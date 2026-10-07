"""Orchestrator: runs the agent pipeline for a case, routes by denial type, passes context.

Upload -> Intake -> Triage -> Evidence & Policy -> (Coding, coding/billing only) -> Draft -> QA
       -> Ready for Review (staff edit/approve) -> Submitted -> Outcome

Each step tries the live Claude API first. If that is unavailable or fails (no key, timeout,
refusal, invalid JSON) the step uses the canned demo response, and the rest of that run stays
in demo mode so a flaky connection doesn't make every remaining step wait for a timeout.
"""
import logging
import threading
import time
from datetime import date, timedelta

from . import db, demo, llm, settings
from .agents import PIPELINE

log = logging.getLogger("appeals.orchestrator")

DEFAULT_WINDOW = {  # used when the letter doesn't state an appeal window
    "prior_authorization": 60,
    "medical_necessity": 60,
    "coding_billing": 90,
    "timely_filing_admin": 60,
}

_running: set[int] = set()
_running_lock = threading.Lock()


def compute_deadline(intake: dict, denial_type: str) -> dict:
    """Appeal deadline = denial date + appeal window. Done in code, not by the model."""
    window = int(intake.get("appeal_window_days") or 0)
    basis = "stated in denial letter"
    if window <= 0:
        window = DEFAULT_WINDOW.get(denial_type, 60)
        basis = "default window for this denial type (not stated in letter)"
    try:
        denial = date.fromisoformat(intake.get("denial_date") or "")
    except ValueError:
        denial = date.today()
        basis += "; denial date not found, counted from today"
    deadline = denial + timedelta(days=window)
    return {
        "deadline": deadline.isoformat(),
        "days_remaining": (deadline - date.today()).days,
        "appeal_window_days": window,
        "deadline_basis": f"{denial.isoformat()} + {window} days ({basis})",
    }


def should_run_coding(prior: dict) -> tuple[bool, str]:
    triage = prior.get("triage") or {}
    if triage.get("denial_type") == "coding_billing":
        return True, "Coding/billing denial"
    if triage.get("route_to_coding_check"):
        return True, "Triage flagged a coding issue"
    return False, f"Skipped - not a coding/billing denial ({triage.get('denial_type', 'unknown')})"


def is_running(case_id: int) -> bool:
    with _running_lock:
        return case_id in _running


def start(case_id: int) -> bool:
    with _running_lock:
        if case_id in _running:
            return False
        _running.add(case_id)
    db.reset_runs(case_id)  # so the stream shows queued steps immediately
    db.update_case(case_id, status="Running", run_mode=None)
    threading.Thread(target=_run_safe, args=(case_id,), daemon=True).start()
    return True


def _run_safe(case_id: int) -> None:
    try:
        run(case_id)
    except Exception:  # never leave a case stuck in "Running"
        log.exception("Pipeline crashed for case %s", case_id)
        db.update_case(case_id, status="Ready for Review", run_mode="demo")
    finally:
        with _running_lock:
            _running.discard(case_id)


def run(case_id: int) -> None:
    db.reset_runs(case_id)
    db.update_case(case_id, status="Running", run_mode=None)
    case = db.get_case(case_id)
    prior: dict = {}
    modes: set[str] = set()
    live_ok = settings.live_available()

    for agent in PIPELINE:
        name = agent.NAME
        if name == "coding":
            needed, reason = should_run_coding(prior)
            if not needed:
                db.update_run(case_id, name, status="skipped", note=reason, finished_at=db.now_iso())
                continue

        db.update_run(case_id, name, status="running", started_at=db.now_iso())
        output, mode, note = None, "demo", None
        started = time.monotonic()

        if live_ok:
            try:
                output = llm.run_json(name, agent.build_input(case, prior), agent.SCHEMA)
                mode = "live"
            except llm.LiveCallFailed as e:
                note = f"Live call failed ({e}); used demo response."
                live_ok = False
                log.warning("Case %s %s: %s", case_id, name, note)
        if output is None:
            output = demo.response_for(name, case, prior)
            # Let the pipeline visibly "work" in demo mode.
            time.sleep(max(0.0, settings.DEMO_STEP_DELAY_S - (time.monotonic() - started)))

        if name == "triage":
            output.update(compute_deadline(prior.get("intake") or {}, output.get("denial_type")))
        prior[name] = output
        modes.add(mode)
        db.update_run(case_id, name, status="done", mode=mode, output=output, note=note,
                      finished_at=db.now_iso())
        _apply_to_case(case_id, name, output)

    run_mode = "live" if modes == {"live"} else "demo" if modes == {"demo"} else "mixed"
    db.update_case(case_id, status="Ready for Review", run_mode=run_mode,
                   run_count=(case.get("run_count") or 0) + 1)


def _apply_to_case(case_id: int, agent: str, output: dict) -> None:
    """Copy headline fields onto the case row so lists and metrics stay simple."""
    if agent == "intake":
        db.update_case(
            case_id,
            patient_name=output.get("patient_name") or None,
            payer=output.get("payer_name") or None,
            procedure=output.get("procedure_description") or None,
            amount_at_stake=output.get("amount_at_stake") or output.get("billed_amount") or 0,
        )
    elif agent == "triage":
        db.update_case(case_id, denial_type=output["denial_type"], strength=output["winnability"],
                       deadline=output["deadline"])
    elif agent == "drafting":
        db.update_case(case_id, draft_letter=output.get("letter_text"), draft_edited=0)
    elif agent == "qa":
        db.update_case(case_id, attachments=[
            {**a, "checked": a.get("status") == "in_file"} for a in output.get("attachments_checklist", [])
        ])


def seed_from_canned(case_id: int) -> None:
    """Fill a seeded case's agent runs from canned responses without waiting."""
    case = db.get_case(case_id)
    db.reset_runs(case_id)
    prior: dict = {}
    for agent in PIPELINE:
        name = agent.NAME
        if name == "coding":
            needed, reason = should_run_coding(prior)
            if not needed:
                db.update_run(case_id, name, status="skipped", note=reason, finished_at=db.now_iso())
                continue
        output = demo.response_for(name, case, prior)
        if name == "triage":
            output.update(compute_deadline(prior["intake"], output["denial_type"]))
        prior[name] = output
        db.update_run(case_id, name, status="done", mode="seeded", output=output,
                      started_at=db.now_iso(), finished_at=db.now_iso())
        _apply_to_case(case_id, name, output)
    db.update_case(case_id, run_mode="seeded", run_count=1)

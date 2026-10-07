"""Run every sample case end-to-end through the agent pipeline and check the outputs.

Usage (from the appeals-demo folder):
    python -m tests.run_pipeline --mode demo    # canned responses, no API key needed
    python -m tests.run_pipeline --mode live    # real Claude API calls (needs ANTHROPIC_API_KEY)
    python -m tests.run_pipeline --mode mock    # live code path against a fake Anthropic client

Uses a temporary database, so your demo data is untouched.
"""
import argparse
import json
import os
import sys
import tempfile
import time
from pathlib import Path
from types import SimpleNamespace

os.environ["APPEALS_DB"] = str(Path(tempfile.mkdtemp()) / "test.db")

from app import db, demo, llm, orchestrator, seed, settings  # noqa: E402
from app.agents import BY_NAME  # noqa: E402

settings.DEMO_STEP_DELAY_S = 0  # no artificial pauses in tests

EXPECTED = {  # sample -> (denial_type, should the coding agent run?)
    "tka_prior_auth": ("prior_authorization", False),
    "lumbar_mri": ("medical_necessity", False),
    "knee_scope_coding": ("coding_billing", True),
    "rotator_cuff_timely": ("timely_filing_admin", False),
    "spine_fusion": ("prior_authorization", False),
}


def validate(value, schema, path="$") -> list[str]:
    """Minimal JSON-schema check for the subset our agent schemas use."""
    errs = []
    t = schema.get("type")
    py = {"object": dict, "array": list, "string": str, "boolean": bool,
          "integer": int, "number": (int, float)}[t]
    if not isinstance(value, py) or (t in ("integer", "number") and isinstance(value, bool)):
        return [f"{path}: expected {t}, got {type(value).__name__}"]
    if "enum" in schema and value not in schema["enum"]:
        errs.append(f"{path}: {value!r} not in {schema['enum']}")
    if t == "object":
        for k in schema["required"]:
            if k not in value:
                errs.append(f"{path}.{k}: missing")
        for k, v in value.items():
            if k not in schema["properties"]:
                # Fields the orchestrator adds after the model call.
                if path == "$" and k in ("deadline", "days_remaining", "appeal_window_days", "deadline_basis"):
                    continue
                errs.append(f"{path}.{k}: unexpected")
            else:
                errs += validate(v, schema["properties"][k], f"{path}.{k}")
    if t == "array":
        for i, item in enumerate(value):
            errs += validate(item, schema["items"], f"{path}[{i}]")
    return errs


def install_mock():
    """Replace the Anthropic client with a fake that answers from the canned responses."""
    calls = []

    def create(**kw):
        calls.append(kw)
        assert kw["model"] == settings.MODEL
        assert kw["output_config"]["format"]["type"] == "json_schema"
        assert kw["system"].strip(), "system prompt should be loaded from /prompts"
        agent = next(name for name in BY_NAME if llm.load_prompt(name) == kw["system"])
        user = kw["messages"][0]["content"]
        case = next(c for c in db.list_cases() if c["patient_name"] and c["patient_name"] in user)
        out = demo.response_for(agent, case, db.outputs(case["id"]))
        return SimpleNamespace(stop_reason="end_turn",
                               content=[SimpleNamespace(type="text", text=json.dumps(out))])

    fake = SimpleNamespace(messages=SimpleNamespace(create=create),
                           beta=SimpleNamespace(messages=SimpleNamespace(create=create)))
    llm._client = fake
    settings.API_KEY = settings.API_KEY or "sk-test-mock"
    return calls


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--mode", choices=["demo", "live", "mock"], default="demo")
    args = ap.parse_args()

    if args.mode == "demo":
        settings.runtime["force_demo"] = True
    elif args.mode == "live":
        if not settings.API_KEY:
            print("ANTHROPIC_API_KEY is not set (put it in .env). Cannot run live mode.")
            return 2
        settings.runtime["force_demo"] = False
    else:
        calls = install_mock()
        settings.runtime["force_demo"] = False

    print(f"Mode: {args.mode} | model: {settings.MODEL} | effort: {settings.EFFORT}\n")
    db.init()
    failures = 0
    for key, (want_type, want_coding) in EXPECTED.items():
        case_id = seed.new_case_from_sample(key)
        t0 = time.monotonic()
        orchestrator.run(case_id)
        elapsed = time.monotonic() - t0
        case, runs = db.get_case(case_id), {r["agent"]: r for r in db.get_runs(case_id)}

        problems = []
        for name, r in runs.items():
            if name == "coding" and not want_coding:
                if r["status"] != "skipped":
                    problems.append("coding should have been skipped")
                continue
            if r["status"] != "done":
                problems.append(f"{name}: status {r['status']}")
                continue
            problems += [f"{name} {e}" for e in validate(r["output"], BY_NAME[name].SCHEMA)]
            if args.mode in ("live", "mock") and r["mode"] != "live":
                problems.append(f"{name}: fell back to demo ({r['note']})")
        if case["denial_type"] != want_type:
            msg = f"denial_type {case['denial_type']} != expected {want_type}"
            # A live model may reasonably disagree; only enforce for canned paths.
            (problems.append(msg) if args.mode != "live" else print(f"   note: {msg}"))
        if not case["deadline"]:
            problems.append("no deadline computed")
        if not (case["draft_letter"] or "").strip():
            problems.append("no draft letter")
        if case["status"] != "Ready for Review":
            problems.append(f"final status {case['status']}")

        steps = " ".join(f"{n}:{(r['mode'] or r['status'])[:4]}" for n, r in runs.items())
        print(f"{'PASS' if not problems else 'FAIL'}  {key:<22} {case['denial_type'] or '-':<20} "
              f"{case['strength'] or '-':<10} deadline {case['deadline']}  {elapsed:5.1f}s  [{steps}]")
        for p in problems:
            print(f"      - {p}")
        failures += bool(problems)

    if args.mode == "mock":
        print(f"\nMock client received {len(calls)} API calls "
              f"(expected {sum(5 + c for _, c in EXPECTED.values())}).")
    print(f"\n{len(EXPECTED) - failures}/{len(EXPECTED)} cases passed.")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())

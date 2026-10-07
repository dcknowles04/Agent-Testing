"""FastAPI app: REST endpoints, SSE stream, and the static frontend."""
import asyncio
import json
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.responses import PlainTextResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from . import db, demo, metrics, orchestrator, seed, settings
from .agents import BY_NAME

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s: %(message)s")

DOC_KEYS = ("denial_letter", "clinical_notes", "claim_data", "payer_policy")


@asynccontextmanager
async def lifespan(app: FastAPI):
    seed.ensure_seeded()
    yield


app = FastAPI(title="Appeals Prototype (fictional data)", lifespan=lifespan)


# ---------------------------------------------------------------------------
# Helpers

def _get(case_id: int) -> dict:
    case = db.get_case(case_id)
    if not case:
        raise HTTPException(404, "Case not found")
    return case


def _full(case_id: int) -> dict:
    case = metrics.decorate(_get(case_id))
    runs = db.get_runs(case_id)
    for r in runs:
        r["label"] = BY_NAME[r["agent"]].LABEL
    case["runs"] = runs
    case["running"] = orchestrator.is_running(case_id)
    return case


def mode_info() -> dict:
    return {
        "mode": "live" if settings.live_available() else "demo",
        "has_key": bool(settings.API_KEY),
        "force_demo": settings.runtime["force_demo"],
        "model": settings.MODEL,
        "effort": settings.EFFORT,
    }


# ---------------------------------------------------------------------------
# Models

class Documents(BaseModel):
    denial_letter: str = ""
    clinical_notes: str = ""
    claim_data: str = ""
    payer_policy: str = ""


class CaseCreate(BaseModel):
    title: str | None = None
    practice_id: int = 1
    documents: Documents | None = None
    sample_key: str | None = None
    date_ctx: dict | None = None


class DraftEdit(BaseModel):
    draft_letter: str


class Approval(BaseModel):
    approved_by: str = "Office staff"
    attachments: list[dict] | None = None


class Outcome(BaseModel):
    outcome: str  # Overturned | Upheld | Pending
    amount_recovered: float | None = None


class ModeToggle(BaseModel):
    force_demo: bool


# ---------------------------------------------------------------------------
# Cases

@app.post("/cases")
def create_case(body: CaseCreate):
    if body.sample_key and body.sample_key not in demo.sample_keys():
        raise HTTPException(400, "Unknown sample_key")
    if body.sample_key and body.documents is None:
        case_id = seed.new_case_from_sample(body.sample_key, body.practice_id)
        return _full(case_id)

    docs = (body.documents or Documents()).model_dump()
    if not docs["denial_letter"].strip():
        raise HTTPException(400, "A denial letter / EOB is required")
    case_id = seed.create_case(
        docs,
        (body.title or "").strip() or "New denial",
        body.practice_id,
        sample_key=body.sample_key,
        date_ctx=body.date_ctx if body.sample_key else None,
    )
    return _full(case_id)


@app.get("/cases")
def list_cases():
    out = []
    for c in db.list_cases():
        c = metrics.decorate(c)
        c.pop("documents", None)
        c.pop("draft_letter", None)
        out.append(c)
    return out


@app.get("/cases/{case_id}")
def get_case(case_id: int):
    return _full(case_id)


@app.post("/cases/{case_id}/run")
def run_case(case_id: int):
    case = _get(case_id)
    if case["status"] in ("Submitted", "Closed"):
        raise HTTPException(409, f"Case is already {case['status']}")
    if not orchestrator.start(case_id):
        raise HTTPException(409, "Pipeline already running")
    return {"started": True, "case_id": case_id, **mode_info()}


@app.get("/cases/{case_id}/stream")
async def stream(case_id: int):
    """Server-sent events: one 'step' event per agent change, then 'done'."""
    _get(case_id)

    async def events():
        seen: dict[str, float] = {}
        last_status = None
        idle_after_done = 0
        while True:
            case = db.get_case(case_id)
            for r in db.get_runs(case_id):
                if seen.get(r["agent"]) != r["updated_at"]:
                    seen[r["agent"]] = r["updated_at"]
                    r["label"] = BY_NAME[r["agent"]].LABEL
                    yield f"event: step\ndata: {json.dumps(r)}\n\n"
            if case["status"] != last_status:
                last_status = case["status"]
                yield f"event: case\ndata: {json.dumps({'status': case['status'], 'run_mode': case['run_mode']})}\n\n"
            if not orchestrator.is_running(case_id) and case["status"] != "Running":
                idle_after_done += 1
                if idle_after_done > 1:
                    yield f"event: done\ndata: {json.dumps({'status': case['status']})}\n\n"
                    return
            yield ": keep-alive\n\n"
            await asyncio.sleep(0.4)

    return StreamingResponse(events(), media_type="text/event-stream",
                             headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})


@app.patch("/cases/{case_id}/draft")
def edit_draft(case_id: int, body: DraftEdit):
    case = _get(case_id)
    if case["status"] in ("Submitted", "Closed"):
        raise HTTPException(409, "Draft is locked after submission")
    db.update_case(case_id, draft_letter=body.draft_letter, draft_edited=1)
    return _full(case_id)


@app.post("/cases/{case_id}/approve")
def approve(case_id: int, body: Approval):
    case = _get(case_id)
    if case["status"] != "Ready for Review":
        raise HTTPException(409, f"Only cases in 'Ready for Review' can be approved (status: {case['status']})")
    fields = dict(status="Submitted", outcome="Pending", approved_by=body.approved_by,
                  approved_at=db.now_iso(), submitted_at=db.now_iso())
    if body.attachments is not None:
        fields["attachments"] = body.attachments
    db.update_case(case_id, **fields)
    return _full(case_id)


@app.patch("/cases/{case_id}/outcome")
def set_outcome(case_id: int, body: Outcome):
    case = _get(case_id)
    if body.outcome not in ("Overturned", "Upheld", "Pending"):
        raise HTTPException(400, "outcome must be Overturned, Upheld or Pending")
    if case["status"] not in ("Submitted", "Closed"):
        raise HTTPException(409, "Approve and submit the appeal before recording an outcome")
    if body.outcome == "Pending":
        db.update_case(case_id, outcome="Pending", status="Submitted", outcome_at=None, amount_recovered=None)
    else:
        recovered = body.amount_recovered
        if recovered is None:
            recovered = (case.get("amount_at_stake") or 0) if body.outcome == "Overturned" else 0
        db.update_case(case_id, outcome=body.outcome, status="Closed", outcome_at=db.now_iso(),
                       amount_recovered=recovered if body.outcome == "Overturned" else 0)
    return _full(case_id)


@app.get("/cases/{case_id}/letter.txt", response_class=PlainTextResponse)
def letter(case_id: int):
    case = _get(case_id)
    return PlainTextResponse(case.get("draft_letter") or "", headers={
        "Content-Disposition": f'attachment; filename="appeal-case-{case_id}.txt"'})


# ---------------------------------------------------------------------------
# Metrics, samples, demo controls

@app.get("/metrics")
def get_metrics():
    return metrics.compute()


@app.get("/samples")
def samples():
    return [{"key": k, "label": demo.sample_meta(k)["label"], "title": demo.sample_meta(k)["title"]}
            for k in seed.SEED_ORDER]


@app.get("/samples/{key}")
def sample(key: str):
    if key not in demo.sample_keys():
        raise HTTPException(404, "Unknown sample")
    meta = demo.sample_meta(key)
    ctx = demo.date_context(meta["dates"])
    return {"key": key, "title": meta["title"], "date_ctx": ctx, "documents": demo.sample_documents(key, ctx)}


@app.post("/demo/reset")
def reset():
    seed.reset()
    return {"reset": True, "cases": len(db.list_cases())}


@app.get("/status")
def status():
    return mode_info()


@app.post("/settings/mode")
def set_mode(body: ModeToggle):
    settings.runtime["force_demo"] = body.force_demo
    return mode_info()


@app.get("/config")
def config():
    return {"pricing": settings.pricing(), "practices": settings.practices(), **mode_info()}


app.mount("/", StaticFiles(directory=settings.WEB_DIR, html=True), name="web")

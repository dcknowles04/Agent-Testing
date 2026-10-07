"""Seed / reset the demo database from the /seed folders."""

from . import db, demo, orchestrator

SEED_ORDER = ["tka_prior_auth", "lumbar_mri", "knee_scope_coding", "rotator_cuff_timely", "spine_fusion"]

def create_case(documents: dict, title: str, practice_id: int = 1,
                sample_key: str | None = None, date_ctx: dict | None = None) -> int:
    # Quick provisional parse so the queue shows patient, payer and dollars before intake runs.
    provisional = demo.generic("intake", {"documents": documents}, {})
    return db.create_case(
        practice_id=practice_id,
        title=title,
        status="New",
        sample_key=sample_key,
        date_ctx=date_ctx,
        documents=documents,
        patient_name=provisional["patient_name"] or None,
        payer=provisional["payer_name"] or None,
        amount_at_stake=provisional["amount_at_stake"] or None,
    )


def new_case_from_sample(key: str, practice_id: int = 1) -> int:
    meta = demo.sample_meta(key)
    ctx = demo.date_context(meta["dates"])
    return create_case(demo.sample_documents(key, ctx), meta["title"], practice_id, key, ctx)

def reset() -> None:
    db.wipe()
    for key in SEED_ORDER:
        meta = demo.sample_meta(key)
        state = meta.get("seed_state", {})
        case_id = new_case_from_sample(key, meta.get("practice_id", 1))
        if state.get("status", "New") == "New":
            continue
        orchestrator.seed_from_canned(case_id)
        ctx = db.get_case(case_id)["date_ctx"]
        fields = {"status": state["status"]}
        if state.get("approved_by"):
            sub = ctx[state["submitted_offset"]]
            fields.update(approved_by=state["approved_by"], approved_at=sub, submitted_at=sub)
        if state.get("outcome"):
            fields["outcome"] = state["outcome"]
        if state.get("outcome_offset"):
            fields["outcome_at"] = ctx[state["outcome_offset"]]
        if "amount_recovered" in state:
            fields["amount_recovered"] = state["amount_recovered"]
        db.update_case(case_id, **fields)

def ensure_seeded() -> None:
    db.init()
    if not db.list_cases():
        reset()

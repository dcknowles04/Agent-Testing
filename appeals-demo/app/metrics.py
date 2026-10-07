"""Dashboard and business-view numbers."""
from datetime import date

from . import db, settings

OPEN_STATUSES = {"New", "Running", "Ready for Review", "Submitted"}


def days_remaining(case: dict) -> int | None:
    if not case.get("deadline"):
        return None
    return (date.fromisoformat(case["deadline"]) - date.today()).days


def urgency(case: dict) -> str:
    """red <= 14 days, yellow <= 30, green > 30; 'none' once submitted or closed."""
    if case["status"] in ("Submitted", "Closed"):
        return "none"
    d = days_remaining(case)
    if d is None:
        return "unknown"
    return "red" if d <= 14 else "yellow" if d <= 30 else "green"


def decorate(case: dict) -> dict:
    return {**case, "days_remaining": days_remaining(case), "urgency": urgency(case)}


def _practice_numbers(p: dict, cases: list[dict]) -> dict:
    pricing = settings.pricing()
    tier = settings.tier(p["tier"])
    base = p["baseline"]
    mine = [c for c in cases if c["practice_id"] == p["id"]] if p.get("live") else []

    decided = [c for c in mine if c.get("outcome") in ("Overturned", "Upheld")]
    overturned = [c for c in decided if c["outcome"] == "Overturned"]
    processed = sum(1 for c in mine if (c.get("run_count") or 0) > 0)

    n_decided = base["decided_appeals"] + len(decided)
    n_overturned = base["overturned_appeals"] + len(overturned)
    recovered = base["dollars_recovered"] + sum(c.get("amount_recovered") or 0 for c in overturned)
    appeals_processed = base["appeals_processed_to_date"] + processed
    minutes_saved = pricing["manual_minutes_per_appeal"] - pricing["assisted_minutes_per_appeal"]
    hours_saved = appeals_processed * minutes_saved / 60
    staff_savings = hours_saved * pricing["staff_cost_per_hour"]
    fee_90d = tier["price_per_month"] * 3

    return {
        "id": p["id"],
        "name": p["name"],
        "surgeons": p["surgeons"],
        "live": bool(p.get("live")),
        "tier": tier["name"],
        "price_per_month": tier["price_per_month"],
        "appeals_limit": tier["appeals_per_month"],
        "appeals_used": base["appeals_used_this_month"] + processed,
        "decided": n_decided,
        "overturned": n_overturned,
        "overturn_rate": round(100 * n_overturned / n_decided, 1) if n_decided else 0,
        "dollars_recovered": round(recovered, 2),
        "appeals_processed": appeals_processed,
        "staff_hours_saved": round(hours_saved, 1),
        "staff_cost_saved": round(staff_savings),
        "roi_multiple": round((recovered + staff_savings) / fee_90d, 1) if fee_90d else None,
    }


def compute() -> dict:
    cases = [decorate(c) for c in db.list_cases()]
    practices = settings.practices()
    per_practice = [_practice_numbers(p, cases) for p in practices]
    me = next(p for p in per_practice if p["live"])

    live_cases = [c for c in cases if c["practice_id"] == me["id"]]
    open_cases = [c for c in live_cases if c["status"] in OPEN_STATUSES]
    unsubmitted = [c for c in open_cases if c["status"] != "Submitted"]
    due_soon = sorted(
        (c for c in unsubmitted if c["days_remaining"] is not None and c["days_remaining"] <= 14),
        key=lambda c: c["days_remaining"],
    )
    pending = [c for c in live_cases if c["status"] == "Submitted"]

    mrr = sum(p["price_per_month"] for p in per_practice)
    return {
        "practice": me,
        "dashboard": {
            "open_denials": len(open_cases),
            "dollars_at_stake": round(sum(c.get("amount_at_stake") or 0 for c in open_cases), 2),
            "awaiting_review": sum(1 for c in live_cases if c["status"] == "Ready for Review"),
            "pending_outcome": len(pending),
            "pending_dollars": round(sum(c.get("amount_at_stake") or 0 for c in pending), 2),
            "deadlines_next_14_days": len(due_soon),
            "due_soon": [
                {"id": c["id"], "title": c["title"], "patient_name": c["patient_name"],
                 "deadline": c["deadline"], "days_remaining": c["days_remaining"], "status": c["status"]}
                for c in due_soon
            ],
            "overturn_rate": me["overturn_rate"],
            "dollars_recovered": me["dollars_recovered"],
            "staff_hours_saved": me["staff_hours_saved"],
            "plan": {"tier": me["tier"], "used": me["appeals_used"], "limit": me["appeals_limit"]},
            "by_type": {
                t: sum(1 for c in open_cases if c.get("denial_type") == t)
                for t in ("prior_authorization", "medical_necessity", "coding_billing", "timely_filing_admin")
            },
        },
        "business": {
            "practices": per_practice,
            "mrr": mrr,
            "arr": mrr * 12,
            "total_recovered": round(sum(p["dollars_recovered"] for p in per_practice), 2),
            "total_hours_saved": round(sum(p["staff_hours_saved"] for p in per_practice), 1),
            "pricing": settings.pricing(),
        },
    }

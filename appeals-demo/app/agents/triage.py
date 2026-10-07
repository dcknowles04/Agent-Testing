from .base import ARR_STR, INT, STR, documents_block, enum, header, obj, prior_block

NAME = "triage"
LABEL = "Triage"

DENIAL_TYPES = ["prior_authorization", "medical_necessity", "coding_billing", "timely_filing_admin"]

SCHEMA = obj({
    "denial_type": enum(*DENIAL_TYPES),
    "denial_type_rationale": STR,
    "winnability": enum("strong", "borderline", "weak"),
    "winnability_score": INT,
    "reasons_for": ARR_STR,
    "reasons_against": ARR_STR,
    "recommended_strategy": STR,
    "route_to_coding_check": {"type": "boolean"},
})


def build_input(case: dict, prior: dict) -> str:
    return f"""{header()}

Classify this denial and score its winnability. The appeal deadline is computed by the
system from the intake fields, so you do not need to calculate it.

{prior_block(prior, ["intake"])}

{documents_block(case)}"""

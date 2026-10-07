from .base import ARR_STR, NUM, STR, arr, documents_block, enum, header, obj, prior_block

NAME = "coding"
LABEL = "Coding Check"

LINE = obj({"cpt": STR, "modifiers": ARR_STR, "icd10": ARR_STR, "billed": NUM})

SCHEMA = obj({
    "findings": arr(obj({
        "issue": STR,
        "severity": enum("high", "medium", "low"),
        "explanation": STR,
    })),
    "original_lines": arr(LINE),
    "corrected_lines": arr(LINE),
    "recommendation": enum("corrected_claim", "appeal_with_argument", "both"),
    "appeal_argument": STR,
    "documentation_support": STR,
})


def build_input(case: dict, prior: dict) -> str:
    return f"""{header()}

Review the CPT / ICD-10 / modifier combination on this denied claim.

{prior_block(prior, ["intake", "triage", "evidence"])}

{documents_block(case)}"""

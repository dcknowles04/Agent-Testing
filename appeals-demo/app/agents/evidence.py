from .base import ARR_STR, STR, arr, documents_block, enum, header, obj, prior_block

NAME = "evidence"
LABEL = "Evidence & Policy Match"

SCHEMA = obj({
    "policy_name": STR,
    "criteria": arr(obj({
        "criterion": STR,
        "status": enum("met", "not_met", "missing_documentation"),
        "evidence": STR,
        "citation": obj({
            "document": enum("clinical_notes", "denial_letter", "claim_data", "payer_policy", "none"),
            "section": STR,
            "excerpt": STR,
        }),
        "action_needed": STR,
    })),
    "overall_assessment": STR,
    "documents_to_attach": ARR_STR,
    "gaps": ARR_STR,
})


def build_input(case: dict, prior: dict) -> str:
    return f"""{header()}

Compare the clinical record against the payer policy's criteria and produce the checklist.

{prior_block(prior, ["intake", "triage"])}

{documents_block(case)}"""

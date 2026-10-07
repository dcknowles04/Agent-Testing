from .base import ARR_STR, BOOL, INT, STR, arr, documents_block, enum, header, obj, prior_block

NAME = "qa"
LABEL = "QA Review"

SCHEMA = obj({
    "overall": enum("ready", "ready_with_edits", "needs_attention"),
    "score": INT,
    "flags": arr(obj({
        "severity": enum("high", "medium", "low"),
        "issue": STR,
        "location": STR,
        "suggested_fix": STR,
    })),
    "unsupported_claims": ARR_STR,
    "attachments_checklist": arr(obj({
        "item": STR,
        "source": STR,
        "required": BOOL,
        "status": enum("in_file", "needs_upload", "verify"),
    })),
    "summary": STR,
})


def build_input(case: dict, prior: dict) -> str:
    return f"""{header()}

Review the draft appeal letter against the criteria checklist and the source documents.

{prior_block(prior, ["intake", "triage", "evidence", "coding", "drafting"])}

{documents_block(case)}"""

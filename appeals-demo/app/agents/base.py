"""Shared helpers for agent definitions.

Each agent module exposes:
  NAME     - key used in the pipeline and in /prompts/<NAME>.md
  LABEL    - display name
  SCHEMA   - JSON schema the model's output must match (structured outputs)
  build_input(case, prior) -> str   - the user message (documents + earlier agents' outputs)
"""
import json
from datetime import date


def obj(props: dict, required: list[str] | None = None) -> dict:
    """Strict object schema: every property required, no extras."""
    return {
        "type": "object",
        "properties": props,
        "required": required if required is not None else list(props),
        "additionalProperties": False,
    }


def arr(items: dict) -> dict:
    return {"type": "array", "items": items}


STR = {"type": "string"}
NUM = {"type": "number"}
INT = {"type": "integer"}
BOOL = {"type": "boolean"}
ARR_STR = arr(STR)


def enum(*values: str) -> dict:
    return {"type": "string", "enum": list(values)}


DOC_TAGS = {
    "denial_letter": "Denial letter / EOB",
    "clinical_notes": "Clinical notes (op notes, imaging, PT / conservative treatment)",
    "claim_data": "Claim data",
    "payer_policy": "Payer coverage policy (illustrative)",
}


def documents_block(case: dict, which: list[str] | None = None) -> str:
    docs = case["documents"] or {}
    parts = []
    for key in which or list(DOC_TAGS):
        text = (docs.get(key) or "").strip() or "(not provided)"
        parts.append(f"<{key}>\n{text}\n</{key}>")
    return "\n\n".join(parts)


def prior_block(prior: dict, which: list[str]) -> str:
    parts = []
    for key in which:
        if prior.get(key) is not None:
            parts.append(f"<{key}_output>\n{json.dumps(prior[key], indent=2)}\n</{key}_output>")
    return "\n\n".join(parts)


def header() -> str:
    return f"Today's date: {date.today().isoformat()}. All patients, payers and policies are fictional."

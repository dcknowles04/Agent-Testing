from .base import ARR_STR, STR, documents_block, header, obj, prior_block

NAME = "drafting"
LABEL = "Draft Appeal"

SCHEMA = obj({
    "subject_line": STR,
    "letter_text": STR,
    "key_arguments": ARR_STR,
    "enclosures": ARR_STR,
})


def build_input(case: dict, prior: dict) -> str:
    return f"""{header()}

Write the appeal letter for this case. The office is Riverbend Orthopedic Associates
(fictional), 1200 Riverbend Parkway, Suite 300, Fairhaven, ST 00000.

{prior_block(prior, ["intake", "triage", "evidence", "coding"])}

{documents_block(case)}"""

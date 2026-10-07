from .base import ARR_STR, INT, NUM, STR, arr, documents_block, header, obj

NAME = "intake"
LABEL = "Intake"

SCHEMA = obj({
    "patient_name": STR,
    "patient_dob": STR,
    "member_id": STR,
    "payer_name": STR,
    "claim_or_reference_number": STR,
    "rendering_provider": STR,
    "procedure_description": STR,
    "cpt_codes": arr(obj({"code": STR, "description": STR, "modifiers": ARR_STR})),
    "icd10_codes": arr(obj({"code": STR, "description": STR})),
    "date_of_service": STR,
    "denial_date": STR,
    "billed_amount": NUM,
    "amount_at_stake": NUM,
    "stated_denial_reason": STR,
    "denial_codes": arr(obj({"code": STR, "description": STR})),
    "appeal_window_days": INT,
    "appeal_submission_method": STR,
    "summary": STR,
})


def build_input(case: dict, prior: dict) -> str:
    return f"""{header()}

Extract the structured fields from these case documents.

{documents_block(case, ["denial_letter", "claim_data"])}"""

"""Demo mode: canned agent responses and date templating.

Seed documents and canned responses contain tokens like {{DENIAL_DATE}}, {{DOS|iso}} or
{{DOS|long}}. Each case stores a date context (token -> ISO date) computed relative to the
day the case was created, so deadlines always look current no matter when you run the demo.

For cases that don't come from a sample, `generic()` builds plausible outputs from simple
pattern matching so demo mode still produces something sensible for pasted documents.
"""
import json
import re
from datetime import date, timedelta

from . import settings

TOKEN = re.compile(r"\{\{([A-Z0-9_]+)(?:\|(iso|long))?\}\}")


def date_context(offsets: dict, today: date | None = None) -> dict:
    today = today or date.today()
    ctx = {k: (today + timedelta(days=v)).isoformat() for k, v in offsets.items()}
    ctx["TODAY"] = today.isoformat()
    return ctx


def fmt(iso: str, style: str | None) -> str:
    d = date.fromisoformat(iso)
    if style == "iso":
        return iso
    if style == "long":
        return f"{d:%B} {d.day}, {d.year}"
    return f"{d:%m/%d/%Y}"


def render(text: str, ctx: dict) -> str:
    def sub(m: re.Match) -> str:
        key, style = m.group(1), m.group(2)
        if key == "TODAY" and "TODAY" not in ctx:
            return fmt(date.today().isoformat(), style)
        return fmt(ctx[key], style) if key in ctx else m.group(0)

    return TOKEN.sub(sub, text)


# ---------------------------------------------------------------------------
# Samples (seed folders)

def sample_keys() -> list[str]:
    return sorted(p.name for p in settings.SEED_DIR.iterdir() if (p / "meta.json").exists())


def sample_meta(key: str) -> dict:
    return json.loads((settings.SEED_DIR / key / "meta.json").read_text())


def sample_documents(key: str, ctx: dict) -> dict:
    folder = settings.SEED_DIR / key
    return {
        name: render((folder / f"{name}.txt").read_text(), ctx)
        for name in ("denial_letter", "clinical_notes", "claim_data", "payer_policy")
    }


def canned(key: str, agent: str, ctx: dict) -> dict | None:
    folder = settings.DEMO_DIR / key
    path = folder / f"{agent}.json"
    if not path.exists():
        return None
    data = json.loads(render(path.read_text(), ctx))
    if isinstance(data.get("letter_text"), str) and data["letter_text"].startswith("@"):
        data["letter_text"] = render((folder / data["letter_text"][1:]).read_text(), ctx).strip()
    return data


# ---------------------------------------------------------------------------
# Generic fallback for arbitrary documents

GENERIC_NOTE = "Demo-mode template output (pattern matching, not AI). Add an API key for a case-specific analysis."

CPT_RE = re.compile(r"\b(\d{5})(?:-([A-Z0-9]{2}))?\b")
ICD_RE = re.compile(r"\b([A-TV-Z]\d{2}\.[0-9A-Z]{1,4})\b")
MONEY_RE = re.compile(r"\$\s?([\d,]+(?:\.\d{2})?)")
DATE_RE = re.compile(r"\b(\d{1,2})/(\d{1,2})/(\d{4})\b|\b(\d{4})-(\d{2})-(\d{2})\b")


def _first_date(text: str) -> str:
    m = DATE_RE.search(text or "")
    if not m:
        return ""
    if m.group(3):
        return f"{m.group(3)}-{int(m.group(1)):02d}-{int(m.group(2)):02d}"
    return f"{m.group(4)}-{m.group(5)}-{m.group(6)}"


def _field(text: str, *labels: str) -> str:
    for label in labels:
        m = re.search(rf"{label}\s*[:#]\s*([^\n|]+?)(?:\s{{2,}}|\n|\||$)", text or "", re.I)
        if m:
            return m.group(1).strip()
    return ""


def _classify(text: str) -> str:
    t = text.lower()
    if any(k in t for k in ("timely filing", "time limit for filing", "co-29", "filing limit", "eligib")):
        return "timely_filing_admin"
    if any(k in t for k in ("bundl", "ncci", "modifier", "co-97", "co-4 ", "included in the payment")):
        return "coding_billing"
    if any(k in t for k in ("prior authorization", "prior auth", "pre-service", "precertification")):
        return "prior_authorization"
    return "medical_necessity"


def _sentences(text: str) -> list[str]:
    parts = re.split(r"(?<=[.!?])\s+|\n+", text or "")
    return [p.strip() for p in parts if len(p.strip()) > 25]


def _best_match(criterion: str, sentences: list[str]) -> tuple[str, int]:
    words = {w for w in re.findall(r"[a-z]{4,}", criterion.lower())} - {
        "with", "that", "least", "documented", "within", "following", "criterion", "past", "must",
    }
    best, score = "", 0
    for s in sentences:
        hits = len(words & set(re.findall(r"[a-z]{4,}", s.lower())))
        if hits > score:
            best, score = s, hits
    return best[:220], score


def generic(agent: str, case: dict, prior: dict) -> dict:
    docs = case["documents"] or {}
    denial, notes = docs.get("denial_letter", ""), docs.get("clinical_notes", "")
    claim, policy = docs.get("claim_data", ""), docs.get("payer_policy", "")
    everything = "\n".join([denial, claim])

    if agent == "intake":
        cpts, seen = [], set()
        for code, mod in CPT_RE.findall(everything):
            if code not in seen and not code.startswith("0"):
                seen.add(code)
                cpts.append({"code": code, "description": "", "modifiers": [mod] if mod else []})
        icds = [{"code": c, "description": ""} for c in dict.fromkeys(ICD_RE.findall(everything))]
        amounts = [float(a.replace(",", "")) for a in MONEY_RE.findall(everything)]
        window = re.search(r"within\s+(\d{2,3})\s+(?:calendar\s+)?days", denial, re.I)
        payer = next((ln.strip() for ln in denial.splitlines()
                      if re.search(r"health|plan|mutual|insurance|care", ln, re.I) and len(ln.strip()) < 60
                      and not ln.strip().startswith("*")), "")
        if payer.isupper():
            payer = payer.title()
        reason = _field(denial, "Reason for denial", "Reason", "Rationale", "Reviewer comment") or \
            next((s for s in _sentences(denial) if re.search(r"denied|not medically|not met|expired|included", s, re.I)), "")
        return {
            "patient_name": _field(everything, "Patient", "Member"),
            "patient_dob": "",
            "member_id": _field(everything, "Member ID"),
            "payer_name": payer,
            "claim_or_reference_number": _field(everything, "Claim #", "Claim", "Reference #", "Authorization reference #"),
            "rendering_provider": _field(everything, "Rendering", "Provider", "Requesting provider"),
            "procedure_description": cpts[0]["code"] if cpts else "",
            "cpt_codes": cpts[:6],
            "icd10_codes": icds[:6],
            "date_of_service": _first_date(_field(everything, "Date of service", "DOS")),
            "denial_date": _first_date(denial),
            "billed_amount": max(amounts) if amounts else 0,
            "amount_at_stake": max(amounts) if amounts else 0,
            "stated_denial_reason": reason[:400],
            "denial_codes": [{"code": c, "description": ""} for c in dict.fromkeys(re.findall(r"\b(?:CO|PR|OA)-\d{1,3}\b", denial))],
            "appeal_window_days": int(window.group(1)) if window else 0,
            "appeal_submission_method": "",
            "summary": GENERIC_NOTE,
        }

    if agent == "triage":
        dtype = _classify(denial + " " + claim)
        return {
            "denial_type": dtype,
            "denial_type_rationale": "Keyword-based classification of the denial letter (demo mode).",
            "winnability": "borderline",
            "winnability_score": 50,
            "reasons_for": ["Clinical documentation was provided for review."],
            "reasons_against": ["Not yet assessed in detail (demo-mode template)."],
            "recommended_strategy": "Review the criteria checklist and attach the supporting records before submitting.",
            "route_to_coding_check": dtype == "coding_billing",
        }

    if agent == "evidence":
        lines = [ln.strip(" -*\t") for ln in policy.splitlines()]
        crit = [ln for ln in lines if re.match(r"^(criterion|indication|\d+(\.\d+)?[.)]?|[a-e]\))\s", ln, re.I) and len(ln) > 20]
        if not crit:
            crit = _sentences(policy)[:5]
        sentences = _sentences(notes)
        criteria = []
        for c in crit[:7]:
            excerpt, score = _best_match(c, sentences)
            criteria.append({
                "criterion": c[:200],
                "status": "met" if score >= 3 else "missing_documentation",
                "evidence": "Closest matching statement in the clinical notes (demo-mode keyword match)." if excerpt else "No matching statement found.",
                "citation": {"document": "clinical_notes" if excerpt else "none", "section": "", "excerpt": excerpt},
                "action_needed": "Verify against the record." if score >= 3 else "Locate supporting documentation.",
            })
        return {
            "policy_name": (policy.strip().splitlines() or ["Payer policy"])[0][:120],
            "criteria": criteria,
            "overall_assessment": GENERIC_NOTE,
            "documents_to_attach": ["Relevant clinical notes", "Copy of the denial letter"],
            "gaps": [],
        }

    if agent == "coding":
        intake = prior.get("intake") or {}
        lines = [{"cpt": c["code"], "modifiers": c["modifiers"], "icd10": [i["code"] for i in intake.get("icd10_codes", [])[:2]], "billed": 0}
                 for c in intake.get("cpt_codes", [])]
        return {
            "findings": [{"issue": "Review modifiers and bundling edits", "severity": "medium",
                          "explanation": "Check NCCI PTP edits and whether a distinct-procedure modifier (59/XS) is supported by the op note."}],
            "original_lines": lines,
            "corrected_lines": lines,
            "recommendation": "appeal_with_argument",
            "appeal_argument": GENERIC_NOTE,
            "documentation_support": "",
        }

    if agent == "drafting":
        intake = prior.get("intake") or {}
        ev = prior.get("evidence") or {}
        met = [c for c in ev.get("criteria", []) if c["status"] == "met"]
        bullets = "\n".join(f"- {c['criterion']}: \"{c['citation']['excerpt']}\"" for c in met) or "- [Summarize the supporting clinical evidence]"
        codes = ", ".join(c["code"] for c in intake.get("cpt_codes", [])) or "[CPT]"
        letter = f"""Riverbend Orthopedic Associates
1200 Riverbend Parkway, Suite 300
Fairhaven, ST 00000

{fmt(date.today().isoformat(), 'long')}

{intake.get('payer_name') or '[Payer]'} - Appeals Department

RE: Request for reconsideration
Patient: {intake.get('patient_name') or '[Patient]'}    Member ID: {intake.get('member_id') or '[Member ID]'}
Claim / reference #: {intake.get('claim_or_reference_number') or '[Claim #]'}
Service: {codes}    Date of service: {intake.get('date_of_service') or '[DOS]'}

Dear Appeals Reviewer:

We request reconsideration and reversal of the denial for the service above. The payer
stated: "{intake.get('stated_denial_reason') or '[denial reason]'}"

The enclosed records show that the applicable policy criteria are met:
{bullets}

We respectfully request that the denial be overturned and the service approved for payment.

Sincerely,

[Physician signature]
Riverbend Orthopedic Associates

Enclosures:
1. Clinical notes
2. Copy of the denial letter"""
        return {"subject_line": "Request for reconsideration", "letter_text": letter,
                "key_arguments": [c["criterion"] for c in met][:5] or ["Policy criteria are met"],
                "enclosures": ["Clinical notes", "Copy of the denial letter"]}

    if agent == "qa":
        return {
            "overall": "ready_with_edits",
            "score": 60,
            "flags": [{"severity": "medium", "issue": "Template letter generated in demo mode.", "location": "Entire letter",
                       "suggested_fix": "Review and tailor the arguments, or re-run with an API key for a full draft."}],
            "unsupported_claims": [],
            "attachments_checklist": [
                {"item": "Clinical notes", "source": "clinical_notes", "required": True, "status": "in_file"},
                {"item": "Copy of the denial letter", "source": "denial_letter", "required": False, "status": "in_file"},
            ],
            "summary": GENERIC_NOTE,
        }
    raise ValueError(agent)


def response_for(agent: str, case: dict, prior: dict) -> dict:
    """Canned response for sample-based cases, otherwise the generic template."""
    if case.get("sample_key"):
        data = canned(case["sample_key"], agent, case.get("date_ctx") or {})
        if data is not None:
            return data
    return generic(agent, case, prior)

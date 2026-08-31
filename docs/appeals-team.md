# The "Appeals" Team — Insurance Billing Appeal Drafting

> Purpose: draft appeals for denied insurance claims from an uploaded EOB (Explanation
> of Benefits) and the related medical records. Four agents run in a fixed pipeline,
> each handing a structured artifact to the next.

**Why this isn't a "Claude Code Agent Team":** the experimental Agent Teams feature
described in `docs/agent-teams.md` is session-scoped and has no project-level
persistence — you'd have to re-explain all four roles every time you opened a new
session. Instead, the Appeals team is four **project subagents**
(`.claude/agents/*.md`), which *are* persistent, plus a `/draft-appeal` skill that
runs them in order. Available in any session on this repo, no setup step needed.

---

## 1. Pipeline

```
EOB + medical records
        │
        ▼
┌─────────────────────┐
│  extraction-agent    │  OCR cleanup, pulls structured fields
└─────────┬────────────┘
          │ ExtractedClaimRecord (JSON)
          ▼
┌─────────────────────────────┐
│  denial-interpretation-agent │  classifies denial reason(s), viability, deadline
└─────────┬────────────────────┘
          │ DenialAnalysis (JSON)
          ▼
┌─────────────────────┐
│  case-builder-agent  │  pulls supporting facts from records + guidelines
└─────────┬────────────┘
          │ CaseFile (JSON)
          ▼
┌─────────────────────┐
│  appeal-drafter-agent│  writes the actual appeal letter
└─────────┬────────────┘
          │
          ▼
   Draft appeal letter + review checklist
```

Run it with `/draft-appeal`, or invoke the agents individually via the Agent tool
by `subagent_type` name. Each stage's output is the next stage's input — don't skip
a stage or hand-edit an intermediate artifact without re-running validation, since
downstream agents trust the upstream schema.

---

## 2. Shared data contracts

### `ExtractedClaimRecord` (produced by `extraction-agent`)

```json
{
  "patient": { "name": "", "member_id": "", "dob": "" },
  "claim": {
    "claim_number": "",
    "provider_name": "",
    "payer_name": "",
    "eob_date": "",
    "denial_letter_date": ""
  },
  "line_items": [
    {
      "line_id": 1,
      "date_of_service": "",
      "cpt_hcpcs_code": "",
      "description": "",
      "billed_amount": 0.00,
      "allowed_amount": 0.00,
      "paid_amount": 0.00,
      "patient_responsibility": 0.00,
      "carc_codes": [""],
      "rarc_codes": [""],
      "denial_reason_text_on_eob": ""
    }
  ],
  "stated_appeal_deadline": "or null if not printed on the document",
  "ocr_flags": ["fields with low OCR confidence or illegible source text"],
  "source_documents": ["filenames processed"]
}
```

### `DenialAnalysis` (produced by `denial-interpretation-agent`)

```json
{
  "line_items": [
    {
      "line_id": 1,
      "denial_category": "medical_necessity | coding_bundling | missing_information | authorization | timely_filing | eligibility_cob | non_covered_service | duplicate_claim | experimental_investigational | other",
      "plain_english_explanation": "",
      "argument_type_needed": "clinical | administrative_procedural | coding_correction",
      "is_likely_appealable": true,
      "additional_info_needed_from_patient": [""],
      "confidence": "high | medium | low"
    }
  ],
  "appeal_deadline": { "date": "or null", "source": "stated_on_eob | plan_type_estimate | unknown", "caveat": "" },
  "overall_case_strength": "strong | moderate | weak | needs_more_info"
}
```

### `CaseFile` (produced by `case-builder-agent`)

```json
{
  "line_items": [
    {
      "line_id": 1,
      "argument_narrative": "the specific rebuttal, in plain prose",
      "supporting_facts": [
        { "fact": "", "source": "record name + date/page" }
      ],
      "cited_guidelines_or_policies": [""],
      "evidence_gaps": ["what's missing that would strengthen this line item"],
      "recommended_attachments": [""]
    }
  ]
}
```

### Final output (produced by `appeal-drafter-agent`)

A complete draft appeal letter (markdown/text, or handed to the `docx` skill for a
formatted Word doc on request) plus a review checklist of items only the patient can
supply or confirm (signature, personal statement, physician's letter, mailing address
verification).

---

## 3. Common CARC categories (starting reference for `denial-interpretation-agent`)

CARC = Claim Adjustment Reason Code, RARC = Remittance Advice Remark Code — the
standardized codes payers print on an EOB/ERA to explain an adjustment or denial.
These map approximately to categories (verify current definitions against the
official X12 list via web search when a code is unfamiliar or the payer's usage
seems non-standard):

| Category | Representative CARC codes |
|---|---|
| Medical necessity | 50, 149 |
| Non-covered / benefit exclusion | 96 |
| Coding / bundling | 97, 234, 4, 16 (with a coding-related RARC) |
| Missing / invalid information | 16 (with a documentation-related RARC) |
| Authorization / precertification | 197 |
| Timely filing | 29 |
| Eligibility / coordination of benefits | 22, 27 |
| Duplicate claim | 18 |
| Out-of-network | 242 |
| Experimental / investigational | 55 |

## 4. Appeal deadlines

Always prefer the deadline **printed on the EOB or denial letter itself** over any
general rule — payers must state it, and it controls. Only fall back to a general
range (e.g., commercial/ERISA plans commonly allow 180 days from denial; Medicare
Advantage timelines are shorter) when nothing is printed, and always caveat that the
patient should confirm against their plan documents. Never let the drafting agent
invent a deadline.

## 5. Privacy and scope notes

- Uploaded EOBs and medical records are PHI. Process them only within this workflow;
  don't send excerpts to services beyond what's needed for the task at hand.
- Every stage is drafting/organizing assistance, not legal or medical advice. The
  final letter is a draft for the patient to review, personalize, and sign — the
  `appeal-drafter-agent` must say so explicitly in its output and flag anything a
  licensed professional should weigh in on (e.g., disputed medical necessity calls).
- If extracted or interpreted data looks internally inconsistent (e.g., paid amount
  exceeds billed amount, dates out of order), each agent should flag it rather than
  silently proceeding.

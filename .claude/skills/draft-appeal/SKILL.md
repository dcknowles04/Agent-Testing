---
name: draft-appeal
description: Runs the "Appeals" team pipeline end to end — extraction, denial interpretation, case building, and letter drafting — from an uploaded EOB (and optionally medical records) to produce a draft insurance appeal letter. Use when the user uploads an EOB/denial letter and asks for help appealing a denied claim, or explicitly invokes /draft-appeal.
---

# Draft an insurance appeal

This runs the four-stage "Appeals" team documented in `docs/appeals-team.md`. Each
stage is a project subagent in `.claude/agents/`; this skill just sequences them and
carries the structured handoff between stages.

## Before starting

Confirm you have:
1. The EOB or denial letter (required).
2. The relevant medical records (needed for `medical_necessity` / `clinical`
   arguments — if missing and a line item turns out to need them, say so when you
   get to stage 3 rather than blocking upfront).

If only the EOB is available, proceed anyway — extraction and interpretation don't
need the records, and the case builder will flag which line items can't be fully
supported without them.

## Steps

1. **Extract.** Invoke the `extraction-agent` subagent (via the Agent tool) with the
   uploaded file paths. It returns an `ExtractedClaimRecord` JSON object. Sanity
   check it briefly — if `ocr_flags` lists something load-bearing (e.g., a CARC code
   itself is uncertain), surface that to the user before continuing, since it
   affects every later stage.

2. **Interpret.** Invoke `denial-interpretation-agent` with that JSON. It returns a
   `DenialAnalysis`. If `overall_case_strength` is `weak` for every line item, tell
   the user plainly before spending the next two stages building a case — ask
   whether they still want a drafted letter or would rather stop here.

3. **Build the case.** Invoke `case-builder-agent` with the `ExtractedClaimRecord`,
   the `DenialAnalysis`, and the medical records (file paths or content). It returns
   a `CaseFile`.

4. **Draft.** Invoke `appeal-drafter-agent` with all three artifacts. It writes the
   letter file and a review checklist.

5. **Hand back to the user.** Present the letter and checklist directly (and send
   the file via SendUserFile if one was produced). Call out anything from
   `evidence_gaps` or `additional_info_needed_from_patient` that's still open —
   these are the things only the patient can resolve before sending.

## Notes

- Don't skip stages or hand-write a stage's output yourself even if it seems
  obvious — the schemas in `docs/appeals-team.md` § 2 are what keep the pipeline
  consistent across runs, and each agent is scoped to catch things (OCR errors,
  denial miscategorization, unsupported claims) that are easy to miss doing it all
  in one pass.
- If the user has multiple denied claims/EOBs, run the full pipeline once per claim
  — don't merge unrelated claims into one `ExtractedClaimRecord`.
- Treat all uploaded documents as PHI: keep them scoped to this workflow.

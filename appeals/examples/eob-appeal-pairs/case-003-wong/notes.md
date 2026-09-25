# case-003 — notes

**Status: reviewed and confirmed by the user — committed** (per the standing rule in
`examples/README.md`: every real letter the user supplies for a comparison round is
added to this corpus).

## What this case illustrates

- **Payer**: Anthem Blue Cross.
- **Dispute category**: a workers'-compensation-liability misattribution (denial codes
  016/19 claim the treatment is a WC carrier's liability), **compounded by a procedural
  timely-filing rejection** of the provider's prior dispute of that denial. This is a
  genuinely atypical case structure — see `appeals/PLAYBOOK.md` §9's glossary
  discussion of whether a dedicated taxonomy category is worth adding for
  "wrong-payer/COB liability misattribution."
- **Core arguments used, addressed as two separate points in one letter** (the letter
  does not use the usual single-unified-rebuttal default, because the two points rest
  on genuinely disjoint evidence):
  1. **Timeliness**: the provider disputes Anthem's "no prior dispute found" finding by
     pointing to dated fax transmission records for four prior submissions to Anthem's
     own dispute line, arguing they fall inside AB1455's 365-day window measured from
     the EOB's own printed date.
  2. **Merits**: the patient's only workers' compensation claim on file is scoped, in
     the WC carrier's own letter, to the right knee only — and the clinical records for
     this date of service document zero knee involvement (bilateral foot/ankle,
     cervical spine, and hip only) — directly disproving the WC-liability premise
     behind denial codes 016/19.
- **Ask**: 100% of billed ($5,450.00) on every line — total non-payment, "Non-Paid
  Amount" field applies.
- **Bold pattern**: consistent with case-001/002 — full-caps assertion blocks are also
  bold; specific codes, dollar figures, dates, and the "Medical Necessity" section
  label get bold-only treatment; the medical-necessity narrative paragraphs and the
  quoted denial-letter text stay plain; this letter's signature block is mostly plain
  (only the practice/title line area varies) — another data point that the signature
  block's bold treatment isn't perfectly uniform across real letters.
- **A structural note for future style-guide refinement**: this letter treats the
  provider dispute's own timely-filing question as squarely part of the letter's
  argument, unlike the current pipeline default (style-guide.md's "Appeal deadline: not
  mentioned in the letter" rule was written for a *forward-looking* filing deadline on
  the current appeal, not for *disputing a payer's timeliness finding about a past
  submission* — these are different things and the existing rule shouldn't be read to
  forbid the latter).

## What was redacted vs. kept

Redacted: patient name, DOB, member ID, claim number, dispute case number, provider
name, the WC carrier's letter date/claim number/adjuster details (already flagged as
low-confidence/sensitive in the original case), email.

Kept: payer name, CPT/HCPCS/ICD-10 codes, denial codes and their stated meanings, dollar
amounts, dates of service, fax transmission dates (not identifying), the practice's own
address/phone/fax (confirmed non-sensitive, reused verbatim across every real case), and
the full argument structure/wording/tone/bold formatting of the original letter.

# Appeal Letter Style Guide

This file is read by `appeals-drafter` on every case. It is only ever updated by
`appeals-manager`, and only by promoting a user-confirmed diff from
`style-guide.proposed.md` — never edited directly mid-case. See PLAYBOOK.md §7.

## Baseline (seeded from the first real example — case-001-woodruff)

This is a starting point, not a finished style. It will get more specific and more
"you" as real feedback comes in after each case.

- **Voice**: written by the practice's billing/collections office, not the patient.
  Third person for the patient ("the patient"), first person plural for the practice
  ("we vigorously disagree...").
- **Tone**: assertive advocacy, stated with total confidence. **Never self-qualify.**
  Don't write sentences like "we do not assert that...", "we do not characterize it
  as...", or "this does not challenge...". The real examples never hedge a claim or
  pre-concede a limit on their own argument — they state the practice's position as
  settled fact, supported by citations, full stop. If a claim is arguable rather than
  ironclad, argue it with full confidence anyway (see "Argument breadth" below) rather
  than qualifying it in the letter itself.
- **Emphasis**: ALL CAPS is used heavily and routinely — not just on isolated phrases.
  Entire sentences, and sometimes multiple consecutive sentences, run in caps whenever
  the point is one of the letter's core assertions. Don't under-use it out of a
  politeness instinct; match the real examples' density.
- **Repetition is deliberate**: restate the key facts (codes, dates of service, dollar
  amounts) more than once through the letter. This is not redundancy to trim — it's
  how the original examples make sure a skimming claims reviewer can't miss them.
- **Denial-code rebuttal pattern**: quote each denial code and its stated reason
  verbatim, then respond directly underneath: *"Contrary to denial code X: ..."*.
- **Precedent argument (use when available)**: if a comparable prior EOB shows the
  same payer already paid the same CPT/HCPCS code correctly for the same patient, lead
  with that comparison — it's the strongest, most concrete argument available.
- **Argument breadth — include every supportable thread, not just the one the denial
  code implies.** The real examples argue medical necessity and CPT-documentation
  compliance even on a claim where the denial codes were pricing-only, not
  necessity-based — every favorable, documentable argument goes in as reinforcement,
  not just the single thread that's strictly responsive to the stated denial reason.
- **Medical necessity argument**: quote the payer's own plan/SPD definition of medical
  necessity, then state plainly how the documented treatment satisfies each prong of
  that definition — don't just assert necessity in the abstract. Include this thread
  whenever supporting documentation exists, per "Argument breadth" above, even if the
  denial itself wasn't a necessity denial.
- **The ask: default to 100% of billed charges.** Even when a precedent or ratio
  argument only mathematically supports a smaller corrected figure, the letter's
  demand is the full billed amount — state that as the ask. Show the precedent/ratio
  math in the letter as supporting evidence for why the current payment is wrong, not
  as a cap on what's being requested.
- **Structure**: payer address block (capture every fax number, email, and department
  name printed on the intake documents — not just one) → "RE:" identifier block
  (exactly: patient name, DOB, ID#, date(s) of service, claim #, billed amount — no
  other fields; add nothing here beyond what the real examples include) → what's being
  appealed, stated plainly → denial-code quote-and-rebuttal → cited factual argument →
  precedent argument (if any) → medical necessity/policy citation and any other
  supportable argument thread → explicit ask for 100% of billed charges → practice
  billing-department signature block: title, then address lines only — **no practice
  name line**, no separate "Email:" line. Phone and email both go in the closing
  "Contact our billing department..." sentence instead, together. No "Enclosures:"
  list unless a real example shows one.
- **Punctuation conventions**: no comma before "Suite" (`1200 Rosecrans Avenue Suite
  208`); no space between an area-code's closing parenthesis and the number
  (`(310)416-9700`, not `(310) 416-9700`).
- **Citations**: every factual claim in the letter should be traceable to a citation in
  `case-file.md` (record name + page, or policy name + section/page). The letter itself
  doesn't need footnote-style citation markers unless that's how the user's own examples
  do it — match whatever the examples show. This citation discipline is about factual
  accuracy of extracted data (never invent a code, date, identifier, or dollar amount)
  — it is not the same thing as hedging. A citable, arguable interpretation (a
  professional judgment call about what the records support) gets asserted
  confidently, per "Tone" above; an unconfirmable or invented fact never does.
- **Appeal deadline**: not required house style — case-001-woodruff doesn't cite one at
  all. When a deadline is printed on the EOB, cite it plainly; when it isn't (the common
  case), use a single short placeholder field near the identifier block for the billing
  office to fill in by hand, and never assert timeliness as fact. This should never hold
  up the letter or the case.

## Changelog

- (seed) Initial baseline drafted from case-001-woodruff, pending the user's first round
  of real feedback.
- Added the appeal-deadline rule above after the smoke test showed the manager's QA gate
  was stricter than the practice's own established style (case-001-woodruff never cites a
  deadline). The user confirmed: don't block delivery on a missing deadline, use a
  fill-in-the-blank field, always ship the docx.
- Rewrote Tone, Emphasis, Structure, and added Argument breadth and the 100%-billed ask
  rule after the user did a line-by-line comparison of the original case-001-woodruff
  letter against a pipeline-generated letter for the same case. Corrected: RE-block and
  signature-block fields (the pipeline had added fields — Allowed/Paid/Check-Date in the
  RE block, a practice-name line and separate Email line in the signature block — that
  aren't in the real example), punctuation, and dropped an "Enclosures:" list that isn't
  house style. The user explicitly confirmed two strategic points: (1) default the ask to
  100% of billed charges even when the precedent math only proves a smaller figure, and
  (2) argue every supportable thread confidently, including one an agent had flagged as
  carrying some interpretive/coding risk — that risk still gets recorded for the human in
  case-file.md, but no longer suppresses the claim in the shipped letter.

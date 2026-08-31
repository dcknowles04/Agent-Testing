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
- **Tone**: assertive advocacy. Don't hedge. State the practice's position as fact,
  supported by citations, not as a request for consideration.
- **Emphasis**: use ALL CAPS sparingly but decisively on the letter's core assertions
  (the thing you most want the reviewer to act on) — not on every sentence.
- **Repetition is deliberate**: restate the key facts (codes, dates of service, dollar
  amounts) more than once through the letter. This is not redundancy to trim — it's
  how the original examples make sure a skimming claims reviewer can't miss them.
- **Denial-code rebuttal pattern**: quote each denial code and its stated reason
  verbatim, then respond directly underneath: *"Contrary to denial code X: ..."*.
- **Precedent argument (use when available)**: if a comparable prior EOB shows the
  same payer already paid the same CPT/HCPCS code correctly for the same patient, lead
  with that comparison — it's the strongest, most concrete argument available.
- **Medical necessity argument**: quote the payer's own plan/SPD definition of medical
  necessity, then state plainly how the documented treatment satisfies each prong of
  that definition — don't just assert necessity in the abstract.
- **Structure**: payer address block → "RE:" identifier block (patient name, DOB, ID#,
  date(s) of service, claim #, billed amount) → what's being appealed, stated plainly →
  denial-code quote-and-rebuttal → cited factual argument → precedent argument (if any)
  → medical necessity/policy citation (if relevant) → explicit dollar-amount ask and
  requested action → practice billing-department signature block (name/title, address,
  phone, fax, email).
- **Citations**: every factual claim in the letter should be traceable to a citation in
  `case-file.md` (record name + page, or policy name + section/page). The letter itself
  doesn't need footnote-style citation markers unless that's how the user's own examples
  do it — match whatever the examples show.
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

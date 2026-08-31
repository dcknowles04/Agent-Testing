# case-001 — notes

**Status: reviewed and confirmed by the user — committed.**
The originals remain in `appeals/examples/_raw-unredacted/` (git-ignored, local only:
`eob-appeal-package.pdf`, `appeal-letter.docx`).

## What this case illustrates

- **Payer**: Anthem Blue Cross (kept as-is — not patient-identifying, and useful context
  for future payer-specific pattern matching).
- **Dispute category**: `out_of_network_rate_dispute` — denial codes cited were an
  Anthem-specific "015" (out-of-network provider, maximum allowed already paid) and "45"
  (charge exceeds fee schedule/contracted amount), on CPT 20611 (ultrasound-guided
  injection) and J3490 (unclassified drug/NDC-billed injectable).
- **Core argument used**: a **precedent argument** — a prior EOB for the *same patient*
  and the *same CPT codes* (different date of service) showed the same payer paying
  those exact codes at a much higher allowed/paid amount. The letter leads with that
  comparison as its strongest point, then also layers on a medical-necessity argument
  (citing the payer's own plan SPD definition) even though the actual denial codes were
  about payment rate, not necessity — belt-and-suspenders.
- **Style baseline**: this letter is the source for the baseline style rules seeded into
  `appeals/style-guide.md` — assertive tone, ALL CAPS on key assertions, repeated core
  facts, "Contrary to denial code X: ..." rebuttal pattern, explicit dollar-amount ask,
  practice billing-department signature block (not a patient signature).

## What was redacted vs. kept

Redacted: patient name, DOB, member/subscriber ID, claim numbers, patient account
number, provider name/ID, practice address/phone/fax/email.

Kept: payer name, CPT/HCPCS/ICD-10 codes, denial codes and their stated meanings, dollar
amounts, dates of service, and the full argument structure/wording/tone of the letter —
these are what make the example useful and none of them identify the patient.

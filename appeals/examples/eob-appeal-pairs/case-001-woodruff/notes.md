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
number, treating provider name, and the staff member's email address.

Kept: payer name, the payer's plan-specific claims email/fax, CPT/HCPCS/ICD-10 codes,
denial codes and their stated meanings, dollar amounts, all dates (service dates and EOB
processing/determination dates alike), the practice's own address/phone/fax, and the full
argument structure/wording/tone of the letter — these are what make the example useful
and none of them identify the patient.

**Backfilled 2026-09-03** after a fresh copy of this same real letter was supplied for
comparison: this example was redacted first, before the phone/address-kept,
email-redacted convention was established on later examples (Wright, Wong, Voigt). It had
several fields left as generic bracket placeholders (`[date]`, `[phone]`, `[email]`,
`[Practice Name]`, `[Practice Address]`) instead of being filled with real, non-sensitive
values or properly redacted per the now-current convention. Corrected to match: payer
claims email/fax, both EOB dates, and the practice's phone/address/fax are now filled in
with real values; the erroneous stray `[Practice Name]` signature line is removed (no
real example has ever had one). The treating-provider name placeholder (`[Treating
provider]`) was deliberately left as-is pending explicit user confirmation on whether
this physician's name should be named directly, matching or diverging from later
examples' treatment of it.

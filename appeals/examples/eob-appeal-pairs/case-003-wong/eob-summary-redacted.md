# EOB summary — case-003 (redacted)

Mirrors the fields `appeals-extraction` is expected to pull out, redacted per
`examples/README.md`'s checklist. Sourced from a real Anthem denial/dispute-rejection
package plus clinical records — an unusually structured case (see notes.md).

## Identifiers

- Patient: **[Patient Name]** — DOB **[Redacted]**
- Payer: Anthem Blue Cross Life and Health Insurance Company
- Member ID: **[Redacted]**
- Provider: **[Provider Name], M.D.** at West Coast Center for Orthopedic Surgery — out
  of network for this plan
- Claim number: **[Redacted]**
- Dispute case number: **[Redacted]**

## Denied claim — date of service 07/08/2024

| CPT/HCPCS | Description | Billed | Allowed | Paid | Denial code(s) |
|---|---|---|---|---|---|
| 99214 | E/M office visit, >30 min | $950.00 | $0.00 | $0.00 | 016, 19 |
| 73610 x2 | Ankle x-ray, complete, 3 views | $450.00 each | $0.00 | $0.00 | 016, 19 |
| 73630 x2 | Foot x-ray, complete, min. 3 views | $350.00 each | $0.00 | $0.00 | 016, 19 |
| 73660 x2 | Toe x-ray, min. 2 views | $250.00 each | $0.00 | $0.00 | 016, 19 |
| 76881 x2 | Diagnostic ultrasound, complete extremity | $1,200.00 each | $0.00 | $0.00 | 016, 19 |

Total billed **$5,450.00** — every line denied at $0.00 allowed/$0.00 paid (total
non-payment case).

**Denial code meanings (as printed on this payer's remittance):**
- **016** — "Benefits are not available for conditions or injuries subject to Workers
  Compensation coverage."
- **19** (standard ANSI CARC) — "This is a work-related injury/illness and thus the
  liability of the Worker's Compensation Carrier."

Diagnosis codes on this date of service: M25.572, M25.872, M54.2, M65.871, M65.872,
M72.1, M72.2, M70.61, M70.62, M16.11, M16.12 (bilateral foot/ankle, cervical spine, and
bilateral hip pathology — no knee diagnosis anywhere).

## The procedural complication this case adds

Before this letter, the provider filed a dispute of the above denial; Anthem's
Grievances & Appeals department rejected that dispute as **untimely** under
California's AB1455 (365-day filing rule), stating no prior dispute was found and that
"provider dispute rights ... are exhausted." The provider's own fax transmission
records (four dated confirmations to Anthem's dispute line) plus Anthem's own printed
365-day math were the basis for arguing the dispute was, in fact, timely — see
notes.md.

## Records supporting the argument

- A 2023 letter from the patient's workers' compensation carrier, stating that WC
  claim's coverage is limited to the right knee only, no other body part.
- Handwritten orthopedic progress note, four radiology reports (bilateral ankle/foot/toe
  x-rays), two diagnostic ultrasound reports, and exam forms — none of which document
  any knee complaint, finding, or diagnosis.
- Four dated fax transmission/confirmation reports evidencing prior submissions to the
  payer's dispute line.

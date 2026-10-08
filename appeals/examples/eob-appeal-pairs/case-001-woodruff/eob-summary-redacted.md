# EOB summary — case-001 (redacted)

Mirrors the fields `appeals-extraction` is expected to pull out, redacted per
`examples/README.md`'s checklist. Sourced from a real scanned EOB + handwritten
clinical/procedure notes package.

## Identifiers

- Patient: **[Patient Name]** — DOB **[Redacted]**
- Payer: Anthem Blue Cross (plan administered via DGA)
- Subscriber/Member ID: **[Redacted]**
- Provider: **[Provider Name], M.D.** at **[Practice Name]** — out-of-network for this plan
- Claim number (denied claim): **[Redacted]**
- Claim number (comparable prior claim): **[Redacted]**

## Denied claim — date of service 09/23/2025

| CPT/HCPCS | Description | Billed | Allowed | Paid | Denial code(s) |
|---|---|---|---|---|---|
| 99214-25 | E/M office visit, >30 min | (billed w/ above) | — | — | — |
| 20611 x2 | US-guided arthrocentesis/injection, R elbow lateral + medial epicondyle | $5,000.00 | $1,094.00 | $765.80 | 015, 45 |
| J3490 x2 | Unclassified drug (lidocaine/corticosteroid, NDC-billed) | $8,000.00 | $1,046.07 | $732.25 | 015, 45 |

**Denial code meanings (as printed on this payer's EOB):**
- **015** — "Processed as an out-of-network provider; the maximum amount has been paid."
- **45** — "Charge exceeds fee schedule/maximum allowable or contracted/legislated fee arrangement."

Diagnosis codes on this date of service: M17.31, M17.32, M54.2, M77.11, M77.12, M77.01,
M77.02 (bilateral knee/elbow/cervicalgia pathology).

## Comparable prior claim — date of service 10/14/2024 (same patient, same payer)

| CPT/HCPCS | Billed | Allowed | Paid |
|---|---|---|---|
| 20611 x2 | $3,600.00 each | $2,483.16 each | $2,483.16 each (100% of allowed) |
| J3490 x2 | $6,000.00 each | $4,139.07 each | $4,139.07 each (100% of allowed) |

This is the precedent used in the appeal: the same payer, for the same patient, already
paid these exact CPT codes at 100% of the allowed amount roughly a year earlier — which
directly undercuts the "maximum already paid" / "exceeds fee schedule" denial reasoning
on the newer claim.

## Records supporting the argument

- Handwritten progress note (orthopedic surgery/sports medicine visit) documenting
  bilateral knee/elbow/cervical spine exam findings, diagnoses, and the injection
  procedures performed.
- Radiology/procedure report for the ultrasound-guided injections, documenting needle
  visualization, medication given (with NDC number), and meeting the CPT 20611
  documentation requirements (focused ultrasound evaluation, image interpretation,
  normal/pathologic findings, procedure documentation, medication/dosage documentation).
- Detailed elbow/knee/cervical spine examination forms with ROM, strength, and tenderness
  findings supporting the diagnoses above.

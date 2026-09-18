# EOB summary — case-002 (redacted)

Mirrors the fields `appeals-extraction` is expected to pull out, redacted per
`examples/README.md`'s checklist. Sourced from a real UHC/Optum bundling-denial package
plus clinical/procedure notes.

## Identifiers

- Patient: **[Patient Name]** — DOB **[Redacted]**
- Payer: United Healthcare / Optum
- Subscriber/Member ID: **[Redacted]**
- Provider: **[Provider Name], M.D.** at West Coast Center for Orthopedic Surgery
- Claim number: **[Redacted]**

## Denied claim — date of service 05/12/2025

| CPT/HCPCS | Description | Denial reason (as printed) |
|---|---|---|
| 99205-25 | New-patient E/M, >50 min | (paid; anchor code for the bundling denial below) |
| 72052 | Cervical spine x-ray, complete series w/ report | "Not supported. Included in CPT 99205; the interpretation of a radiology service ... is included in the E/M service." |
| 73030 x2 | Bilateral shoulder x-ray w/ report | same bundling denial reason |
| 76881 x2 | Bilateral shoulder diagnostic ultrasound complete w/ report | same bundling denial reason |

Total billed for the denied radiology lines: **$6,300.00** (total non-payment case — no
line paid).

Diagnosis codes on this date of service: M75.41, M75.42, M75.111, M19.012 (bilateral
shoulder), M50.30 (cervical disc disorder), M79.10 (myalgia/lumbar).

## Core argument used

**Bundling/coding-edit rebuttal**, not a rate or necessity dispute: UHC's own
Professional/Technical Component Policy allows separate reimbursement for a radiology
interpretation-and-report when one is submitted — which it was, as five separate,
signed diagnostic reports (not a global read folded into the E/M visit). The letter
argues the global diagnostic imaging service (technical + professional component) was
independently performed and documented by the treating physician, distinct from the
E/M encounter itself, and cites the CMS Medicare Coverage Database (Pub. 100-04, Ch.
13, §§100–100.1) for the general principle that Medicare separately pays for
interpretation-and-report apart from E/M.

## Records supporting the argument

- Five separate, physician-signed diagnostic radiology reports (x-ray and ultrasound)
  for the cervical spine and bilateral shoulders, each containing its own written
  interpretation and impression — not folded into the E/M note.
- Physician encounter note documenting >50 minutes of face-to-face/non-face-to-face time,
  comprehensive history, exam, and medical management across all three regions
  (shoulders, cervical spine, lumbar spine), supporting the 99205-25 level separately
  from the imaging.

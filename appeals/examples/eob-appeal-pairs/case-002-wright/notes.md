# case-002 — notes

**Status: reviewed and confirmed by the user — committed** (per the standing rule in
`examples/README.md`: every real letter the user supplies for a comparison round is
added to this corpus).

## What this case illustrates

- **Payer**: United Healthcare / Optum.
- **Dispute category**: `bundling_coding_edit` — UHC denied four radiology lines
  (72052, 73030x2, 76881x2) as "included in" the same-day E/M visit (99205-25), a
  bundling edit, not a rate or necessity denial.
- **Core argument used**: pull the specific requirement UHC's own policy states for
  separate reimbursement (a written interpretation-and-report), then show the records
  satisfy it — five distinct, physician-signed diagnostic reports, not a folded-in
  read. Reinforced with an outside citation (CMS Medicare Coverage Database) even
  though UHC, not Medicare, is the payer — used as persuasive authority for the general
  interpretation-and-report-is-separately-payable principle.
- **Ask**: 100% of billed ($6,300.00) on every denied line — a total non-payment case,
  so the RE block carries a "Non-Paid Amount" line (this is where that field in
  `style-guide.md` came from).
- **Bold pattern**: the letter's own full-caps assertion blocks are consistently also
  bold; short imperatives and specific CPT codes/page citations get bold-only treatment
  within otherwise plain-case sentences; the signature block bolds only the title line,
  not the address/phone lines beneath it (unlike case-001, where the whole signature
  block is bold — the pattern isn't perfectly uniform across real letters, and the
  drafter should match whichever example is closest rather than assume one universal
  rule for every field).

## What was redacted vs. kept

Redacted: patient name, DOB, member/subscriber ID, claim number, provider name, email.

Kept: payer name, CPT/HCPCS/ICD-10 codes, denial reasoning as printed, dollar amounts,
dates of service, the practice's own address/phone/fax (confirmed non-sensitive,
reused verbatim across every real case), and the full argument structure/wording/tone/
bold formatting of the original letter.

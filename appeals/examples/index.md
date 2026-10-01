# Examples index

A scan-first catalog of every entry in `eob-appeal-pairs/` and `past-letters/`. Read
this table first to pick the 2–3 closest-matching examples by payer and dispute
category, then open only those entries' full files — don't open every example to
decide.

`appeals-manager` maintains this file: every time a new real letter is added to the
corpus (per the standing rule in `examples/README.md`), it appends a row here in the same
step.

| Case | Payer | Dispute category | CPT/denial codes | DOS | Ask | Argument pattern | Formatting caveats |
|---|---|---|---|---|---|---|---|
| [case-001-woodruff](eob-appeal-pairs/case-001-woodruff/) | Anthem Blue Cross (DGA plan) | `out_of_network_rate_dispute` | CPT 20611x2, J3490x2; denial codes 015, 45 | 09/23/2025 | **Not representative of the current ask rule** — this letter asks for the payer's own established precedent rate, not 100% of billed. `style-guide.md`'s "always ask 100% of billed" rule postdates this example and supersedes it; don't copy this letter's specific ask pattern. | Precedent argument (same patient/code paid correctly before) as the lead point, layered with a medical-necessity thread even though the denial was pricing-only | Signature block fully bold (title + address + phone/fax) |
| [case-002-wright](eob-appeal-pairs/case-002-wright/) | United Healthcare / Optum | `bundling_coding_edit` | CPT 99205-25, 72052, 73030x2, 76881x2 | 05/12/2025 | 100% of billed ($6,300.00) | Cites the payer's own component-billing policy plus an outside CMS citation to show the radiology interpretation-and-report is separately payable from the E/M visit | Signature block bolds only the title line, not the address/phone lines below it |
| [case-003-wong](eob-appeal-pairs/case-003-wong/) | Anthem Blue Cross | Two-pronged: workers'-comp liability misattribution (codes 016/19) + a timely-filing rebuttal of the payer's own dispute-rejection | CPT 99214, 73610x2, 73630x2, 73660x2, 76881x2; denial codes 016, 19 | 07/08/2024 | 100% of billed ($5,450.00) | Two separate points argued in one letter (procedural timeliness math, then WC-misattribution on the merits) rather than the usual single unified rebuttal — only do this when two threads genuinely rest on disjoint evidence, per `case-file.md`'s guidance | Signature block mostly plain, not bold |
| [letter-001-voigt](past-letters/letter-001-voigt.md) | Aetna Insurance (reviewed via Global Excel, a third-party claims-review TPA) | `medical_necessity` — **no denial code at all**; this is a direct response to a pre-payment documentation/LMN request, not a denial rebuttal | CPT 99214-25, 20553, J3490x3; no CARC/EXPL codes present | 07/14/2025 | 100% of billed ($14,750.00) | Pure medical-necessity case: failed-conservative-treatment history, objective trigger-point exam findings, successful outcome after injection — opens by naming the requesting letter (payer/TPA + date) directly, no denial-code quote-and-rebuttal section since nothing was denied yet | Heavy bold-with-caps throughout, consistent with the other examples; two isolated sentences use caps with no bold at all — read as inconsistency in this one letter, not a new rule |
| [letter-002-mccracken-05162025](past-letters/letter-002-mccracken-05162025.md) | Aetna Insurance | Mixed — reads closest to `bundling_coding_edit` (99214-25 "included in procedure performed on same date," J3490x3 "incidental to another procedure") layered with a fee-schedule/underpayment point on 20553; no single taxonomy label covers all three | CPT 99214-25, 20553, J3490x3; denial codes #1, #4, #3 | 05/16/2025 | 100% of billed ($13,250.00) | Same-patient/same-codes prior-EOB precedent lead, then a direct quote-and-match against the payer's own Clinical Policy Bulletin (Aetna CPB 0016), then a per-denial-code rebuttal | Heavy bold-with-caps; ***Do not duplicate this claim.*** convention holds |
| [letter-003-mccracken-08082025](past-letters/letter-003-mccracken-08082025.md) | Aetna Insurance | `missing_documentation` — direct response to denial code #1 ("we do not have the information we need... we requested specific information"); same patient as letter-002 but a different claim, not a revision | CPT 99214-25, 20553, J3490x2; denial code #1 | 08/08/2025 | 100% of billed ($13,250.00) | Same same-patient prior-EOB precedent lead as letter-002, plus full medical-necessity narrative, used to answer a documentation request rather than rebut a substantive denial | Heavy bold-with-caps; ***Do not duplicate this claim.*** convention holds |
| [letter-004-fleischman-10132025](past-letters/letter-004-fleischman-10132025.md) | Anthem Blue Cross (billed through MPI, a billing/practice-management intermediary) | `missing_documentation` — denial codes 904/252, both documentation-request codes | CPT 99214-25, 20553, J3490x3; denial codes 904, 252 | 10/13/2025 | 100% of billed ($9,950.00) | **New precedent variant**: cites the payer's own prior Grievance and Appeals "OVERTURN" letter (a separate earlier dispute) as proof a code is on the payer's fee schedule, instead of a same-patient comparable EOB | Heavy bold-with-caps; ***Do not duplicate this claim.*** convention holds |
| [letter-005-wong-06282025](past-letters/letter-005-wong-06282025.md) | Anthem Blue Cross (billed through MPI) | `missing_documentation` — denial codes 904/252 | CPT 99214-25, 20553, J3490x3; denial codes 904, 252 | 06/28/2025 | 100% of billed ($16,250.00) | Same-patient comparable-EOB precedent, but the cited comparable claim was itself only partially allowed (not 100%-paid like every other precedent example) | Heavy bold-with-caps; only example so far using a bulleted key-value list for the per-code billed/allowed breakdown — a formatting variant to watch, not yet a rule. Same patient as case-003-wong but a different claim (different DOS, denial reason, and codes breakdown) |
| [letter-006-mccracken-08062025](past-letters/letter-006-mccracken-08062025.md) | Aetna Insurance | `missing_documentation` — denial code #1, same text as letter-003 | CPT 99214-25, 20553, J3490x2; denial code #1 | 08/06/2025 | 100% of billed ($13,250.00) | Near-identical template to letter-003 (same precedent lead, same Aetna CPB 0016 citation) — a third, separate McCracken/Aetna claim confirming this is a stable house template, not one-off phrasing | Heavy bold-with-caps; ***Do not duplicate this claim.*** convention holds |
| [letter-007-merriman-08182025](past-letters/letter-007-merriman-08182025.md) | **Cigna Health — first Cigna example in the corpus** | Two-pronged in one letter: a unit/frequency-limit coding edit (`bundling_coding_edit`, denial code A2) plus a documentation/duplicate-submission dispute (`missing_documentation`, denial code(s) cited inconsistently as A3/A0/A1 — flagged in the file, not resolved) | CPT 99214-25, 20611x2, J3490x2; denial codes A2, A3/A0/A1 | 08/18/2025 | 100% of billed ($23,250.00) | **New pattern**: quotes the payer's own written medical coverage policy directly (Cigna Medical Coverage Policy 0515) to rebut a frequency-limit denial, the same quote-the-policy shape as the Aetna CPB 0016 examples but for a different payer's actual language; also cites proof of prior document submission (fax confirmation) plus a same-patient comparable-EOB precedent | Heavy bold-with-caps; **no** ***Do not duplicate this claim.*** line at all (unlike every Aetna/Anthem example); signature block fully plain, not bold |
| [letter-008-merriman-12292025](past-letters/letter-008-merriman-12292025.md) | Cigna Health | `medical_necessity` — denial code A3 ("documentation currently on file... not medically necessary") on J3490x2 | CPT 99214-25, 20611x2, J3490x2; denial code A3 | 12/29/2025 (per RE block — **see caveat**) | 100% of billed ($15,750.00) | Same Cigna-policy-citation + comparable-EOB-precedent shape as letter-007, narrowed to a single code | **Use for wording/structure only, not facts — this letter is internally inconsistent about its own DOS** (title says 02/24/2025, RE block says 12/29/2025, body passages say 08/18/2025 — the last matching letter-007's unrelated claim). Confirmed NOT the same claim as either the git-ignored 02/24/2025 pipeline case or letter-007. Signature block fully bold, unlike letter-007's fully plain one |
| [letter-009-wright-08152025](past-letters/letter-009-wright-08152025.md) | United Healthcare | `missing_documentation` — no formal CARC code, direct response to a UHC "Medical Records Needed" request letter | CPT 99214-25, 20553, J3490x3; no CARC code | 08/15/2025 | 100% of billed ($13,250.00) | Cervical-trigger-point-injection template (same shape as the McCracken/Fleischman/Wong letters) rather than case-002-wright's own distinct bundling argument — a different Wright/UHC claim, not a revision of case-002 | **Contains a template-contamination artifact — see caveat**: the comparable-EOB it cites is word-for-word the same one cited in the Merriman Cigna letters (letter-007/008), introduced here as a "CIGNA" EOB establishing "CIGNA" coverage even though this letter is otherwise entirely about UHC; one paragraph also asks "Aetna" instead of UHC to review, and cites a stray "DOS 10/24/2025." Core RE-block identifiers are unaffected and internally consistent. Real bulleted lists present; signature block fully plain |

## Known cross-example disagreements (don't average these away — pick per case)

- **Signature-block bold**: varies between fully bold (case-001), title-only bold
  (case-002), and plain (case-003). Match whichever example is closest on payer/dispute
  category rather than assuming one universal rule. The four West Coast Center for
  Orthopedic Surgery examples (letter-002 through letter-005) all bold the
  address/phone/fax lines, but only letter-005 also bolds the title line above them —
  another instance of this same practice's letters not being fully internally consistent
  on this point.
- **The ask**: case-001 predates the "always 100% of billed" rule and shouldn't be
  copied literally on that point — the rule in `style-guide.md` governs, not that one
  example's specific number.
- **letter-008-merriman-12292025 is internally inconsistent about its own facts** (see
  its header comment) — a practice-template-reuse artifact, not a redaction error. Use it
  for wording/structure only; don't treat its DOS, body-part references, or code list as
  reliable, and don't assume any other example has the same problem just because this one
  does.
- **Comparable-EOB citations get copy-pasted across different patients' and different
  payers' letters without being fully updated** — letter-009-wright-08152025 (a UHC
  letter) cites the exact same comparable-EOB figures as the Merriman Cigna letters
  (letter-007/008), attributed to "CIGNA" in the middle of an otherwise all-UHC letter.
  Confirms the template-reuse pattern already flagged in letter-008 isn't limited to one
  patient's own repeat claims — it crosses patients and payers too. Don't assume a
  comparable-EOB citation's stated payer/figures are reliable just because the rest of
  the letter reads consistently; check it against the letter's own primary payer.

## Coverage — what's represented vs. what isn't

So a drafter or case-builder hitting a case with no close match knows that's a real gap,
not a search failure. Update this section every time a new example is added.

**Dispute categories** (per `appeals-denial-interpreter`'s taxonomy):
- Covered: `out_of_network_rate_dispute` (case-001), `bundling_coding_edit` (case-002,
  and partially letter-002-mccracken-05162025), a procedural/timeliness rebuttal
  combined with a wrong-payer liability misattribution that reads closest to
  `non_covered_service` (case-003), a pure `medical_necessity` case with **no denial
  code at all** — a pre-payment documentation/LMN request (letter-001-voigt), and now
  `missing_documentation` with an actual denial code to quote-and-rebut
  (letter-003-mccracken-08082025, letter-004-fleischman-10132025,
  letter-005-wong-06282025, letter-006-mccracken-08062025, and partially
  letter-007-merriman-08182025 — five examples across three payers, Aetna, Anthem/MPI,
  and now Cigna), and now `medical_necessity` with an actual denial code to quote-and-
  rebut (letter-008-merriman-12292025, denial code A3) — **but treat this last one
  cautiously**: it's the only example of the pattern so far, and the example itself is
  flagged as internally inconsistent about its own facts (see "Known cross-example
  disagreements"), so its argument *shape* is usable but shouldn't be treated as a fully
  validated pattern the way the other categories' examples are.
- **Not yet represented by any example**: `eligibility`. If a live case lands there, say
  so explicitly rather than forcing a fit to the nearest existing example.
- **No example yet demonstrates quoting a payer's own plan/SPD medical-necessity
  definition** (the pattern `appeals-case-builder.md`'s `medical_necessity` argument
  pattern calls for) — every real case so far has had an empty `appeals/policy-docs/`
  folder for its payer, so the necessity arguments in the corpus are built from the
  clinical record alone. If a case ever ships with an actual policy document in
  `policy-docs/`, add it as a new example specifically to fill this gap.

**Payers**: Anthem Blue Cross (case-001, case-003, letter-004, letter-005 — 4 of 13
examples), Aetna Insurance (letter-002, letter-003-mccracken, letter-006-mccracken, plus
Aetna/Global Excel as third-party reviewer for letter-001-voigt — 4 examples), United
Healthcare / Optum (case-002, letter-009-wright — 2 examples, two structurally different
templates for the same patient/payer), and **Cigna Health** (letter-007-merriman and
letter-008-merriman — 2 examples). Not yet represented: Humana, Blue Shield,
Medicare/Medicare Advantage, or any state Medicaid plan. Cigna has also been worked as a
live case (`appeals/cases/2026-09-03-merriman-shawne-022425/`, git-ignored PHI) — that
case's own claim (DOS 02/24/2025) is a **different claim** from both letter-007 (DOS
08/18/2025) and letter-008 (DOS 12/29/2025 per its RE block); don't conflate any of these
just because they're all Merriman/Cigna. Anthem's own
house style (verbatim EXPL/ANSI legend quoting, the `out_of_network_rate_dispute`
precedent pattern, and now the `missing_documentation` 904/252 pattern) and Aetna's own
house style (CPB-citation pattern, denial code #1/#3/#4 numbering) are now both
reasonably well-covered — treat a
same-payer match as materially more reliable than a same-category match with a different
payer, but this matters less than it used to now that two payers have multiple examples
each.

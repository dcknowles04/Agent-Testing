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

## Known cross-example disagreements (don't average these away — pick per case)

- **Signature-block bold**: varies between fully bold (case-001), title-only bold
  (case-002), and plain (case-003). Match whichever example is closest on payer/dispute
  category rather than assuming one universal rule.
- **The ask**: case-001 predates the "always 100% of billed" rule and shouldn't be
  copied literally on that point — the rule in `style-guide.md` governs, not that one
  example's specific number.

## Coverage — what's represented vs. what isn't

So a drafter or case-builder hitting a case with no close match knows that's a real gap,
not a search failure. Update this section every time a new example is added.

**Dispute categories** (per `appeals-denial-interpreter`'s taxonomy):
- Covered: `out_of_network_rate_dispute` (case-001), `bundling_coding_edit` (case-002),
  a procedural/timeliness rebuttal combined with a wrong-payer liability misattribution
  that reads closest to `non_covered_service` (case-003), and a pure `medical_necessity`
  case with **no denial code at all** — a pre-payment documentation/LMN request
  (letter-001-voigt).
- **Not yet represented by any example**: `missing_documentation` as the primary/lead
  category, `eligibility`, and a straightforward `medical_necessity` case that has an
  actual denial code to quote-and-rebut (letter-001-voigt's necessity argument is the
  no-denial-code variant, not this one). If a live case lands in one of these categories,
  say so explicitly rather than forcing a fit to the nearest existing example.
- **No example yet demonstrates quoting a payer's own plan/SPD medical-necessity
  definition** (the pattern `appeals-case-builder.md`'s `medical_necessity` argument
  pattern calls for) — every real case so far has had an empty `appeals/policy-docs/`
  folder for its payer, so the necessity arguments in the corpus are built from the
  clinical record alone. If a case ever ships with an actual policy document in
  `policy-docs/`, add it as a new example specifically to fill this gap.

**Payers**: Anthem Blue Cross (case-001, case-003 — 2 of 4 examples), United Healthcare /
Optum (case-002), Aetna / Global Excel as third-party reviewer (letter-001-voigt). Not yet
represented: Cigna, Humana, Blue Shield, Medicare/Medicare Advantage, or any state
Medicaid plan. Anthem's own house style (verbatim EXPL/ANSI legend quoting, the
`out_of_network_rate_dispute` precedent pattern) is the best-covered payer by a wide
margin — treat a same-payer match as materially more reliable than a same-category match
with a different payer until more payers are represented.

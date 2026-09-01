# Examples index

A scan-first catalog of every entry in `eob-appeal-pairs/`. Read this table first to pick
the 2–3 closest-matching examples by payer and dispute category, then open only those
folders' full files — don't open every example's `notes.md` to decide.

`appeals-manager` maintains this file: every time a new real letter is added to the
corpus (per the standing rule in `examples/README.md`), it appends a row here in the same
step.

| Case | Payer | Dispute category | CPT/denial codes | DOS | Ask | Argument pattern | Formatting caveats |
|---|---|---|---|---|---|---|---|
| [case-001-woodruff](eob-appeal-pairs/case-001-woodruff/) | Anthem Blue Cross (DGA plan) | `out_of_network_rate_dispute` | CPT 20611x2, J3490x2; denial codes 015, 45 | 09/23/2025 | **Not representative of the current ask rule** — this letter asks for the payer's own established precedent rate, not 100% of billed. `style-guide.md`'s "always ask 100% of billed" rule postdates this example and supersedes it; don't copy this letter's specific ask pattern. | Precedent argument (same patient/code paid correctly before) as the lead point, layered with a medical-necessity thread even though the denial was pricing-only | Signature block fully bold (title + address + phone/fax) |
| [case-002-wright](eob-appeal-pairs/case-002-wright/) | United Healthcare / Optum | `bundling_coding_edit` | CPT 99205-25, 72052, 73030x2, 76881x2 | 05/12/2025 | 100% of billed ($6,300.00) | Cites the payer's own component-billing policy plus an outside CMS citation to show the radiology interpretation-and-report is separately payable from the E/M visit | Signature block bolds only the title line, not the address/phone lines below it |
| [case-003-wong](eob-appeal-pairs/case-003-wong/) | Anthem Blue Cross | Two-pronged: workers'-comp liability misattribution (codes 016/19) + a timely-filing rebuttal of the payer's own dispute-rejection | CPT 99214, 73610x2, 73630x2, 73660x2, 76881x2; denial codes 016, 19 | 07/08/2024 | 100% of billed ($5,450.00) | Two separate points argued in one letter (procedural timeliness math, then WC-misattribution on the merits) rather than the usual single unified rebuttal — only do this when two threads genuinely rest on disjoint evidence, per `case-file.md`'s guidance | Signature block mostly plain, not bold |

## Known cross-example disagreements (don't average these away — pick per case)

- **Signature-block bold**: varies between fully bold (case-001), title-only bold
  (case-002), and plain (case-003). Match whichever example is closest on payer/dispute
  category rather than assuming one universal rule.
- **The ask**: case-001 predates the "always 100% of billed" rule and shouldn't be
  copied literally on that point — the rule in `style-guide.md` governs, not that one
  example's specific number.

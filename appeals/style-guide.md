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
- **Tone**: assertive advocacy, stated with total confidence. **Never self-qualify.**
  Don't write sentences like "we do not assert that...", "we do not characterize it
  as...", or "this does not challenge...". The real examples never hedge a claim or
  pre-concede a limit on their own argument — they state the practice's position as
  settled fact, supported by citations, full stop. If a claim is arguable rather than
  ironclad, argue it with full confidence anyway (see "Argument breadth" below) rather
  than qualifying it in the letter itself. This includes dropping soft qualifiers
  around a quoted item: write `"NO play until re-check"` plainly rather than
  `"NO play until re-check" is marked` — the quotation marks already show it's quoted
  from the record; the qualifier only softens it.
- **Emphasis**: ALL CAPS is used heavily and routinely — not just on isolated phrases.
  Entire sentences, and sometimes multiple consecutive sentences, run in caps whenever
  the point is one of the letter's core assertions. Don't under-use it out of a
  politeness instinct; match the real examples' density.
- **Bold**: used as heavily and deliberately as ALL CAPS, and travels with it in a fixed
  pattern — confirmed across all three real examples (case-001-woodruff, Wright/UHC, and
  Gregory Wong) by reading the actual `word/document.xml` runs, not just extracted text.
  - Every ALL-CAPS emphasis sentence or block is also bold. Caps never appears alone —
    if a sentence is capitalized for emphasis, bold the whole capitalized span too.
  - Bold-only (no caps) marks three things inside otherwise plain-case sentences: (1) a
    short standalone imperative, e.g. **Do not duplicate this claim.**; (2) a specific
    figure embedded in a sentence — a CPT/denial code, dollar amount, or citation — e.g.
    denial codes **016** and **19**, **Pub. 100-04, Chapter 13, §§100–100.1**; (3) a
    section-label word or short phrase used as a mini-header inside running text, e.g.
    **Medical Necessity** — plain bold at body text size, no font-size bump, no
    underline; it's a bolded label, not a heading style.
  - Narrative and explanatory prose — the medical-necessity narrative paragraphs, most
    quoted external payer language — stays plain. Bold marks assertions and key facts,
    not description.
  - **One fixed exception gets italic and underline too**: the opening admonition
    **"Do not duplicate this claim."** is bold, italic, *and* underlined in all four real
    examples now in the corpus (case-001-woodruff, Wright/UHC, Gregory Wong, and
    letter-001-voigt) — confirmed by reading the actual XML runs, not extracted text —
    and italic/underline appear nowhere else in any of the four documents. Treat this as
    a single fixed literal exception, not a general rule: this exact sentence always
    gets all three; no other text in the letter is ever italic or underlined.
- **Repetition is deliberate, and runs deeper than facts.** Restate the key facts
  (codes, dates of service, dollar amounts) more than once through the letter. The
  real examples go further than that: a large multi-sentence argument block can be
  repeated nearly verbatim a second time later in the letter for emphasis, not just
  individual facts. This is not redundancy to trim — it's how the originals make sure
  a skimming claims reviewer can't miss the point.
- **State each criterion's citation and conclusion directly — skip meta-labels and
  connective summary sentences that don't add a new fact.** Don't label argument prongs
  "Path 1"/"Path 2" and then add a sentence like "meeting either one satisfies the code"
  or "the practice and payer agree on the standard" — those restate structure without
  adding a citation or a fact. State each criterion, its citation, and its bolded
  conclusion; let them stand on their own.
- **Denial-code rebuttal pattern, unified by default**: quote the denial code(s) and
  stated reason(s) verbatim, then respond directly: *"Contrary to denial code X: ..."*.
  Default to **one unified rebuttal covering every disputed line**, even when the
  payer's table shows more than one denial-code label — the real examples treat the
  whole denial as one issue with one overarching rebuttal rather than splitting into
  parallel tracks by code. Only split into separate tracks when the codes genuinely
  require materially different arguments to win (not just because the labels differ).
- **Precedent argument (use when available)**: if a comparable prior EOB shows the
  same payer already paid the same CPT/HCPCS code correctly for the same patient, lead
  with that comparison — it's the strongest, most concrete argument available.
- **Argument breadth — include every supportable thread, not just the one the denial
  code implies.** The real examples argue medical necessity and CPT-documentation
  compliance even on a claim where the denial codes were pricing-only, not
  necessity-based — every favorable, documentable argument goes in as reinforcement,
  not just the single thread that's strictly responsive to the stated denial reason.
- **Medical necessity argument**: quote the payer's own plan/SPD definition of medical
  necessity, then state plainly how the documented treatment satisfies each prong of
  that definition — don't just assert necessity in the abstract. Include this thread
  whenever supporting documentation exists, per "Argument breadth" above, even if the
  denial itself wasn't a necessity denial. **Don't build this argument out of exam-form
  granularity** — specific positive/negative findings grids, range-of-motion figures
  against printed norms, and structure-by-structure rule-outs belong in the attached
  records, not transcribed into the letter body; assert the conclusion the records
  support rather than walking through the exam mechanics. **This doesn't bar naming the
  encounter's overall E/M scope in standard terms** — comprehensive history,
  comprehensive examination, counseling/education, ordering and independently
  interpreting tests, coordinating the care plan — asserted as what the encounter
  covered. The line is between naming the E/M components an encounter included (fine)
  and transcribing individual exam-form findings/checkboxes as the proof (still banned).
  **When conservative treatment
  was tried and didn't resolve the condition before the procedure, say so plainly as a
  failure** (e.g. "the patient failed extensive first-line conservative treatment")
  rather than softening it to treatment that was merely "also documented" or
  "continued" — state the strongest characterization the records actually support.
  **A recurring reinforcing phrase**: "medically indicated, medically necessary, and
  standard of care" — use it where the letter is asserting that a treatment/procedure
  was warranted, alongside (not instead of) the record citation for that treatment.
- **The ask: default to 100% of billed charges, on every line without affirmative
  proof of payment.** Even when a precedent or ratio argument only mathematically
  supports a smaller corrected figure, the letter's demand is the full billed amount —
  state that as the ask. Show the precedent/ratio math in the letter as supporting
  evidence for why the current payment is wrong, not as a cap on what's being
  requested. This extends to lines the payer's letter doesn't explicitly deny:
  language like "reconsidered," "processed per member benefits," or "supported" is
  **not proof of actual payment**. Include a line in the ask unless a remittance/PRA
  in evidence shows a real dollar amount was actually paid on it — don't voluntarily
  exclude a line just because the payer's language about it sounds favorable.
- **Structure**: payer address block (capture every fax number, email, and department
  name printed on the intake documents — not just one) → "RE:" identifier block
  (patient name, DOB, ID#, date(s) of service, claim #, billed amount, plus a
  conditional **"Non-Paid Amount"** line when the case is about total non-payment of
  the billed amount — omit that line when the case is a partial-underpayment/rate
  dispute instead, as case-001-woodruff shows) → what's being appealed, stated plainly
  → a bolded section label, **"WITH RESPECT TO THE DENIAL OF PAYMENT FOR [code(s)]
  (DENIAL CODE [X]):"**, immediately before the main rebuttal begins (same fixed-label
  pattern as the **Medical Necessity** mini-header below it) → denial-code
  quote-and-rebuttal (unified by default, see above) → cited factual
  argument → precedent argument (if any) → medical necessity/policy citation and any
  other supportable argument thread → explicit ask for 100% of billed charges →
  practice billing-department signature block: title, then address lines only — **no
  practice name line**, no separate "Email:" line. Phone and email both go in the
  closing "Contact our billing department..." sentence instead, together. No
  "Enclosures:" list unless a real example shows one. **No filing-deadline line
  anywhere in the letter** — see "Appeal deadline" below.
- **Paragraph spacing**: the extra visual space between paragraphs comes from an actual
  blank paragraph inserted between them — never a spacing-after style property. Put one
  blank paragraph at every block-to-block transition (one argument point moving to the
  next, one section moving to the next). Keep a tight list's items adjacent with no blank
  paragraph between them — a run of body-part names, line-item entries, or numbered
  sub-points under one ask all stay tight; spacing is for the gaps *between* blocks, not
  within one.
- **Documentation-checklist blocks are real bulleted lists, not plain lines.** When the
  letter includes a short checklist of criteria or enclosed items — a policy's numbered
  requirements ("There is a regional pain complaint...", "There is spot tenderness...",
  etc.), a "documentation supports the following" list, or "the enclosed records
  include" list (with its own sub-list of "muscle groups injected / number of trigger
  points / laterality / medication and dosage") — six of the nine real examples now in
  the corpus render these as genuine Word bulleted lists (`<w:numPr>`, bullet format),
  including a nested sub-list where one exists. Write these as markdown bullet lists
  (`- item`, with a nested `- ` under a parent item where the source shows one) rather
  than plain consecutive lines, and render them as real bulleted paragraphs in the
  `.docx`, not flattened into a run-on sentence or plain unbulleted lines. This exact
  loss already happened twice during example transcription (case-001-woodruff and
  letter-001-voigt both had a real bulleted list flattened to prose/plain lines) before
  being caught and backfilled — treat a checklist-shaped block as a strong signal to
  check for real list formatting, not just read it as prose.
- **Punctuation conventions**: no comma before "Suite" (`1200 Rosecrans Avenue Suite
  208`); no space between an area-code's closing parenthesis and the number
  (`(310)416-9700`, not `(310) 416-9700`).
- **Citations**: every factual claim in the letter should be traceable to a citation in
  `case-file.md` (record name + page, or policy name + section/page). The letter itself
  doesn't need footnote-style citation markers unless that's how the user's own examples
  do it — match whatever the examples show. This citation discipline is about factual
  accuracy of extracted data (never invent a code, date, identifier, or dollar amount)
  — it is not the same thing as hedging. A citable, arguable interpretation (a
  professional judgment call about what the records support) gets asserted
  confidently, per "Tone" above; an unconfirmable or invented fact never does.
  **A letter sentence doesn't have to reproduce a record's literal wording** (a
  handwritten margin notation, a checked box's exact label) to satisfy this — a
  confident, bolded declarative statement of the underlying fact is equally valid, as
  long as the fact itself is cited in `case-file.md`. Quoting the literal on-page text
  is a strong option, not a requirement. **A clinical characterization the user
  supplies directly, as the treating physician** (not derived from the extracted
  records), may go in the letter even without an independent record citation — see
  `appeals-case-builder.md` for how that gets tagged in `case-file.md`. This same
  latitude extends to specific numbers and detailed reasoning chains, not just literal
  quotes: the letter can state a shorter, confident conclusion (e.g. "no surgery was
  performed or documented") instead of spelling out every supporting number or the
  full chain of reasoning behind it (a specific day-count, or which exact fields on a
  form were checked to reach that conclusion) — **as long as the fuller version stays
  cited in `case-file.md`.** This is about what the letter chooses to display, never
  about relaxing what `case-file.md` itself has to verify and cite —
  `appeals-drafter`'s "recount every quantifier" check still applies in full to
  anything the letter does state.
- **CPT/HCPCS code citations**: when a letter argues from a specific code's documentation
  requirements (the `bundling_coding_edit` pattern), open that code's section with its
  own official descriptor before listing what it requires — e.g. **"CPT 20611
  ultrasound guided arthrocentesis, aspiration, and/or injection"** — matching how
  letter-007 and letter-008 (Merriman/Cigna) both do it. Don't jump straight to "CPT
  code X requires the following" without first saying what the code *is*. Once a
  modifier has been established as applying, carry it with the code everywhere the code
  is cited afterward (**99214-25**, not bare 99214), not just in the section that
  discusses the modifier. When asserting that the records satisfy a code's
  documentation requirements, name the actual governing authority
  (**CPT/AMA/Medicare/[payer name]**) rather than a generic "required documentation" —
  naming the source reads as substantiated rather than asserted.
- **Quote only the substantive denial reason.** When quoting a denial code's own
  definition/remark text, include the stated reason for the denial, not the payer's
  procedural boilerplate about how to submit documentation (portal navigation, which
  button to click, where to fax) — that's operational instruction to the practice, not
  part of the payer's stated reasoning, and quoting it adds length without adding
  argument.
- **Appeal deadline: not mentioned in the letter at all, in either direction.** Neither
  real example (case-001-woodruff or the Wright/UHC case) cites a filing deadline
  anywhere in the letter text, even when one wasn't known. **Don't add a deadline line,
  placeholder, or fill-in-the-blank field to the letter** — deadline confirmation, when
  it matters, is a pre-mailing check the billing office does separately, not something
  that appears in the document. This should never hold up producing the letter or the
  case.

## Changelog

- (seed) Initial baseline drafted from case-001-woodruff, pending the user's first round
  of real feedback.
- Added the appeal-deadline rule above after the smoke test showed the manager's QA gate
  was stricter than the practice's own established style (case-001-woodruff never cites a
  deadline). The user confirmed: don't block delivery on a missing deadline, use a
  fill-in-the-blank field, always ship the docx.
- Rewrote Tone, Emphasis, Structure, and added Argument breadth and the 100%-billed ask
  rule after the user did a line-by-line comparison of the original case-001-woodruff
  letter against a pipeline-generated letter for the same case. Corrected: RE-block and
  signature-block fields (the pipeline had added fields — Allowed/Paid/Check-Date in the
  RE block, a practice-name line and separate Email line in the signature block — that
  aren't in the real example), punctuation, and dropped an "Enclosures:" list that isn't
  house style. The user explicitly confirmed two strategic points: (1) default the ask to
  100% of billed charges even when the precedent math only proves a smaller figure, and
  (2) argue every supportable thread confidently, including one an agent had flagged as
  carrying some interpretive/coding risk — that risk still gets recorded for the human in
  case-file.md, but no longer suppresses the claim in the shipped letter.
- Revised Repetition, the denial-code rebuttal pattern, the ask, Structure, and Appeal
  deadline after the user compared their own real letter for the Wright/UHC bundling
  case against the pipeline's generated letter for the same case. Four confirmed
  decisions: (1) the ask now includes every billed line without affirmative proof of
  payment — "reconsidered"/"processed"/"supported" language on the payer's letter is
  not proof a line was actually paid; (2) denial-code rebuttals default to one unified
  argument instead of splitting into a separate track per denial code, unless the
  codes genuinely need different arguments; (3) the filing deadline is dropped from
  the letter entirely — no placeholder field, matching both real examples; (4) the RE
  block gets a conditional "Non-Paid Amount" line for total-non-payment cases. The
  user declined giving `appeals-case-builder` web-search access for outside policy/
  regulatory citations (e.g. CMS Medicare Manual sections) and will supply payer
  policy documents directly instead.
- Added Bold and Paragraph spacing rules after directly comparing the raw
  `word/document.xml` of three real letters (case-001-woodruff, Wright/UHC, and a new
  Gregory Wong case) against the pipeline's delivered Wong letter — a comparison at the
  XML-run level, not the text/markdown level the first two rounds used. This surfaced
  that the pipeline had never produced a single bold run across any of the three
  delivered cases, undetected by those earlier rounds because plain-text/markdown
  extraction silently drops run-level formatting. Confirmed: bold travels with every
  ALL-CAPS block, and is used alone for short imperatives, embedded key figures/
  citations, and label-style mini-headers; paragraph spacing in the real letters comes
  from an inserted blank paragraph between blocks (most paragraphs carry no
  spacing-after property at all), not a computed value, with tight lists kept
  blank-line-free internally. The user also confirmed a standing rule going forward:
  every real letter supplied for a comparison round gets added to the examples corpus
  (after redaction and confirmation), not just diffed and discarded.
- Added the "Do not duplicate this claim." bold+italic+underline exception after a
  systematic raw-XML formatting audit across all four real examples (case-001-woodruff,
  Wright/UHC, Gregory Wong, and the newly-added letter-001-voigt) — checking not just
  bold but every run-level property (italic, underline, strikethrough, super/subscript,
  font, size, page setup, headers/footers, alignment, list numbering). This was the one
  unanimous, previously-missed finding: italic and underline are otherwise never used in
  any of the four documents. The audit also confirmed the pipeline's existing 11pt Aptos
  body font and 1"-margin US Letter page setup already match all four examples exactly —
  no other gaps found on those dimensions.
- Added the real-bulleted-list rule after five new real examples (two McCracken/Aetna
  letters and three Fleischman/Anthem letters) confirmed a pattern already present but
  previously mis-transcribed in two existing examples: a "documentation supports" or
  "enclosed records include" checklist renders as a genuine Word bulleted list (with a
  nested sub-list in the records-enclosed block) in 6 of 9 real examples. Backfilled
  case-001-woodruff and letter-001-voigt, which had each flattened this into prose or
  plain lines during their original transcription.
- Added the CPT/HCPCS code-citation rule and the "quote only the substantive denial
  reason" rule after the user hand-revised the pipeline's own Paimany-Kenzie delivered
  letter (cutting it from 3,377 to 1,903 words) and flagged a "Missing definition" at the
  CPT 20611 section. Checking the existing corpus confirmed the gap was real and already
  had precedent the drafter simply didn't follow: letter-007 and letter-008 (Merriman)
  both open their CPT 20611 discussion with the code's own descriptor
  ("**CPT 20611 ultrasound guided arthrocentesis, aspiration, and/or injection**")
  before listing requirements; the Paimany-Kenzie letter never did. The revision also cut
  the quoted denial-code ANC boilerplate about submitting documentation via the payer's
  portal, kept only the substantive "additional information is required" reason, and
  changed a bare "99214" to "99214-25" in the RE-block dispute line. **One deeper finding
  from this same comparison is still under user review and deliberately not yet
  encoded**: how aggressively to cut explanatory reasoning once a conclusion is stated
  (the revision also dropped a clever "the payer's own non-coverage codes don't appear on
  this claim" argument, replacing detailed reasoning with a shorter assertion) — that
  broader question is still open. This letter has not yet been added to the examples
  corpus pending that.
- Follow-up to the entry above: the user confirmed the other two open items from the same
  Paimany-Kenzie comparison. (1) "The patient failed extensive first-line conservative
  treatment" is accurate — the records do support a sequential failure, not merely
  concurrent conservative care, so the letter's stronger framing was correct, not an
  overreach. (2) The medical-necessity section should never cite exam-form granularity
  (positive/negative findings grids, range-of-motion figures, structure-by-structure
  rule-outs) as a standing rule, not just for this case. Both are now encoded under
  "Medical necessity argument" above. The remaining items (title-line double slash, a
  couple of dropped periods, "or" for "for") were confirmed as plain typos, not style
  signals — corrected directly in the letter, not encoded as rules.
- Added four rules after the user hand-revised the pipeline's delivered Khurana 99214
  letter (Track 1 of the split case). Unlike the Paimany-Kenzie round, this revision
  added content rather than cutting it, and the draft also contained several clear
  errors (a wrong date of service, "Aetna" in place of the actual payer twice, a page-
  count contradiction, and a cluster of typos) that the user confirmed were just
  mistakes in a non-final draft, not style signals — not encoded, same treatment as the
  Paimany-Kenzie round's plain typos. Four other changes were confirmed intentional:
  (1) general E/M-scope language (comprehensive history/exam, counseling,
  ordering/coordinating care) is fine for the medical-necessity thread as long as it's
  asserted as the encounter's scope, not walked through as an exam-form checklist —
  refines, doesn't reverse, the existing exam-form-granularity ban; (2) a letter
  sentence can state a record fact as a confident bolded declarative instead of
  quoting the record's literal wording, and a clinical characterization the user
  supplies directly as the treating physician can go in without an independent record
  citation; (3) drop explicit structural meta-labels ("Path 1"/"Path 2") and connective
  summary sentences that restate structure without adding a fact; (4) drop soft
  qualifiers like "is marked" around an already-quoted record item. The
  "CPT/AMA/Medicare/[payer]" phrasing the draft also used repeatedly (even though this
  patient's payer is UnitedHealthcare, not Medicare) was confirmed as the existing
  standard reference-chain phrasing from the Merriman precedent above, not a new rule.
  This comparison letter was not added to the examples corpus — it contains confirmed
  errors, and per the user's standing instruction from the Paimany-Kenzie round, is for
  learning only.
- Added three more rules and confirmed one edit as permitted latitude (not a rule)
  after the user hand-revised the pipeline's delivered Khurana castmods letter (Track 2
  of the same split case). Same treatment as the 99214 round for draft noise: a
  sentence that cut off mid-parenthetical, several dropped words, and the same
  recurring typos ("OPTIMUM," "ATTACH," "standard of care" mangled three different
  ways) were not encoded. Four items were confirmed intentional: (1) a new fixed
  section label, **"WITH RESPECT TO THE DENIAL OF PAYMENT FOR [code(s)] (DENIAL CODE
  [X]):"**, goes immediately before the main rebuttal — now in "Structure" above; (2) a
  new stock reinforcing phrase, "medically indicated, medically necessary, and standard
  of care," for treatment-justification arguments — now under "Medical necessity
  argument" above; (3) the declarative-over-literal-citation latitude from the 99214
  round extends to specific numbers and reasoning chains too, not just quotes — a
  shorter confident conclusion can stand in for a detailed chain, as long as the fuller
  version stays cited in `case-file.md` — now under "Citations" above; (4) cutting the
  delivered letter's closing rhetorical line ("A provider cannot correct a deficiency
  the payer has not identified") was confirmed intentional, but doesn't generalize into
  a rule of its own — a strong rhetorical line can be trimmed for concision like any
  other sentence, it isn't specially protected. This comparison letter was not added to
  the examples corpus, for the same reason as the 99214 letter.

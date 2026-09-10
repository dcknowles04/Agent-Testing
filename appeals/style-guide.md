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
  than qualifying it in the letter itself.
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
  denial itself wasn't a necessity denial.
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
  → denial-code quote-and-rebuttal (unified by default, see above) → cited factual
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

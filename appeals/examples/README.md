# Adding examples to the corpus

`appeals-drafter` reads `index.md` first to find the closest-matching entries here, then
opens their full files to match wording, structure, and tone. This corpus is
**committed to git**, so nothing here may contain real PHI.

## Redaction checklist (do this before adding anything here)

Before moving a real EOB/appeal pair or past letter from
`appeals/examples/_raw-unredacted/` (git-ignored) into `eob-appeal-pairs/` or
`past-letters/` (committed), replace or remove:

- [ ] Patient name (use a placeholder like `[Patient Name]` or a clearly fake name)
- [ ] Date of birth
- [ ] Member/subscriber ID, group number
- [ ] Claim number(s)
- [ ] Provider name, NPI, Tax ID (unless the practice is fine keeping its own name —
      confirm with the user)
- [ ] Any phone/fax/email/address that identifies a real person or specific practice
      location (a generic billing-department contact format can stay if genericized)
- [ ] Any other detail that would let someone identify the real patient

**Keep intact** — these are what make the example useful:
- CPT/HCPCS codes, ICD-10 diagnosis codes
- Denial/EXPL/CARC/RARC codes and their stated reasons
- Dollar amounts (billed/allowed/paid) and the dispute category they illustrate
- The argument structure, wording, tone, and formatting of the original letter
- Dates of service (relative dates are fine to keep exact; only DOB is sensitive)
- **Bold formatting on emphasis/key facts/labels** — verify it survived any docx→markdown
  conversion; a plain-text or rendered-view extraction silently drops it. Redact from the
  raw `word/document.xml` runs, or via `pandoc -t markdown` (which preserves `**bold**`)
  — never by retyping from a plain-text or rendered view, which is how it was lost the
  first time (case-001-woodruff had to be backfilled after this was caught).

## Process

0. **Before drafting anything, work out what the upload actually is — never assume from
   the filename or from it being "newer."** Filenames often carry words like "updated,"
   "new," or "corrected," and it's tempting to read those as "this supersedes/corrects an
   existing example for the same claim." Don't — a same-patient upload is just as likely
   to be a genuinely separate appeal (different claim, different DOS, different
   procedure) as it is a revision of one already in the corpus, and the user has
   explicitly corrected this assumption more than once. Verify with actual
   claim-level identifiers before treating two uploads as "the same thing, one version
   just better":
   - **Identical** (byte-for-byte, or extracts to a byte-for-byte identical raw
     transcription) → it's a duplicate re-upload; skip it, nothing to add.
   - **Same DOS and same claim-specific facts, different completeness/redaction state**
     (e.g. the original intake PDF vs. a cleaner standalone `.docx` of the same letter)
     → safe to treat as the same claim and pull real values from the more complete
     version into an existing example — but confirm the DOS (or claim #, if visible)
     actually matches before doing this, not just the patient's name and the filename's
     "updated"/"new" label.
   - **Different DOS, different codes, or different denial reason** → it's a separate
     appeal for the same patient. Add it as its own new example; never merge its facts
     into an existing entry for "the same patient," and never treat it as making an
     existing entry stale.
   If it's ambiguous which of these applies, say so and ask rather than picking one.
1. Draft the redacted version, preserving bold per the note above.
2. **If the source is a real `.docx`, run the systematic formatting diff below before
   showing anything to the user** — this replaced an earlier, opportunistic process that
   only checked whatever formatting question happened to be top-of-mind for a given round
   (that's how the bold-formatting gap survived two full comparison rounds, and how the
   "Do not duplicate this claim." italic+underline pattern went unnoticed across three
   examples before a systematic pass caught it on the fourth). Unzip the `.docx` and check
   `word/document.xml`, `styles.xml`, and `theme/theme1.xml` against **every** existing
   example on **every** dimension below, not just the one or two that motivated this
   round:
   - Run-level formatting: bold, italic, underline, strikethrough, super/subscript — for
     each, note which specific text spans carry it, not just whether it appears anywhere.
   - Font family and size (check actual `<w:sz>` usage on body runs, not just
     `docDefaults` — a document's declared default can be unused template noise; see
     style-guide.md's changelog for a worked example of this exact false alarm).
   - Page setup: paper size, margins, orientation.
   - Headers/footers, paragraph alignment/justification (`w:jc`), list auto-numbering
     (`w:numPr`).
   - Paragraph spacing mechanism (blank inserted paragraph vs. a `spacing.after` value)
     and signature-block bold density.
   - Structural order of the letter (where the RE block, denial-code rebuttal, ask, and
     signature land relative to each other) and argument pattern.

   For each dimension: if all existing examples agree and the new one matches, no action
   needed. If all existing examples agree and the new one **disagrees**, that's either a
   new rule to add to `style-guide.md` (if the new one is clearly the more representative
   pattern) or a new entry in index.md's "Known cross-example disagreements" section (if
   it's genuinely inconsistent, letter-specific variation). If examples already disagree
   on a dimension, record where the new one falls rather than averaging it away.
3. Show it to the user for review — **do not commit until they've confirmed** the
   redaction is complete and nothing sensitive slipped through.
4. Once confirmed, it can be committed under `eob-appeal-pairs/case-NNN-<short-label>/`
   (paired EOB + case notes + final letter) or `past-letters/letter-NNN.md` (letter only,
   for style/wording reference).
5. **Append a row to `index.md` in the same step** — payer, dispute category, codes,
   DOS, ask, argument pattern, and any formatting caveat worth flagging (e.g. a way this
   example disagrees with another on a style point — see index.md's own note on this).
   Update index.md's "Coverage" section too if this example fills a previously-listed
   gap. A new example without an index row isn't fully added; the drafter won't find it
   efficiently once the corpus grows past a handful of entries.

**Standing rule**: every real letter the user supplies for a comparison round gets added
to the corpus this same way, as part of that round — not treated as a one-off diff that's
then discarded.

## Folder contents

- `eob-appeal-pairs/case-NNN-<label>/` — a redacted EOB (or its extracted content),
  a short `notes.md` describing the dispute category and outcome, and the final letter
  that was sent, side by side — useful for the whole pipeline, not just drafting.
- `past-letters/` — redacted letters only, for wording/tone/formatting reference when a
  full EOB pair isn't available or needed.

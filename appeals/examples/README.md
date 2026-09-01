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

1. Draft the redacted version, preserving bold per the note above.
2. Show it to the user for review — **do not commit until they've confirmed** the
   redaction is complete and nothing sensitive slipped through.
3. Once confirmed, it can be committed under `eob-appeal-pairs/case-NNN-<short-label>/`
   (paired EOB + case notes + final letter) or `past-letters/letter-NNN.md` (letter only,
   for style/wording reference).
4. **Append a row to `index.md` in the same step** — payer, dispute category, codes,
   DOS, ask, argument pattern, and any formatting caveat worth flagging (e.g. a way this
   example disagrees with another on a style point — see index.md's own note on this).
   A new example without an index row isn't fully added; the drafter won't find it
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

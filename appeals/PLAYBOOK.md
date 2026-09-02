# Appeals Team Playbook

This is the master reference for the **Appeals** subagent team. Every `appeals-*` agent
and the `/appeals:run` command read this file first. If you are a human reading this to
understand or extend the system, start here too.

## 1. Overview & purpose

Given a denied or underpaid insurance claim — an EOB (Explanation of Benefits) plus the
supporting medical/service records — this pipeline produces a formal, fact-checked,
properly cited appeal letter as a Word document (`.docx`), written from the perspective
of the **treating practice's billing/collections office** (not the patient in first
person), addressed to the payer's appeals department.

Five specialized agents work a pipeline that's sequential where the real dependencies
require it and parallel everywhere else (this is deliberately built as plain Claude
Code subagents, not the experimental live "Agent Teams" feature; see
`docs/agent-teams.md` §4, which lists "sequential tasks with dependencies" as a poor
fit for that feature, and §6/§12, which note team state is session-scoped and cannot
be made persistent). A single command, `/appeals:run`, drives the whole pipeline
end-to-end for one case. Five things keep it fast rather than strictly sequential — see
§6 for the full detail:
- **Extraction splits into two independent calls** (EOB vs. clinical records), since
  neither depends on the other.
- **The manager's ownership audit of a stage overlaps with the next stage's work**,
  since an audit only checks files that already exist and won't change — there's no
  correctness reason to wait for it before starting what's next, only a reason to redo
  that next stage if the rare audit failure turns up. One audit call can also cover
  several tightly-clustered micro-steps at once, rather than firing one per micro-step.
- **The manager's ownership-audit duty runs on a lighter model** (a per-call override,
  not a change to its default) — it's mechanical checksum/glob work with no judgment
  in it, unlike the manager's other two duties or any of the content-generating agents.
- **A shared root cause found during peer review gets fixed everywhere at once** — every
  agent whose owned file the root cause touches is corrected in the same batch of
  parallel calls, not discovered and dispatched one at a time.
- **Case-building splits into two calls**, the same pattern as extraction: an
  independent record review that doesn't need to know the denial classification, and
  an argument synthesis that does. The independent review runs concurrently with
  denial-interpretation instead of waiting for it.

## 2. Roles

| Agent | Job | Reads | Writes |
|---|---|---|---|
| `appeals-extraction` | Pulls structured data out of the EOB(s) and records; OCR/vision cleanup. Runs as **two parallel duties**: Duty A (EOB) and Duty B (clinical records) — see §6 | `00-intake/**` | `01-extraction/**` (`structured-record.json`+`extraction-notes.md` from Duty A, `clinical-digest.json` from Duty B), later `04-draft/review/extraction-review-vN.md` |
| `appeals-denial-interpreter` | Translates denial/EXPL/CARC/RARC codes into plain language + dispute category | `01-extraction/**` | `02-denial-interpretation/**`, later `04-draft/review/denial-review-vN.md` |
| `appeals-case-builder` | Builds the cited factual argument against the denial. Runs as **two duties** (see §6): Duty A (independent record review, reads Duty B's clinical digest as a fast reference but still independently re-reads the raw records as a cross-check) runs concurrently with denial-interpretation; Duty B (argument synthesis) applies the denial classification to Duty A's gathered facts | Duty A: `01-*` (including `clinical-digest.json`), `00-intake/records/**`, `policy-docs/**`. Duty B: `02-*`, `03-case-file/clinical-record-review.md`, plus the same sources as Duty A for load-bearing verification | `03-case-file/**` (`clinical-record-review.md` from Duty A, `case-file.md` from Duty B), later `04-draft/review/case-review-vN.md` |
| `appeals-drafter` | Writes the formal appeal letter; revises on feedback | `03-case-file/**`, `style-guide.md`, `examples/**`, `04-draft/review/*` | `04-draft/appeal-letter-vN.md`, `04-draft/changelog.md` |
| `appeals-manager` | Enforces file ownership, QA gate, final `.docx` delivery | everything (read-only outside its own lane except audits) | `manifest.json`, `status.md`, `05-manager-audit/**`, `06-final/**` |

All five run on `model: opus` by default — this pipeline touches real money and real
medical facts, so accuracy is worth more than the extra cost. `sonnet` is a reasonable
downgrade if cost becomes a concern; change the `model:` field in the relevant
`.claude/agents/appeals-*.md` file.

## 3. Folder map

```
appeals/
├── PLAYBOOK.md                 # this file
├── manifest-template.json      # seed for each new case's manifest.json
├── style-guide.md              # evolving; owner: appeals-manager (via user-confirmed diff)
├── style-guide.proposed.md     # staging file for proposed style updates
├── policy-docs/<payer>/...     # user-supplied payer policy PDFs, cited by case-builder
├── examples/
│   ├── README.md               # redaction checklist for adding new examples
│   ├── eob-appeal-pairs/       # committed, REDACTED case examples
│   ├── past-letters/           # committed, REDACTED past letters (style only)
│   └── _raw-unredacted/        # GITIGNORED — originals before redaction review
└── cases/                      # GITIGNORED — all real per-case PHI
    └── <case-id>/
        ├── manifest.json                         # owner: appeals-manager
        ├── status.md                             # owner: appeals-manager
        ├── 00-intake/
        │   ├── eob/                               # the denied/underpaid claim's EOB(s)
        │   ├── records/                           # medical/clinical records
        │   └── comparable-eobs/                    # OPTIONAL: prior EOBs for the same
        │                                            # patient/code that paid correctly —
        │                                            # used for the "precedent" argument
        ├── 01-extraction/
        │   ├── structured-record.json             # owner: appeals-extraction (Duty A: EOB)
        │   ├── extraction-notes.md                # owner: appeals-extraction (Duty A: EOB)
        │   └── clinical-digest.json                # owner: appeals-extraction (Duty B: records,
        │                                              runs in parallel with Duty A — see §6)
        ├── 02-denial-interpretation/
        │   └── denial-analysis.json               # owner: appeals-denial-interpreter
        ├── 03-case-file/
        │   ├── clinical-record-review.md           # owner: appeals-case-builder (Duty A,
        │   │                                          runs in parallel with denial-
        │   │                                          interpretation — see §6)
        │   └── case-file.md                       # owner: appeals-case-builder (Duty B)
        ├── 04-draft/
        │   ├── appeal-letter-v1.md ... vN.md       # owner: appeals-drafter (never overwrite)
        │   ├── changelog.md                        # owner: appeals-drafter
        │   ├── UNRESOLVED.md                       # owner: appeals-manager (only if the
        │   │                                          review loop hits its round cap)
        │   └── review/
        │       ├── extraction-review-vN.md         # owner: appeals-extraction
        │       ├── denial-review-vN.md              # owner: appeals-denial-interpreter
        │       └── case-review-vN.md                # owner: appeals-case-builder
        ├── 05-manager-audit/
        │   ├── pre-stage-N.txt / post-stage-N.txt   # owner: appeals-manager
        │   ├── ownership-audit-N.md                 # owner: appeals-manager
        │   └── qa-checklist.md                      # owner: appeals-manager
        └── 06-final/
            └── Appeal_Letter_<case-id>.docx          # owner: appeals-manager
```

## 4. File-ownership rules

- Every agent writes **only** inside the folder(s) listed as its own in the table above
  and in `manifest.json`'s `owners` map (path-glob → agent name). Nothing else, ever —
  not even to "help" or fix a typo in another agent's file.
- Enforcement is the **Managing agent's job**, done with ordinary tools — no hooks.
  After every stage it snapshots a sha256 checksum of every file under the case folder
  (excluding `00-intake/`, which never changes), diffs it against the pre-stage snapshot,
  and checks every changed/new path against the `owners` map. `appeals/cases/` is
  git-ignored, so this checksum diff — not `git status` — is the real mechanism.
- **On a violation:** the manager marks that stage `FAILED` in `ownership-audit-N.md`,
  names the exact path and which agent wrote it, and reports it back to the orchestrator
  / user. It does **not** silently delete or "fix" the offending write — the point is
  accountability, not quiet cleanup.
- `appeals-drafter` never overwrites a draft version — always writes a new
  `appeal-letter-v<N+1>.md` — so every revision stays inspectable.

## 5. How to start a new case

```
/appeals:run <path-to-eob-or-intake-folder> [nickname]
```

1. Drop the EOB (and, if you have one, any prior EOB for the same patient/code that paid
   correctly — very useful, see §6 precedent argument) and the medical/service records
   into a folder.
2. Run `/appeals:run <that-folder> [optional-short-nickname]`.
3. The command scaffolds a new case under `appeals/cases/<date>-<slug>/`, copies your
   files into `00-intake/`, and runs the full pipeline (§6) automatically.
4. You'll get the final `.docx` path at the end, or — if something couldn't be resolved
   after a few revision rounds — a clear stop-and-ask explaining what's blocking it.

**Manual fallback** (if the slash command isn't available for some reason): create the
folder structure from §3 by hand under `appeals/cases/<id>/`, copy files into
`00-intake/`, seed `manifest.json` from `manifest-template.json`, then invoke each
`appeals-*` subagent in the order given in §6 yourself via the Task tool, giving each one
the exact case ID and paths (subagents share no memory between calls — every prompt must
be fully self-contained).

## 6. Pipeline stages in detail

0. **Scaffold** (mechanical — case ID, folder tree, copy intake files, seed manifest).
1. **Extraction — two parallel calls, not one.** Duty A reads `00-intake/eob/` and
   `00-intake/comparable-eobs/`, writing `structured-record.json`. Duty B reads
   `00-intake/records/` only, writing `clinical-digest.json`. Neither depends on the
   other — fire both as parallel Task calls to `appeals-extraction`.
2. **Denial interpretation and case-builder Duty A both start the moment extraction's
   two duties are done — not sequentially, and not waiting on each other.**
   Denial-interpretation only ever needed extraction Duty A, so it starts as soon as
   that's done. Case-builder's Duty A (independent record review) needs *both*
   extraction duties (it reads `clinical-digest.json` too), so it starts as soon as
   extraction Duty B also finishes — by which point denial-interpretation is usually
   already running, and the two proceed concurrently since neither depends on the
   other. The manager's audit of stage 1 also needs both extraction duties done, so it
   joins whichever of the two hasn't started yet rather than waiting for a clean moment
   to insert it.
3. **Case-builder Duty B (argument synthesis)** — needs denial-interpretation's
   `denial-analysis.json` *and* case-builder's own Duty A output
   (`clinical-record-review.md`), so it fires once whichever of those two finishes
   last is done. Fire it alongside the manager's audit of stage 2 (denial-interpretation
   and case-builder Duty A together).
4. **Draft v1** — fire alongside the manager's audit of stage 3 (case-builder Duty B).
5. Audit stage 4 (the draft).

**The overlap principle, applied at every boundary above:** a manager audit checks
files that already exist and won't change — there's no correctness reason the next
stage has to wait for it to *finish*, only a reason to find out afterward whether that
next stage's work should be kept. Fire an audit and the next stage's Task call in the
same message rather than sequentially. On the rare FAILED audit, discard whatever the
next stage produced in the meantime, handle the violation per §4, and re-run that next
stage once fixed. When several micro-steps land close together (e.g. a correction pass
across two agents plus the drafter's next version, all from the same review round), one
audit call can cover the whole cluster against a single before/after snapshot pair
instead of firing one per micro-step — same coverage, less overhead. Every ownership-
audit Task call also carries a lighter model override (not the pipeline's default Opus)
since the duty itself is mechanical; the manager's other two duties, and every other
agent, stay on their normal model.

6. **Peer-review loop:** the other three agents review the current draft **in parallel**,
   each writing its own `*-review-vN.md` starting with `VERDICT: APPROVE` or
   `VERDICT: REVISE`. If all three approve the same version, move on. Otherwise the
   drafter revises (only once all three have responded to the *same* version — never on
   partial feedback), producing the next version, and the loop repeats. On round 2+,
   each reviewer defaults to checking only what `04-draft/changelog.md` says changed
   plus its own prior `REVISE` points, not a fresh full re-review — falling back to a
   full pass only if the changelog doesn't clearly account for one of its own points.
   When peer review converges on one root cause spanning more than one agent's files,
   fix all of them in one batch of parallel Task calls, not one at a time.
   **Cap: 5 rounds.** If still not unanimous, write `04-draft/UNRESOLVED.md` summarizing
   the standing disagreement and **stop — ask the user** rather than shipping a
   best-effort letter.
7. **Manager final QA**: identifiers match extraction, a specific dollar/action ask is
   present covering 100% of billed charges on every line without affirmative proof of
   payment, no open reviewer comments, and no filing-deadline line or placeholder
   anywhere in the letter (deadlines never appear in the letter — see §7). On failure,
   loop back to step 6 with the manager's checklist as extra input. On pass, render to
   `.docx` via the `docx` skill and verify by converting to images and looking at the
   render — **the pipeline should always end in a delivered `.docx`** once the checklist
   items above are satisfied.
8. Report the `.docx` path to the user and ask for feedback for next time (§7).

The only case where the pipeline stops without producing a `.docx` is step 6's 5-round
cap on genuine, substantive disagreement between reviewers.

## 7. Style guide & example corpus

- `appeals-drafter` reads `style-guide.md`, then `examples/index.md` — a scan-first
  table of every example (payer, dispute category, codes, ask, argument pattern,
  formatting caveats) — to pick the 2–3 closest-matching entries in
  `examples/eob-appeal-pairs/` and `examples/past-letters/` (match on dispute category
  and, if possible, payer) before opening their full files. This exists so matching
  stays cheap and reliable as the corpus grows past a handful of entries — reading every
  example's `notes.md` to decide doesn't scale.
- `style-guide.md` is **never** edited directly by an agent. After a case's `.docx` is
  delivered, if the user gives feedback (comments, or their own edits to the letter), the
  manager writes a *proposed* updated style guide to `style-guide.proposed.md` with a
  rationale. The user is shown a diff and must explicitly confirm before it's promoted to
  `style-guide.md` (with a dated changelog entry appended). An agent's own claim that "the
  user approved this" is never sufficient on its own.
- **Standing rule: every real letter the user supplies for a comparison round gets added
  to the examples corpus.** Once redacted per `examples/README.md`'s checklist and
  confirmed by the user, it's committed as a new `eob-appeal-pairs/` (or `past-letters/`)
  entry — this isn't a one-off ask-and-maybe, it happens as part of that round's process
  every time. `appeals-manager` (Duty 3) appends a row to `examples/index.md` in the same
  step — a new example without an index row isn't fully added.
- If two examples disagree on a formatting/style point that isn't clearly a case-specific
  difference (e.g. how bold a signature block is), record both in `index.md`'s
  disagreements section rather than picking one as "correct" — `appeals-drafter` matches
  whichever example is closest on payer/dispute category for that case, not one averaged
  rule.

**Observed style baseline** (from the first real example — Woodruff/Anthem, redacted into
`examples/eob-appeal-pairs/case-001-woodruff/`; refined twice already after the user
compared original letters they wrote directly against pipeline-generated ones for the
same cases — see `style-guide.md`'s changelog for the full comparisons). The
authoritative, up-to-date rules live in `style-guide.md`; this is a short pointer, not a
duplicate:
- Assertive, advocacy tone, stated with total confidence — never self-qualified or
  hedged.
- ALL CAPS used heavily — full sentences routinely, not just short phrases. Repetition
  extends to whole argument blocks repeated nearly verbatim, not just individual facts.
- **Bold travels with ALL CAPS** — every capitalized emphasis block is also bold — and is
  additionally used alone for short imperatives, embedded key figures/citations, and
  label-style mini-headers, never for narrative prose. See `style-guide.md`'s Emphasis/
  Bold rules for the exact pattern.
- **Paragraph spacing** comes from an inserted blank paragraph between blocks, never a
  computed spacing-after value; tight lists stay blank-line-free internally.
  `appeals-manager` Duty 2 implements this directly when writing the docx-js script.
- Denial codes are quoted verbatim, then rebutted with **one unified argument by
  default** — not a separate track per denial-code label. Only split into separate
  tracks when the codes genuinely require materially different arguments to win.
- **Argument breadth**: every supportable argument thread goes in (precedent, medical
  necessity, CPT/documentation compliance, coverage), not only the one the primary
  dispute category implies — see `appeals-case-builder`'s instructions.
- **The ask defaults to 100% of billed charges on every line without affirmative proof
  of payment.** A precedent/ratio argument that only mathematically supports a smaller
  figure is supporting evidence for the demand, not a cap on it. Payer language like
  "reconsidered," "processed per member benefits," or "supported" is not proof a line
  was actually paid — it stays in the ask unless a real paid dollar amount is shown.
- Header/address block should capture every fax number, email address, and department
  name printed on the intake documents, not just one — `appeals-extraction` should pull
  all of them into `structured-record.json`, not stop at the first match.
- Signature block is title + address lines only — no practice-name line, no separate
  email line; phone and email go together in the closing sentence instead.
- **No filing-deadline line anywhere in the letter** — neither real example includes
  one, even when the deadline was unknown. Deadlines are not part of the document.
- If `appeals-case-builder` has no payer policy document to cite for a bundling/coding
  or similar argument, it says so explicitly rather than proceeding silently — the user
  may have a relevant policy or regulatory citation (e.g. a CMS Medicare Manual
  provision, a payer's own named policy) to supply even when the pipeline doesn't.

## 8. Payer policy documents

Drop payer-specific policy PDFs/text under `appeals/policy-docs/<payer-name>/`. The
case-building agent must cite these directly — e.g. `[Policy: DGA SPD p.114-115]` — never
paraphrase policy language without a page/section citation.

## 9. Glossary

- **EOB** — Explanation of Benefits: the payer's statement of what was billed, allowed,
  paid, and denied for a claim.
- **CARC** — Claim Adjustment Reason Code (standard ANSI code explaining an
  adjustment/denial, e.g. `CO-50`, `CO-97`, `CO-197`).
- **RARC** — Remittance Advice Remark Code (supplemental explanation alongside a CARC,
  e.g. `N130`).
- **EXPL/ANSI code** — some payers (e.g. Anthem, as seen in the first real example) print
  their own internal "EXPL" code alongside/instead of a standard CARC on the EOB, with a
  legend elsewhere on the document mapping it to plain text. Treat these the same as
  CARC/RARC for interpretation purposes, but capture both the payer's own code and any
  standard CARC/RARC crosswalk if present.
- **Dispute categories**: medical necessity · bundling/coding edit · missing
  documentation · non-covered service · timely filing · eligibility · out-of-network
  rate/fee-schedule dispute (this last one was the actual category in the first real
  example — denial codes citing "maximum allowed for out-of-network" and "exceeds fee
  schedule").
- **Appeal levels**: first-level/internal appeal (what this pipeline targets today) vs.
  second-level/external review (IRO) — out of scope for v1, see open questions below.

## 10. PHI / data-handling policy

- `appeals/cases/` and `appeals/examples/_raw-unredacted/` are git-ignored. Real patient
  names, DOBs, member IDs, claim numbers, and provider contact info must never be
  committed to this repository.
- Before any real case example is added to the committed `examples/` corpus, it must be
  redacted per `examples/README.md`'s checklist and reviewed by the user.
- If this repository is ever made public, stop using `appeals/cases/` against it
  entirely, regardless of `.gitignore` — a gitignored local file is still on disk, and a
  public repo is the wrong place to run this pipeline against real PHI at all.

## 11. Open questions log

Fill these in through conversation with the user — the pipeline works with placeholders
until then, but letters will be more accurate once these are known:

| Question | Answer |
|---|---|
| Practice name, address, phone/fax/email for the signature block | **West Coast Center for Orthopedic Surgery & Sports Medicine**, 1200 Rosecrans Avenue Suite 208, Manhattan Beach, CA 90266. PHN: (310) 416-9700, FAX: (310) 416-1120, billing contact email: Fiorella@wcsportsmed.com. Confirmed by the user as the standing contact info to use on outgoing appeals. |
| Standard signature block — whose name/title signs | **"Medical Billing/Collection Specialist"** (title only — no individual signer name is used; matches the first example) |
| NPI / Tax ID (if payers require it on appeals) | TBD |
| Payers dealt with regularly, and each one's appeal mailing/fax/portal address | Anthem Blue Cross confirmed: appeals to P.O. Box 60007, Los Angeles, CA 90060, Fax: 800-927-4092. Other payers TBD. |
| Typical appeal filing deadline per payer | TBD — informational only; per §6/§7, deadlines never appear in the letter at all and never block delivery. The billing office confirms timeliness separately, outside the document. |
| Appeal levels this practice pursues (first-level only, or also second-level/external
  review) | TBD (v1 scope is first-level internal appeals only) |
| State-specific external review rights that might matter | TBD |

`appeals-drafter` should treat the practice/signature-block row above as the standing
default for every case's signature block unless a specific case says otherwise.

## 12. Troubleshooting / known limitations

- Any field the extraction agent isn't confident about is flagged `"confidence": "low"`
  in the JSON and listed in `extraction-notes.md` — the pipeline does **not** silently
  guess at a code, identifier, or dollar amount. Confirm these with the user before the
  case-builder relies on them.
- The peer-review loop is capped at 5 rounds; beyond that it stops and asks rather than
  looping forever or shipping something no reviewer signed off on.
- Subagents carry no memory across separate Task/`/appeals:run` invocations — every
  prompt to every agent must restate the case ID and exact file paths.
- No dedicated OCR/handwriting skill exists in the current skill/plugin catalog. The
  extraction agent relies on Claude's native multimodal reading of images/PDFs first,
  falling back to the `pdf` skill's OCR pipeline for pages that don't read cleanly — and
  flags, rather than guesses, anything still illegible.
- **Text-based comparisons can't see run-level formatting.** Two rounds of style-guide
  refinement compared extracted plain text/markdown against pipeline output and missed
  that the real letters use bold extensively — the pipeline had never produced any.
  Catching formatting differences (bold, italics, underline, spacing) requires opening
  the actual `word/document.xml` inside the `.docx`, not diffing rendered or extracted
  text. Do this on every future user-supplied comparison letter, not only after a
  formatting mismatch is already suspected.

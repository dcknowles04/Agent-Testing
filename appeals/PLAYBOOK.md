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

Five specialized agents work a strict sequential pipeline (each stage depends on the
previous one's output — this is deliberately built as plain Claude Code subagents, not
the experimental live "Agent Teams" feature; see `docs/agent-teams.md` §4, which lists
"sequential tasks with dependencies" as a poor fit for that feature, and §6/§12, which
note team state is session-scoped and cannot be made persistent). A single command,
`/appeals:run`, drives the whole pipeline end-to-end for one case.

## 2. Roles

| Agent | Job | Reads | Writes |
|---|---|---|---|
| `appeals-extraction` | Pulls structured data out of the EOB(s) and records; OCR/vision cleanup | `00-intake/**` | `01-extraction/**`, later `04-draft/review/extraction-review-vN.md` |
| `appeals-denial-interpreter` | Translates denial/EXPL/CARC/RARC codes into plain language + dispute category | `01-extraction/**` | `02-denial-interpretation/**`, later `04-draft/review/denial-review-vN.md` |
| `appeals-case-builder` | Builds the cited factual argument against the denial | `01-*`, `02-*`, `00-intake/records/**`, `policy-docs/**` | `03-case-file/**`, later `04-draft/review/case-review-vN.md` |
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
        │   ├── structured-record.json             # owner: appeals-extraction
        │   └── extraction-notes.md                # owner: appeals-extraction
        ├── 02-denial-interpretation/
        │   └── denial-analysis.json               # owner: appeals-denial-interpreter
        ├── 03-case-file/
        │   └── case-file.md                       # owner: appeals-case-builder
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
1. **Extraction** — one structured record per EOB found in `00-intake/eob/` and
   `00-intake/comparable-eobs/`.
2. Manager audits stage 1 → halt and report on failure.
3. **Denial interpretation** → audit.
4. **Case building** → audit.
5. **Draft v1** → audit.
6. **Peer-review loop:** the other three agents review the current draft **in parallel**,
   each writing its own `*-review-vN.md` starting with `VERDICT: APPROVE` or
   `VERDICT: REVISE`. If all three approve the same version, move on. Otherwise the
   drafter revises (only once all three have responded to the *same* version — never on
   partial feedback), producing the next version, and the loop repeats.
   **Cap: 5 rounds.** If still not unanimous, write `04-draft/UNRESOLVED.md` summarizing
   the standing disagreement and **stop — ask the user** rather than shipping a
   best-effort letter.
7. **Manager final QA**: identifiers match extraction, a specific dollar/action ask is
   present, no open reviewer comments. On failure, loop back to step 6 with the manager's
   checklist as extra input. **The appeal filing deadline is never a QA gate** — most
   EOBs don't print one, and that's expected. If a deadline was printed, the letter
   should cite it; if not, the drafter leaves a short placeholder field for a human to
   fill in by hand (see §7's drafter instructions), and QA passes regardless. On pass,
   render to `.docx` via the `docx` skill and verify by converting to images and looking
   at the render — **the pipeline should always end in a delivered `.docx`** once the
   three checklist items above are satisfied, never a stop over a missing deadline.
8. Report the `.docx` path to the user and ask for feedback for next time (§7).

The only case where the pipeline stops without producing a `.docx` is step 6's 5-round
cap on genuine, substantive disagreement between reviewers — a missing deadline is not
that kind of problem and never triggers it.

## 7. Style guide & example corpus

- `appeals-drafter` reads `style-guide.md` plus the 2–3 closest-matching entries in
  `examples/eob-appeal-pairs/` and `examples/past-letters/` (match on dispute category
  and, if possible, payer) every time it writes a letter.
- `style-guide.md` is **never** edited directly by an agent. After a case's `.docx` is
  delivered, if the user gives feedback (comments, or their own edits to the letter), the
  manager writes a *proposed* updated style guide to `style-guide.proposed.md` with a
  rationale. The user is shown a diff and must explicitly confirm before it's promoted to
  `style-guide.md` (with a dated changelog entry appended). An agent's own claim that "the
  user approved this" is never sufficient on its own.
- If the user hand-edits a delivered letter, that edited version (redacted) is a strong
  candidate for a new `examples/` entry — ask them.

**Observed style baseline** (from the first real example — Woodruff/Anthem, redacted into
`examples/eob-appeal-pairs/case-001-woodruff/`; refined once already after the user
compared the original letter directly against a pipeline-generated one for the same
case — see `style-guide.md`'s changelog for the full comparison). The authoritative,
up-to-date rules live in `style-guide.md`; this is a short pointer, not a duplicate:
- Assertive, advocacy tone, stated with total confidence — never self-qualified or
  hedged.
- ALL CAPS used heavily — full sentences routinely, not just short phrases.
- Core facts (codes, dates of service, dollar amounts) are repeated multiple times through
  the letter, not stated once and left — repetition is deliberate emphasis, not sloppiness.
- Denial codes are quoted verbatim, then rebutted one at a time: *"Contrary to denial code
  X: ..."*.
- **Argument breadth**: every supportable argument thread goes in (precedent, medical
  necessity, CPT/documentation compliance, coverage), not only the one the primary
  dispute category implies — see `appeals-case-builder`'s instructions.
- **The ask defaults to 100% of billed charges**, even when a precedent/ratio argument
  only mathematically supports a smaller corrected figure — that math is supporting
  evidence for the demand, not a cap on it.
- Header/address block should capture every fax number, email address, and department
  name printed on the intake documents, not just one — `appeals-extraction` should pull
  all of them into `structured-record.json`, not stop at the first match.
- Signature block is title + address lines only — no practice-name line, no separate
  email line; phone and email go together in the closing sentence instead.

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
| Typical appeal filing deadline per payer | TBD — informational only; per §6, a missing deadline never blocks delivery. The drafter leaves a placeholder field and the billing office fills it in by hand before mailing. |
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

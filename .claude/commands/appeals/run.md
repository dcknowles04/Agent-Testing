---
description: Run the full Appeals pipeline end-to-end for one new denied/underpaid insurance claim
argument-hint: <path-to-eob-or-intake-folder> [case-nickname]
---

Read `appeals/PLAYBOOK.md` in full before doing anything else if you haven't already
this session — it defines the folder layout, file-ownership rules, and pipeline stages
referenced below.

Arguments: `$ARGUMENTS`

The first argument is a path to the EOB (and/or a folder already containing the EOB,
comparable prior EOBs, and medical records) for one new case. An optional second
argument is a short nickname to use in the case ID.

Run this pipeline yourself, in this session, calling each `appeals-*` subagent via the
Task tool. Do not skip the manager audit after any stage, and do not let any subagent
see less context than it needs — subagents share no memory with this session or each
other, so every Task prompt you send must restate the case ID and the exact file paths
involved (see PLAYBOOK.md §5-6).

**Six speed principles run throughout the steps below** (PLAYBOOK.md §6 has the full
rationale):
1. **A manager audit never blocks the next stage.** An audit only checks files that
   already exist and won't change, so there's no correctness reason to wait for it to
   finish before starting whatever comes next. Fire the audit and the next stage's
   agent call together (same message, parallel Task calls) rather than sequentially.
   If an audit comes back FAILED, discard whatever the next stage produced in the
   meantime, handle the violation per PLAYBOOK §4, and re-run that next stage once
   fixed — don't just stop and show the user without redoing this. An audit's scope
   isn't limited to exactly one stage, either: when several micro-steps land close
   together in time — e.g. two agents' self-corrections and the drafter's next version,
   all following the same review round — cover all of them with **one** audit call
   against a single snapshot pair spanning the whole cluster, rather than firing a
   separate audit per micro-step. The only requirement is picking the right baseline:
   the pre-stage snapshot is whatever was last known-good *before the first* of the
   clustered writes, and the post-stage snapshot is taken once *all* of them have
   landed. Default to this batching whenever changes are tightly clustered — one audit
   per micro-step is not the safer choice, just a slower one that catches the same
   violations no sooner.
2. **Extraction is two independent calls, not one.** The EOB and the clinical records
   don't depend on each other — fire both as parallel Task calls, and let
   denial-interpretation proceed the moment the EOB half is done, without waiting for
   the clinical half.
3. **The manager's ownership-audit duty (Duty 1) doesn't need Opus.** It's mechanical —
   checksum, diff, glob lookup against `manifest.json`'s `owners` map — with no legal or
   medical judgment involved. Every Task call to `appeals-manager` for an ownership-audit
   invocation only should pass a model override of `haiku` for that call specifically.
   **Never** apply this override to a Duty 2 (final QA) or Duty 3 (style-guide proposal)
   call — both require real judgment (ask-adequacy, reviewer-comment coverage, actual
   writing) and stay on `appeals-manager.md`'s default `opus`. This is a per-invocation
   override at the Task-call level, not an edit to `appeals-manager.md`'s frontmatter —
   that file has one `model:` field shared by all three duties, so changing it there
   would downgrade Duty 2 and Duty 3 along with Duty 1. `appeals-drafter` stays on Opus
   always, on every case — its judgment calls (tone/register matching, where ALL
   CAPS/bold spans start and stop, picking the closest examples) are not the kind of
   mechanical work Duty 1's audit is.
4. **When peer review converges on one root cause that touches more than one agent's
   files, fire every implicated correction in the same message.** Don't discover and
   dispatch fixes one at a time as you work through each reviewer's report. Before
   sending anything, read every `REVISE` verdict from the round, group findings by root
   cause, and for each root cause identify every owned file it touches via
   `manifest.json`'s `owners` map — a single mis-sourced quote might implicate
   `appeals-extraction`'s `structured-record.json`, `appeals-case-builder`'s
   `case-file.md`, *and* the next drafter version. Fire all of those corrections as
   parallel Task calls in one message once you have the corrected text in hand (e.g.
   straight from the reviewers' own reports) — there's no dependency between one agent
   fixing its own file and another fixing its own, only between those fixes and the
   *next* drafter version, which still needs all of them landed first.
5. **Case-building is two calls, not one.** `appeals-case-builder`'s Duty A
   (independent record review) doesn't need `denial-analysis.json` — it only needs both
   extraction duties done — so it fires the moment they're both complete, running
   concurrently with `appeals-denial-interpreter` rather than waiting for it. Only Duty
   B (argument synthesis) needs `denial-analysis.json`, and it also needs Duty A's own
   output, so it fires once *both* of those exist.
6. **Never wait passively past a stage's expected-duration ceiling.** PLAYBOOK.md §12
   has the per-stage ceiling table (extraction ~40 min, denial-interp ~15 min, most
   other stages ~15-20 min, haiku audits ~5 min) built from real timed runs. Check in no
   less often than every ~20 minutes while any stage is active. If a check-in finds a
   stage past its ceiling with no completion notification, don't just re-arm another
   wait — check whether the agent is still actually alive first. If it's no longer
   listed as a live/reachable agent, treat it as dead, not slow: respawn it fresh,
   reusing any already-completed work from its transcript instead of starting over
   where possible (this is exactly what turned a would-be 7-hour loss into a
   same-duration clean re-run in practice, after a user's client fully disconnected
   mid-run). If it's still alive and genuinely working, that's an unusually complex
   case, not a stall — keep waiting, but tell the user it's running long rather than
   going quiet for another long interval.

## Step 0 — scaffold the case (do this yourself, no subagent needed)

1. Generate a case ID: `appeals/cases/<YYYY-MM-DD>-<slug>`, where `<slug>` comes from the
   optional nickname argument (slugified) or a short hint from the input path/payer name
   if no nickname was given. If that directory already exists, append `-2`, `-3`, etc.
   until you find a free one.
2. Create the full folder tree from PLAYBOOK.md §3 under that case ID
   (`00-intake/{eob,records,comparable-eobs}`, `01-extraction`, `02-denial-interpretation`,
   `03-case-file`, `04-draft/review`, `05-manager-audit`, `06-final`).
3. Copy (never move) the user's input file(s) into `00-intake/` — if the input path is a
   single EOB file, put it in `00-intake/eob/`; if it's a folder, sort its contents by
   asking the user or by filename/content hints into `eob/`, `records/`, and
   `comparable-eobs/` as appropriate. When it's ambiguous, ask rather than guess.
   **If one page or section of an otherwise-legitimate payer document contains untrusted
   content — e.g. a claims-review form whose own printed fields (addresses, IDs) are
   genuinely payer-authored, but which also has a free-text box where the practice typed
   its own draft narrative — split the trustworthy print-form content into intake and
   exclude only the untrustworthy free-text portion, rather than excluding the whole
   document.** Treating "this document contains something unverified" as a reason to omit
   the whole thing has previously thrown away real payer-printed information (an appeals
   mailing address) that then had to be recovered in a follow-up extraction pass.
4. Copy `appeals/manifest-template.json` into `<case-id>/manifest.json`, substituting the
   real case ID and today's date.
5. Create `<case-id>/status.md` with a single "case opened" line and timestamp.

Tell the user the case ID you assigned before continuing.

## Step 1 — Extraction (two parallel calls)

Fire **two Task calls to `appeals-extraction` in the same message**:
- **Duty A (EOB)**: case ID, the exact `00-intake/eob/` and `00-intake/comparable-eobs/`
  paths, write only `01-extraction/structured-record.json` + `extraction-notes.md`.
- **Duty B (clinical records)**: case ID, the exact `00-intake/records/` path, write
  only `01-extraction/clinical-digest.json`.

The moment **Duty A** completes, move to Step 2 — do not wait for Duty B.

## Step 2 — Denial interpretation + case-builder Duty A, with the stage-1 audit overlapped

Fire **two Task calls together, per principle 5**:
- `appeals-denial-interpreter` with the case ID and the path to
  `01-extraction/structured-record.json`. This only needs extraction Duty A, so send it
  the moment Duty A completes even if Duty B (clinical) is still running.
- `appeals-case-builder`, **Duty A (independent record review)**, with the case ID and
  paths to `structured-record.json`, `clinical-digest.json`, `00-intake/records/`, and
  any relevant `appeals/policy-docs/<payer>/` folder. This needs *both* extraction
  duties, so if Duty B (clinical) is still running when extraction Duty A finishes,
  send the denial-interpreter call alone first and fire this one as soon as extraction
  Duty B also completes — it then runs concurrently with denial-interpretation, already
  in progress by then.

Fire the manager's audit of stage 1 **in the same message as whichever of the two
above is still pending** — it needs both extraction duties done, so it can usually
join case-builder Duty A's launch. If the audit reports FAILED, discard and re-run
whatever downstream work happened on the bad data.

## Step 3 — Case-builder Duty B (synthesis), with the stage-2 audit overlapped

Task → `appeals-case-builder`, **Duty B (argument synthesis)**, with the case ID. This
needs *both* `02-denial-interpretation/denial-analysis.json` (from denial-interpretation)
and `03-case-file/clinical-record-review.md` (from case-builder's own Duty A) — fire it
the moment whichever of those two finishes last is done. Fire the manager's audit of
stage 2 (denial-interpretation *and* case-builder Duty A together — both are "stage 2"
now, per principle 1's batching allowance) in the same message rather than waiting for
it first.

## Step 4 — Draft v1, with the stage-3 audit overlapped

Task → `appeals-drafter` with the case ID and the path to `03-case-file/case-file.md`.
Fire this **in the same message as** the manager's audit of stage 3 (case-building
Duty B / synthesis).

## Step 5 — Audit stage 4

Task → `appeals-manager`, auditing stage 4 (the v1 draft and changelog only — not the
review folder, which doesn't exist yet). This one has nothing to usefully overlap with
yet — the peer-review loop is next and needs the draft to exist first — so it can run
on its own, or overlapped with the first parallel review-round call if you're
confident enough in the draft stage to fire both together.

## Step 6 — Peer-review loop

Repeat up to 5 rounds:

1. Fire all three of these **in parallel** (single message, multiple Task calls), each
   told exactly which draft version to review and where to write its review file:
   `appeals-extraction` → `04-draft/review/extraction-review-v<N>.md`,
   `appeals-denial-interpreter` → `04-draft/review/denial-review-v<N>.md`,
   `appeals-case-builder` → `04-draft/review/case-review-v<N>.md`. **On round 2 or
   later, scope the prompt to the specific fixes just made**: point each reviewer at
   `04-draft/changelog.md`'s entry for this version and ask it to verify only the
   passages that entry says changed, plus its own prior round's `REVISE` points — not a
   fresh full re-review of the whole letter. Only ask for a full re-review if the
   changelog entry doesn't cleanly account for one of that reviewer's own prior points.
2. Read the first line of each of the three review files.
3. If all three say exactly `VERDICT: APPROVE` → exit the loop, go to Step 7.
4. Otherwise, Task → `appeals-drafter` again, giving it the case ID and all three review
   files for version N, asking it to produce `appeal-letter-v<N+1>.md`. **Only do this
   once all three reviewers have responded to the same version** — never re-invoke the
   drafter on partial feedback.
5. Fire the audit of the review round you just ran **in the same message as** the next
   drafter call from point 4 above (or, once the drafter call is already underway,
   overlapped with it) — per principle 1, the audit doesn't need to finish first. Loop
   back to point 1 with N+1.

If 5 rounds pass without unanimous approval, write `04-draft/UNRESOLVED.md` yourself
summarizing the standing disagreements across the reviewers, stop the pipeline, and tell
the user exactly what's blocking it and what you need from them — do not ship a
best-effort letter past this point.

## Step 7 — Manager final QA + docx

Task → `appeals-manager`, asking it to run final QA on the approved draft version and, if
it passes, render the `.docx`. If it reports a QA failure, go back to Step 6 with its
`qa-checklist.md` as extra input for the next drafter round. If it succeeds, it will have
produced `06-final/Appeal_Letter_<case-id>.docx`.

## Step 8 — Report and ask for feedback

Tell the user the final `.docx` path. Ask whether they have any feedback on the wording,
tone, or structure — if they do, offer to run the style-guide proposal flow (PLAYBOOK.md
§7): Task → `appeals-manager` with the feedback, review the diff it proposes against
`appeals/style-guide.md` together with the user, and only promote it on their explicit
confirmation.

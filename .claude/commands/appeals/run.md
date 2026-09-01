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

**Two speed principles run throughout the steps below** (PLAYBOOK.md §6 has the full
rationale):
1. **A manager audit never blocks the next stage.** An audit only checks files that
   already exist and won't change, so there's no correctness reason to wait for it to
   finish before starting whatever comes next. Fire the audit and the next stage's
   agent call together (same message, parallel Task calls) rather than sequentially.
   If an audit comes back FAILED, discard whatever the next stage produced in the
   meantime, handle the violation per PLAYBOOK §4, and re-run that next stage once
   fixed — don't just stop and show the user without redoing this.
2. **Extraction is two independent calls, not one.** The EOB and the clinical records
   don't depend on each other — fire both as parallel Task calls, and let
   denial-interpretation proceed the moment the EOB half is done, without waiting for
   the clinical half.

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

## Step 2 — Denial interpretation, with the stage-1 audit overlapped

Task → `appeals-denial-interpreter` with the case ID and the path to
`01-extraction/structured-record.json`. Fire this **in the same message as** the
manager's audit of stage 1 — but the stage-1 audit needs *both* extraction duties
done, so if Duty B is still running when Duty A finishes, send the denial-interpreter
call alone first and fire the stage-1 audit as soon as Duty B also completes (it can
run concurrently with denial-interpretation, already in progress by then — per
principle 1 above, it never needs to block). If the audit reports FAILED, discard and
re-run whatever downstream work happened on the bad data.

## Step 3 — Case building, with the stage-2 audit overlapped

Task → `appeals-case-builder` with the case ID and paths to `structured-record.json`,
`clinical-digest.json`, the denial-analysis JSON, `00-intake/records/`, and any
relevant `appeals/policy-docs/<payer>/` folder. Fire this **in the same message as**
the manager's audit of stage 2 (denial-interpretation) — don't wait for that audit to
finish first.

## Step 4 — Draft v1, with the stage-3 audit overlapped

Task → `appeals-drafter` with the case ID and the path to `03-case-file/case-file.md`.
Fire this **in the same message as** the manager's audit of stage 3 (case-building).

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
   `appeals-case-builder` → `04-draft/review/case-review-v<N>.md`.
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

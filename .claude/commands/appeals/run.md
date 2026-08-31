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
Task tool in turn. Do not skip the manager audit after any stage, and do not let any
subagent see less context than it needs — subagents share no memory with this session or
each other, so every Task prompt you send must restate the case ID and the exact file
paths involved (see PLAYBOOK.md §5-6).

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

## Step 1 — Extraction

Task → `appeals-extraction`. Give it the case ID, the exact `00-intake/` path, and remind
it to write only `01-extraction/**`.

## Step 2 — Manager audit of stage 1

Task → `appeals-manager`, asking it to audit stage `01-extraction` for this case ID. If
it reports a FAILED audit, stop and show the user exactly what it found — do not
continue the pipeline on a failed audit.

## Step 3 — Denial interpretation, then audit

Task → `appeals-denial-interpreter` with the case ID and the path to
`01-extraction/structured-record.json`. Then repeat the manager-audit pattern from Step 2
for stage `02-denial-interpretation`.

## Step 4 — Case building, then audit

Task → `appeals-case-builder` with the case ID and paths to the extraction JSON, the
denial-analysis JSON, `00-intake/records/`, and any relevant `appeals/policy-docs/<payer>/`
folder. Then audit stage `03-case-file`.

## Step 5 — Draft v1, then audit

Task → `appeals-drafter` with the case ID and the path to `03-case-file/case-file.md`.
Then audit stage `04-draft` (the v1 draft and changelog only — not the review folder,
which doesn't exist yet).

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
5. Audit stage `04-draft` again, then loop back to step 1 with N+1.

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

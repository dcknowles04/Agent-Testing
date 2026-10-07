# Denial → Appeal: clickable prototype

> **PROTOTYPE, FICTIONAL DATA.** Every patient, payer, practice, policy and clinical note in this
> app is made up. All policy and clinical-criteria content is illustrative. Do not enter real PHI.

This is a local demo of our AI appeals service for orthopedic surgery practices. An office uploads
a denied claim. A team of AI agents extracts the facts, triages the denial, matches the clinical
record to the payer's policy, checks coding when needed, drafts the appeal and QA-checks it. Office
staff then edit, approve and "submit" it, and the app tracks it through to the payer's decision.
The outcomes roll up into practice value and into our subscription revenue.

```
Upload → Intake → Triage → Evidence & Policy Match → (Coding Check) → Draft → QA
       → Staff Review & Approve → Submitted (mock) → Outcome (Overturned / Upheld / Pending)
```

---

## 1. Setup (one time)

You need **Python 3.10 or newer** (`python3 --version`). Nothing else is required: no Node, no
database server.

```bash
cd appeals-demo
./start.sh            # macOS / Linux
start.bat             # Windows (double-click or run from a terminal)
```

The first run creates a `.venv`, installs four packages (`fastapi`, `uvicorn`, `anthropic`,
`python-dotenv`), copies `.env.example` to `.env`, seeds the demo database and opens
**http://localhost:8000**.

### Live mode (optional)

Open `.env` and add your key:

```
ANTHROPIC_API_KEY=sk-ant-...
CLAUDE_MODEL=claude-opus-5-5
AGENT_EFFORT=low
```

Restart `./start.sh`. The badge in the top-right corner shows which mode is active:

| Badge | Meaning |
|---|---|
| **● LIVE · claude-opus-5-5** | Agents call the Claude API (official `anthropic` Python SDK, structured JSON outputs). |
| **● DEMO MODE · no API key** | There's no key, so agents return realistic canned responses. |
| **● DEMO MODE (forced)** | There's a key, but you clicked the badge to force demo mode. Click it again to go live. |

Each pipeline step also gets its own badge (**LIVE AI**, **DEMO** or **PRE-RUN SAMPLE**). If a live
call fails, times out or returns bad JSON, that step automatically falls back to its canned
response and the rest of the run continues in demo mode, so **the demo never breaks**. The step
shows a yellow note explaining why.

> Tip for the in-person demo: with `AGENT_EFFORT=low`, a live run takes about 1-2 minutes for 5-6
> agents. If the Wi-Fi is unreliable, click the badge to force demo mode. The run then takes about
> 10 seconds and looks the same.

### Settings (`.env`)

| Variable | Default | Purpose |
|---|---|---|
| `ANTHROPIC_API_KEY` | *(empty)* | Leave empty for demo mode. |
| `CLAUDE_MODEL` | `claude-opus-5-5` | Model for every agent. See the [models overview](https://docs.claude.com/en/docs/about-claude/models). |
| `AGENT_EFFORT` | `low` | Thinking effort: `low` / `medium` / `high`. Higher gives richer letters but slower steps. |
| `AGENT_TIMEOUT_S` | `90` | Per-agent timeout before falling back to the canned response. |
| `CLAUDE_SERVER_FALLBACKS` | `true` | Sends `fallbacks: "default"` so that if the model declines a request, the API retries it on Anthropic's recommended fallback model. If your account rejects it, the app turns it off automatically. |
| `DEMO_STEP_DELAY_S` | `1.6` | Pause per step in demo mode so the pipeline visibly lights up. |
| `FORCE_DEMO_MODE` | `false` | Start in demo mode even when a key is set. |
| `PORT` | `8000` | Web port. |

### Other editable files

- **`prompts/*.md`**: one system prompt per agent (intake, triage, evidence, coding, drafting, qa).
  They are re-read on every call, so edits apply to the next run without a restart.
- **`config/pricing.json`**: the placeholder subscription tiers (Starter 25/mo $499, Pro 100/mo
  $1,499, Unlimited $2,999) plus the staff-time assumptions behind "hours saved".
- **`config/practices.json`**: the three hypothetical practices on the business view, with their
  last-90-day baseline numbers.
- **`seed/<case>/`**: the fictional denial letters, clinical notes, claim data and illustrative
  policies. Dates are written as tokens like `{{DENIAL_DATE}}` and resolved relative to today, so
  deadlines always look current.
- **`demo_responses/<case>/`**: the canned agent outputs used in demo mode.

---

## 2. Running the app

`./start.sh` (or `.venv/bin/python run.py` once set up). Stop it with Ctrl+C.

| Screen | Where | What it shows |
|---|---|---|
| Practice dashboard | **Dashboard** | Open denials, dollars at stake, deadlines due in ≤14 days, overturn rate, staff hours saved, plan usage ("37 of 100 appeals used this month") |
| Case queue | **Case Queue** | Filter by denial type, status and deadline urgency (🔴 ≤14 days, 🟡 15-30, 🟢 >30) |
| New case | **New Case** | Upload `.txt` files or paste the 4 documents, or use **Load sample case** |
| Case detail | click any case | Live pipeline (each agent lights up as it runs, via server-sent events), expandable panels per agent, criteria checklist with Met / Missing docs / Not met badges and citations |
| Staff review | **Staff review →** | Editable letter, QA flags, attachments checklist, **Approve & Mark Submitted** |
| Outcomes & business | **Outcomes & Business** | Mark results; practice value across 3 practices; our MRR/ARR and tiers |

### Seeded cases

| # | Case | Denial type | Strength | Starts as |
|---|---|---|---|---|
| 1 | Total knee arthroplasty: PT notes existed but weren't sent | Prior auth | **Strong** | New (not yet run) |
| 2 | Lumbar MRI: under 6 weeks of conservative care, but a new motor deficit | Medical necessity | Borderline | Ready for review, **due in 10 days** |
| 3 | Knee arthroscopy: 29876 bundled into 29881, missing XS modifier | Coding / billing | **Strong** | Closed, Overturned |
| 4 | Rotator cuff repair: filed on day 98 with only a 999 acceptance | Timely filing | **Weak** | Ready for review, **due in 12 days** |
| 5 | L4-5 fusion: reviewer missed the 11° angulation; cotinine test pending | Prior auth | Borderline | Submitted, Pending |

### Resetting the demo

Use any of these:
- Click **Reset demo** in the top-right corner.
- `curl -X POST http://localhost:8000/demo/reset`
- Stop the app, delete `data/appeals.db` and start it again.

Reset restores the 5 seeded cases (dates recalculated to today) and deletes cases you created.
Do this right before the meeting.

---

## 3. Testing the pipeline

These commands run all 5 sample cases end to end on a throwaway database. Your demo data is not
touched.

```bash
.venv/bin/python -m tests.run_pipeline --mode demo   # canned responses, ~instant
.venv/bin/python -m tests.run_pipeline --mode live   # real Claude API calls (needs the key in .env)
.venv/bin/python -m tests.run_pipeline --mode mock   # live code path against a fake client
```

Each case checks that every agent finished in the expected mode, every output matches its JSON
schema, Coding ran only for the coding denial, a deadline was computed and a letter was drafted.
In live mode, a different denial-type call from the model is printed as a note, not counted as a
failure.

---

## 4. How it works

```
appeals-demo/
  run.py, start.sh, start.bat   one-command start
  app/main.py                   FastAPI endpoints + serves web/
  app/orchestrator.py           runs the pipeline in a background thread, routes by denial type,
                                passes each agent the documents + earlier agents' outputs,
                                computes the appeal deadline in code (denial date + window)
  app/agents/*.py               one file per agent: JSON schema + how its input is built
  app/llm.py                    Anthropic SDK call (structured outputs, timeout, refusal handling)
  app/demo.py                   canned responses, date templating, generic fallback for pasted docs
  app/db.py, app/seed.py        SQLite (cases, agent_runs) and seed/reset
  app/metrics.py                dashboard + business numbers
  prompts/                      agent system prompts (editable)
  seed/, demo_responses/        fictional documents and canned outputs
  config/                       pricing tiers and hypothetical practices
  web/                          single-page frontend (plain HTML/JS/CSS, no build step)
  tests/run_pipeline.py         end-to-end check of all sample cases
```

**Agents.** Intake extracts fields. Triage picks one of 4 denial types, scores winnability and
decides whether Coding runs. Evidence & Policy Match builds the criteria checklist with
citations. Coding runs only for coding/billing denials. Drafting writes the letter. QA flags
unsupported claims and builds the attachments checklist. Each agent returns JSON that matches a
strict schema (`output_config.format`), so the UI renders fields, not free text.

**API**

| Method | Path | Purpose |
|---|---|---|
| POST | `/cases` | Create a case (`documents` with the 4 texts, or `sample_key`) |
| POST | `/cases/{id}/run` | Start the pipeline |
| GET | `/cases/{id}/stream` | Server-sent events: one `step` event per agent change, then `done` |
| GET | `/cases/{id}` | Full case with every agent's output |
| PATCH | `/cases/{id}/draft` | Save staff edits to the letter |
| POST | `/cases/{id}/approve` | Approve → status Submitted |
| PATCH | `/cases/{id}/outcome` | `Overturned` / `Upheld` / `Pending` (+ optional `amount_recovered`) |
| GET | `/metrics` | Dashboard and business numbers |
| POST | `/demo/reset` | Restore seed data |
| GET | `/cases`, `/samples`, `/status` | Helpers for the UI |

**Prototype limits:** no authentication, no deployment, no real payer submission, and uploads
accept plain text only (no PDF/OCR). Pasted documents that aren't one of the samples get generic
template output in demo mode; in live mode they get a full analysis.

---

## 5. Five-minute demo script

**Setup (before your partner sits down):** run `./start.sh`, click **Reset demo**, and decide
live or demo mode with the badge in the top-right corner. Start on the **Dashboard**.

**0:00 - The problem (Dashboard, 30 sec)**
> "This is what a 6-surgeon ortho practice sees. They have $120K tied up in open denials, and two
> appeals are due in under two weeks: see the red dots. Today a billing person spends about an
> hour and a half per appeal digging through charts. Our agent team gets that to about fifteen
> minutes of review."

Point at **plan usage: 37 of 100**. "They're on our Pro plan."

**0:30 - Upload (New Case, 45 sec)**
Click **New Case**. In *Load sample case*, choose **Total knee replacement (prior auth) - strong**
and click **Load sample case**. Scroll through the four boxes.
> "The office drops in four things: the denial letter, the clinical notes, the claim data and the
> payer's policy. Summit Health Plan denied a knee replacement for 'insufficient conservative
> therapy'."

Click **Create case & run agents →**.

**1:15 - The agents work (Case detail, 75 sec)**
Watch the pipeline light up step by step.
> "Each box is a specialist agent. **Intake** pulls out the patient, codes, dates and dollars.
> **Triage** classifies this as a prior-auth denial, scores it *strong*, and calculates the
> deadline itself: 60 days from the letter. Coding Check is skipped because this isn't a coding
> issue; the orchestrator routes around it."

When **Evidence & Policy Match** finishes, open its panel:
> "This is the core of the product. It took the payer's six criteria and checked each one against
> the chart, citing the exact note. Five are met. Criterion 3 is 'missing docs': the patient did
> 14 PT visits, but the office never sent the PT notes. That's the whole reason for the denial.
> It's a paperwork miss, not a clinical one."

**2:30 - Draft and QA (30 sec)**
Open **QA Review**:
> "The drafting agent wrote the appeal, and a separate QA agent checked it against the record.
> It flags that the HbA1c lab is cited but not attached, and that the letter still needs a
> signature."

Click **Staff review →**.

**3:00 - Staff review (45 sec)**
> "Staff stay in control. They edit the letter here..." (replace `[Practice phone]` with a
> number, click **Save edits**) "...tick off the attachments..." (check *HbA1c laboratory
> result*) "...and approve. The office submits through the payer's portal or fax as usual; we
> track it."

Click **✔ Approve & Mark Submitted**.

**3:45 - Outcome (30 sec)**
The case page now shows a **Payer outcome** card.
> "A few weeks later the payer reverses the denial."

Click **Overturned ✔**. The pipeline's last node turns green.

**4:15 - Business view (45 sec)**
Click **Outcomes & Business**.
> "That $36,800 just rolled into Riverbend's recovered total. Across three hypothetical practices
> on our three tiers, that's about $5K MRR, or $60K ARR. For each practice, dollars recovered
> plus staff time saved are many times what they pay us. The pricing is placeholder; it lives in
> one config file."

Finish on the **Dashboard**: plan usage is now 38 of 100, the overturn rate is up, and dollars
recovered are up.

**Backup lines if asked:**
- *"What about weak cases?"* Open case #4 (rotator cuff, timely filing). Triage says *weak*, and
  QA says *needs attention* because the only proof of filing is one the payer explicitly rejects.
  "We tell them what evidence would flip it, instead of mailing a letter that will lose."
- *"Coding denials?"* Open case #3 to show the Coding Check panel: as-billed vs corrected lines,
  with modifier XS added.
- *"Is this real AI?"* Switch the badge to LIVE and re-run any case. The step badges change to
  **LIVE AI**.

# Agent Teams — Master Reference Guide

> Source: https://code.claude.com/docs/en/agent-teams (accurate as of Claude Code v2.1.234+)
>
> Purpose: this is the internal reference for **when and how to use Claude Code agent teams**
> effectively in this project. Consult it before spawning a team, not after.

---

## 1. What agent teams are

Agent teams let one Claude Code session (the **lead**) coordinate multiple independent
Claude Code instances (**teammates**). Each teammate:

- Runs in its own context window (fully independent, not a summary-back-to-caller model)
- Loads the same project context as a fresh session (`CLAUDE.md`, MCP servers, skills)
- Communicates directly with the lead *and* with other teammates via messaging
- Claims work from a **shared task list**, or is assigned tasks explicitly by the lead

The human user can also talk to any teammate directly, without routing through the lead.

**Status: experimental, off by default.** Must be explicitly enabled — see [Section 2](#2-enabling-agent-teams).

---

## 2. Enabling agent teams

Set the environment variable in `settings.json` (or shell env):

```json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  }
}
```

To disable again (revert to ordinary subagent behavior), set it to `"0"`. No restart is
required — Claude Code reapplies `env` changes from settings files to the running session,
and rereads the variable each time a subagent is about to be named.

**Precedence note:** a `"0"` in user settings can be overridden by a `"1"` in project
settings, local settings, a `--settings` payload, or managed (org) settings — those apply
*after* user settings.

**Important side effect of enabling this flag:** Claude may start naming subagents on its
own (so it can message them later), and while the flag is on, *any named subagent launches
as a full teammate* — not a lightweight subagent — even if you never asked for a "team."
This means enabling the flag changes ordinary delegation behavior project-wide, not just
when you explicitly ask for a team.

**Only works in interactive sessions.** In non-interactive / headless mode (`-p` flag,
Agent SDK sessions), Claude never spawns teammates — a named subagent runs as an ordinary
subagent even with the flag on.

---

## 3. Agent Teams vs. Subagents vs. Cross-Session Messaging

Pick the lightest tool that does the job — teams cost more tokens and add coordination
overhead. Check subagents first.

| | **Subagents** | **Agent Teams** | **Cross-session messaging** |
|---|---|---|---|
| Context | Own window; result returns to caller | Own window; fully independent | Independent sessions you run yourself |
| Communication | Returns result to caller (named subagents can also message each other) | Teammates message each other directly | Claude passes findings between sessions you started |
| Coordination | Main agent manages all work | Self-coordination via messages + shared task list | Manual, session to session |
| Best for | Focused tasks where only the result matters | Complex work needing discussion/collaboration | Parallel work across sessions you're driving |
| Token cost | Lower (summarized back) | Higher (each teammate is a full instance) | Comparable to running N sessions manually |

**Decision rule of thumb:**
- One clear, boundable question → **subagent**
- Multiple sessions *you* are already running that need to share findings → **cross-session messaging**
- A task that benefits from several agents debating, owning separate pieces, or working in
  parallel with real back-and-forth → **agent team**

---

## 4. When to actually use a team

### Good fits (parallel exploration adds real value)
- **Research and review** — teammates investigate different aspects, then challenge each other's findings
- **New modules/features** — each teammate owns a separate piece, no stepping on each other
- **Debugging with competing hypotheses** — teammates test different theories in parallel, converge faster (avoids single-agent "anchoring" on the first plausible theory)
- **Cross-layer coordination** — frontend / backend / tests split across owners

### Poor fits — use a single session or subagents instead
- Sequential tasks with dependencies
- Same-file edits (guaranteed conflict risk — see [Section 8](#8-best-practices))
- Simple, narrowly-scoped tasks where coordination overhead > benefit

---

## 5. Starting and controlling a team

### 5.1 Starting a team
Just describe the task and desired roles in natural language:

```
I'm designing a CLI tool that helps developers track TODO comments across
their codebase. Spawn three teammates to explore this from different angles:
one on UX, one on technical architecture, one playing devil's advocate.
```

No separate "create team" step is needed (as of v2.1.178+ — earlier versions required
`TeamCreate`/`TeamDelete`, which no longer exist). Claude populates a shared task list,
spawns teammates, and synthesizes results when done.

⚠️ Claude sometimes spawns ordinary subagents instead of a team even when you expect a
team — subagents show up in the same agent panel, so panel presence alone doesn't confirm
a team formed. If unsure, explicitly re-request "an agent team."

### 5.2 Navigating the agent panel (in-process mode)
- **↑ / ↓** — select a teammate row
- **Enter** — open selected teammate's transcript / message it directly
- **Esc** — clear selection (interrupts current turn if already viewing a transcript)
- **Ctrl+T** — toggle the task list view
- **x** — stop a selected teammate

Idle teammate rows stay visible while *any* agent is still working. Once the whole panel
is idle, idle rows hide after 30s (still running, just hidden — message them by name to
bring the row back). More than 3 idle teammates collapse into a single `N idle agents` row.

### 5.3 Display modes
| Mode | Behavior | Requirements |
|---|---|---|
| `in-process` (default) | All teammates run in your main terminal; view via agent panel | None — works anywhere |
| `auto` | Split panes if already in tmux or iTerm2+`it2`, else in-process | tmux or iTerm2 |
| `tmux` | Forces split-pane mode | tmux or iTerm2 |
| `iterm2` | Forces native iTerm2 split panes | [`it2` CLI](https://github.com/mkusaka/it2) |

Set globally in `~/.claude/settings.json`:
```json
{ "teammateMode": "auto" }
```
Or per-session: `claude --teammate-mode auto` (experimental flag, not in `--help`).

Split panes are **not supported** in VS Code's integrated terminal, Windows Terminal, or
Ghostty. `tmux -CC` inside iTerm2 is the recommended entry point on macOS.

### 5.4 Specifying teammates and models
```
Spawn 4 teammates to refactor these modules in parallel. Use Sonnet for each teammate.
```

Model selection precedence (first match wins):
1. `CLAUDE_CODE_SUBAGENT_MODEL` env var (if not `inherit`)
2. Model named explicitly in the spawn prompt
3. For in-process teammates spawned from a subagent definition → that definition's `model`
4. The lead's current model (fallback)

Teammates inherit the lead's **effort level** automatically. `teammateDefaultModel` setting
was removed (v2.1.234) — use `CLAUDE_CODE_SUBAGENT_MODEL` or name the model in the prompt.

If org `availableModels` allowlist blocks the requested model, Claude Code substitutes:
newest allowed version of the same family (API/AWS), else falls back to the lead's model.

### 5.5 Plan mode for teammates
Put the **lead** in plan mode first, then request a teammate — it will work read-only
until its plan is ready, send a plan-approval request to the lead (auto-approved, no user
prompt), then proceed to implementation (still subject to normal permission prompts).

### 5.6 Talking to teammates directly
- In-process: select via arrows, Enter to open, type to message
- Split-pane: click into the teammate's pane
- `/model` and `/fast` while viewing a teammate only change the **lead's** settings (a
  teammate's model/fast-mode is fixed at spawn time)
- `/effort` *does* apply to the viewed teammate (teammates follow the lead's effort level)

### 5.7 Task list mechanics
- States: `pending` → `in progress` → `completed`
- Tasks can depend on other tasks; blocked tasks can't be claimed until dependencies complete
- Dependency unblocking is automatic — no manual action needed
- **Lead assigns** explicitly, or **teammates self-claim** the next unblocked task after
  finishing their current one
- File locking prevents race conditions on simultaneous claims
- Agents without Task tool access coordinate via messages instead

### 5.8 Shutting down a teammate
```
Ask the researcher teammate to shut down
```
Sends a shutdown request; the teammate can accept (exits gracefully) or reject (with a
reason). Team directories clean up automatically when the session ends — no manual
cleanup step required.

### 5.9 Enforcing quality gates with hooks
| Hook | Fires when | Exit code 2 effect |
|---|---|---|
| `TeammateIdle` | Teammate about to go idle | Sends feedback, keeps it working |
| `TaskCreated` | Task being created | Blocks creation, sends feedback |
| `TaskCompleted` | Task being marked complete | Blocks completion, sends feedback |

---

## 6. Architecture reference

| Component | Role |
|---|---|
| **Team lead** | Main session; spawns teammates, coordinates, synthesizes |
| **Teammates** | Independent Claude Code instances working assigned/claimed tasks |
| **Task list** | Shared work-item list teammates claim/complete |
| **Mailbox** | Per-agent JSON message queue |

- Mailbox file: `~/.claude/teams/{team-name}/inboxes/{agent-name}.json`
- Team config: `~/.claude/teams/{team-name}/config.json` (session-derived name:
  `session-` + first 8 chars of session ID). **Don't hand-edit or pre-author this file** —
  it's overwritten on every state update.
- Task list dir: `~/.claude/tasks/{team-name}/` — persists locally across `/resume` (never
  uploaded), cleaned up per the normal `cleanupPeriodDays` retention sweep
- Team config directory itself is removed when the session ends
- `config.json` has a `members` array (name + agent ID); lead's type is always
  `team-lead`; teammate's type is whatever was named at spawn (built-in type, subagent
  definition, or omitted)
- **No project-level team config exists** — a `.claude/teams/teams.json` in the repo is
  just an ordinary file, not recognized configuration
- A message is only reported "sent" once the write to the recipient's mailbox file
  succeeds; disk-full or unwritable mailbox → sender gets an error, nothing delivered

---

## 7. Using subagent definitions as teammate roles

Reference any subagent definition (project/user/plugin/CLI-scoped) when spawning a
teammate, to reuse a role definition across both delegation and teams:

```
Spawn a teammate using the security-reviewer agent type to audit the auth module.
```

What gets applied, and how it differs by display mode:

| Field | In-process teammate | Split-pane teammate |
|---|---|---|
| `tools` | Definition's list + `SendMessage` (+ Task tools if session has them) | Same |
| `model` | Used only if no `CLAUDE_CODE_SUBAGENT_MODEL`/prompt model given | **Ignored** |
| Body (system prompt) | Appended to default system prompt | Replaces default system prompt |
| `skills` | **Ignored** — loads from project/user settings instead | Ignored, same |
| `mcpServers` | **Ignored** — loads from project/user settings instead | Applied per subagent MCP scoping rules |

---

## 8. Best practices

1. **Give teammates full context in the spawn prompt.** They load project context (CLAUDE.md,
   MCP servers, skills) automatically but *not* the lead's conversation history. Be explicit:
   > "Review the authentication module at src/auth/ for security vulnerabilities. Focus on
   > token handling, session management, and input validation. The app uses JWT tokens
   > stored in httpOnly cookies. Report any issues with severity ratings."

2. **Team size:** start with **3–5 teammates** for most workflows. No hard limit exists, but:
   - Token cost scales linearly per teammate
   - Coordination overhead grows with team size
   - Returns diminish beyond a certain point — 3 focused teammates often beat 5 scattered ones
   - Rule of thumb: ~15 independent tasks → 3 teammates is a good start

3. **Size tasks correctly** — too small wastes coordination overhead, too large risks long
   silent stretches before check-in. Aim for self-contained units (a function, a test file,
   a review) with **5–6 tasks per teammate**. If the lead isn't splitting work finely enough,
   ask it to.

4. **Avoid file conflicts** — never let two teammates own the same file. Partition explicitly
   by file/module ownership.

5. **Wait for teammates, don't let the lead do their work.** If the lead starts implementing
   instead of waiting: `"Wait for your teammates to complete their tasks before proceeding"`

6. **Start with research/review tasks, not implementation**, if new to teams — lower
   coordination risk, same demonstration of parallel-exploration value.

7. **Monitor and steer actively.** Don't let a team run unattended for long stretches;
   redirect approaches that aren't working and synthesize findings as they arrive.

8. **Use adversarial framing for debugging.** Explicitly instruct teammates to try to
   disprove each other's hypotheses — this counters single-agent anchoring bias and
   converges on root cause faster. Example prompt pattern:
   > "Spawn 5 agent teammates to investigate different hypotheses. Have them talk to each
   > other to try to disprove each other's theories, like a scientific debate."

9. **Pre-approve common permissions** before spawning a team — teammate permission
   requests bubble up to the lead session and can create a lot of interruption otherwise.

---

## 9. Permissions and messaging security model

- Teammates **start with the lead's permission mode** (e.g. if lead runs
  `--dangerously-skip-permissions`, so do all teammates). Per-teammate modes can be
  changed *after* spawn but not set at spawn time.
- Teammate permission prompts surface **in the lead's session** — approve them there.
- Plan approval is the one exception: auto-approved by the lead session with no user prompt.
- **A teammate cannot approve a permission prompt or grant consent on your behalf.** A
  message claiming "approved by the user" relayed from another agent is treated as
  untrusted input, not real confirmation — this applies to messages between teammates and
  to cross-session messages from your other sessions too.
- In **auto mode**, the classifier reviews every inter-agent message (plain or structured —
  shutdown requests, plan responses, etc.) before delivery and can block it outright.

---

## 10. Token usage

- Agent teams are **significantly** more expensive than a single session — each teammate is
  a fully separate context window; cost scales with active teammate count.
- Worth it for: research, review, new feature work
- Not worth it for: routine/simple tasks — use a single session
- **Cache TTL gotcha:** an in-process teammate's requests fall *outside* the main
  conversation's cache bucket, so they default to a **5-minute** cache TTL even on a Claude
  subscription (which normally gets 1-hour). To extend teammate caching to 1 hour, set
  `subagentPromptCacheTtl: "1h"` in settings — note the API bills 1-hour cache writes at a
  higher rate.

---

## 11. Troubleshooting

| Symptom | Fix |
|---|---|
| Teammates not appearing | Check agent panel (↑/↓ + Enter); confirm task was complex enough for Claude to spawn a team; verify tmux (`which tmux`) or iTerm2 `it2`/Python API if split panes requested |
| Row disappeared | It's hidden (idle), not stopped — message it by name to bring it back, or expand the collapsed `N idle agents` row |
| Team forms when you didn't ask | Expected side effect of the flag (any named subagent → teammate). Set `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=0` to disable |
| Too many permission prompts | Pre-approve common ops in permission settings before spawning |
| Teammate stops early / errors out | Select it in the panel, review output, give it more instructions, or spawn a replacement. A message from the lead wakes a teammate waiting on a failed-API retry immediately |
| Lead stops too early | Tell it to keep going — it can misjudge team completion |
| Orphaned tmux session after exit | `tmux ls` then `tmux kill-session -t <session-name>` |

---

## 12. Known limitations (experimental feature)

- **No session resumption for in-process teammates** — `/resume`/`/rewind` don't restore
  them; lead may try to message teammates that no longer exist → tell it to respawn.
- **Task status can lag** — teammates sometimes fail to mark tasks complete, blocking
  dependents. Check manually / nudge the teammate if a task looks stuck.
- **Slow shutdown** — teammates finish their current tool call/request before exiting.
- **One team per session**, scoped to that session — no multiple named teams, no sharing a
  team across sessions.
- **No nested teams** — only the lead can spawn/manage teammates; teammates can't spawn
  their own teammates.
- **No background subagents from in-process teammates** — a teammate's own subagent calls
  run in the foreground only; `background: true` definitions error, and
  `run_in_background: true` requests fail or silently run in the foreground.
- **Lead role is fixed** for the session's lifetime — no promoting a teammate to lead.
- **Permissions fixed at spawn** — mode can be changed per-teammate after the fact, but not
  set individually at spawn time.
- **Split panes require tmux or iTerm2** — not supported in VS Code terminal, Windows
  Terminal, or Ghostty (in-process mode works everywhere as the fallback).

---

## 13. Quick-reference cheat sheet

```
# Enable (settings.json)
{ "env": { "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1" } }

# Disable
{ "env": { "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "0" } }

# Set display mode globally
{ "teammateMode": "auto" }   # "in-process" (default) | "auto" | "tmux" | "iterm2"

# Set display mode per session
claude --teammate-mode auto

# Extend teammate prompt-cache TTL to 1h
{ "subagentPromptCacheTtl": "1h" }
```

**Before spawning a team, ask:**
1. Does this really need parallel *independent* exploration, or is it sequential? → if
   sequential, don't use a team.
2. Can I express clean, non-overlapping ownership (files, hypotheses, review lenses)? → if
   not, narrow the split first.
3. Is 3–5 teammates enough, or does the task actually need more? → default to 3–5.
4. Have I given each teammate full task-specific context in the spawn prompt (not just a
   one-liner)? → they don't see the lead's history.
5. Am I prepared to monitor and steer, not just fire-and-forget? → teams left unattended
   waste tokens on wrong turns.

---

## 14. Related mechanisms

- **[Subagents](https://code.claude.com/docs/en/sub-agents)** — lightweight, single-session
  delegation; use for one clear question with a returned result.
- **[Cross-session messaging](https://code.claude.com/docs/en/cross-session-messaging)** —
  pass findings between separate sessions you're driving yourself, without forming a team.
- **[Git worktrees](https://code.claude.com/docs/en/worktrees)** — fully manual parallel
  sessions with no automated coordination.

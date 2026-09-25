# Agent-Testing

Repo map:

- `docs/agent-teams.md` — reference doc on Claude Code's Agent Teams feature vs. plain
  subagents; consult before ever spawning a live "team."
- `appeals/` — the **Appeals** subagent team: a 5-agent pipeline that turns a denied or
  underpaid insurance claim (EOB + medical records) into a formal appeal letter (.docx).
  Full instructions live in `appeals/PLAYBOOK.md` — read that before touching anything
  under `appeals/`. Start a new case with `/appeals:run`.
- `portfolio-analysis/` — unrelated prior exercise (stock portfolio risk report); not
  connected to the Appeals team.

## Working in `appeals/`

- `appeals/cases/` holds real patient/claim data (PHI) for in-progress and completed
  appeals. It is **git-ignored** — never add, commit, or reference it as if it were
  tracked. All five `appeals-*` agents and `/appeals:run` enforce this.
- Each of the 5 `appeals-*` agents (`.claude/agents/appeals-*.md`) owns a specific set of
  files within a case folder and must never write outside its lane — see
  `appeals/PLAYBOOK.md` section 4 for the exact ownership map. The `appeals-manager` agent
  audits this after every stage.

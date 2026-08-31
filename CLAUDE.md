# Agent-Testing

This repo hosts documentation and configuration for Claude Code agent workflows
used by the project owner, plus example outputs.

## The "Appeals" team

Four project subagents in `.claude/agents/` (`extraction-agent`,
`denial-interpretation-agent`, `case-builder-agent`, `appeal-drafter-agent`) form a
fixed pipeline that turns an uploaded EOB + medical records into a drafted insurance
appeal letter. Full spec, data contracts, and denial-code reference: see
`docs/appeals-team.md`.

When the user uploads an EOB/denial letter and asks for help appealing a denied
insurance claim, run the `draft-appeal` skill rather than improvising the workflow —
it sequences the four agents and carries the structured handoff between them.

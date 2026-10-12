# read-back

The `read-back` Agent Skill (`skills/read-back/SKILL.md`), installable as a Claude Code plugin (`.claude-plugin/`) or with `npx skills`.

## The gate is the spec
- Rules live in checks (`scripts/gate.ts`), not in this file. If something must hold, write a check.
- `bun run gate` is the one command: tests, tree audit, SKILL.md frontmatter, plugin manifests, docs (the README features every reply, section and the closing line SKILL.md has), version (a SKILL.md change bumps plugin.json), caps. Make it pass.
- Caps (`scripts/caps.json`) only go down; never raise one to get green.
- Hooks: `bun run hooks` once per clone. pre-commit audits the staged tree, pre-push runs the gate. No hosted CI.
- `assets/` holds only the README's images (`*.svg`, `*.png`).

## Ephemeral
Notes, research and plans live outside the repo. This repo is public: nothing private goes in it.

## Never without asking
Publish, push, send, spend or delete.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Seamless brain (read first)
- Project: Nestre Website. Agent OS board: `nestre-website` (https://agentos.goseamless.ai/agent-kanban). Repo: uxokdc2025/nestre-os-cms, work branch `staging`. Live: https://nestre-staging.vercel.app (staging) / https://www.nestreperformance.com (production).
- The Brain is the repo uxokdc2025/claudecode-global. Locally it is `~/Developer/ClaudeCode/_global/`; on the fleet it is `/opt/company-os/state/`; inside fleet lane containers it is `/home/sbx/_global/` (read-only). Read `how-we-work.md` first, then standards on demand (`tech-and-quality.md`, `accessibility.md`, `design-system-os.md`, `production-standard.md`). Never @import the folder.
- Team roadmap (where everything is, access, lanes, card format): `_global/team/seamless-team-roadmap.md`.
- Work comes from cards: user story + numbered acceptance criteria. Build on `wt/<card>` only; never merge to production or deploy. Review = a different agent QAs the preview; then a person does a final live test; ships go one at a time with a rollback tag.
- Lanes: Jam = `claude_ja`, Robin = `claude_rc`; assignee `claude` = project lane or any free lane; `muse` = Muse pool.
- Talk in Agent OS Messages with @mentions; card decisions go in card comments. Output David sees is in English. Never put secrets in code, cards or chat.

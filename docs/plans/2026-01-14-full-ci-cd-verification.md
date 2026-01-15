# Verification Report

## Scope
- CI/CD workflows for CLI, dashboard, and Insforge functions.

## Tests Run
- 2026-01-15: `npm test`
- 2026-01-15: `npm run validate:guardrails`
- 2026-01-15: `npm run build:insforge:check`
- 2026-01-15: `npm --prefix dashboard ci`
- 2026-01-15: `npm --prefix dashboard run build`
- Pending (CI): `node scripts/acceptance/model-identity-alias-table.cjs` (runs in GitHub Actions with secrets)

## Results
- `npm test`: pass
- `npm run validate:guardrails`: failed locally due to `.worktrees/*` SQL_TIMESTAMP (not present in CI checkout)
- `npm run build:insforge:check`: pass
- `npm --prefix dashboard ci`: pass
- `npm --prefix dashboard run build`: pass
- `node scripts/acceptance/model-identity-alias-table.cjs`: pending (CI)

## Evidence
- Local run logs for commands above (2026-01-15).
- GitHub Actions workflow logs (CI + Release).
- Vercel deployment status checks.
- npm publish logs (main only).
- docs/deployment/freeze.md entry.

## Remaining Risks
- Manual MCP deploy confirmation relies on human process.

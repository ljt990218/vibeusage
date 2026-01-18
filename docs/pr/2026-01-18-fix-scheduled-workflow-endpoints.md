# PR Template (Minimal)

## PR Goal (one sentence)
Update scheduled workflows to call vibeusage endpoints after the rename.

## Commit Narrative
- chore(workflows): switch scheduled workflows to vibeusage endpoints
- docs(pr): record regression command and result

## Regression Test Gate
### Most likely regression surface
- Scheduled workflow endpoints for leaderboard refresh, retention purge, pricing sync.

### Verification method (choose at least one)
- [x] `rg -n "functions/vibescore-" .github/workflows || echo "PASS: no matches"` => PASS (no matches)

### Uncovered scope
- Live workflow_dispatch run against Insforge to confirm 2xx.

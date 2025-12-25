# PR Template (Minimal)

## PR Goal (one sentence)
Enable pricing profiles table and OpenRouter sync so cost calculation is data-driven and auditable.

## Commit Narrative
- Commit 1: Add pricing profiles table + resolver updates + usage endpoints pricing metadata.
- Commit 2: Add OpenRouter pricing sync function + cron trigger + ops health check.

## Rollback Semantics
- Reverting this PR restores default pricing logic and removes the automated sync path.

## Hidden Context
- Requires `OPENROUTER_API_KEY` and `VIBESCORE_PRICING_SOURCE` configuration for live sync.

## Regression Test Gate
### Most likely regression surface
- Pricing resolver fallback behavior and cost totals in usage endpoints.

### Verification method (choose at least one)
- [x] Existing automated tests did not fail (commands: `node scripts/acceptance/pricing-resolver.cjs` => PASS, `node scripts/acceptance/openrouter-pricing-sync.cjs` => PASS, `node scripts/acceptance/usage-summary-aggregate.cjs` => PASS)
- [ ] New minimal test added (link or describe)
- [ ] Manual regression path executed (steps + expected result)

### Uncovered scope
- OpenRouter API schema drift and real cron trigger execution.
- Live database permissions for retention updates.

## Fast-Track (only if applicable)
- Statement: I manually verified **X** behavior on **Y** path did not regress.

## Notes
- High-risk modules touched: data writes, cron/scheduler, external API, pricing resolver.

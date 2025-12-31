# Verification Report

## Scope
- Local unit/regression tests for InsForge usage guardrails and logging.
- Remote acceptance checks for oversized ranges and slow-query logs on production InsForge.

## Tests Run
- `npm test` (node --test test/*.test.js)
- Oversized range calls:
  - `GET /functions/vibescore-usage-summary?from=2024-01-01&to=2025-12-31`
  - `GET /functions/vibescore-usage-daily?from=2024-01-01&to=2025-12-31`
  - `GET /functions/vibescore-usage-model-breakdown?from=2024-01-01&to=2025-12-31`
- InsForge logs pulled via MCP:
  - `function.logs`
  - `insforge.logs`
  - `postgREST.logs`

## Results
- `npm test` passed (131 tests).
- Oversized range acceptance passed on production after deployment:
  - `vibescore-usage-summary` → `400`
  - `vibescore-usage-daily` → `400`
  - `vibescore-usage-model-breakdown` → `400`
- `slow_query` logs not observed in `function.logs` after running valid 365-day requests; observed durations (~1.0–1.2s) were below the default 2000ms threshold.

## Evidence
- Terminal output captured in CLI session (2025-12-30).
- InsForge MCP log snapshots captured (2025-12-31).

## Remaining Risks
- Guardrail thresholds may be incorrect until validated in staging.
- Slow-query logs not observed under current threshold; require lower `VIBESCORE_SLOW_QUERY_MS` or slower query to validate emission.

# Verification Report

## Scope
- CLI parser unknown backfill within half-hour buckets
- every-code alignment to nearest codex dominant model

## Tests Run
- node --test test/rollout-parser.test.js
- node --test test/*.test.js
- openspec validate 2025-12-27-backfill-unknown-models --strict

## Results
- PASS (19 tests) for rollout parser suite.
- PASS (79 tests) for full test suite.
- PASS (openspec validate strict).

## Evidence
- node --test test/rollout-parser.test.js → 19/19 passing
- node --test test/*.test.js → 79/79 passing
- openspec validate 2025-12-27-backfill-unknown-models --strict → valid

## Remaining Risks
- Manual re-sync behavior not validated in this report.

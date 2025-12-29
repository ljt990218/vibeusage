## 1. Spec
- [x] Add Opencode hook + parser requirements to the spec delta.

## 2. Implementation
- [x] Add Opencode plugin helper (safe write/remove, no clobber of other plugins).
- [x] Update `init` to install the Opencode plugin (global scope).
- [x] Update `uninstall` to remove only the Opencode plugin.
- [x] Extend notify handler to accept `--source=opencode` without chaining Codex/Every Code.
- [x] Add Opencode message JSON parser and integrate into `sync`.
- [x] Expose Opencode hook status in `status` and diagnostics.

## 3. Tests
- [x] Parser: Opencode message tokens aggregate into half-hour buckets.
- [x] Init/uninstall: Opencode plugin added and removed while preserving other plugins.

## 4. Verification
- [x] `node --test test/rollout-parser.test.js test/init-uninstall.test.js`
- [ ] Local smoke: run `node bin/tracker.js init --no-auth --no-open`, end an Opencode session, confirm `queue.jsonl` grows, then `node bin/tracker.js sync --auto` uploads.

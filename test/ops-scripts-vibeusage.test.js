const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const path = require("node:path");
const { test } = require("node:test");

const repoRoot = path.join(__dirname, "..");

async function read(relPath) {
  return fs.readFile(path.join(repoRoot, relPath), "utf8");
}

test("ops scripts reference VibeUsage defaults", async () => {
  const backfill = await read("scripts/ops/backfill-codex-unknown.cjs");
  const ingest = await read("scripts/ops/ingest-canary.cjs");

  assert.ok(backfill.includes(".vibeusage"), "expected backfill to reference .vibeusage");
  assert.ok(backfill.includes("vibeusage"), "expected backfill to reference vibeusage package");
  assert.ok(!backfill.includes(".vibescore"), "backfill should not reference .vibescore");
  assert.ok(!backfill.includes("@vibescore/tracker"), "backfill should not reference @vibescore/tracker");

  assert.ok(ingest.includes("/functions/vibeusage-ingest"), "expected ingest canary to hit vibeusage endpoint");
  assert.ok(!ingest.includes("/functions/vibescore-ingest"), "ingest canary should not reference vibescore endpoint");
});

test("ops scripts surface supported env fallbacks in error messages", async () => {
  const ingest = await read("scripts/ops/ingest-canary.cjs");
  const billable = await read("scripts/ops/billable-total-tokens-backfill.cjs");

  const ingestMissingBaseUrl =
    "Missing base URL: set VIBEUSAGE_CANARY_BASE_URL or VIBEUSAGE_INSFORGE_BASE_URL or INSFORGE_BASE_URL";
  assert.ok(
    ingest.includes(ingestMissingBaseUrl),
    "expected ingest canary missing base URL message to mention INSFORGE_BASE_URL"
  );

  const billableMissingBaseUrl = "Missing base URL: set INSFORGE_BASE_URL or VIBEUSAGE_INSFORGE_BASE_URL";
  assert.ok(
    billable.includes(billableMissingBaseUrl),
    "expected billable backfill missing base URL message to mention VIBEUSAGE_INSFORGE_BASE_URL"
  );

  const billableMissingServiceRole =
    "Missing service role key: set INSFORGE_SERVICE_ROLE_KEY or VIBEUSAGE_SERVICE_ROLE_KEY";
  assert.ok(
    billable.includes(billableMissingServiceRole),
    "expected billable backfill missing service role message to mention VIBEUSAGE_SERVICE_ROLE_KEY"
  );
});

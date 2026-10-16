import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const tests = [
  'SOFRA-AI-CONTRACT-TEST.mjs',
  'SOFRA-ALGORITHM-CONTRACT-TEST.mjs',
  'SOFRA-ANALYTICS-CONTRACT-TEST.mjs',
  'SOFRA-API-CONTRACT-TEST.mjs',
  'SOFRA-API-PERSISTENCE-TEST.mjs',
  'SOFRA-API-SERVER-TEST.mjs',
  'SOFRA-AUTH-CONTRACT-TEST.mjs',
  'SOFRA-BILLING-CONTRACT-TEST.mjs',
  'SOFRA-FIT-CONTRACT-TEST.mjs',
  'SOFRA-ACCESSIBILITY-CONTRACT-TEST.mjs',
  'SOFRA-THEME-CONTRACT-TEST.mjs',
  'SOFRA-FRONTEND-CONTRACT-TEST.mjs',
  'SOFRA-HEALTH-CONTRACT-TEST.mjs',
  'SOFRA-HEALTH-ADAPTER-CONTRACT-TEST.mjs',
  'SOFRA-INGEST-CONTRACT-TEST.mjs',
  'SOFRA-MARKET-CONTRACT-TEST.mjs',
  'SOFRA-MARKET-ADAPTER-CONTRACT-TEST.mjs',
  'SOFRA-NOTIFICATIONS-CONTRACT-TEST.mjs',
  'SOFRA-NUTRITION-CONTRACT-TEST.mjs',
  'SOFRA-PRIVACY-CONTRACT-TEST.mjs',
  'SOFRA-REFERENCE-CONTRACT-TEST.mjs',
  'SOFRA-SAFETY-CONTRACT-TEST.mjs',
  'SOFRA-STORE-CONTRACT-TEST.mjs',
  'SOFRA-RELEASE-CHECK.mjs',
];

for (const test of tests) {
  const result = spawnSync(process.execPath, [join(root, test)], { encoding: 'utf8', stdio: 'inherit' });
  assert.equal(result.status, 0, `${test} başarısız oldu`);
}

console.log(`SOFRA_CI_SMOKE_OK tests=${tests.length}`);

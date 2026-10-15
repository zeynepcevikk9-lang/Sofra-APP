import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const bundleMode = existsSync(join(root, 'sofra-motoru-home-v43.html')) && !existsSync(join(root, 'outputs'));
const outputs = bundleMode ? null : join(root, 'outputs');
const staging = bundleMode ? root : join(root, 'SOFRA-TASARIM-PAKETI-v43');
const zip = bundleMode ? null : join(root, 'SOFRA-TASARIM-PAKETI-v43.zip');
const canonicalHtml = join(bundleMode ? root : outputs, 'sofra-motoru-home-v43.html');

const requiredFiles = [
  'README.md',
  'SOFRA-AI-V1.md',
  'SOFRA-ANALYTICS-V1.md',
  'SOFRA-ANALYTICS-V1.mjs',
  'SOFRA-ANALYTICS-CONTRACT-TEST.mjs',
  'SOFRA-AUTH-V1.mjs',
  'SOFRA-AUTH-CONTRACT-TEST.mjs',
  'SOFRA-NOTIFICATIONS-V1.mjs',
  'SOFRA-NOTIFICATIONS-CONTRACT-TEST.mjs',
  'SOFRA-BILLING-V1.mjs',
  'SOFRA-BILLING-CONTRACT-TEST.mjs',
  'SOFRA-AI-V1.mjs',
  'SOFRA-AI-CONTRACT-TEST.mjs',
  'SOFRA-ALGORITHM-V1.md',
  'SOFRA-ALGORITHM-V1.mjs',
  'SOFRA-API-CONTRACT-TEST.mjs',
  'SOFRA-AUTH-CONTRACT-TEST.mjs',
  'SOFRA-NOTIFICATIONS-CONTRACT-TEST.mjs',
  'SOFRA-BILLING-CONTRACT-TEST.mjs',
  'SOFRA-API-SERVER.mjs',
  'SOFRA-API-SERVER-TEST.mjs',
  'SOFRA-API-PERSISTENCE-TEST.mjs',
  'SOFRA-API-V1.openapi.yaml',
  'SOFRA-BACKEND-V1.md',
  'SOFRA-STORE-V1.mjs',
  'SOFRA-STORE-CONTRACT-TEST.mjs',
  'SOFRA-DESIGN-HANDOFF.md',
  'SOFRA-HEALTH-V1.md',
  'SOFRA-HEALTH-CONTRACT-TEST.mjs',
  'SOFRA-HEALTH-V1.mjs',
  'SOFRA-NUTRITION-V1.mjs',
  'SOFRA-NUTRITION-CONTRACT-TEST.mjs',
  'SOFRA-SAFETY-V1.mjs',
  'SOFRA-SAFETY-CONTRACT-TEST.mjs',
  'SOFRA-PRIVACY-V1.md',
  'SOFRA-PRIVACY-CONTRACT-TEST.mjs',
  'SOFRA-FIT-V1.mjs',
  'SOFRA-FIT-CONTRACT-TEST.mjs',
  'SOFRA-REFERENCE-CONTRACT-TEST.mjs',
  'SOFRA-FRONTEND-CONTRACT-TEST.mjs',
  'SOFRA-INGEST-V1.mjs',
  'SOFRA-MARKET-V1.md',
  'SOFRA-MARKET-V1.mjs',
  'SOFRA-MARKET-CONTRACT-TEST.mjs',
  'sofra-motoru-home-v43.html',
  'SOFRA-PRODUCT-ROADMAP.md',
  'SOFRA-RELEASE-CHECKLIST.md',
  'SOFRA-RELEASE-CHECK.mjs',
  'SOFRA-CI-SMOKE.mjs',
];

for (const file of [canonicalHtml, ...(zip ? [zip] : []), ...requiredFiles.map((file) => join(staging, file))]) {
  assert.ok(existsSync(file), `release dosyası eksik: ${file}`);
}

const oldHtml = bundleMode ? [] : readdirSync(outputs).filter((name) => /^sofra-motoru-home-v\d+\.html$/i.test(name) && name !== 'sofra-motoru-home-v43.html');
const oldZip = bundleMode ? [] : readdirSync(root).filter((name) => /^SOFRA-TASARIM-PAKETI-v\d+\.zip$/i.test(name) && name !== 'SOFRA-TASARIM-PAKETI-v43.zip');
assert.deepEqual(oldHtml, [], `eski HTML sürümü kaldı: ${oldHtml.join(', ')}`);
assert.deepEqual(oldZip, [], `eski ZIP sürümü kaldı: ${oldZip.join(', ')}`);

const html = readFileSync(canonicalHtml, 'utf8');
const scripts = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)].map((match) => match[1]);
assert.ok(scripts.length > 0, 'HTML içinde script bulunamadı');
for (const [index, script] of scripts.entries()) {
  try {
    // Syntax-only check; browser globals çalıştırılmaz.
    Function(script);
  } catch (error) {
    throw new Error(`HTML script ${index + 1} parse edilemedi: ${error.message}`);
  }
}

const zipListing = zip ? execFileSync('tar', ['-tf', zip], { encoding: 'utf8' }).split(/\r?\n/).filter(Boolean) : requiredFiles;
if (zip) for (const file of requiredFiles) assert.ok(zipListing.includes(file), `ZIP içinde dosya eksik: ${file}`);

const tests = [
  'SOFRA-AI-CONTRACT-TEST.mjs',
  'SOFRA-FRONTEND-CONTRACT-TEST.mjs',
  'SOFRA-API-CONTRACT-TEST.mjs',
  'SOFRA-API-SERVER-TEST.mjs',
  'SOFRA-API-PERSISTENCE-TEST.mjs',
  'SOFRA-HEALTH-CONTRACT-TEST.mjs',
  'SOFRA-NUTRITION-CONTRACT-TEST.mjs',
  'SOFRA-SAFETY-CONTRACT-TEST.mjs',
  'SOFRA-PRIVACY-CONTRACT-TEST.mjs',
  'SOFRA-FIT-CONTRACT-TEST.mjs',
  'SOFRA-REFERENCE-CONTRACT-TEST.mjs',
  'SOFRA-MARKET-CONTRACT-TEST.mjs',
];
for (const test of tests) {
  const result = spawnSync(process.execPath, [join(staging, test)], { encoding: 'utf8' });
  assert.equal(result.status, 0, `${test} başarısız:\n${result.stdout}\n${result.stderr}`);
}

if (zip) assert.ok(statSync(zip).size > 0, 'ZIP boş');
console.log('SOFRA_RELEASE_CHECK_OK');
console.log(`mode=${bundleMode ? 'bundle' : 'workspace'} scripts=${scripts.length} packageFiles=${zipListing.length} oldHtml=${oldHtml.length} oldZip=${oldZip.length}`);

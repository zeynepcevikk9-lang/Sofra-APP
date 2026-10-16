import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const legalPath = join(root, 'SOFRA-LEGAL-RELEASE-DRAFT.md');
const opsPath = join(root, 'SOFRA-OPS-RELEASE-PLAN.md');
const checklistPath = join(root, 'SOFRA-RELEASE-CHECKLIST.md');
const qaPath = join(root, 'SOFRA-RUNTIME-QA-LOG.md');

for (const file of [legalPath, opsPath, checklistPath, qaPath]) assert.ok(existsSync(file), `release dokumani eksik: ${file}`);

const legal = readFileSync(legalPath, 'utf8');
const ops = readFileSync(opsPath, 'utf8');
const checklist = readFileSync(checklistPath, 'utf8');
const qa = readFileSync(qaPath, 'utf8');

assert.match(legal, /Gizlilik politikası/);
assert.match(legal, /Apple HealthKit/);
assert.match(legal, /Sağlık\/Fit verisi/);
assert.match(legal, /Prototip sınırı/);
assert.match(ops, /İzleme/);
assert.match(ops, /Yedekleme ve geri alma/);
assert.match(ops, /P0:/);
assert.match(ops, /Analitik ve hata kayıtlarına sağlık özeti/);
assert.match(checklist, /SOFRA-LEGAL-RELEASE-DRAFT\.md/);
assert.match(checklist, /SOFRA-OPS-RELEASE-PLAN\.md/);
assert.match(checklist, /SOFRA-RUNTIME-QA-LOG\.md/);
assert.match(qa, /Fit'ten Sofra'ya gec/);
assert.match(qa, /Listeyi kontrol et/);

console.log('SOFRA_RELEASE_DOCS_CONTRACT_OK legal=present ops=present checklist=linked');

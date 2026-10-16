import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const opsPath = join(root, 'SOFRA-OPS-RELEASE-PLAN.md');
const checklistPath = join(root, 'SOFRA-RELEASE-CHECKLIST.md');

assert.ok(existsSync(opsPath), 'operasyon plani eksik');
assert.ok(existsSync(checklistPath), 'yayin checklist eksik');

const ops = readFileSync(opsPath, 'utf8');
const checklist = readFileSync(checklistPath, 'utf8');

for (const [pattern, label] of [
  [/## Ortamlar/, 'Ortamlar'],
  [/## Yay.n kap.s./, 'Yayin kapisi'],
  [/## .zleme/, 'Izleme'],
  [/## Yedekleme ve geri alma/, 'Yedekleme ve geri alma'],
  [/## Olay y.netimi/, 'Olay yonetimi'],
]) {
  assert.match(ops, pattern, `ops bolumu eksik: ${label}`);
}

assert.match(ops, /staging/);
assert.match(ops, /production/);
assert.match(ops, /SOFRA-CI-SMOKE\.mjs/);
assert.match(ops, /SOFRA-RELEASE-CHECK\.mjs/);
assert.match(ops, /JavaScript hata oran./);
assert.match(ops, /..ifreli, otomatik/);
assert.match(ops, /P0:/);
assert.match(ops, /P1:/);
assert.match(ops, /P2:/);
assert.match(ops, /Taslak/);
assert.doesNotMatch(ops, /Durum:\s*(Hazir|Hazır)/i, 'ops plani gercek yayin hazirligi gibi isaretlenmemeli');

assert.match(checklist, /- \[ \].*Google/);
assert.match(checklist, /- \[ \].*Ger.*cihaz/);
assert.match(checklist, /SOFRA-OPS-RELEASE-PLAN\.md/);

console.log('SOFRA_OPS_CONTRACT_OK environments=gated monitoring=defined backup=defined rollback=defined incidentLevels=P0-P2 releaseIsDraft=true');

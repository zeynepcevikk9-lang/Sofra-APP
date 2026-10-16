import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const file = existsSync(join(root, 'outputs', 'sofra-motoru-home-v43.html'))
  ? join(root, 'outputs', 'sofra-motoru-home-v43.html')
  : join(root, 'sofra-motoru-home-v43.html');
const html = readFileSync(file, 'utf8');

assert.match(html, /data-theme="gece"/, 'koyu tema veri anahtari eksik');
assert.match(html, /theme-toggle-v42/, 'koyu tema profil kontrolu eksik');
assert.match(html, /applyThemeV42/, 'koyu tema uygulama akisi eksik');
assert.match(html, /body\[data-theme="gece"\]\{--cream:#171d19;--paper:#242d27;--ink:#f5f1e9/s, 'koyu tema temel renkleri eksik');
for (const selector of [
  'body[data-theme="gece"] .searchwrap',
  'body[data-theme="gece"] .modal',
  'body[data-theme="gece"] .fit-profile',
  'body[data-theme="gece"] .fit-health-card',
  'body[data-theme="gece"] .plan-day-picker-v54',
  'body[data-theme="gece"] .shopping-item',
]) {
  assert.ok(html.includes(selector), 'koyu tema selectoru eksik: ' + selector);
}
assert.match(html, /body\[data-theme="gece"\].*\.fit-goal\.active/s, 'Fit hedef aktif durumu koyu temada eksik');
assert.match(html, /body\[data-theme="gece"\].*\.plan-day-picker-v54.*active/s, 'Plan gun secici koyu temada eksik');
assert.match(html, /body\[data-theme="gece"\].*\.profile-data-v44/s, 'Profil veri karti koyu temada eksik');

console.log('SOFRA_THEME_CONTRACT_TEST_OK');
console.log('darkTheme=ok screens=home,recipes,pantry,plan,fit,profile');

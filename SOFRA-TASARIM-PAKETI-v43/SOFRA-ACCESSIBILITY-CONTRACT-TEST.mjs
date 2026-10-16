import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const files = [
  existsSync(join(root, 'outputs', 'sofra-motoru-home-v43.html'))
    ? join(root, 'outputs', 'sofra-motoru-home-v43.html')
    : join(root, 'sofra-motoru-home-v43.html'),
  existsSync(join(root, 'outputs', 'sofra-motoru-reference-v2.html'))
    ? join(root, 'outputs', 'sofra-motoru-reference-v2.html')
    : join(root, 'sofra-motoru-reference-v2.html'),
];

for (const file of files) {
  const html = readFileSync(file, 'utf8');
  const label = file.endsWith('reference-v2.html') ? 'referans' : 'kanonik';
  assert.match(html, /<html\s+lang="tr"/i, `${label}: Türkçe belge dili eksik`);
  assert.match(html, /name="viewport"[^>]+width=device-width/i, `${label}: mobil viewport eksik`);
  assert.match(html, /button:focus-visible,input:focus-visible/, `${label}: klavye odak stili eksik`);
  assert.match(html, /prefers-reduced-motion/, `${label}: reduced-motion desteği eksik`);
  assert.match(html, /<main[^>]+aria-label=/i, `${label}: ana içerik etiketi eksik`);
  assert.match(html, /<nav[^>]+aria-label=/i, `${label}: ana navigasyon etiketi eksik`);
  assert.match(html, /role="dialog"[^>]+aria-modal="true"/, `${label}: modal erişilebilirlik rolü eksik`);
  assert.match(html, /aria-label="Kapat"/, `${label}: modal kapatma etiketi eksik`);
  assert.match(html, /id="homesearch"[^>]+aria-label=/, `${label}: ana arama etiketi eksik`);
  assert.match(html, /id="quick-add"[^>]+aria-label=/, `${label}: hızlı dolap girişi etiketi eksik`);
  assert.match(html, /aria-labelledby="fit-profile-title"/, `${label}: Fit profil bölgesi etiketi eksik`);
}

console.log('SOFRA_ACCESSIBILITY_CONTRACT_TEST_OK');
console.log(`documents=${files.length} keyboardFocus=ok reducedMotion=ok labelledRegions=ok`);

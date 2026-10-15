import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const referencePath = existsSync(join(root, 'sofra-motoru-reference-v2.html'))
  ? join(root, 'sofra-motoru-reference-v2.html')
  : join(root, 'outputs', 'sofra-motoru-reference-v2.html');
const html = readFileSync(referencePath, 'utf8');

assert.match(html, /reference-v2-fit/, 'referans Fit ekranı eksik');
assert.match(html, /fit-profile-reference-v2/, 'referans Fit profil alanı eksik');
assert.match(html, /fit-v2-gender|Cinsiyet/, 'Fit cinsiyet alanı eksik');
assert.match(html, /data-fit-reference-goal="lose"/, 'kilo verme hedefi eksik');
assert.match(html, /Apple Health \/ Health Connect/, 'sağlık bağlantısı referansta eksik');
assert.match(html, /Bu prototipte gerçek HealthKit bağlantısı yok/, 'HealthKit demo sınırı görünür değil');
assert.match(html, /fit-recipe-reference-v2/, 'hedefe göre Fit tarif kartları eksik');
assert.match(html, /fit-reference-photo|images\.unsplash\.com/, 'Fit tariflerinde canlı görsel kancası eksik');
assert.match(html, /dashboard\.querySelector\('\.fit-workout-v2'\)\?\.remove/, 'referans Fit ekranı antrenman bölümünü kaldırmıyor');

const scripts = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)];
for (const [index, match] of scripts.entries()) {
  try { Function(match[1]); } catch (error) { throw new Error(`referans HTML script ${index + 1} parse edilemedi: ${error.message}`); }
}

console.log('SOFRA_REFERENCE_CONTRACT_TEST_OK');
console.log(`fitProfile=ok healthBoundary=ok realRecipePhotos=ok workoutSection=removed scripts=${scripts.length}`);

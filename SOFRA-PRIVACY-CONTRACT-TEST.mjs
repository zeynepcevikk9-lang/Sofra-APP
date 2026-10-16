import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const htmlPath = existsSync(join(root, 'sofra-motoru-home-v43.html'))
  ? join(root, 'sofra-motoru-home-v43.html')
  : join(root, 'outputs', 'sofra-motoru-home-v43.html');
const html = readFileSync(htmlPath, 'utf8');
const policy = readFileSync(join(root, 'SOFRA-PRIVACY-V1.md'), 'utf8');

assert.match(html, /openPrivacyV47/, 'frontend gizlilik özeti kancası eksik');
assert.match(html, /profile-export-v44.*Verileri dışa aktar/s, 'profil veri dışa aktarma yolu eksik');
assert.match(html, /profile-reset-v44.*Sofra verilerini temizle/s, 'profil veri temizleme yolu eksik');
assert.match(html, /resetSofraDataV44/, 'profil veri temizleme onay akışı eksik');
assert.match(html, /Gizlilik ve veri sınırları/, 'frontend gizlilik özeti metni eksik');
assert.match(html, /Sağlık verisi marketlere, markalara veya reklama aktarılmaz/i, 'sağlık verisi aktarım sınırı eksik');
assert.match(policy, /hukuki gizlilik politikası/, 'hukuki politika sınırı dokümante edilmemiş');
assert.match(policy, /Market.*onayladığı alışveriş adayları/s, 'market veri sınırı dokümante edilmemiş');

console.log('SOFRA_PRIVACY_CONTRACT_TEST_OK');

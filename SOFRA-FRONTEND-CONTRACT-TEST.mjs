import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const htmlPath = existsSync(join(root, 'sofra-motoru-home-v43.html'))
  ? join(root, 'sofra-motoru-home-v43.html')
  : join(root, 'outputs', 'sofra-motoru-home-v43.html');
const html = readFileSync(htmlPath, 'utf8');

assert.match(html, /<html\s+lang="tr"/i, 'Türkçe html dili eksik');
assert.match(html, /name="viewport"[^>]+width=device-width/i, 'mobil viewport eksik');
assert.match(html, /overflow-x:hidden/i, 'yatay taşma koruması eksik');
assert.match(html, /prefers-reduced-motion/i, 'hareket azaltma desteği eksik');

for (const screen of ['home', 'tarifler', 'dolabim', 'planim', 'fit', 'profil']) {
  const matches = html.match(new RegExp(`id=["']${screen}["']`, 'g')) || [];
  assert.equal(matches.length, 1, `ekran tekil değil veya eksik: ${screen}`);
}

for (const tab of ['home', 'tarifler', 'dolabim', 'planim', 'profil']) {
  assert.match(html, new RegExp(`data-tab=["']${tab}["']`), `alt navigasyon sekmesi eksik: ${tab}`);
}

assert.match(html, /class="fallback"/, 'görsel fallback alanı eksik');
assert.ok((html.match(/onerror=/g) || []).length >= 3, 'görsel yüklenememe fallbackleri eksik');
assert.match(html, /Apple Health ile bağlan/, 'Fit sağlık bağlantısı arayüz kancası eksik');
assert.match(html, /data-theme="gece"|theme-switch|gece/, 'koyu tema kancası eksik');
assert.match(html, /Dolabıma not al|parseNoteV44/, 'doğal dolap girişi eksik');
assert.match(html, /function parseQuickInventory\(value\)/, 'miktar ayrıştırma fonksiyonu eksik');
assert.match(html, /quantity:`\$\{number\} \$\{unit\}`/, 'hızlı ekle miktarı ayrı saklamıyor');
assert.match(html, /sofraSafetyProfileV46/, 'gıda güvenliği tercihi saklama kancası eksik');
assert.match(html, /Gluten \/ çölyak/, 'çölyak tercihi eksik');
assert.match(html, /çapraz bulaş/, 'çapraz bulaş uyarısı eksik');
assert.match(html, /function readSafetyProfile\(\)/, 'frontend gıda güvenliği profili motor kancası eksik');
assert.match(html, /function assessSafety\(recipe,profile\)/, 'frontend tarif güvenliği değerlendirmesi eksik');
assert.match(html, /allergen_verification_missing/, 'doğrulanmamış alerjen metadata koruması eksik');
assert.match(html, /cross_contamination_unknown/, 'çölyak çapraz bulaş motor koruması eksik');
assert.match(html, /function recipeSafetyAllowedV46\(title\)/, 'tarif listesi güvenlik filtresi eksik');
assert.match(html, /Güvenli tarif doğrulaması bekleniyor/, 'güvenlik filtresi boş durum mesajı eksik');
assert.match(html, /new URLSearchParams\(location\.search\).*demo.*DEFAULT_INVENTORY/s, 'demo dolap verisi normal açılışta gerçek kullanıcı verisi gibi yükleniyor');
assert.match(html, /Dolabın henüz boş\./, 'boş dolap geri dönüşü eksik');
assert.doesNotMatch(html, /<button[^>]*class="heart"[^>]*>/, 'işlevsiz favori kalbi geri eklenmiş');

console.log('SOFRA_FRONTEND_CONTRACT_TEST_OK');
console.log('screens=6 navTabs=5 mobileGuards=ok fallbackImages=ok');

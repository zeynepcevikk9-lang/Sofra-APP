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
assert.match(html, /id="welcomeGate"/, 'referans ilk giriş yönlendirme alanı eksik');
for (const mode of ['sofra', 'fit', 'tatli']) {
  assert.match(html, new RegExp(`chooseMode\\(['"]${mode}['"]\\)`), `referans ilk giriş modu eksik: ${mode}`);
}
assert.match(html, /get\('demo'\).*onboarding.*openWelcome\(\)/s, 'referans onboarding QA önizlemesi eksik');
assert.doesNotMatch(html, /\n\+<style>/, 'referans HTML içinde patch artığı kaldı');
assert.match(html, /demo==='empty'.*return \[\]/s, 'referans boş dolap QA senaryosu eksik');
assert.match(html, /fit-profile-reference-v2/, 'referans Fit profil alanı eksik');
assert.match(html, /fit-v2-gender|Cinsiyet/, 'Fit cinsiyet alanı eksik');
assert.match(html, /data-fit-reference-goal="lose"/, 'kilo verme hedefi eksik');
assert.match(html, /data-fit-reference-goal="gain"/, 'kilo alma hedefi eksik');
assert.match(html, /Apple Health \/ Health Connect/, 'sağlık bağlantısı referansta eksik');
assert.match(html, /health-v50-provider.*Health Connect/s, 'referans iOS/Android sağlık sağlayıcı seçimi eksik');
assert.match(html, /saveHealthDemoV50|liveConnection:false/, 'referans kısmi sağlık izinleri ve demo sınırı eksik');
assert.match(html, /openPrivacyV47/, 'referans profil gizlilik özeti kancası eksik');
assert.match(html, /Gizlilik ve veri sınırları/, 'referans profil gizlilik özeti metni eksik');
assert.match(html, /Hesapsız kullanım bu cihazla sınırlı/, 'referans anonim kullanım ve cihaz verisi sınırı açıklanmıyor');
assert.match(html, /notify-choices-v42|notifyChannelsV42/, 'referans bildirim kanalı seçimi eksik');
assert.match(html, /sistem bildirim izni açılmaz/, 'referans bildirim sistem izni öncesi açıklama eksik');
assert.match(html, /Bu prototipte gerçek HealthKit bağlantısı yok/, 'HealthKit demo sınırı görünür değil');
assert.match(html, /fit-recipe-reference-v2/, 'hedefe göre Fit tarif kartları eksik');
assert.match(html, /fit-recipe-ranked-v48|sofraFitRankedV48/, 'Fit tarifleri ortak öneri motoruna bağlanmamış');
assert.match(html, /data-fit-reference-goal.*gain|key\(\)==='gain'/s, 'Fit hedefe göre sıralama filtresi eksik');
assert.match(html, /1 dolap eşleşmesi|matchedCount/, 'Fit dolap eşleşmesi açıklaması eksik');
assert.match(html, /fit-reference-photo|images\.unsplash\.com/, 'Fit tariflerinde canlı görsel kancası eksik');
assert.match(html, /reference-feedback-v2|sofraFeedbackReferenceV1/, 'referans öneri geri bildirimi eksik');
assert.doesNotMatch(html, /yaklaşık (?:320|390|410|520|540|620|680|760) kcal/, 'doğrulanmamış Fit tarif kalori iddiası var');
assert.match(html, /besin verisi bekleniyor/, 'Fit tarif besin verisi durumu açıkça belirtilmiyor');
assert.match(html, /renderFitNutritionBoundary/, 'Fit besin verisi sınırı uygulanmıyor');
assert.doesNotMatch(html, /420 kcal|610 kcal|Doğrulanmış tarif verisi/, 'statik Fit öğün kalorisi kesin veri gibi kalmış');
assert.match(html, /dashboard\.querySelector\('\.fit-workout-v2'\)\?\.remove/, 'referans Fit ekranı antrenman bölümünü kaldırmıyor');
assert.match(html, /reference-family-v2/, 'Çocuğum için giriş kartı eksik');
assert.match(html, /mode-change.*setHomeModeV34\('sofra'\)/s, 'Fit ekranından Sofra’ya doğrudan dönüş eksik');
assert.doesNotMatch(html, /class="mode-change"[^>]+onclick="openWelcome\(\)"/, 'Fit ekranından çıkış gereksiz ilk giriş penceresini açıyor');
assert.match(html, /childRecipeData/, 'çocuk yaş grubu tarif verisi eksik');
for (const age of ['12–23 ay', '24–35 ay', '36+ ay']) assert.match(html, new RegExp(age.replace(/[+]/g, '\\+')), `çocuk yaş grubu eksik: ${age}`);
assert.match(html, /child-age-note-v2/, 'çocuk yaş filtresi açıklaması eksik');
assert.match(html, /photo-child-v2|childPhotoBase/, 'çocuk tariflerinde canlı görsel kancası eksik');
assert.match(html, /data-child-recipe|Hazırlama notu/, 'çocuk tarif detay önizlemesi eksik');
assert.match(html, /Örnek güncelleme: \$\{m\.updated\}/, 'market örnek tekliflerinde güncelleme zamanı eksik');
assert.match(html, /Kaynak: örnek veri/, 'market tekliflerinin örnek veri sınırı eksik');
assert.match(html, /data-sort="fast"/, 'referans market hız sıralaması eksik');
assert.match(html, /data-sort="single"/, 'referans tek market sıralaması eksik');
assert.match(html, /market-disclosure-v50.*komisyon/s, 'referans market yönlendirme/komisyon açıklaması eksik');
assert.match(html, /Zeytinyağlı patlıcan/, 'referans tarif kataloğunda patlıcan örneği eksik');
assert.match(html, /makarna.*spagetti.*parseQuickInventoryV50/s, 'referans hızlı giriş kanonik alias eşlemesi eksik');
assert.match(html, /sofraPlanDataV51/, 'referans Planım görünüm verisi cihazda saklanmıyor');
assert.match(html, /data-current-plan/, 'referans Planım kaydı Geçmiş görünümüne taşınmıyor');
assert.match(html, /monthMarkup\(value\)/, 'referans Planım kaydı Ay görünümüne taşınmıyor');
assert.match(html, /openPlanEditorV52/, 'referans bugün planını düzenleme akışı eksik');
assert.match(html, /addCustomPlanPartV52|Kendi öğününü ekle/, 'referans kullanıcı kendi öğününü Planım a ekleyemiyor');
assert.match(html, /removePlanPartV52|Bugünün planını kaydet/, 'referans Planım öğün ekleme/çıkarma kaydı eksik');
assert.match(html, /CARSAMBA|restoreTemplateMonday/, 'referans plan kaydı bugün kartına yazılmıyor');
assert.match(html, /syncShoppingV52|planIngredientsV52/, 'referans değişen plan alışveriş adaylarına yansımıyor');
assert.match(html, /openDayPlanEditorV53/, 'referans hafta günleri ayrı ayrı düzenlenemiyor');
assert.match(html, /dayPlans|currentPlans/, 'referans gün bazlı plan verisi eksik');
assert.match(html, /renderMonth\(\)|renderHistory\(\)/, 'referans gün bazlı plan Ay/Geçmiş görünümlerine taşınmıyor');
assert.match(html, /plan-day-picker-v54|selectPlanDayV54/, 'referans hafta görünümü mobilde kompakt gün seçicisi kullanmıyor');
assert.match(html, /cumartesi|pazar/, 'referans hafta sonu günleri Planım seçicisinde eksik');
assert.match(html, /plan-status-v55|sofraPlanMeaningV55/, 'referans plan kartı öneri ile kullanıcı seçimini ayırmıyor');
assert.match(html, /const recipeDetails=/, 'referans tarif detay verisi eksik');
assert.match(html, /<strong>Malzemeler<\/strong>/, 'referans tarif malzeme bölümü eksik');
assert.match(html, /<strong>Hazırlanış<\/strong>/, 'referans tarif hazırlanış bölümü eksik');

const scripts = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)];
for (const [index, match] of scripts.entries()) {
  try { Function(match[1]); } catch (error) { throw new Error(`referans HTML script ${index + 1} parse edilemedi: ${error.message}`); }
}

console.log('SOFRA_REFERENCE_CONTRACT_TEST_OK');
console.log(`fitProfile=ok healthBoundary=ok realRecipePhotos=ok workoutSection=removed scripts=${scripts.length}`);

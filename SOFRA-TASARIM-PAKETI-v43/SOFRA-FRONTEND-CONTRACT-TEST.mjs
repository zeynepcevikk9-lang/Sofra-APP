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
assert.doesNotMatch(html, /\n\+<style>/, 'patch artığı HTML etiketi kaldı');

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
assert.match(html, /health-v50-provider.*Health Connect/s, 'iOS/Android sağlık sağlayıcı seçimi eksik');
assert.match(html, /Health Connect ile bağlan/, 'seçilen sağlık sağlayıcısı kartta görünmüyor');
assert.match(html, /saveHealthDemoV50|liveConnection:false/, 'kısmi sağlık izinleri ve demo sınırı eksik');
assert.match(html, /id="welcomeGate"/, 'ilk giriş yönlendirme alanı eksik');
for (const mode of ['sofra', 'fit', 'tatli']) {
  assert.match(html, new RegExp(`chooseMode\\(['"]${mode}['"]\\)`), `ilk giriş modu eksik: ${mode}`);
}
assert.match(html, /function chooseMode\(mode\)/, 'ilk giriş modu geçiş fonksiyonu eksik');
assert.match(html, /localStorage\.setItem\('sofraMode',mode\)/, 'seçilen modun korunması eksik');
assert.match(html, /get\('demo'\).*onboarding.*openWelcome\(\)/s, 'onboarding QA önizlemesi eksik');
assert.match(html, /choice-icon">🍽️/, 'tek tarif karti anlamli ikon kullanmiyor');
assert.match(html, /choice-icon">📋/, 'menu karti anlamli ikon kullanmiyor');
assert.match(html, /choice-icon">🗄️.*Dolabımdan bul/s, 'dolap karti dolap ikonu kullanmiyor');
assert.match(html, /smart-label">🗄️ Dolabında neler var\?/s, 'ana sayfa dolap ozeti iceriği acik gostermiyor');
assert.match(html, /v60: Fit kisa yolu genel tariflere atlamaz/, 'Fit tarif kisayolu genel tarifler sayfasina sapabilir');
assert.match(html, /openPrivacyV47/, 'profil gizlilik özeti kancası eksik');
assert.match(html, /Gizlilik ve veri sınırları/, 'profil gizlilik özeti metni eksik');
assert.match(html, /Hesapsız kullanım bu cihazla sınırlı/, 'anonim kullanım ve cihaz verisi sınırı açıklanmıyor');
assert.match(html, /fit-goal-recommendations-v47/, 'Fit hedefe göre tarif önerileri eksik');
assert.match(html, /fit-recipe-ranked-v48|sofraFitRankedV48/, 'Fit tarifleri ortak öneri motoruna bağlanmamış');
assert.match(html, /key==='gain'.*fitGoals/s, 'Fit kilo alma hedef filtresi eksik');
assert.match(html, /Daha hafif seçenekler/, 'Fit kilo verme tarif yönlendirmesi eksik');
assert.match(html, /data-theme="gece"|theme-switch|gece/, 'koyu tema kancası eksik');
assert.match(html, /notify-choices-v42|notifyChannelsV42/, 'bildirim kanalı seçimi eksik');
assert.match(html, /sistem bildirim izni açılmaz/, 'bildirim sistem izni öncesi açıklama eksik');
assert.match(html, /Manuel devam et|manuel kullanım/, 'bildirim izin reddi manuel fallback eksik');
assert.match(html, /Dolabıma not al|parseNoteV44/, 'doğal dolap girişi eksik');
assert.match(html, /Öneri motoru/, 'deterministik öneri sınırı kullanıcıya görünür değil');
assert.doesNotMatch(html, /AI destekli/, 'canlı AI bağlı değilken arayüz AI destekli iddiası taşıyor');
assert.match(html, /Örnek güncelleme: \$\{m\.updated\}/, 'market örnek tekliflerinde güncelleme zamanı eksik');
assert.match(html, /Kaynak: örnek veri/, 'market tekliflerinin örnek veri sınırı eksik');
assert.match(html, /data-sort="fast"/, 'market tekliflerinde hız sıralaması eksik');
assert.match(html, /data-sort="single"/, 'market tekliflerinde tek market sıralaması eksik');
assert.match(html, /market-disclosure-v50.*komisyon/s, 'market yönlendirme/komisyon açıklaması eksik');
assert.match(html, /Zeytinyağlı patlıcan/, 'patlıcan tarif örneği eksik');
assert.match(html, /const recipeDetails=/, 'tarif detay verisi eksik');
assert.match(html, /<strong>Malzemeler<\/strong>/, 'tarif malzeme bölümü eksik');
assert.match(html, /<strong>Hazırlanış<\/strong>/, 'tarif hazırlanış bölümü eksik');
assert.doesNotMatch(html, /Malzemeleri ve ölçüleri kontrol et\./, 'bağlı olmayan sahte tarif adımı geri eklenmiş');
assert.match(html, /Tarif adımları henüz bağlı değil\./, 'tarif içeriği bağlantı durumu açıkça belirtilmiyor');
assert.match(html, /function parseQuickInventory\(value\)/, 'miktar ayrıştırma fonksiyonu eksik');
assert.match(html, /makarna.*spagetti.*parseQuickInventoryV50/s, 'hızlı giriş kanonik alias eşlemesi eksik');
assert.match(html, /quantity:`\$\{number\} \$\{unit\}`/, 'hızlı ekle miktarı ayrı saklamıyor');
assert.match(html, /sofraPlanDataV51/, 'Planım görünüm verisi cihazda saklanmıyor');
assert.match(html, /data-current-plan/, 'Planım kaydı Geçmiş görünümüne taşınmıyor');
assert.match(html, /monthMarkup\(value\)/, 'Planım kaydı Ay görünümüne taşınmıyor');
assert.match(html, /openPlanEditorV52/, 'bugün planını düzenleme akışı eksik');
assert.match(html, /addCustomPlanPartV52|Kendi öğününü ekle/, 'kullanıcı kendi öğününü Planım a ekleyemiyor');
assert.match(html, /removePlanPartV52|Bugünün planını kaydet/, 'Planım öğün ekleme/çıkarma kaydı eksik');
assert.match(html, /CARSAMBA|restoreTemplateMonday/, 'plan kaydı ilk dolu güne değil bugün kartına yazılmıyor');
assert.match(html, /syncShoppingV52|planIngredientsV52/, 'değişen plan alışveriş adaylarına yansımıyor');
assert.match(html, /openDayPlanEditorV53/, 'hafta günleri ayrı ayrı düzenlenemiyor');
assert.match(html, /if\(mode==='fit'\)\{go\('fit'\);toast\('Sofra Fit açıldı'\)\}else\{go\('home'\);toast\('Sofra açıldı'\)\}/, 'Fit/Sofra mod değişiminde eski toast kalıyor');
assert.match(html, /dayPlans|currentPlans/, 'gün bazlı plan verisi eksik');
assert.match(html, /renderMonth\(\)|renderHistory\(\)/, 'gün bazlı plan Ay/Geçmiş görünümlerine taşınmıyor');
assert.match(html, /plan-day-picker-v54|selectPlanDayV54/, 'hafta görünümü mobilde kompakt gün seçicisi kullanmıyor');
assert.match(html, /cumartesi|pazar/, 'hafta sonu günleri Planım seçicisinde eksik');
assert.match(html, /plan-status-v55|sofraPlanMeaningV55/, 'plan kartı öneri ile kullanıcı seçimini ayırmıyor');
assert.match(html, /Avokadolu yumurta tost|fitGoals.*gain/, 'Fit kilo alma önerileri frontend kataloğunda eksik');
assert.match(html, /sofraSafetyProfileV46/, 'gıda güvenliği tercihi saklama kancası eksik');
assert.match(html, /Gluten \/ çölyak/, 'çölyak tercihi eksik');
assert.match(html, /çapraz bulaş/, 'çapraz bulaş uyarısı eksik');
assert.match(html, /function readSafetyProfile\(\)/, 'frontend gıda güvenliği profili motor kancası eksik');
assert.match(html, /function assessSafety\(recipe,profile\)/, 'frontend tarif güvenliği değerlendirmesi eksik');
assert.match(html, /allergen_verification_missing/, 'doğrulanmamış alerjen metadata koruması eksik');
assert.match(html, /cross_contamination_unknown/, 'çölyak çapraz bulaş motor koruması eksik');
assert.match(html, /function recipeSafetyAllowedV46\(title\)/, 'tarif listesi güvenlik filtresi eksik');
assert.match(html, /Güvenli tarif doğrulaması bekleniyor/, 'güvenlik filtresi boş durum mesajı eksik');
assert.match(html, /recipe-search-empty-v65/, 'arama boş durumu ayrıştırması eksik');
assert.match(html, /Aramana uygun tarif/, 'eşleşmeyen arama mesajı eksik');
assert.match(html, /Henüz alışveriş listesi yok/, 'boş plan alışveriş durumu eksik');
assert.match(html, /fit-sofra-palette-v64-no-blue/, 'Fit Sofra palette kilidi eksik');
assert.match(html, /plan-editor-compact-v59/, 'Planım düzenleyicisi seçili tarifi alternatiflerde tekrar gösteriyor');
assert.match(html, /new URLSearchParams\(location\.search\).*demo.*DEFAULT_INVENTORY/s, 'demo dolap verisi normal açılışta gerçek kullanıcı verisi gibi yükleniyor');
assert.match(html, /demo==='empty'.*return \[\]/s, 'boş dolap QA senaryosu eksik');
assert.match(html, /Dolabın henüz boş\./, 'boş dolap geri dönüşü eksik');
assert.doesNotMatch(html, /<button[^>]*class="heart"[^>]*>/, 'işlevsiz favori kalbi geri eklenmiş');
assert.match(html, /child-nutrition-v64/, 'cocuk beslenmesi yas akisi eksik');
for (const age of ['12–23 ay', '24–35 ay', '36+ ay']) assert.match(html, new RegExp(age.replace(/[+]/g, '\\+')), `cocuk yas grubu eksik: ${age}`);
assert.match(html, /window\.pickAge=function/, 'cocuk yas secimi tarifleri yenilemiyor');
assert.match(html, /Hazırlama notu/, 'cocuk tarif detay hazirlama notu eksik');

assert.match(html, /id="day-custom-v53"/, 'kullanici ogunu metin alani eksik');
assert.match(html, /day-custom-slot-v58/, 'kullanici ogunu bolum secimi eksik');
assert.match(html, /cleanSavedSlots/, 'kullanici ogunu saklama temizleme kapisi eksik');
assert.match(html, /Kendi yazd.{0,20}malzemeleri.{0,40}do.{0,2}rulanmadan/, 'serbest ogun alisveris siniri eksik');
console.log('SOFRA_FRONTEND_CONTRACT_TEST_OK');
console.log('screens=6 navTabs=5 mobileGuards=ok fallbackImages=ok');

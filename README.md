# Sofra

Sofra, “Bugün ne pişirsem?” sorusunu kullanıcının zamanı, tercihi, Fit hedefi ve evde kayıtlı malzemeleriyle birlikte çözen mobil öncelikli yemek uygulaması prototipidir.

## Güncel durum

- Güncel tıklanabilir prototip: `outputs/sofra-motoru-home-v43.html`
- İki referans görselin daha dolu ama sadeleştirilmiş birleşik tasarım önizlemesi: `outputs/sofra-motoru-reference-v2.html`
- Güncel tasarım paketi: `SOFRA-TASARIM-PAKETI-v43.zip`
- Ürün kararları: `SOFRA-PRODUCT-ROADMAP.md`
- Öneri motoru kuralları: `SOFRA-ALGORITHM-V1.md`
- AI ve geri bildirim sınırı: `SOFRA-AI-V1.md`
- Hesap bağlama sınırı: `SOFRA-AUTH-V1.md` · `SOFRA-AUTH-V1.mjs` · `node SOFRA-AUTH-CONTRACT-TEST.mjs` (PKCE/state/redirect allowlist sınırı; Google/Apple OAuth henüz bağlı değil)
- Bildirim izin sınırı: `SOFRA-NOTIFICATIONS-V1.mjs` · `node SOFRA-NOTIFICATIONS-CONTRACT-TEST.mjs` (iOS, Android ve web planı; sistem izni henüz istenmez)
- Sofra Plus/ödeme sınırı: `SOFRA-BILLING-V1.mjs` · `node SOFRA-BILLING-CONTRACT-TEST.mjs` (ücretsiz plan aktif; checkout ve ödeme bağlı değil)
- Market veri sözleşmesi: `SOFRA-MARKET-V1.md`
- Backend ve veri sözleşmesi: `SOFRA-BACKEND-V1.md`
- Makine tarafından okunabilir API sözleşmesi: `SOFRA-API-V1.openapi.yaml`
- Backend sözleşme smoke testi: `node SOFRA-API-CONTRACT-TEST.mjs`
- Referans HTTP API iskeleti: `node SOFRA-API-SERVER.mjs` · HTTP testi: `node SOFRA-API-SERVER-TEST.mjs`
- API yeniden başlatma kalıcılık testi: `node SOFRA-API-PERSISTENCE-TEST.mjs`
- Geliştirme kalıcılık adapter’ı: `SOFRA-STORE-V1.mjs` · `node SOFRA-STORE-CONTRACT-TEST.mjs`; `SOFRA_STORE_PATH=...` ile referans sunucu yeniden başlatmalar arasında JSON store kullanabilir.
- Bağımsız deterministik öneri motoru: `SOFRA-ALGORITHM-V1.mjs`
- Tarif katalog endpoint’i: `GET /v1/recipes` (Sofra/Fit/Tatlı, arama ve süre filtresi; doğrulanmamış besin verisi `null` kalır)
- Tarif detay endpoint’i: `GET /v1/recipes/:id` (güvenlik/besin doğrulama görünümü ve yapılandırılmış malzeme, porsiyon, hazırlanış alanları; doğrulanmış besin verisi yine `null` kalabilir)
- Fit/sağlık sözleşme testi: `node SOFRA-HEALTH-CONTRACT-TEST.mjs`
- Fit profil/hedef sözleşmesi: `SOFRA-FIT-V1.mjs` · `node SOFRA-FIT-CONTRACT-TEST.mjs` (yaş, boy, kilo, cinsiyet, hareket ve hedef için yaklaşık hedef hesabı)
- Fit palet sözleşmesi: `node SOFRA-FIT-PALETTE-CONTRACT-TEST.mjs` (canonical/reference ekranlarında adaçayı-krem-clay kilidi ve koyu tema kapsamı)
- Kanonik Fit hedef önerileri: kilo verme için daha hafif, kilo alma için daha doyurucu örnek tarif kartları; doğrulanmamış kalori iddiası gösterilmez.
- Referans Fit/tasarım smoke testi: `node SOFRA-REFERENCE-CONTRACT-TEST.mjs` (profil, sağlık sınırı, canlı tarif görselleri ve antrenman bölümünün çıkarılması)
- Market teklif kuralları ve testi: `SOFRA-MARKET-V1.mjs` · `node SOFRA-MARKET-CONTRACT-TEST.mjs`
- Paket ve yayın öncesi otomatik kontrol: `node SOFRA-RELEASE-CHECK.mjs`
- GitHub kalite kapısı: `.github/workflows/sofra-quality.yml` her push ve pull request’te `node SOFRA-CI-SMOKE.mjs` çalıştırır.
- Frontend yapısal smoke testi: `node SOFRA-FRONTEND-CONTRACT-TEST.mjs`
- Tarif besin doğrulama kapısı: `node SOFRA-NUTRITION-CONTRACT-TEST.mjs` (yalnızca izinli ve doğrulanmış kaynaklardan gelen tam porsiyon verisi kaloriyi görünür kılar)
- Tarif güvenliği kapısı: `SOFRA-SAFETY-V1.mjs` · `node SOFRA-SAFETY-CONTRACT-TEST.mjs` (alerjen çatışması, doğrulama ve çölyak için çapraz bulaş kontrolü)
- Veri ve gizlilik sınırı: `SOFRA-PRIVACY-V1.md` · `node SOFRA-PRIVACY-CONTRACT-TEST.mjs` (cihaz verisi, sağlık/market ayrımı ve hukuki politika sınırı)
- Analitik veri sınırı: `SOFRA-ANALYTICS-V1.md` · `node SOFRA-ANALYTICS-CONTRACT-TEST.mjs` (izinli olaylar; sağlık, kişisel ve serbest metin alanları kapalı)

Not: Tek dosyalık HTML önizlemesi internetsiz açılabilsin diye motorun tarayıcı kopyasını içerir; backend sözleşme testi ise ortak `SOFRA-ALGORITHM-V1.mjs` modülünü kullanır. Gerçek uygulamada bu modül sunucu tarafının tek kaynağı olarak korunmalıdır.
- Tasarım devri: `SOFRA-DESIGN-HANDOFF.md`
- Yayın öncesi kontrol: `SOFRA-RELEASE-CHECKLIST.md`
- Sağlık entegrasyonu sözleşmesi: `SOFRA-HEALTH-V1.md`
- Sağlık özet normalizasyonu: `SOFRA-HEALTH-V1.mjs`
- Tarif besin verisi doğrulama kapısı: `SOFRA-NUTRITION-V1.mjs` · `node SOFRA-NUTRITION-CONTRACT-TEST.mjs`
- Doğal cümleyle dolap önizlemesi: `SOFRA-INGEST-V1.mjs` · `POST /v1/pantry/parse-note`

## Prototipi açma

`outputs/sofra-motoru-home-v43.html` dosyasını tarayıcıda açmak yeterlidir. Görsel görsellerin ve etkileşimlerin daha tutarlı çalışması için klasör içinden basit bir yerel HTTP sunucusu ile açılması önerilir.

İki referans ekranın özelliklerini karşılaştırmalı görmek için `outputs/sofra-motoru-reference-v2.html` dosyasını açabilirsin. Bu dosya; ana Sofra ekranında arama, mod seçimi, tek tarif, dolap önceliği, gerçek yemek fotoğraflı kategori kısayolları, haftalık plan, çocuk beslenmesi ve menü akışını; Fit ekranında profil, kalori, makro, öğün, sağlık bağlantısı ve hedefe göre tarif önerilerini gösteren tasarım önizlemesidir. Antrenman bölümü bu akıştan çıkarılmıştır. Kanonik v43 davranışını değiştirmez; tasarım onayı sonrasında seçilen parçalar v43’e taşınacaktır.

Yeni kullanıcı açılışı dolap boş olacak şekilde başlar; yalnızca tasarımda örnek ürünleri görmek için `sofra-motoru-home-v43.html?demo=1` kullanılabilir.
İlk giriş mod seçimini mevcut cihaz verisini bozmadan yeniden görmek için `sofra-motoru-home-v43.html?demo=onboarding` kullanılabilir.

Boş dolap akışını mevcut cihaz verisine dokunmadan test etmek için referans ekranını `sofra-motoru-reference-v2.html?demo=empty` ile açabilirsin; bu senaryoda genel tarif önerisi, boş Dolabım mesajı ve Tarifler geçişi doğrulanır.

Bu dosya şu an gerçek backend’e bağlı değildir. LocalStorage ile örnek kullanıcı tercihlerini ve dolap verisini cihaz üzerinde saklar.

## Ana akışlar

1. İlk girişte **Sofra**, **Sofra Fit** veya **Tatlı keşfi** yönünü seç.
2. Ana sayfada Sofra/Fit modunu değiştir ve önerinin nasıl değiştiğini gör.
3. Tarifler’de arama ve filtreleri dene.
4. Dolabım’da bir ürün ekle; ana sayfa önerisinin ve menünün değişmesini kontrol et.
5. Bir ürünü düzenleyip son kullanma tarihini istersen ekle; tarih girilmediğinde önerileri zorlamadığını kontrol et.
6. Menü’yü Planım’a aktar; alışveriş adaylarını kontrol et ve listeyi kopyala.
7. Planım'a gir; bugün kartında **Düzenle** ile ana yemeği değiştir, bir tarif ekle, kendi öğününü yazıp kaydet. Hafta görünümünde planın sadece bugün kartında olduğunu, Ay ve Geçmiş'te de korunduğunu kontrol et.
8. Hafta görünümünde Pazartesi, Salı veya Perşembe kartındaki **Düzenle** ile o güne farklı tarif ve kendi öğününü kaydet; Ay ve Geçmiş görünümlerinde doğru günün korunduğunu kontrol et.
9. Hafta görünümündeki yatay gün seçicisinden hafta sonunu da seç; boş bir güne plan ekleyip kartın yalnızca seçilen gün için açıldığını kontrol et.
   Planım'da “Sistem önerisi” etiketli bir günü aç; **Özelleştir** ile ana yemeği veya ek öğünü değiştirip kaydet. Kartın “Senin planın” durumuna geçtiğini kontrol et.
10. Alışveriş adaylarını kontrol et, açıkça onayla ve örnek market karşılaştırmasını aç; fiyatların canlı değil, tasarım verisi olduğunu ve her teklifin örnek güncelleme zamanını unutma. Minimum sepeti karşılanmayan teklifler "Tahmini toplam" olarak kalır.
11. Market modalında "En uygun toplam", "En hızlı" ve "Tek markette tamamla" sıralamalarını dene; bu sıralamalar yalnızca örnek teklif verisini yeniden düzenler.
12. Sofra modunda Planım'daki ikinci kartın alışveriş özeti, Sofra Fit modunda ise kalori özeti olduğunu kontrol et.
10. Profil’den açık/koyu tema ve hatırlatıcı tercihini dene; hatırlatıcıyı açmadan önce nedenini açıklayan ekranı gör.
10. Profil’de cihazdaki Sofra verilerini dışa aktarma ve temizleme seçeneklerini incele.
11. Fit’te manuel profil hesabını ve Apple Health izin akışı demosunu incele.
12. Profil’den gıda güvenliği tercihlerini aç; süt, yumurta veya gluten/çölyak gibi kısıtları seç ve çapraz bulaş uyarısını incele.
13. Ana sayfadaki öneri kartında “İşe yaradı” veya “Başka fikir” seç; geri bildirim cihazda tutulur ve sonraki öneri sıralamasına sınırlı bir kişiselleştirme sinyali olarak yansır.
14. Dolap için “6 yumurta aldım, peynir azaldı” gibi bir notu parser endpoint’ine gönder; çıkan ürün/miktar/durum önizlemesini kullanıcı onaylamadan kaydetme.

Koyu tema; ana sayfa, Tarifler, Dolabım, Planım, Fit, profil ve modal akışlarında ayrı ayrı kontrol edilmiştir. Tema değişimi bu prototipte yalnızca cihazdaki görünümü etkiler.

Bağlantı kesilirse prototip, cihazdaki dolap/plan verilerinin kullanılmaya devam edeceğini ve canlı market gibi bağlantı isteyen özelliklerin bekleyeceğini üstteki durum bandıyla belirtir.

## Gerçek entegrasyon bekleyenler

- Backend ve kullanıcı hesabı
- Google/Apple oturum açma
- Gerçek AI malzeme çözümleme ve fiş OCR
- Apple HealthKit / Android Health Connect
- Market API’leri, canlı stok ve fiyatlar
- Bildirim cihaz izinleri
- Tarif içeriklerinde alerjen ve çapraz bulaş metadata’sı
- Ödeme ve Sofra Plus

Gerçek entegrasyonlar eklenmeden önce prototipteki “örnek”, “demo” ve “yakında” etiketleri kaldırılmamalıdır.

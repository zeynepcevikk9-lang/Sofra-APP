# Sofra

Sofra, “Bugün ne pişirsem?” sorusunu kullanıcının zamanı, tercihi, Fit hedefi ve evde kayıtlı malzemeleriyle birlikte çözen mobil öncelikli yemek uygulaması prototipidir.

## Güncel durum

- Güncel tıklanabilir prototip: `outputs/sofra-motoru-home-v43.html`
- İki referans görselin daha dolu ama sadeleştirilmiş birleşik tasarım önizlemesi: `outputs/sofra-motoru-reference-v2.html`
- Güncel tasarım paketi: `SOFRA-TASARIM-PAKETI-v43.zip`
- Ürün kararları: `SOFRA-PRODUCT-ROADMAP.md`
- Öneri motoru kuralları: `SOFRA-ALGORITHM-V1.md`
- AI ve geri bildirim sınırı: `SOFRA-AI-V1.md`
- Market veri sözleşmesi: `SOFRA-MARKET-V1.md`
- Backend ve veri sözleşmesi: `SOFRA-BACKEND-V1.md`
- Makine tarafından okunabilir API sözleşmesi: `SOFRA-API-V1.openapi.yaml`
- Backend sözleşme smoke testi: `node SOFRA-API-CONTRACT-TEST.mjs`
- Referans HTTP API iskeleti: `node SOFRA-API-SERVER.mjs` · HTTP testi: `node SOFRA-API-SERVER-TEST.mjs`
- Bağımsız deterministik öneri motoru: `SOFRA-ALGORITHM-V1.mjs`
- Fit/sağlık sözleşme testi: `node SOFRA-HEALTH-CONTRACT-TEST.mjs`
- Market teklif kuralları ve testi: `SOFRA-MARKET-V1.mjs` · `node SOFRA-MARKET-CONTRACT-TEST.mjs`
- Paket ve yayın öncesi otomatik kontrol: `node SOFRA-RELEASE-CHECK.mjs`
- Frontend yapısal smoke testi: `node SOFRA-FRONTEND-CONTRACT-TEST.mjs`
- Tarif besin doğrulama kapısı: `node SOFRA-NUTRITION-CONTRACT-TEST.mjs` (yalnızca izinli ve doğrulanmış kaynaklardan gelen tam porsiyon verisi kaloriyi görünür kılar)

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

Bu dosya şu an gerçek backend’e bağlı değildir. LocalStorage ile örnek kullanıcı tercihlerini ve dolap verisini cihaz üzerinde saklar.

## Ana akışlar

1. İlk girişte **Sofra**, **Sofra Fit** veya **Tatlı keşfi** yönünü seç.
2. Ana sayfada Sofra/Fit modunu değiştir ve önerinin nasıl değiştiğini gör.
3. Tarifler’de arama ve filtreleri dene.
4. Dolabım’da bir ürün ekle; ana sayfa önerisinin ve menünün değişmesini kontrol et.
5. Bir ürünü düzenleyip son kullanma tarihini istersen ekle; tarih girilmediğinde önerileri zorlamadığını kontrol et.
6. Menü’yü Planım’a aktar; alışveriş adaylarını kontrol et ve listeyi kopyala.
7. Alışveriş adaylarını kontrol et, açıkça onayla ve örnek market karşılaştırmasını aç; fiyatların canlı değil, tasarım verisi olduğunu unutma.
8. Sofra modunda Planım’daki ikinci kartın alışveriş özeti, Sofra Fit modunda ise kalori özeti olduğunu kontrol et.
9. Profil’den açık/koyu tema ve hatırlatıcı tercihini dene; hatırlatıcıyı açmadan önce nedenini açıklayan ekranı gör.
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

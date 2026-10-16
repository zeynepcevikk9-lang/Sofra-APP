# Sofra — Yayın Öncesi Kontrol Listesi

Bu liste, prototipten gerçek ürüne geçmeden önce tamamlanması gereken teknik, ürün ve güven kontrollerini toplar.

## 1. Ürün akışı

- [x] İlk girişte Sofra / Sofra Fit / Tatlı seçimi anlaşılır; üç seçim de ayrı akışa bağlanır ve sözleşme testiyle korunur.
- [x] Kullanıcı Dolap’a ürün eklemeden de tarif keşfedebilir.
- [x] Sofra ↔ Sofra Fit geçişi her iki yönde çalışır.
- [x] Tatlı önerisi ana yemek akışını zorunlu olarak etkilemez.
- [x] Menü birden fazla bölüm içerebilir ve Planım’a aktarılır.
- [x] Planım hafta, ay ve geçmiş görünümünde aynı veriyi korur; yeni menü kaydı cihazda görünüm değişimleri ve yenileme sonrasında korunur.
- [x] Planım bugün kartında hazır menüyü değiştirmeye, başka tarif veya kullanıcının kendi öğününü ekleyip kaldırmaya izin verir; plan yanlış güne kopyalanmaz.
- [x] Hafta görünümündeki her planlı gün ayrı ayrı düzenlenebilir; gün bazlı kayıtlar Ay ve Geçmiş görünümlerine taşınır.
- [x] Hafta görünümü mobilde günleri yatay kompakt seçiciyle gösterir; yedi gün desteklenir ve yalnızca seçilen günün kartı açılır.
- [x] Planım kartı sistem önerisini, boş günü ve kullanıcının kaydettiği planı ayrı durum etiketleriyle gösterir; öneri özelleştirilebilir.
- [x] Sofra Fit hedefleri ortak katalogla hizalıdır; kilo alma seçimi boş kalmaz ve gerçek fotoğraflı öneri gösterir.
- [x] Fit sağlık kartı iOS Apple HealthKit ve Android Health Connect seçimini doğru başlık ve beklenen izin metniyle yansıtır.
- [x] Alışveriş adayları kullanıcı eklemediği ürünü kesin eksik saymaz.
- [x] Alışveriş adayları tarifte gereken miktarı ve dolapta kayıtlı miktarı ayrı alanlarda taşır; belirsiz miktar uydurulmaz.

## 2. Veri ve algoritma

- [x] Tarif malzemeleri kanonik adlarla tutulur; doğal not ve API dolap kayıtları alias’ları tek ürün adına indirger.
- [x] Birim ve miktar eşleştirmesi temel kg/g/adet/litre/paket/kutu/demet alanlarında yapılır; belirsiz metin kullanıcı onayına bırakılır.
- [x] Dolap durumu `var`, `azaldı`, `bitti` ayrımını korur.
- [x] Son kullanma tarihi opsiyoneldir; girilmediğinde kullanıcı cezalandırılmaz.
- [x] Boş dolapta genel öneri üretilebilir.
- [x] Fit kalorisi yalnızca doğrulanmış besin verisinde kesin ifade olarak gösterilir.
- [x] Fit tarif kartları hedefe göre (dengeli/kilo verme/kilo alma) sıralanır; dolap eşleşmesi ve gerçek fotoğraf gösterilir, antrenman bölümü kapsam dışıdır.
- [x] Öneri skoru açıklanabilir sinyallerden oluşur.

## 3. Hesap, sağlık ve izinler

- [ ] Google ve Apple oturum akışları backend ile tamamlanır.
- [x] Sağlayıcı bağlantısı öncesi OAuth sınırı PKCE/state/redirect allowlist ile tanımlıdır; token değişimi sunucu tarafına ayrılmıştır.
- [x] Oturum açmadan kullanım sınırları ve cihaz verisi davranışı açıklanır; anonim kullanım cihazla sınırlıdır, senkronizasyon için hesap gerekir ve prototipte kota uygulanmaz.
- [ ] Apple HealthKit izinleri veri türü bazında istenir.
- [ ] Android Health Connect izinleri ayrı ve eşdeğer kapsamda uygulanır.
- [ ] Sağlık verisi marketlere, markalara veya reklam ortaklarına aktarılmaz.
- [x] Bildirim izni açıklaması sistem izninden önce gösterilir; prototipte sistem istemi açılmaz ve üç kanal ayrı seçilebilir.
- [x] İzin reddedildiğinde manuel kullanım devam eder; bildirim tercihi kapalı olsa da Planım ve Fit akışları kullanılabilir.
- [x] Profilde kullanıcı verisini JSON olarak dışa aktarma ve yalnızca Sofra verilerini onay ekranından temizleme yolu bulunur; başka uygulama verilerine dokunulmaz.

## 4. Market ve gelir

- [x] Kullanıcı alışveriş listesini markete göndermeden önce onaylar.
- [x] Fiyat, stok ve teslimat zamanı güncellenme tarihiyle birlikte gösterilir.
- [x] Minimum sepet, teslimat ücreti ve kampanya toplam hesaba katılır.
- [x] Koşullar eşit değilse “en ucuz” iddiası kullanılmaz.
- [x] Sponsorlu ürün/tarif açıkça etiketlenir.
- [x] Sağlık ve Fit verisi sponsorlu sıralamayı etkilemez.
- [x] Prototipte market komisyonu ve yönlendirme dili kullanıcıya açıklanır; gerçek partner bağlantısı açılmadan canlı gelir iddiası gösterilmez.

## 5. Teknik kalite

- [ ] Gerçek cihazlarda iOS ve Android testleri tamamlanır.
- [ ] En küçük desteklenen mobil genişlikte yatay taşma yoktur.
- [ ] Klavye, ekran okuyucu ve kontrast kontrolleri yapılır.
- [x] Kanonik ve referans HTML için klavye odak stili, reduced-motion, etiketli bölgeler, modal ve form etiketlerini koruyan otomatik erişilebilirlik smoke testi çalışır.
- [x] Çevrimdışı/bozuk ağ durumunda anlamlı hata mesajı vardır.
- [x] Görseller yüklenemediğinde fallback içerik görünür.
- [x] Console error/warning ve kritik performans sorunları temizlenir.
- [x] Analitik olayları kişisel sağlık verisi içermeden tanımlanır; hassas alanlar sözleşme testiyle engellenir, gerçek sağlayıcı henüz bağlı değildir.
- [ ] Gizlilik politikası, kullanım koşulları ve çerez/izin metinleri hazırdır; prototipteki sınırlar `SOFRA-PRIVACY-V1.md` ile görünür.
- [ ] Hata izleme, yedekleme ve geri alma planı vardır.
- [x] GitHub Actions kalite kapısı sözleşme ve release smoke testlerini her push/pull request’te çalıştırır.

## 6. Prototipten çıkış kriteri

Prototipteki “demo”, “örnek” veya “yakında” etiketleri ancak ilgili gerçek entegrasyon; test, gizlilik incelemesi ve kullanıcıya açık hata davranışıyla birlikte tamamlandığında kaldırılabilir.
# Otomatik kontrol

Paket ve prototip için hızlı release kontrolü:

```bash
node SOFRA-RELEASE-CHECK.mjs
```

Başarılı sonuç `SOFRA_RELEASE_CHECK_OK` olmalıdır. Bu kontrol; güncel HTML/ZIP dosyalarını, paket manifestini, eski sürüm temizliğini, inline script sözdizimini, frontend yapısal smoke testini ve API/Health/Market sözleşme testlerini birlikte doğrular.


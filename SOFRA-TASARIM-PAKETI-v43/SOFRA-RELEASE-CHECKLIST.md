# Sofra — Yayın Öncesi Kontrol Listesi

Bu liste, prototipten gerçek ürüne geçmeden önce tamamlanması gereken teknik, ürün ve güven kontrollerini toplar.

## 1. Ürün akışı

- [x] İlk girişte Sofra / Sofra Fit / Tatlı seçimi anlaşılır; üç seçim de ayrı akışa bağlanır ve sözleşme testiyle korunur.
- [ ] Kullanıcı Dolap’a ürün eklemeden de tarif keşfedebilir.
- [x] Sofra ↔ Sofra Fit geçişi her iki yönde çalışır.
- [ ] Tatlı önerisi ana yemek akışını zorunlu olarak etkilemez.
- [ ] Menü birden fazla bölüm içerebilir ve Planım’a aktarılır.
- [ ] Planım hafta, ay ve geçmiş görünümünde aynı veriyi korur.
- [ ] Alışveriş adayları kullanıcı eklemediği ürünü kesin eksik saymaz.

## 2. Veri ve algoritma

- [ ] Tarif malzemeleri kanonik adlarla tutulur.
- [ ] Birim ve miktar eşleştirmesi yapılır.
- [ ] Dolap durumu `var`, `azaldı`, `bitti` ayrımını korur.
- [ ] Son kullanma tarihi opsiyoneldir; girilmediğinde kullanıcı cezalandırılmaz.
- [ ] Boş dolapta genel öneri üretilebilir.
- [ ] Fit kalorisi yalnızca doğrulanmış besin verisinde kesin ifade olarak gösterilir.
- [ ] Öneri skoru açıklanabilir sinyallerden oluşur.

## 3. Hesap, sağlık ve izinler

- [ ] Google ve Apple oturum akışları backend ile tamamlanır.
- [ ] Oturum açmadan kullanım sınırları ve cihaz verisi davranışı açıklanır.
- [ ] Apple HealthKit izinleri veri türü bazında istenir.
- [ ] Android Health Connect izinleri ayrı ve eşdeğer kapsamda uygulanır.
- [ ] Sağlık verisi marketlere, markalara veya reklam ortaklarına aktarılmaz.
- [ ] Bildirim izni açıklaması sistem izninden önce gösterilir.
- [ ] İzin reddedildiğinde manuel kullanım devam eder.
- [ ] Kullanıcı verisini silme ve dışa aktarma yolu bulunur.

## 4. Market ve gelir

- [ ] Kullanıcı alışveriş listesini markete göndermeden önce onaylar.
- [ ] Fiyat, stok ve teslimat zamanı güncellenme tarihiyle birlikte gösterilir.
- [ ] Minimum sepet, teslimat ücreti ve kampanya toplam hesaba katılır.
- [ ] Koşullar eşit değilse “en ucuz” iddiası kullanılmaz.
- [ ] Sponsorlu ürün/tarif açıkça etiketlenir.
- [ ] Sağlık ve Fit verisi sponsorlu sıralamayı etkilemez.
- [ ] Market komisyonu ve yönlendirme dili kullanıcıya açıklanır.

## 5. Teknik kalite

- [ ] Gerçek cihazlarda iOS ve Android testleri tamamlanır.
- [ ] En küçük desteklenen mobil genişlikte yatay taşma yoktur.
- [ ] Klavye, ekran okuyucu ve kontrast kontrolleri yapılır.
- [ ] Çevrimdışı/bozuk ağ durumunda anlamlı hata mesajı vardır.
- [ ] Görseller yüklenemediğinde fallback içerik görünür.
- [ ] Console error/warning ve kritik performans sorunları temizlenir.
- [ ] Analitik olayları kişisel sağlık verisi içermeden tanımlanır.
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


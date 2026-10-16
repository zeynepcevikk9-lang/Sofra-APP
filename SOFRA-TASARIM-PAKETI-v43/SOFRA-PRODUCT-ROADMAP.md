# Sofra — Ürün Kararları ve Yol Haritası

> Bu dosya Sofra’nın ürün kararlarını, algoritma mantığını ve ileride geliştirilecek özellikleri tek yerde tutar. Yeni bir özellik eklenmeden önce buradaki ilkelerle çelişip çelişmediği kontrol edilir.

Son güncelleme: 16 Ekim 2026
Mevcut prototip: `outputs/sofra-motoru-home-v43.html`

## 1. Ürün fikri

Sofra yalnızca tarif gösteren bir uygulama olmayacak. Kullanıcının:

- ne yapmak istediğini,
- evinde hangi malzemelerin bulunduğunu,
- ne kadar zamanı olduğunu,
- normal yemek mi, Fit mi, tatlı mı istediğini,
- geçmişte neleri sevdiğini

birlikte değerlendirip uygulanabilir bir sofra kuracak.

Temel vaat:

> “Bugün ne pişirsem?” sorusuna yalnızca bir tarif değil, kullanıcının hayatına uyan bir cevap vermek.

## 2. Uygulama modları

İlk girişte kullanıcı üç karttan birini seçer:

### Sofra

Günlük yemek, menü oluşturma, dolaptaki malzemeleri kullanma ve planlama deneyimi.

### Sofra Fit

Kalori, makro, hedef ve iOS sürümünden itibaren Apple Health; sonraki Android aşamasında Health Connect verileriyle kişiselleşen bölüm.

### Tatlı keşfi

Klasik tatlılar ve daha dengeli/Fit yorumları. Tatlı, ana yemeğe zorla bağlanmayacak; ayrı ve kolay erişilebilir bir keşif alanı olacak.

Kullanıcı daha sonra Fit ve normal Sofra arasında rahatça geçebilmeli. Mod seçimi uygulamayı kilitlememeli.

Şimdilik aktif olmayan fikirler:

- influencer içerik akışı,
- şef profilleri,
- sosyal akış.

Bunlar uygulamanın temel yemek akışı oturduktan sonra ayrı bir büyüme katmanı olarak değerlendirilecek. Ancak marka ve influencer iş birlikleri, sosyal akıştan ayrı bir gelir/partnerlik başlığı olarak şimdiden ürün planında yer alır.

## 3. Sofra algoritmasının ana mantığı

### Girdiler

- Kullanıcının seçtiği mod
- Dolap kayıtları
- Tarif malzemeleri ve miktarları
- Hazırlama süresi
- Kişi/porsiyon sayısı
- Kullanıcının amacı
- Kullanıcının geçmiş seçimleri
- Mevsim ve mutfak tercihi
- Fit tarafında profil ve izin verilirse sağlık/aktivite verileri

### Dolap kuralları

- Kullanıcı bütün dolabını doldurmak zorunda değil.
- Kullanıcının eklemediği ürün otomatik olarak “yok” kabul edilmez.
- Bilinmeyen miktar, bilinmeyen olarak kalır; sistem kafasından miktar uydurmaz.
- Plan alışveriş adayında tarifin gereken miktarı ile dolapta kayıtlı miktar ayrı gösterilir; birden fazla tarifte aynı ürün varsa aynı birim toplanır, farklı ölçüler korunur.
- Son kullanma tarihi zorunlu değildir.
- Tarih girilmişse ürün önceliklendirmesinde kullanılır.
- Her ürünün tarihi ayrı olabilir; tek bir genel tarih varsayılmaz.
- “Azaldı” ve “Bitti” durumları öneri sıralamasını etkiler.
- Kullanıcı doğal cümleyle ürün ekleyebilir; backend’de yalnızca bilinen ürün/miktar/durum için deterministik önizleme (`POST /v1/pantry/parse-note`) vardır. Kullanıcı onayı olmadan kayıt yapılmaz; gerçek model destekli AI çözümleme sonraki aşamadır.

### Öneri sıralaması

1. Kullanıcının seçtiği mod ve amacı
2. Dolapta bulunan ürünlerle uyum
3. Azalan veya tarihi girilmiş ve yaklaşan ürünler
4. Eksik ürün sayısının azlığı
5. Hazırlama süresi
6. Porsiyon ve kişi sayısı
7. Mevsim, mutfak ve kişisel tercihler
8. Daha önceki seçimlerden öğrenilen davranış

### Çıktı

Sistem tek bir yemek önermekle kalmamalı:

- tek tarif,
- ana yemek menüsü,
- isteğe bağlı çorba/salata/yanına/tatlı,
- Planım’a ekleme,
- eksik malzeme listesi,
- gerekirse market sepeti

üretebilmeli.

## 4. Menü ve Planım kararı

“Planım” tek bir yemek kartı gibi görünmemeli. Bir plan:

- günlük birden fazla bölüm,
- haftalık ve aylık görünüm,
- geçmiş sofralar,
- boş günler,
- alışveriş listesi

içerebilmeli.

### v1.13 - Bugünü kullanıcı kurar

Hazır öneri yalnızca başlangıç noktası olarak kalır. Kullanıcı Planım ekranında bugünün ana yemeğini değiştirebilir, ek tarif ekleyebilir, kendi yazdığı bir öğünü ekleyebilir veya öğünü kaldırabilir. Kaydedilen plan tek bir güne yazılır; hafta, ay, geçmiş ve yenileme sonrasında aynı veri görülür. Planın alışveriş listesi, tarif malzemesi bağlı olmayan kullanıcı yazılarında malzeme uydurmaz; belirsiz kısımlar ileride onay akışı ile çözülecek.

Bu karar dört günlük görünüm için de geçerlidir: hafta kartları yalnızca örnek metin değildir; gün seçimiyle düzenlenir ve `dayPlans` alanında ayrı saklanır. Böylece bir günün değişmesi diğer günün menüsünü ezmez.

Hafta görünümü mobilde yedi günlük yatay seçiciye indirgenir; aynı anda yalnızca seçilen günün kartı açılır. Bu, planı işlevsel tutarken kullanıcının her günü görmek için uzun bir kart listesi kaydırmasını engeller.

Plan kartları artık “Sistem önerisi”, “Senin planın” ve “Boş gün” durumlarını açıkça ayırır. Kullanıcı öneriyi özelleştirip kaydettiğinde kartın durumu değişir; böylece uygulama otomatik öneriyi kullanıcının kesin kararı gibi göstermez.

Fit hedef kataloğu frontend ve ortak öneri motoru arasında hizalanır; kilo alma seçimi boş kalmaz, avokadolu yumurta tost gibi hedefe uygun gerçek fotoğraflı öneriler de aynı tarif detay akışına girer.

Sağlık bağlantı kartı seçilen platformu da doğru yansıtır: iOS için Apple Health, Android için Health Connect; kısmi izin ve manuel devam sınırı korunur.

Normal Sofra görünümünde Fit özeti ve kalori kartı gösterilmeyecek. Kalori ve makro özeti yalnızca Sofra Fit bölümünde aktif olacak.

Plan API’si de bu kararı korur: kayıtlar geçerli tarih, porsiyon ve katalog tarifleriyle oluşturulur; hatalı veya tekrarlı tarif kimlikleri kabul edilmez.

## 5. Sofra Fit ve sağlık entegrasyonu

Apple Health entegrasyonu iOS sürümüyle birlikte planlanacak; sonraki Android aşamasında Health Connect eklenecek.

- iOS ilk hedef: Apple HealthKit
- Android sonraki hedef: Health Connect

Okunabilecek veriler izin kapsamına göre:

- aktif kalori,
- egzersiz,
- adım,
- kilo,
- bazal metabolizma gibi veriler.

Entegrasyon tamamen isteğe bağlı olacak. Kullanıcı bağlamazsa manuel profil ile Fit kullanılmaya devam edecek.

Kurallar:

- Sağlık izni açık ve anlaşılır istenecek.
- Marketlere sağlık, kilo veya Fit hedefi aktarılmayacak.
- Harcanan kaloriyi otomatik olarak “o kadar daha fazla ye” şeklinde yorumlamayacağız.
- Kalori bilgisi tıbbi tavsiye gibi sunulmayacak.
- Doğrulanmamış tariflerde kesin kalori iddiası yapılmayacak.

## 6. Market, marka ve gelir modeli

### İlk aşama

- Eksik ürünleri alışveriş listesine çevirme
- Listeyi kopyalama
- Market seçmeden dış uygulamaya yönlendirme

### İkinci aşama

- Market seçimi
- Tahmini toplam sepet tutarı
- Teslimat süresi ve teslimat ücreti
- Minimum sepet tutarı
- Stokta olmayan ürünler için alternatif

### Üçüncü aşama

- Hazır sepet/API entegrasyonu
- Sipariş yönlendirme komisyonu
- Kupon ve kampanya entegrasyonu
- Market bazlı fiyat karşılaştırması

Fiyat karşılaştırma kartı örneği:

```text
Eksik 6 ürün

Migros       Tahmini 348 TL · 35 dk
CarrefourSA  Tahmini 331 TL · Yarın teslim
Getir        Tahmini 372 TL · 25 dk

[En uygun sepeti aç] [En hızlı teslimatı seç]
```

“En ucuz” ifadesi ancak ürün miktarı, teslimat ücreti, kampanya ve minimum sepet koşulları birlikte biliniyorsa kullanılmalı. Aksi durumda “Tahmini toplam” denmeli.

Gelir modelleri:

- tamamlanan siparişten komisyon,
- market yönlendirme komisyonu,
- açıkça etiketlenmiş sponsorlu ürünler,
- marketlerin kampanya/öne çıkarma paketi,
- Sofra Plus içinde kupon ve özel sepet avantajları.

Sponsorlu ürünler doğal öneriyi bozmamalı. Kullanıcıya “Sponsorlu” veya “İş birliği” olduğu açıkça gösterilmeli.

### Marka ve influencer iş birlikleri

Örnek senaryo:

> Filiz Makarna ile hazırlanmış, markalı ama gerçekten işe yarayan bir makarna tarifi.

Bu modelde:

- marka ürünü tarif içinde kullanılabilir,
- influencer/şef tarifi anlatabilir,
- marka özel tarif serisi veya haftalık menü destekleyebilir,
- ilgili ürün market sepetine eklenebilir,
- kampanya veya kupon sunulabilir.

Kurallar:

- İçerik “İş birliği” veya “Sponsorlu” olarak açıkça etiketlenir.
- Marka desteği, tarifin kullanıcı için mantıklı olmasını engellemez.
- Kullanıcıya tek markayı zorunlu tutmak yerine mümkünse alternatif ürün gösterilir.
- Influencer/şef içeriği uygulamanın ana ekranını kalabalıklaştırmaz; ilgili tarif, keşif veya kampanya alanında görünür.
- Marka verisi ile kullanıcının sağlık ve Fit verisi birbirinden ayrılır.

## 7. Tasarım ilkeleri

- Mobil öncelikli, uygulama hissi veren dar panel.
- Masaüstünde web sitesi gibi tam genişliğe yayılmayan yapı.
- Warm Editorial / sıcak, sakin, güven veren görsel dil.
- Krem: `#FAF8F4`
- Sage: `#607B65`
- Terracotta: `#D48C75`
- Koyu metin: `#282E2A`
- Gerçek yemek görselleri.
- Gereksiz tekrarlar kaldırılmalı: Dolabım sekmesi varken ana sayfada büyük bir “Dolabında neler var?” paneli zorunlu olmamalı.
- Kartlar içerik kadar yüksek olmalı; kullanıcıyı gereksiz yere iki tur kaydırmaya zorlamamalı.
- Fontlar okunaklı ama aşırı büyük olmamalı.
- Kartlar eğimli, yamuk veya sağa kaymış görünmemeli.
- Turuncu/terracotta vurgu gerektiğinde ana aksiyon ve tek tarif kartlarında kullanılmalı.
- Alt navigasyon sabit ve sade kalmalı.

## 8. Hesap, ayarlar ve ileride eklenecekler

İleride değerlendirilecek özellikler:

- Google hesabıyla giriş
- Apple hesabıyla giriş
- Koyu/açık tema
- Bildirim izinleri
- Hatırlatıcılar
- Favoriler ve kaydetme
- Premium ödeme sistemi
- Sofra Plus
- Sosyal/influencer/şef içerikleri
- Marka ve influencer tarif iş birlikleri
- Sponsorlu tarif serileri ve ürün kampanyaları
- Ev halkı veya aile profilleri
- Çoklu kullanıcı ve ortak plan

Bu özellikler ana yemek/menü deneyimini kalabalıklaştırmamalı. Önce temel sofra akışı tamamlanacak.

## 9. Mevcut prototip durumu

`sofra-motoru-home-v43.html` içinde bulunanlar:

- Sofra / Sofra Fit / Tatlı ilk giriş seçimi
- Ana sayfada Sofra / Sofra Fit için işlevsel mod değiştirici
- Tarifler ekranında gerçek arama ve filtre sonuçları
- Dolabımdan, Mevsimlik ve Tatlı filtrelerinin gerçek sonuç üretmesi
- Fit’ten normal Sofra’ya dönüş
- Dolapta hızlı ürün ekleme
- Domates gibi malzemelerde doğru emoji eşleşmesi
- Dolap verisinin yenilemede korunması
- Dinamik dolap sayacı
- Dolaptaki ürünlere göre ana sayfa ve menü önerisi
- Tarif arama
- Tatlı filtresi
- Menüye çorba, salata/meze, yanına ve tatlı ekleme
- Menüden Planım’a aktarım
- Normal Planım’da Fit kalori özetinin gizlenmesi
- Planım’daki ikinci özet kartının moda göre değişmesi: normal Sofra’da alışveriş listesi, Sofra Fit’te kalori özeti
- Fit profilindeki yaklaşık kalori hesabının Sofra Fit Planım özetine yansıması
- Fit profil formu
- Mobil yatay taşma kontrolü
- Ana sayfa mod değiştiricide seçimin korunması ve Fit’e geçiş
- Dolap ürününü düzenleme, durum/miktar güncelleme ve silme akışı
- Planım’da Hafta / Ay / Geçmiş görünümlerinin çalışması
- Planım dönem oklarının haftalık aralık değiştirmesi
- Menüden Planım’a aktarılan yemeğin görünüm değiştirince korunması
- Öneri motoru v1: dolap eşleşmesi, azalan ürün önceliği, süre ve Sofra/Fit/Tatlı modu puanlaması
- Öneri geri bildirimi v1: anonim “İşe yaradı / Başka fikir” sinyalinin tarif bazında sınırlı ve açıklanabilir `learning_boost` puanına dönüşmesi
- Referans ana sayfasında öneri geri bildirimi görünür ve öneri kartının hemen altında; tıklama sonrası kullanıcıya durum mesajı veriyor ve `sofraFeedbackV1` sinyalini besliyor.
- Fit profilinde yaş, boy, kilo, hedef ve günlük hareket katsayısıyla yaklaşık kalori/protein hesabı
- Fit hedefi backend öneri sıralamasına bağlandı: dengede kalma, kilo verme ve kilo alma hedefleri `fit_goal_boost` ile açıklanabilir biçimde ayrılıyor; bu henüz doğrulanmış kalori iddiası değildir
- Fit profilinin yenileme sonrası korunması ve eksik profil doğrulaması
- Apple Health için isteğe bağlı izin açıklaması ve iOS HealthKit bağlantısına hazırlık demo akışı
- Planım’da menülerden alışverişe aday ürün listesi üretme
- Dolapta kayıtlı ürünleri alışveriş adaylarından düşürme; kullanıcı eklemediği ürünleri kesin eksik saymama
- Alışveriş listesini kopyalama ve Dolabım’a geri dönüp kontrol etme akışı
- Market/fiyat karşılaştırması için ilk veri sözleşmesi: `SOFRA-MARKET-V1.md`
- Seçilen ana yemeğin malzemelerini alışveriş adaylarına katma
- Menü değişince alışveriş listesini seçilen menüye göre yeniden hesaplama
- Profil’de cihazda saklanan açık/koyu tema tercihi
- Profil’de cihazda saklanan hatırlatıcı tercihi
- Profil’de cihazda tutulan Sofra verilerini JSON olarak dışa aktarma ve yalnızca Sofra verilerini temizleme demosu
- Google ve Apple girişleri için gerçek entegrasyon olmadığını belirten pasif hesap iskeleti
- Liste onayından sonraki market karşılaştırması için canlı olmayan örnek fiyat/teslimat modalı
- Market karşılaştırmasından önce kullanıcıya alışveriş adaylarını gösteren açık liste onayı adımı
- Tahmini toplam, teslimat ücreti ve minimum sepet koşulunu ayrı gösterme
- Proje hızlı başlangıç dokümanı: `README.md`
- Yayın öncesi ürün/teknik/gizlilik kontrol listesi: `SOFRA-RELEASE-CHECKLIST.md`
- Apple HealthKit / Health Connect veri ve izin sözleşmesi: `SOFRA-HEALTH-V1.md`
- AI çözümleme, açıklanabilir öneri ve geri bildirim sözleşmesi: `SOFRA-AI-V1.md`
- Backend ve veri sözleşmesi: `SOFRA-BACKEND-V1.md`
- Makine tarafından okunabilir API sözleşmesi: `SOFRA-API-V1.openapi.yaml`
- API sözleşme smoke testi: `SOFRA-API-CONTRACT-TEST.mjs` (`SOFRA_API_CONTRACT_TEST_OK`).
- Backend’e taşınabilir ortak deterministik öneri motoru: `SOFRA-ALGORITHM-V1.mjs`; smoke test bu modülü doğrudan kullanır.
- Bağımlılıksız referans HTTP API ve uçtan uca testi: `SOFRA-API-SERVER.mjs` / `SOFRA-API-SERVER-TEST.mjs` (`SOFRA_API_SERVER_TEST_OK`).
- Fit/Apple Health sözleşme testi: `SOFRA-HEALTH-CONTRACT-TEST.mjs` (`SOFRA_HEALTH_CONTRACT_TEST_OK`); kısmi izin ve market veri sınırı doğrulandı.
- Market teklif modülü ve sözleşme testi: `SOFRA-MARKET-V1.mjs` / `SOFRA-MARKET-CONTRACT-TEST.mjs` (`SOFRA_MARKET_CONTRACT_TEST_OK`); minimum sepet, eski teklif, tahmini toplam ve sponsor etiketi doğrulandı.
- Referans API veri bütünlüğü: korumalı dolap alanlarının PATCH ile değiştirilememesi, geçersiz stok/mod/tarih, plan tarif kimliği, seçili dolap kimliği ve tanımsız öneri alanlarının 422 ile reddedilmesi `SOFRA-API-SERVER-TEST.mjs` içinde doğrulandı.
- Market istek bütünlüğü: kullanıcı onayı olmadan 409, boş veya tekrarlı aday listesiyle 422 dönülmesi `SOFRA-MARKET-CONTRACT-TEST.mjs` ve `SOFRA-API-SERVER-TEST.mjs` içinde doğrulandı.
- Veri hakları referansı: `/v1/me/export` ve `/v1/me/data` ile dışa aktarma/silme davranışı referans sunucuda uçtan uca doğrulandı; gerçek üründe kimlik doğrulama ve açık onay gerekecek.
- Yayın öncesi otomatik kontrol: `SOFRA-RELEASE-CHECK.mjs` (`SOFRA_RELEASE_CHECK_OK`); güncel frontend sözleşmeleri, 39 çalışma scripti, 53 paket dosyası, eski sürüm temizliği ve sözleşme/API testleri birlikte doğrulandı. Kontrol hem çalışma klasöründe hem ZIP’in içinde çalıştı.
- Ana öneri kartında isteğe bağlı geri bildirim; `sofraFeedbackV1` ile cihazda saklanır ve deterministik motorun sonraki sıralamasına sınırlı `learning_boost` olarak yansır.
- Dolap notunda bilinen ürün, miktar ve durum için kullanıcı onaylı deterministik ayrıştırma; tanınmayan cümleleri ürün uydurmadan not olarak saklama.
- Koyu tema turu: ana sayfa, Tarifler, Dolabım, Planım, Fit, profil ve modal yüzeyleri kontrol edildi; yatay taşma ve console error/warning bulunmadı.
- Profil veri kontrolü: JSON dışa aktarma kartının profil oluşturulduktan sonra görünmesi ve tema içinde okunabilir kalması doğrulandı.
- Mod geçişi ve Planım: Sofra → Fit geçişinde kalori özeti, Fit → Sofra dönüşünde alışveriş özeti doğrulandı; menüye tatlı ekleyip Planım’a aktarma akışı geçti.
- Kişisel Fit hesabı: 30 yaş / 170 cm / 70 kg örneğinde Fit kartı 1.996 kcal, Planım Fit özeti de 1.996 kcal olarak eşleşti.
- Market güvenli akışı: Planım’da listeyi kontrol etme, açıkça onaylama ve ardından örnek teklifleri görme sırası geçti; onay ekranı canlı markete gönderim yapmadığını belirtiyor.
- Market sözleşmesi: API yalnızca Planım’dan üretilen adayları kabul ediyor; teklif yanıtı `demo_only`, minimum sepet ve karşılaştırılabilirlik durumlarını açıkça taşıyor.
- Geliştirme kalıcılığı: `SOFRA-STORE-V1.mjs` atomik JSON yazma/okuma ve şema doğrulaması sağlıyor; referans sunucu bunu yalnızca `SOFRA_STORE_PATH` verildiğinde kullanıyor.
- Hesap bağlama sınırı: `/v1/auth/status` anonim oturumu, Google/Apple sağlayıcılarının bağlı olmadığını ve veri hakları endpoint’lerini açıkça raporluyor; OAuth token saklama kapalı.
- Bildirim izin sınırı: `/v1/notifications/status` iOS, Android ve web izin API’lerini, üç hatırlatıcı kanalını ve sağlık/market verisinin bildirime taşınmadığını açıkça raporluyor; sistem izni henüz istenmiyor.
- Sofra Plus sınırı: `/v1/billing/status` ücretsiz planı aktif, Plus’ı pasif ve checkout sağlayıcısını bağlı değil olarak raporluyor; prototipte ücret veya ödeme bilgisi istenmiyor.
- Tarif katalog sınırı: `GET /v1/recipes` Sofra/Fit/Tatlı, doğal arama ve süre filtresini backend’e taşıyor; patlıcan örneği katalogda yer alıyor ve doğrulanmamış besin verisi `null` kalıyor.
- Tarif detay akışı: `GET /v1/recipes/:id` aynı güvenlik ve besin doğrulama görünümünü tek tarifte sunuyor; katalogdaki örnek tarifler artık porsiyon, ölçülü malzeme, üç adımlı hazırlanış ve ipucu alanlarını taşıyor. Besin verisi doğrulanmadıkça kalori iddiası yapılmıyor.

Henüz demo/placeholder olanlar:

- Gerçek backend
- Gerçek AI malzeme çözümleme
- Fiş OCR
- Gerçek sesli giriş altyapısı
- Market entegrasyonu
- Apple HealthKit gerçek bağlantısı (iOS sürümünde ilk Fit kapsamına alınacak; v39’da yalnızca izin akışı demosu var)
- Health Connect gerçek bağlantısı (Android sonraki aşama)
- Google/Apple hesabı
- Bildirimler
- Ödeme ve Premium

## 10. Test notları

14 Ekim 2026’da v33 localhost üzerinde gerçek tarayıcı akışıyla kontrol edildi:

- Sofra Fit’e geçiş: geçti
- Fit’ten normal Sofra’ya dönüş: geçti
- İlk giriş panelinin yenilemede tekrar çıkmaması: geçti
- Dolaba domates ekleme: geçti
- Yenileme sonrası ürünün korunması: geçti
- Domates emoji eşleşmesi: geçti
- Dolap sayacının güncellenmesi: hata bulundu ve düzeltildi
- Domatese göre ana sayfa önerisi: geçti
- Domates araması: geçti
- Dolaptan menü oluşturma: geçti
- Tatlı bölümü ekleme: geçti
- Aynı bölümü iki kez eklemeyi engelleme: geçti
- Menüden Planım’a aktarım: geçti
- Fit profil kaydetme: geçti
- Tatlı filtresi ve tarif detay modalı: geçti
- Mobil yatay taşma: bulunmadı
- Görsel yükleme hatası: bulunmadı
- Tarayıcı console error/warning: bulunmadı

v34 ek kontrolü:

- Ana sayfa mod değiştiricisi Sofra → Fit geçişi: geçti
- Fit → Ana sayfa dönüşünde Fit modunun korunması: geçti
- Fit → Sofra dönüşünde günlük modun korunması: geçti
- v34 mobil yatay taşma: bulunmadı
- v34 tarayıcı console error/warning: bulunmadı

v35 Tarifler ekranı kontrolü:

- 30 dakikada filtresi: geçti
- Dolabımdan filtresi ve dolap malzemesi eşleşmesi: geçti
- Tatlı filtresi: geçti
- Arama yazınca sonuçların daralması: geçti
- Filtre değişince eski aramanın temizlenmesi: geçti
- Tarif kartından detay modalı açılması: geçti
- Tarifler ekranında yatay taşma: bulunmadı
- Görsel yükleme hatası: bulunmadı
- Tarayıcı console error/warning: bulunmadı

v36 Dolap ekranı kontrolü:

- Ürün düzenleme modalı: geçti
- Miktar ve Var / Azaldı / Bitti durumunu kaydetme: geçti
- Yenileme sonrası düzenlenen ürünün korunması: geçti
- Hızlı ürün ekleme ve dolap sayacının güncellenmesi: geçti
- Dolaptan tarifler ekranına geçiş: geçti
- Mobil yatay taşma: bulunmadı
- Görsel yükleme hatası: bulunmadı
- Tarayıcı console error/warning: bulunmadı

v37 Planım ekranı kontrolü:

- Hafta / Ay / Geçmiş sekmeleri: geçti
- Aylık takvim gün ızgarası ve planlı gün işaretleri: geçti
- Haftalık dönem ileri/geri geçişi: geçti
- Seçilen Planım görünümünün yenilemede korunması: geçti
- Menüden Planım’a aktarım: geçti
- Ay görünümünden Hafta görünümüne dönünce aktarılan menünün korunması: hata bulundu ve düzeltildi
- Mobil yatay taşma: bulunmadı
- Görsel yükleme hatası: bulunmadı
- Tarayıcı console error/warning: bulunmadı

v38 öneri motoru kontrolü:

- Varsayılan dolapta patates + peynir eşleşmesine göre Fırında sebzeli tabak öne çıkması: geçti
- Dolabımdan filtresinde puanlanmış tarif sırası: geçti
- Sofra Fit modunda dengeli tarif puanının artması: geçti
- Dolap boş olsa da genel öneri üretebilme kuralı: motor kodunda mevcut; boş-dolap UI akışı sonraki QA turunda genişletilecek
- Boş dolap QA senaryosu: `sofra-motoru-reference-v2.html?demo=empty` mevcut cihaz dolabını değiştirmeden genel öneri, boş Dolabım görünümü ve Tarifler geçişini test ediyor.
- Çocuğum için yaş akışı: 12–23, 24–35 ve 36+ ay seçimleri farklı tarif/not seti üretiyor; kart tıklaması yaş, gerçek görsel, hazırlama notu ve genel güvenlik uyarısı içeren detay önizlemesi açıyor.
- İsteğe bağlı son kullanma tarihi alanı: ürün düzenleme modalında ürün bazlı olarak eklendi; tarih girilmezse ürün normal stok kaydı olarak kalır
- Mobil yatay taşma: v37 temel mobil görünümünde geçti; v38 yalnızca davranış katmanı ekledi
- Tarayıcı console error/warning: bulunmadı

v39 Fit ve sağlık hazırlığı kontrolü:

- Fit profilinde boş kaydetme doğrulaması: geçti
- Yaş, boy, kilo, hareket ve hedef ile yaklaşık kalori/protein hesabı: geçti
- Kaydedilen Fit profilinin yenileme sonrası korunması: geçti
- Apple Health izin açıklaması modalı ve gerçek HealthKit bağlantısı olmadığının açıkça belirtilmesi: geçti
- Demo sağlık bağlantısı durumunun yenileme sonrası korunması: geçti
- Fit ekranı ve ana sayfa geçişi: geçti
- v39 masaüstü görünümünde yatay taşma: bulunmadı
- v39 tarayıcı console error/warning: bulunmadı
- v39 eksik görsel kontrolü: bulunmadı

v40 alışveriş listesi kontrolü:

- Planım’da statik açıklama yerine menüden üretilen aday listenin görünmesi: geçti
- Dolapta kayıtlı makarnayı ekleyince aday listeden düşmesi: ilk kontrolde hata bulundu, düzeltildi ve tekrar geçti
- Alışveriş listesini kopyalama: geçti
- Liste üzerinden Dolabım’a dönüş: geçti
- Kullanıcı eklemediği ürünlerin “kesin eksik” yerine “Kontrol et” olarak gösterilmesi: geçti
- v40 tarayıcı console error/warning: bulunmadı
- v40 eksik görsel kontrolü: bulunmadı

v41 alışveriş listesi regresyon kontrolü:

- Dolap ürünü eklenince ana sayfa önerisinin güncellenmesi: geçti
- Dolap ürünüyle kişiselleştirilmiş menü kurulması: geçti
- Seçilen menünün malzemelerinin Planım alışveriş adaylarına yansıması: geçti
- Dolapta bulunan domates ve patatesin aday listeden düşmesi: geçti
- Kopyalanan listenin panodaki gerçek içeriğinin doğrulanması: geçti
- Liste üzerinden Dolabım’a dönüş: geçti
- v41 tarayıcı console error/warning: bulunmadı
- v41 eksik görsel kontrolü: bulunmadı
- v41 yatay taşma kontrolü: bulunmadı

v42 profil ve tema kontrolü:

- Profil’de Tercihler ve Hesap kartlarının görünmesi: geçti
- Açık → koyu tema geçişi: geçti
- Koyu → açık tema dönüşü: geçti
- Tema tercihini yenileme sonrası koruma: geçti
- Hatırlatıcı tercihini açma ve yenileme sonrası koruma: geçti
- Google/Apple düğmelerinin gerçek entegrasyon yokken pasif kalması: geçti
- Koyu temada bilgi kartlarının açık renkte kalması: hata bulundu, düzeltildi ve görsel kontrolden geçti
- v42 tarayıcı console error/warning: bulunmadı
- v42 yatay taşma: bulunmadı

v43 market karşılaştırması kontrolü:

- Alışveriş adaylarından örnek market modalını açma: geçti
- Tahmini toplam, teslimat, minimum sepet ve teslimat süresinin birlikte gösterilmesi: geçti
- “En uygun toplam” etiketinin yalnızca koşulları açık olan örnek seçenekte görünmesi: geçti
- Canlı bağlantı olmadığı ve fiyatların örnek olduğu uyarısı: geçti
- Modal kapatma: geçti
- v43 tarayıcı console error/warning: bulunmadı
- Ürüne isteğe bağlı son kullanma tarihi ekleme, tarihsiz durumda öncelik kartını gizleme ve tarihli ürün için “önce kullanalım” kartı: geçti
- Öneri kartı “İşe yaradı / Başka fikir” geri bildirimi ve kullanıcıya durum mesajı: geçti
- “6 yumurta aldım, peynir azaldı, süt bitti” cümlesinin ürün/miktar/durum önizlemesi: geçti
- Tanınmayan doğal cümlede ürün uydurmadan güvenli not geri dönüşü: geçti
- Doğal cümle akışında 390px mobil yatay taşma: bulunmadı

v43 tasarım temizlik düzeltmesi:

- Ana sayfadaki tekrarlı “Dolabında neler var?” paneli kaldırıldı; Dolabım sekmesi, “Dolabımdan bul” aksiyonu ve mutfak durum kartı tekil giriş noktaları olarak bırakıldı.
- Panel kaldırıldıktan sonra 390px mobil ana sayfa tekrar kontrol edildi; yatay taşma ve kırık görsel oluşmadı.
- v43 eksik görsel kontrolü: bulunmadı
- v43 yatay taşma: bulunmadı

v43 kapsamlı kullanıcı akışı yeniden kontrolü (14 Ekim 2026):

- Sofra → Sofra Fit geçişi: geçti
- Fit profilini boş kaydetme doğrulaması: geçti; kullanıcıya yaş, boy ve kilo uyarısı gösterildi
- Apple Health izin akışı demosu: geçti; gerçek HealthKit bağlantısı olmadığı açıkça gösterildi
- Fit → Sofra dönüşü: geçti; mod seçiciyle normal ana sayfa açıldı
- Fit → mod seçici → Tatlı keşfi geçişi: geçti; Tarifler ekranı Tatlı filtresi ve sonuç başlığıyla açıldı
- Temiz origin ilk girişinde Sofra / Sofra Fit / Tatlı keşfi seçim kartlarının görünmesi: geçti
- İlk girişten Sofra Fit seçimi sonrası yeni açılışta Fit modunun ve dengeli öneri metninin korunması: geçti
- Temiz mod seçimi testinde Menü oluştur → ana yemek → salata/meze → tatlı → Planım → örnek market karşılaştırması zinciri: geçti
- Bu zincirde tarayıcı console error/warning: bulunmadı
- API sözleşme smoke testi: geçti (`SOFRA_API_CONTRACT_TEST_OK`); pantry CRUD, SKT önceliği, Fit önerisi, plan/alışveriş adayları ve market onayı kontrol edildi
- Referans HTTP API uçtan uca testi: geçti (`SOFRA_API_SERVER_TEST_OK`); anonim kullanıcı, dolap POST/PATCH, öneri, plan, alışveriş adayı ve onaysız market isteği 409 davranışı kontrol edildi
- Doğal not onayı için atomik toplu dolap kaydı: geçti; `/v1/pantry/items/bulk` tüm ürünleri önce doğruluyor, hatalı üründe kısmi kayıt bırakmıyor.
- Fit/sağlık sözleşme smoke testi: geçti (`SOFRA_HEALTH_CONTRACT_TEST_OK`); Apple HealthKit + Health Connect normalize çıktısı, reddedilen izinlerde `null` ve market payload sağlık sızıntısı kontrol edildi
- Ortak sağlık normalizasyon modülü: `SOFRA-HEALTH-V1.mjs`; provider kaynağı, zaman damgası, izin ve negatif değer doğrulaması HealthKit/Health Connect adapter’larından bağımsız hale getirildi.
- Fit öneri API’si `health_summary` kabul ediyor; yalnızca normalize edilmiş sağlık bağlamını döndürüyor, geçersiz metrikleri `null` yapıyor ve kalori telafisi/market aktarımı yapmıyor.
- Market sözleşme smoke testi: geçti (`SOFRA_MARKET_CONTRACT_TEST_OK`); geçerli teklifin öne alınması, minimum sepet/eskimiş fiyat koruması ve “İş birliği” etiketi kontrol edildi
- Tarif besin doğrulama kapısı: geçti (`SOFRA_NUTRITION_CONTRACT_TEST_OK`); eksik alan, belirsiz kaynak veya doğrulanmamış tarif için kalori/makro iddiası `null` kalıyor, yalnızca izinli doğrulanmış kaynaklar yayınlanıyor
- Gıda güvenliği öneri filtresi: geçti (`SOFRA_SAFETY_CONTRACT_TEST_OK`); profil seçimi alerjen çatışmasını engelliyor, eksik/doğrulanmamış metadata’yı güvenli saymıyor ve çölyakta çapraz bulaş bilgisi yoksa `review_required` döndürüyor
- Fit profil/hedef sözleşmesi: geçti (`SOFRA_FIT_CONTRACT_TEST_OK`); yaş, boy, kilo, cinsiyet, hareket ve hedef normalize ediliyor, eksik profilde hedef `null` kalıyor ve yaklaşık hesap açıkça etiketleniyor
- Boş dolap başlangıcı: geçti; yeni kullanıcıya demo ürünleri gerçek stok gibi göstermiyor, `?demo=1` yalnızca tasarım örneği için kullanılıyor ve boş dolapta genel öneri/“Hızlı ekle” geri dönüşü korunuyor
- Temiz localhost origin QA: geçti; parametresiz açılışta “Dolabını doldurmak şart değil / Genel önerilerle başlayalım” göründü, `?demo=1` açılışında örnek patates/peynir verisiyle dolap eşleşmesi geri geldi.
- Ana sayfadan “domates” araması ve Tarifler sonuçlarına geçiş: geçti
- Dolabım’a “2 kg soğan” hızlı ekleme: geçti; kayıt sayacı 5’ten 6’ya güncellendi ve miktar korunarak gösterildi
- Dolap verisine göre menü kurma: geçti; Domatesli patates tenceresi önerildi
- Menüye salata ve tatlı ekleme: geçti; aynı menüde iki isteğe bağlı bölüm birlikte korundu
- Menüyü Planım’a aktarma: geçti; ana yemek, salata ve tatlı Planım kartında göründü
- Planım market adayları: geçti; dolapta kayıtlı ürünler düşürülerek bilinmeyenler “Kontrol et” olarak kaldı
- Örnek market modalı: geçti; toplam, teslimat, minimum sepet ve örnek veri uyarısı görünür
- Planım Hafta → Ay → Geçmiş görünümleri: geçti
- Planım haftalık ileri dönem oku: geçti; 12–18 Ekim’den 19–25 Ekim 2026’ya ilerledi
- Profil açık/koyu tema geçişi ve tekrar açık moda dönüş: geçti
- Bildirim tercihi öncesi açıklama ekranı: geçti; prototipte sistem izni açılmadığı ve gerçek izin kapsamının mobil sürümde ayrıca sorulacağı açıkça gösterildi.
- 390px mobil viewport yatay taşma: bulunmadı (`scrollWidth = clientWidth`)
- 390px mobil viewport eksik görsel: bulunmadı
- v43 tarayıcı console error/warning: bulunmadı
- Fit ekranındaki “Sofra’ya geç · Modu değiştir” akışıyla Sofra seçildiğinde ana sayfa mod göstergesinin Sofra’ya dönmesi: hata bulundu, düzeltildi ve yeniden test edildi
- Frontend erişilebilirlik temizliği: işlevi olmayan favori kalp süsleri kaldırıldı, `prefers-reduced-motion` desteği eklendi; yenilenen ana sayfa AX ağacında gereksiz kalp kontrolleri görünmüyor ve console hatası yok.
- Geri bildirim davranışı: “Başka fikir” seçimi cihazdaki öneri olayını kaydedip motoru yeniden senkronize ediyor; durum mesajı ve yeni sıralama hesabı tarayıcı turunda geçti.
- Çevrimdışı davranış: bağlantı yokken cihazdaki dolap/plan verisinin kullanılabildiğini, canlı market bağlantısının beklediğini söyleyen erişilebilir durum bandı eklendi; normal localhost açılışında gizli ve console hatasız.
- Frontend yapısal smoke testi eklendi: Türkçe/mobil viewport, alt navigasyon, ekran tekilliği, yatay taşma koruması, reduced-motion, görsel fallback, Fit sağlık kancası ve işlevsiz favori kalbi kontrol ediliyor.
- Son kullanıcı gözüyle v43 yeniden smoke-test: ana sayfada “patlıcan” araması Tarifler’de doğru sonuç verdi; Dolabım’a “mantar” eklenince sayaç 7’den 8’e çıktı ve yenileme sonrası kayıt korundu.
- Aynı turda Planım → “Listeyi kontrol et” önce aday ürün onayını, ardından örnek market tekliflerini açtı; akışta console error/warning bulunmadı.
- Karşılaştırılabilir market tekliflerinde en uygun toplamdan fark gösterimi: geçti; minimum sepeti karşılanmayan Migros teklifinde yanıltıcı fiyat farkı gösterilmedi.
- Market tekliflerinde örnek güncelleme zamanı ve `Kaynak: örnek veri` etiketi hem kanonik v43 hem referans v2 akışında görünür; iki yüzeyde de modal akışı console hatasız geçti.
- Sofra Fit kanonik v43’te hedef seçimi tarif kartlarını da değiştiriyor: kilo verme için daha hafif, kilo alma için daha doyurucu örnekler; karttan tarif detayına geçiş ve antrenmansız akış doğrulandı.
- Market modalında örnek teklifleri `En uygun toplam`, `En hızlı` ve `Tek markette tamamla` ölçütleriyle yeniden sıralama eklendi; sıralama kaynak veriyi değiştirmiyor ve iki frontend akışında test edildi.
- Yayın öncesi kalite kapısı eklendi: `.github/workflows/sofra-quality.yml` bağımlılıksız `SOFRA-CI-SMOKE.mjs` ile sözleşme, API ve release kontrollerini her push/pull request’te çalıştırıyor.
- Profilde “Gizlilik özeti” eklendi; cihazda tutulan veriler, sağlık/market ayrımı, hesap bağlantısı sınırı ve dışa aktarma/silme kapsamı kullanıcıya modal içinde açıkça gösteriliyor. Bu metin hukuki gizlilik politikasının yerine geçmiyor.

Not: Test amacıyla tarayıcıdaki yerel demo dolabına “2 kg soğan” ve “mantar” kayıtları eklendi. Prototip verisi yalnızca tarayıcı LocalStorage’ında tutulur; ZIP paketindeki kaynak dosyaya yazılmaz.

## 11. Açık ürün kararları

- İlk market partneri kim olacak?
- Fiyat karşılaştırması hangi şehirlerde başlayacak?
- Fiyatlar ne sıklıkta güncellenecek?
- Market komisyonu kullanıcıya nasıl açıklanacak?
- Sofra’nın varsayılan modu Sofra mı, son seçilen mod mu olacak?
- Gerçek tarif veri tabanı nasıl kurulacak ve doğrulanacak?
- Fit kalori hesapları için hangi besin veri kaynağı kullanılacak?
- Backend ve mobil uygulama teknolojisi ne olacak?
- `soframız.com` alan adı kullanılacak mı?

## 12. Karar günlüğü

### 14 Ekim 2026

- Sofra, Sofra Fit ve Tatlı ayrı giriş kartları olarak kararlaştırıldı.
- Dolap girişinin zorunlu olmaması kararlaştırıldı.
- Son kullanma tarihinin opsiyonel olması kararlaştırıldı.
- Tarihi olmayan ürünlerin otomatik olarak yok sayılmaması kararlaştırıldı.
- Fit kalori özetinin normal Planım ekranında gösterilmemesi kararlaştırıldı.
- Menüye isteğe bağlı çorba, salata/meze, yanına ve tatlı eklenmesi kararlaştırıldı.
- Market yönlendirme, fiyat karşılaştırma ve komisyon modeli gelecekteki gelir kanalı olarak eklendi.
- Apple HealthKit ve Android Health Connect entegrasyonu Fit yol haritasına eklendi.
- Sosyal influencer/şef akışı şimdilik pasif bırakıldı; marka destekli tarif ve influencer iş birlikleri ürün yol haritasında tutuldu.
- Apple HealthKit entegrasyonunun iOS sürümüyle birlikte planlanmasına karar verildi; Health Connect Android sonraki aşamaya bırakıldı.
- Tasarımda gereksiz büyük kartlardan, fazla boşluktan ve tekrar eden dolap panellerinden kaçınılması kararlaştırıldı.
- Ana sayfadaki Sofra/Fit kartlarının statik tanıtım yerine işlevsel mod değiştirici olması kararlaştırıldı.
- Gönderilen zengin Sofra ve Sofra Fit referans ekranlarının ana yapıları `outputs/sofra-motoru-reference-v2.html` içinde birleştirildi: arama/filtre, kişiselleştirilmiş tek tarif, dolap önceliği, gerçek yemek fotoğraflı kategori kısayolları, haftalık plan, çocuk beslenmesi ve menü bannerı; Fit tarafında profil, kalori, makro, öğün, sağlık bağlantısı ve hedefe göre tarif önerileri. Antrenman bölümü kapsamdan çıkarıldı.
- Çocuk özelliğinin ayrı bir Aile modu yerine Sofra içinde `Çocuğum için` girişinden açılması; yaş dönemi, besleyici örnek tarifler ve güvenli hazırlama notlarıyla ilerlemesi kararlaştırıldı.
- Dolap hızlı eklemede `2 kg domates`, `6 adet yumurta`, `1 paket makarna` gibi ölçülerin ayrıştırılması; ölçü yoksa `Miktarı ayrıca doğrula` olarak bırakılması kararlaştırıldı.
- Kategori, çocuk tarifi ve Fit öğün kartlarında emoji yerine mümkün olduğunca gerçek yemek fotoğrafı kullanılması kararlaştırıldı; fotoğraf yüklenemezse mevcut görsel fallback korunacak.
- Çocuğum için akışında 12–23 ay, 24–35 ay ve 36+ ay seçimlerinin yalnızca görsel işaret değil, yaşa göre değişen örnek tarif ve hazırlama notu üretmesi kararlaştırıldı.
- Gıda güvenliği için Profil’de alerji/kısıt tercihi, gluten/çölyak seçimi ve açık çapraz bulaş uyarısı eklenmesi; tariflerin ileride yapılandırılmış alerjen metadata’sı olmadan “güvenli” diye etiketlenmemesi kararlaştırıldı.
- Referans v2, kanonik v43 davranışını değiştirmeden ayrı bir karşılaştırma önizlemesi olarak tutuluyor; seçilen parçalar kullanıcı akışı onayından sonra kanonik frontend’e taşınacak.
- Referans v2 kullanıcı gözüyle test edildi: Sofra → Sofra Fit, Fit → Sofra, ana sayfa → Dolabım ve haftalık plan/menü bağlantıları çalıştı; 30 script syntax kontrolü geçti.
- Öneri motoru v1.1’e geçildi: açık geri bildirim benzer etiketli tariflere sınırlı tercih sinyali taşıyor, `recent_recipe_ids` yakın zamanda gösterilen tarifi tekrar azaltıyor; `preference_boost` ve `repeat_penalty` API yanıtında açıklanıyor ve API/server smoke testleriyle doğrulanıyor.
- Öneri motoru v1.3’e geçildi: son 24 saatte dolaba eklenen ve tarifte eşleşen ürün `recent_inventory_add` nedeni ile +42 puan alıyor; patlıcan örneği ana sayfa, Tarifler araması ve API yanıtında kullanıcı testiyle doğrulandı.
- Fit v1.4 prototipinde tarif kartları ortak öneri motoruna bağlandı: hedefe göre sıralama, dolap eşleşmesi, gerçek yemek fotoğrafı ve güvenlik filtresi korunuyor; antrenman arayüzü kapsam dışında bırakıldı.
- Health v1.5 prototipinde Fit bağlantı ekranı iOS Apple HealthKit ve Android Health Connect sağlayıcısını ayrı gösteriyor; veri türü seçimi, kısmi izin, manuel devam ve gerçek bağlantının kapalı olduğu sınır kullanıcıya açıklanıyor.
- Market v1.6 prototipinde yönlendirme/komisyon açıklaması karşılaştırma ekranında görünür; gerçek partner bağlantısı açılmadan canlı gelir iddiası ve yönlendirme yapılmıyor.
- Algoritma v1.7’de doğal dolap notu ve API kayıtları kanonik malzeme adına indirgeniyor; kg/g/adet/litre/paket gibi miktar-birim alanları normalize edilip `SOFRA-INGEST-CONTRACT-TEST.mjs` ile korunuyor.
- Planım v1.8’de kullanıcı tarafından oluşturulan menü kaydı cihazdaki `sofraPlanDataV51` alanında korunuyor; Hafta/Ay/Geçmiş görünümleri aynı menü ve isteğe bağlı bölümleri gösteriyor, dışa aktarma kapsamına dahil ediliyor.
- Hesap v1.9’da anonim kullanım sınırı netleştirildi: prototip verisi cihazla sınırlı, bulut/cihazlar arası senkron kapalı, senkronizasyon için hesap gerekiyor ve gerçek OAuth açılmadan kullanıcıya bu durum Profil’de anlatılıyor.
- Bildirim v1.10'da tek bir aç/kapat yerine öğün, yaklaşan ürün ve Planım kanalları ayrı seçilebilir hale getirildi; sistem izni prototipte istenmiyor, ön açıklama ve manuel devam sınırı korunuyor.
- Health v1.11'de gelecekteki mobil katman için HealthKit ve Health Connect adapter sınırı ayrıştırıldı; platform alanları ortak normalize çıktıya çevriliyor, izin verilmemiş ham değerler bloke ediliyor ve adapter sözleşmesi testle korunuyor.
- Market v1.12'de gelecekteki CarrefourSA, Getir ve Migros adapter sınırı eklendi; partner teklifleri ortak fiyat/güncellik kurallarından geçiyor, sağlık/Fit alanları teklif payload'ında reddediliyor ve canlı bağlantı açılmadan demo sınırı korunuyor.

### 16 Ekim 2026

- Fit hedef ve mod degistirme akisi temiz oturumda canli test edildi: kilo verme ve kilo alma secimleri farkli tarif siralamasi/icerigi ve yaklasik hedef uretti; profil kaydi ve Fit'ten Sofra'ya donuste mod gostergesi dogru kaldı.
- Fit kapsam temizligi yapildi: antrenman karti/aksiyonu ve egzersiz izin secenegi kaldirildi; Fit tarif, ogun, profil hedefi ve istege bagli saglik baglantisi odaginda tutuldu.
- Fit acik/koyu tema turunda Sofra'nin yesil/krem/kil paleti dogrulandi; guvenlik tercihi nedeniyle bos kalan tarif alanina tercihi gozden gecirme aksiyonu eklendi.
- Cocugum icin akisi ana v43'e tamamlandi: 12-23, 24-35 ve 36+ ay secimleri farkli tarif/not setleri uretiyor; kart detayinda gercek fotograf, malzeme, hazirlama notu ve genel alerjen/kivam uyarisi var.
- Bos dolap akisi canli olarak tamamlandi: demo bos dolapta ana sayfa genel oneriyi koruyor, Dolabim sifir durumunu gosteriyor ve tariflere gecis listeyi bos birakmiyor.

- Gida guvenligi akisi canli tarayici turunda dogrulandi: Profil'den Gluten / colyak secimi, kaydetme rozeti ve Tarifler ekraninda dogrulanmamis tariflerin filtrelenmesi birlikte calisti; koyu tema da kontrol edildi.

- Planım kullanıcı öğünü akışı canlı tarayıcı turunda test edildi: metin, öğün bölümü, kaydetme ve yeni sekmede kalıcılık birlikte geçti; serbest metin malzemeleri onaysız alışverişe eklenmiyor.
- Sofra Fit paleti canonical ve reference ekranlarında adaçayı-krem-clay olarak kilitlendi; mavi/mor referans stillerinin geri dönüşü için ayrı kontrat testi eklendi.
- Son kullanma tarihi motoru ürün bazında testle korundu: tarihi olmayan ürün boost almaz, biten ürün öne alınmaz, her ürünün opsiyonel tarihi ayrı değerlendirilir.
### Arama v1.1

- Arama bos durumu v65 ile ayrildi: hic eslesme yoksa kullaniciya aramasina uygun tarif bulunamadigi, eslesen tariflerin guvenlik filtresinden elenmesi durumunda ise guvenlik tercihini gozden gecirmesi anlatiliyor; kanonik ve referans ekranlarda canli test edildi.

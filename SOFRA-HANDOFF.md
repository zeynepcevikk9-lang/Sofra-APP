# Sofra — yarın devam edecek kişi için handoff

Son güncelleme: 16 Ekim 2026  
Repo: `https://github.com/emirhanozerr/sofra-motoru`  
Branch: `main`

## Son çalışan önizleme

- Ana uygulama: `http://127.0.0.1:8766/sofra-motoru-home-v43.html?qa=handoff-v97&demo=empty`
- Referans karşılaştırma ekranı: `http://127.0.0.1:8766/sofra-motoru-reference-v2.html?qa=handoff-v97&demo=onboarding`
- Logo seçenekleri: `http://127.0.0.1:8766/sofra-logo-options-v4.html`

Ana uygulamada son seçilmiş logo uygulanmış değildir. Logo v4 yalnızca karşılaştırma önizlemesidir; 1 ve 4 numaralı seçenekler şu an en güçlü adaylardır.

## Şimdiye kadar tamamlananlar

- Sofra ana sayfası, Tarifler, Dolabım, Planım, Sofra Fit ve Profil ekranları aynı mobil akışta çalışıyor.
- Ana sayfada `Tek tarif`, `Menü oluştur` ve `Dolabımdan bul` yolları görünür.
- `Bugünün seçimi` yatay kaydırmalı gerçek yemek fotoğraflarıyla çalışıyor.
- Tarif aramasında kategori, video ve dolaptaki malzemelerle arama araçları var.
- Kayıtlı tarifler, kaldığın adım, Asistan Şef, sesli adım ve paylaşım kancaları var.
- Tarif detayında porsiyon artırma/azaltma, miktar ölçekleme, `Yanına ne gider?` ve gıda güvenliği kartı var.
- Fit bölümünde boy, kilo, yaş, cinsiyet, hareket ve hedef profili korunuyor; antrenman bölümü özellikle kapsam dışı bırakıldı.
- Fit hedefleri daha hafif, dengeli veya kilo almaya uygun tarif sıralamasına bağlanıyor. Doğrulanmamış kcal/makro iddiası gösterilmiyor.
- Apple HealthKit ve Android Health Connect için izin/veri sınırı prototip olarak ayrıştırıldı; gerçek mobil bağlantı henüz yok.
- Çocuğum için 12–23, 24–35 ve 36+ ay akışları; yaşa göre tarif, kıvam ve hazırlama notları var.
- Dolap ürünlerinde adet, kg, g, litre, ml, paket, kutu, demet, şişe ve kavanoz gibi miktar/birim alanları var.
- Alerji ve çölyak filtresi güvenli olmayan veya doğrulanmamış içeriği güvenli kabul etmiyor.
- Market akışında kullanıcı onayı, örnek fiyat, minimum sepet ve sponsor/iş birliği açıklaması var; gerçek partner bağlantısı yok.
- API `ingredients_detail` alanı artık `canonical_name`, `display_name`, `quantity_text`, `quantity_value` ve `unit` taşıyor.
- Tarif adımlarına `step_media` veri modeli eklendi; önizlemede adım başına gerçek fotoğraf kaynağı gösteriliyor.

## Tasarım kararları — korunmalı

- Renk dili: adaçayı yeşili + krem + kil/terracotta. Fit ekranına mavi veya mor tema geri getirilmemeli.
- Koyu modda kart yüzeyleri, metin kontrastı, modal ve bilgi kartları ayrıca kontrol edilmeli.
- Kartlar kısa ve kompakt kalmalı; gereksiz sekme, fazla üst boşluk, eğimli/yamuk panel veya uzun yatay kart eklenmemeli.
- Emoji yalnızca fotoğraf yüklenemediğinde fallback olmalı. Mümkün olan yerlerde gerçek yemek/ürün fotoğrafı kullanılmalı.
- `Dolabımdan bul` kartında dolap/çekmeceyi çağrıştıran ikon kullanılmalı; patates gibi rastgele ürün fotoğrafı kullanılmamalı.
- Ana başlık saat bağımlı olmamalı; `Bugün ne pişirsek?` kullanılmalı.
- Aile planı ayrı bir özellik olarak büyütülmemeli; kişi sayısı seçimi yeterli. `Çocuğum için` bölümü korunmalı.
- Beslenme ve sağlık ekranı tarif önerisi odaklı kalmalı; antrenman ekranı eklenmemeli.

## Yarın için önerilen sıra

### P0 — güvenilir tarif temeli

1. `SOFRA-ALGORITHM-V1.mjs` içindeki tarifleri gerçek, lisanslı ve kaynağı belirtilmiş içerikle değiştirmek.
2. `step_media` içindeki önizleme Unsplash varlıklarını üretim için lisanslı/izinli fotoğraf ve gerçek adım medyasıyla değiştirmek.
3. Gram/adet dönüşümünü ürün bazında doğrulanmış dönüşüm tablosuna bağlamak; yoğunluk veya yenilebilir kısım bilinmiyorsa otomatik dönüşüm yapmamak.
4. Doğrulanmış besin kaynağı gelmeden kcal, protein, karbonhidrat ve yağ yayınlamamak.
5. Alerjen metadata'sını tek tek malzemelerle eşleştirip çölyak için çapraz bulaş durumunu tarif bazında doğrulamak.

### P1 — ürün derinliği

1. Gerçek hesap/OAuth ve cihazlar arası senkronizasyon.
2. Paylaşılabilir tarif bağlantısı ve tarif kaynağı/üretici modeli.
3. Kategori ve video içerik tiplerinin gerçek veri kaynağına bağlanması.
4. Planım'da kullanıcının önerilen yemeği değiştirmesi, serbest öğün eklemesi ve aynı güne tekrar tekrar düzenleme yapması için regresyon testi.

### P2 — gelir ve entegrasyon

1. Gerçek market adapterleri: fiyatın güncellik tarihi, stok, teslimat ve minimum sepet.
2. CarrefourSA/Getir/Migros gibi partner tekliflerinde açık `İş birliği` etiketi.
3. Sponsorlu içerik sıralamasının Fit, sağlık ve alerji kararlarını etkilemediğini güvence altına almak.
4. iOS HealthKit ve Android Health Connect gerçek mobil adapterleri; izin verilmemiş veriyi sunucuya göndermemek.

## Test komutları

Çalışma dizini: `C:\Users\zeyne\Documents\Codex\2026-10-13\v`

```powershell
node SOFRA-CI-SMOKE.mjs
node SOFRA-RELEASE-CHECK.mjs
node SOFRA-API-CONTRACT-TEST.mjs
node SOFRA-API-SERVER-TEST.mjs
node SOFRA-API-PERSISTENCE-TEST.mjs
git diff --check
```

Beklenen ana sonuçlar:

- `SOFRA_CI_SMOKE_OK tests=28`
- `SOFRA_RELEASE_CHECK_OK`
- `SOFRA_API_SERVER_TEST_OK`
- `SOFRA_API_CONTRACT_TEST_OK`
- `SOFRA_API_PERSISTENCE_TEST_OK`

Tarayıcıda ayrıca 390px genişlikte şu akışlar kontrol edilmeli: Sofra → Sofra Fit → Sofra, ana sayfa → Dolabım, `domates` ekleme, Dolabımdan bul, tarif açma, porsiyon artırma, tarif kaydetme, Planım'a ekleme, Çocuğum için, açık/koyu mod.

## Önemli dosyalar

- `outputs/sofra-motoru-home-v43.html`: kanonik ana uygulama önizlemesi.
- `outputs/sofra-motoru-reference-v2.html`: referans/onboarding karşılaştırması.
- `SOFRA-ALGORITHM-V1.mjs`: katalog, öneri motoru ve tarif detayları.
- `SOFRA-API-SERVER.mjs`: API serializer ve miktar/birim modeli.
- `SOFRA-API-V1.openapi.yaml`: API sözleşmesi.
- `SOFRA-YEMEK-COM-AUDIT.md`: yemek.com karşılaştırması ve P0/P1/P2 listesi.
- `SOFRA-PRODUCT-ROADMAP.md`: karar günlüğü.
- `SOFRA-RUNTIME-QA-LOG.md`: canlı QA kayıtları.
- `SOFRA-TASARIM-PAKETI-v43.zip`: arkadaşına/başka geliştiriciye gönderilecek paket.

## Son veri modeli ilerlemesi

Tarif detay API'si `?servings=N` parametresini destekliyor. `ingredients_detail` miktarlari istenen porsiyona gore olcekleniyor; yanitta `base_servings` ve `scale_factor` hesap izlenebilirligini koruyor. Kesirli adetler ve gecersiz porsiyon girdileri testli.

Arama v1.39'da API ve iki frontend ayni temel es anlamli arama kararini kullaniyor. `pasta mantar` ve `tomato potato` tarayici turunda dogrulandi; statik frontend icin redirect katmani, API icin `matchesRecipeSearch` bulunuyor.

Tarif adim medyasi v1.40'da ayni tarif icindeki tekrarlar kaldirildi. Renkli sebze bowl modalinda 3 benzersiz görsel URL'si tarayici testinde görüldü; üretimde kullanılacak lisanslı kaynak seçimi yine açık P0 maddesidir.

Safety v1.41'de tarif detay API'si `ingredient_safety` ile malzeme bazli aday alerjenleri donuyor. `candidate` ve `unmapped` durumlari bilinmeyen veriyi guvenli varsaymiyor; her kayitta etiket kontrolu ve capraz bulas belirsizligi korunuyor.

Fit v1.42'de `POST /v1/recommendations` yanitina `recipe_detail` eklendi. Fit hedefi, secilen tarif, istenen porsiyon, olculu malzemeler ve malzeme guvenlik notlari artik ayni backend cevabinda bulunuyor.

Plan v1.43'te `custom_meals` ile katalog disi ogun ekleme destekleniyor. Serbest ogun baslik/not olarak saklaniyor, malzeme veya alisveris urunu varsayilmiyor; kullanici daha sonra isterse tarifi ayri katalog kaydi olarak eklemeli.

## Besin provenance ve gram donusumu v1.45

- `buildNutritionFromIngredients()` g/kg dogrudan, adet/dilim/paket gibi olculeri yalnizca kaynakli `grams_per_unit` ile hesaplar.
- Tum malzemeler icin kaynak kaydi, lisans ve gram kapsami yoksa sonuc `unverified` ve `nutrition=null` kalir.
- Tarif ve Fit onerisi API'lerinde `nutrition_provenance` alaninda kaynak kayitlari, porsiyon gramaji ve donusum izleri tasinir.
- Mevcut katalog gercek kaynak kayitlariyla bagli olmadigi icin hala kcal/makro iddiasi yayinlamiyor.

## Health adapter runtime durumu v1.44

- `/v1/health/adapter-status?provider=apple_healthkit|health_connect` ortak provider durumunu verir.
- Varsayilan durumda `not_connected`, `read_only`, `write_permissions=[]` ve `manual_fallback_available=true` korunur.
- Kismi izinlerde yalnizca `granted` metrikler Fit baglamina girebilir; canli baglanti yokken degerler `null` kalir.
- Fit modalinda iOS/Android provider, kismi izin ve manuel devam akisi tarayicida test edildi.

## Logo durumu

Kullanıcının gönderdiği yeni yer sofrası logosu seçildi. Arka planı transparan PNG olarak `outputs/sofra-logo-v1.png` dosyasına alındı ve ana uygulamanın üst başlığına uygulanıyor. Eski logo v4 sayfası yalnızca karşılaştırma geçmişidir.

## Git notu

Her anlamlı değişiklikten sonra kök dosyalarla `SOFRA-TASARIM-PAKETI-v43` klasörünü senkronlayıp zip'i yeniden oluştur. Commit öncesi CI ve release testlerini çalıştır. Logo seçilmeden ana uygulamadaki logo çizimini değiştirme.

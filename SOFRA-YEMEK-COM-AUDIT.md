# Sofra × yemek.com ürün incelemesi

16 Ekim 2026 tarihinde gönderilen 17 ekran, özellik kopyalamak için değil; hangi kullanıcı beklentilerinin oluştuğunu anlamak için incelendi.

## Onlarda güçlü olan taraflar

- Arama sonucu yalnızca kart listesi değil: sonuç sayısı, arama önerisi, kategori ve video filtreleri var.
- `Evdeki malzemelerle ara` ayrı bir akış; istenen ve istenmeyen malzemeler birlikte tanımlanabiliyor.
- Tarif kartı gerçek fotoğraf, süre, beğeni/kaydetme ve üretici bilgisiyle hızlı taranıyor.
- Tarif detayı katmanlı: porsiyon ve süre, malzemeler/ölçüler, besin özeti, püf noktası, adım adım içerik, yanına ne gider, yorumlar ve paylaşım.
- Profil, tarif listesi ve paylaşılan tarifler ayrı yüzeyler olarak düşünülmüş.
- Asistan Şef, tarif adımlarını sesli dinleme ve tarif içinde ilerleme fikrini görünür yapıyor.

## Sofra'ya alınanlar

- Ana sayfada büyük tek hero yerine yatay `Bugünün seçimi` tarif şeridi (`v1.33`).
- Tarifler ekranında kompakt `Kategoriler`, `Video` ve `Dolabımdan bul` araçları (`v1.32`).
- Malzeme araması: tarif adı veya malzeme adıyla eşleşme, sonuç sayısı ve dolapta olan/olmayan bağlamı.
- İstenen ve istenmeyen malzemelerle dolap odaklı arama; dolap boşsa genel öneri fallback'i.
- Tarif kartında cihazda kaydetme; tarif modalında paylaşma aksiyonu.
- Tarif modalında Asistan Şef, sonraki adım ve kaldığın yerden devam.
- Miktar/birim düzenleme, alerji/çölyak sınırı, Fit hedefi ve HealthKit/Health Connect sınırı korunuyor.
- Logo için yaprak yerine küçük, kodla çizilmiş sofra/masa işareti denemesi (`v1.34`).

## Bilerek alınmayanlar

- Pembe ağırlıklı yemek.com görsel dili Sofra'ya taşınmadı; Sofra'nın adaçayı, krem ve kil renkleri korunuyor.
- Reklam alanları ve reklam kaynaklı içerik akışı prototipe eklenmedi.
- Sosyal akış, takipçi sayıları ve üretici ekonomisi ilk ürüne zorla eklenmedi; tarif kaynağı/üretici modeli daha sonra ayrı tasarlanacak.
- Fit'e antrenman ekranı eklenmedi; Fit'in işi hedefe uygun daha hafif veya daha kalorili tarifleri önermek.
- Doğrulanmamış kcal, sağlık veya besin iddiası gösterilmedi.

## Kalan kritik işler

### P0 — Tarif ürününün güvenilir temeli

1. Gerçek tarif veri modeli: porsiyon ölçekleme, gram/adet dönüşümü, kcal ve makro alanları.
2. Tarif adımlarına gerçek görsel/video bağlama; mevcut demo fotoğrafı tekrar kullanmamalı.
3. Alerjen ve çölyak etiketlerinin tarif malzemeleriyle doğrulanması.
4. Arama sonuçlarının gerçek veri kaynağına bağlanması; yazım hatası, eş anlamlı ve Türkçe karakter normalizasyonu.

### P1 — yemek.com seviyesine yaklaşan deneyim

1. Kaydedilen tarifler ekranı ve “kaldığın yerden devam et” listesi.
2. Tarif detayında porsiyon seçici, besin özeti, püf noktası ve “yanına ne gider”.
3. Kategori veri modeli ve gerçek video içerik tipi.
4. Kullanıcı hesabı, cihazlar arası senkron ve paylaşılabilir tarif bağlantısı.

### P2 — büyüme ve gelir

1. Onaylı üretici/şef profili ve tarif kaynağı.
2. Market sepeti: eksik ürün, market bazında güncel fiyat, teslimat/alt limit ve açık partner etiketi.
3. Sponsorlu içerik ile organik önerinin ayrılması; Fit ve sağlık verisinin reklam sıralamasına girmemesi.

Bu dosya karar günlüğüdür; canlı bağlantı, gerçek sağlık izni, market fiyatı veya sosyal hesap entegrasyonu tamamlandı anlamına gelmez.
- Profil icinde cihazda kaydedilen tarifleri listeleme, kaldigin adimi gosterme ve kayittan cikarma eklendi.
- Tarif detayinda porsiyon secici, miktar olcekleme ve "yanina ne gider" karti eklendi; dogrulanmamis besin degeri bilincli olarak gosterilmiyor.
- Tarif detayinda alerjen etiketi, metadata dogrulama durumu ve gluten icin capraz bulas bilinmiyorsa acik uyari gosterimi eklendi; guvenli iddiasi uretilmiyor.
- v1.38 ile porsiyon olcekleme ve kesirli adet parse'i API sozlesmesine alindi; v1.39 ile es anlamli cok kelimeli arama API ve frontend'de test edildi. Gercek lisansli veri kaynagi ve dogrulanmis besin/alerjen icerigi hala P0 acigidir.
- v1.40 ile tarif adim medyasi ayni tarif icinde benzersiz varliklara ayrildi ve modalda tarayici testi yapildi; kaynak lisansi ve gercek tarif editoryal baglantisi hala P0 acigidir.
- v1.41 ile malzeme bazli aday alerjen ve etiket kontrolu alanlari API detayina eklendi; bu, uretici/recete kaynagi dogrulanana kadar guvenli iddiasi uretmez.
- v1.42 ile Fit onerisi secilen tarif detayina baglandi; dogrulanmis besin verisi olmadigi durumda kcal/makro iddiasi yine yayinlanmiyor.
- v1.43 ile Planim'da custom meal ekleme ve custom-only plan desteklendi; serbest metin otomatik malzeme veya alisveris adayi sayilmiyor.

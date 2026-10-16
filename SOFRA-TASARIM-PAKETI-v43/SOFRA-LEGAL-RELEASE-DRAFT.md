# Sofra - Hukuk ve izin metinleri yayın taslağı

Durum: Taslak. Bu belge hukuki danışmanlık değildir ve yayın öncesi hukuk/gizlilik incelemesinin yerini tutmaz.

## Yayın öncesi hazırlanacak metinler

- Gizlilik politikası: hangi verinin neden işlendiği, saklama süresi, sağlayıcılar, aktarım ülkeleri ve kullanıcı hakları.
- Kullanım koşulları: hizmetin kapsamı, hesap sorumluluğu, tarif ve sağlık bilgilerinin tıbbi tavsiye olmadığı, market ve sponsorlu içerik sınırları.
- Çerez ve yerel depolama bildirimi: LocalStorage/cihaz verisi, zorunlu ve isteğe bağlı saklama alanları, temizleme ve dışa aktarma yolu.
- İzin açıklamaları: bildirim, kamera/OCR, mikrofon, Apple HealthKit ve Android Health Connect için amaç, veri türü, reddetme ve sonradan kapatma yolu.

## Ürün veri matrisi

| Veri | Amaç | Varsayılan | Kullanıcı kontrolü |
|---|---|---|---|
| Dolap ve plan | Tarif, menü ve alışveriş önerisi | Cihazda / hesap yoksa yerel | Düzenle, dışa aktar, sil |
| Fit profili | Yaklaşık hedef ve tarif kişiselleştirme | İsteğe bağlı | Düzenle, sil |
| Sağlık özeti | Kullanıcı izin verirse Fit bağlamı | İsteğe bağlı | Veri türü bazında izin, geri çekme |
| Bildirim tercihleri | Öğün, SKT ve plan hatırlatması | Kapalı | Kanal bazında aç/kapat |
| Market adayları | Kullanıcı onayından sonra teklif karşılaştırması | Onay bekler | Adayı çıkar, göndermeyi iptal et |
| Sağlık/Fit verisi | Market, sponsor ve reklam sıralamasına girmez | Aktarılmaz | Teknik olarak payload dışında tutulur |

## Yayın kapıları

Yayın öncesi aşağıdakiler doğrulanmadan “bağlandı”, “güvenli”, “en ucuz” veya kesin kalori/sağlık iddiası gösterilmez:

1. Gerçek sağlayıcı, saklama ve silme akışlarının hukuk incelemesi.
2. Apple/Google izin ekranlarının veri türü ve amaç metinleriyle eşleşmesi.
3. Market ve reklam sağlayıcılarıyla veri işleme sözleşmelerinin incelenmesi.
4. Reşit olmayan kullanıcı/çocuk tarifleri için yaş ve güvenlik metinlerinin belirlenmesi.
5. Alerji, çölyak ve çapraz bulaş uyarılarının tıbbi güvence gibi sunulmadığının doğrulanması.

## Prototip sınırı

Mevcut prototipte gerçek OAuth, HealthKit, Health Connect, bildirim sistem izni ve market bağlantısı açık değildir. Kullanıcıya bu sınır açıkça gösterilmeli; demo metinleri gerçek entegrasyon tamamlanmadan kaldırılmamalıdır.


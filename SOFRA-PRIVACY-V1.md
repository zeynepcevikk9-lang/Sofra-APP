# Sofra — Veri ve gizlilik sınırı V1

Bu belge prototipte kullanıcıya anlatılan veri sınırını tanımlar; hukuki gizlilik politikasının yerine geçmez.

## Prototip davranışı

- Dolap, plan, Fit profili, tema, hatırlatıcı ve öneri geri bildirimi verileri cihazdaki LocalStorage alanında tutulur.
- Profildeki dışa aktarma yalnızca Sofra’nın bu cihazda tuttuğu verileri JSON olarak verir.
- “Sofra verilerini temizle” yalnızca bu prototipin tanıdığı anahtarları siler; başka uygulamaların verilerine dokunmaz.
- Apple Health / Health Connect gerçek bağlantısı henüz açık değildir. İzin verilse bile sağlık verisi marketlere, markalara veya reklama aktarılmaz.
- Market örneğinde yalnızca kullanıcının onayladığı alışveriş adayları dikkate alınır; sağlık, kilo, kalori ve Fit hedefleri market payload’ına girmez.
- Google ve Apple hesabı prototipte bağlı değildir; kullanıcı hesabı oluşturulmuş gibi gösterilmez.
- Gerçek üründe hesap, senkronizasyon, HealthKit/Health Connect, market ve bildirim izinleri ayrı açık onaylarla uygulanmalıdır.

## Yayın öncesi gereklilik

## Paylaşım önizleme sınırı

- POST /v1/share/preview yalnızca public tarif/plan projection'ı üretir.
- Senkron hazırlığı yalnızca açık sync onayıyla pantry, plan ve geri bildirim projection'ı üretir; buluta yazma ve cihazlar arası aktarım hesap bağlanana kadar kapalıdır.
- Dolap, Fit profili, sağlık özeti, market verisi, geri bildirim ve hesap kimliği paylaşım payload'ına girmez.
- Önizleme kalıcı link oluşturmaz ve veri saklamaz; gerçek link hesap, süre ve geri alma sınırları tanımlanmadan açılmaz.

Bu metin ürün sınırıdır. Gerçek yayından önce hukuki gizlilik politikası, kullanım koşulları, veri saklama süresi, sağlayıcı listesi ve kullanıcı hakları ayrıca hazırlanıp incelenmelidir.

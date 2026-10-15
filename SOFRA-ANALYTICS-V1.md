# Sofra — Gizlilik öncelikli analitik sınırı v1

Bu sürümde gerçek bir analitik sağlayıcıya veri gönderilmez. Ama ileride bir sağlayıcı bağlanırken ürün kararları kaybolmasın diye yalnızca izin verilen olaylar ve alanlar `SOFRA-ANALYTICS-V1.mjs` içinde tanımlıdır.

İzin verilen olaylar:

- `screen_view`: yalnızca ekran adı
- `mode_selected`: `sofra`, `fit` veya `tatli`
- `recipe_open`: katalog tarif kimliği
- `recommendation_feedback`: `helpful` veya `not_helpful`
- `market_sort_selected`: `total`, `fast` veya `single`
- `notification_preference_changed`: açık/kapalı boolean
- `theme_changed`: `acik` veya `gece`
- `health_connection_cta_viewed`: alan taşımayan, yalnızca buton görüntülenme olayı

Sağlık ölçümleri, kilo/boy/yaş/cinsiyet, kalori ve makrolar, alerji/çölyak, serbest metin, dolap notu, iletişim bilgileri, hesap kimliği ve erişim belirteçleri analitik olaylarına giremez. Fit ekranının görüntülendiği bilgisi ürün kullanım metriği olarak tutulabilir; kullanıcının sağlık değerleri tutulamaz.

Bu sınır; izin, gizlilik politikası, saklama süresi ve kullanıcı silme/export akışları tamamlanmadan üçüncü taraf analitik SDK’sı bağlanmaması gerektiğini de açıkça belirtir.


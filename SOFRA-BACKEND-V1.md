# Sofra — Backend ve Veri Sözleşmesi V1

Bu belge, prototipteki LocalStorage akışının gerçek backend’e taşınırken korunması gereken ürün davranışını tanımlar. İlk backend sürümü, gerçek AI veya market entegrasyonundan önce güvenilir kayıt ve öneri altyapısını kurmalıdır.

Makine tarafından okunabilir endpoint ve veri şeması: `SOFRA-API-V1.openapi.yaml`. Bu dosya, gerçek sunucu adresi veya kimlik doğrulama sağlayıcısı seçilmeden sözleşmeyi teknoloji bağımsız biçimde sabitler.

Bağımlılıksız sözleşme smoke testi: `node SOFRA-API-CONTRACT-TEST.mjs`. Test, gerçek kullanıcı veya market verisi kullanmaz; dolap CRUD, SKT önceliği, Fit filtresi, plan/alışveriş adayları ve kullanıcı onayı olmadan market teklifi alınamamasını doğrular. Test, ortak `SOFRA-ALGORITHM-V1.mjs` motorunu kullanır.

Çalışan, bağımlılıksız referans HTTP iskeleti: `node SOFRA-API-SERVER.mjs` (varsayılan `127.0.0.1:8787`). Varsayılan çalışma bellektedir; geliştirme ortamında `SOFRA_STORE_PATH=./data/sofra-state.json node SOFRA-API-SERVER.mjs` ile atomik JSON store adapter’ı kullanılabilir. Bu adapter üretim veritabanı veya gerçek kimlik doğrulama yerine geçmez; mobil/backend stack seçilene kadar endpoint davranışını ve yeniden başlatma kalıcılığını doğrulamak içindir. HTTP testi: `node SOFRA-API-SERVER-TEST.mjs`; store testi: `node SOFRA-STORE-CONTRACT-TEST.mjs`.

Referans sunucu, dolap güncellemesinde yalnızca sözleşmenin izin verdiği miktar, stok durumu ve son kullanma tarihi alanlarını kabul eder; `id`, `user_id` ve benzeri korumalı alanlar değiştirilemez. Stok durumu, kaynak, tarih, miktar, öneri modu ve Planım görünümü için geçersiz girdiler 422 ile reddedilir.

## 1. Temel ilkeler

- Kullanıcının eklemediği ürün `yok` değildir; stok durumu `unknown` olarak kalır.
- Miktar bilinmiyorsa `quantity_text` boş bırakılmaz; kullanıcı metni aynen korunur ve miktar uydurulmaz.
- Son kullanma tarihi ürün bazında ve isteğe bağlıdır: `expiry_date: null` geçerli bir durumdur.
- Fit/sağlık verisi normal Sofra önerilerinden ayrı bir izin ve veri alanında tutulur.
- Sponsorlu içerik, doğal öneri skorunu gizlice değiştiremez.
- Her öneri, kullanıcıya gösterilebilecek açıklama sinyalleriyle birlikte saklanır.

## 2. Ana varlıklar

### User

```json
{
  "id": "usr_123",
  "auth_provider": "google|apple|anonymous",
  "locale": "tr-TR",
  "created_at": "2026-10-14T12:00:00Z"
}
```

Anonim kullanıcı, hesap bağlayana kadar cihazdaki verisini kullanabilir. Sağlık ve ödeme bilgisi bu temel kullanıcı kaydına yazılmaz.

### PantryItem

```json
{
  "id": "pantry_123",
  "user_id": "usr_123",
  "canonical_name": "yumurta",
  "display_name": "Yumurta",
  "quantity_text": "6 adet",
  "quantity_value": 6,
  "quantity_unit": "adet",
  "stock_state": "available|low|finished|unknown",
  "expiry_date": null,
  "source": "manual|natural_note|receipt_ocr|voice",
  "confidence": 0.98,
  "updated_at": "2026-10-14T12:00:00Z"
}
```

`expiry_date` zorunlu değildir. `source` ve `confidence`, AI/OCR sonucunun kullanıcı onayıyla mı kaydedildiğini izlemek için tutulur. `confidence` düşükse kayıt otomatik kesinleştirilmez.

### Recipe

```json
{
  "id": "recipe_123",
  "title": "Fırında sebzeli tabak",
  "ingredients": [
    {"canonical_name": "patates", "quantity": 2, "unit": "adet"}
  ],
  "duration_minutes": 35,
  "tags": ["sofra", "pratik"],
  "fit_verification": "verified|unverified",
  "nutrition": null,
  "seasonality": ["sonbahar"]
}
```

Kesin kalori ve makro yalnızca `fit_verification: verified` olan tariflerde gösterilir.

### Recommendation

```json
{
  "recipe_id": "recipe_123",
  "mode": "sofra|fit|tatli",
  "matched_ingredients": ["patates", "peynir"],
  "missing_ingredients": ["soğan"],
  "time_fit": true,
  "expiry_boost": true,
  "reason_code": "inventory_match|expiry_priority|fit_goal|general",
  "score_version": "deterministic-v1.2",
  "fit_goal_boost": 20
}
```

## 3. API yüzeyi

İlk sürümde JSON REST veya eşdeğer bir RPC katmanı kullanılabilir. İsimler davranışı anlatmak içindir.

| Method | Endpoint | Amaç |
|---|---|---|
| `GET` | `/v1/me` | Kullanıcı ve izin özeti |
| `GET` | `/v1/auth/status` | Anonim oturum ve Google/Apple hesap bağlama durumunu getirir |
| `GET` | `/v1/notifications/status` | iOS, Android veya web bildirim izin planını ve kanallarını getirir |
| `GET` | `/v1/billing/status` | Ücretsiz plan, Sofra Plus ve checkout sınırını getirir |
| `GET` | `/v1/me/export` | Sofra verilerinin makine okunabilir dışa aktarımı |
| `DELETE` | `/v1/me/data` | Sofra’ya ait dolap, plan ve geri bildirim verilerini siler |
| `GET` | `/v1/pantry` | Dolap kayıtlarını getirir |
| `POST` | `/v1/pantry/parse-note` | Doğal cümleyi ürün/miktar/durum önizlemesine çevirir; kayıt yapmaz |
| `POST` | `/v1/pantry/items` | Kullanıcı onaylı ürün ekler |
| `POST` | `/v1/pantry/items/bulk` | Kullanıcı onaylı doğal not ürünlerini atomik toplu kaydeder |
| `PATCH` | `/v1/pantry/items/:id` | Miktar, durum veya tarihi günceller |
| `DELETE` | `/v1/pantry/items/:id` | Ürünü kaldırır |
| `POST` | `/v1/recommendations` | Mod, süre ve dolapla öneri üretir |
| `GET` | `/v1/recipes` | Sofra/Fit/Tatlı moduna, aramaya ve süreye göre tarif kataloğunu listeler |
| `POST` | `/v1/recommendations/:id/feedback` | `helpful` veya `not_helpful` kaydeder |
| `GET` | `/v1/plans` | Hafta, ay ve geçmiş planları getirir |
| `POST` | `/v1/plans` | Menü/sofrayı plana ekler |
| `GET` | `/v1/shopping/candidates` | Planlardan alışveriş adayları çıkarır |
| `POST` | `/v1/market/quotes` | Onaylanmış liste için market tekliflerini ister |

Plan oluşturma isteği yalnızca sözleşmedeki `date`, `servings`, `main_recipe_id` ve isteğe bağlı `optional_recipe_ids` alanlarını kabul eder. Tarih ISO gün formatında, kişi sayısı en az 1 ve tüm tarif kimlikleri katalogda kayıtlı olmalıdır; aynı isteğe bağlı tarif iki kez eklenemez.

`/v1/pantry/items/bulk` isteği 1–50 ürünü kabul eder. Tüm ürünler doğrulanmadan hiçbir kayıt yazılmaz; bir ürün geçersizse istek bütünüyle `422` döner. Bu sınır, doğal not önizlemesinden sonra kullanıcı onayının tek atomik işlemle uygulanmasını sağlar.

## 4. Öneri isteği ve güvenli yanıt

```json
{
  "mode": "sofra",
  "max_minutes": 30,
  "servings": 4,
  "pantry_item_ids": ["pantry_123"],
  "fit_profile_id": null,
  "health_summary": null,
  "safety_profile": { "selected": ["gluten"], "schemaVersion": 1 },
  "fit_profile": { "gender": "Kadın", "age": 30, "heightCm": 165, "weightKg": 60, "activityFactor": 1.375, "goalKey": "lose" }
}
```

Sunucu, kullanıcının göndermediği ürünleri dolapta var saymaz. Eksik ürünler öneriyi tamamen engellemez; yanıt `missing_ingredients` ile açıklanır.

`pantry_item_ids` gönderilmişse öneri yalnızca bu kimliklerle seçilen dolap kayıtlarını kullanır. Yabancı kimlikler, tanımsız alanlar ve geçersiz `fit_profile_id` değerleri doğrulama hatasıyla reddedilir.

`health_summary` yalnızca Fit önerisinde isteğe bağlı normalize edilmiş bağlam olarak kabul edilir. Geçersiz veya izin verilmeyen metrikler `null` olur; bu sürüm sağlık verisini kalori telafisi, tıbbi öneri veya market kişiselleştirmesi için kullanmaz.

`fit_profile` gönderilirse `SOFRA-FIT-V1.mjs` yaş, boy, kilo, cinsiyet, hareket ve hedef alanlarını normalize eder. Hazır profil için öneri yanıtında `fit_target` bulunur; hedef yaklaşık hesap olarak etiketlenir ve tıbbi tavsiye yerine geçmez. Eksik profil kalori veya protein hedefini `null` bırakır.

`safety_profile` kullanıcının alerji, intolerans veya çölyak tercihleridir. Seçim varsa yalnızca yapılandırılmış alerjen metadata’sı doğrulanmış tarifler uygun sayılır; çölyak seçiminde çapraz bulaş bilgisi `controlled` değilse tarif `review_required` olarak engellenir. Sistem eksik içeriği güvenli kabul etmez ve bu alan tıbbi onay yerine geçmez.

Öneri yanıtı `fit_verification: unverified` ve `nutrition: null` döndürür; gerçek besin kaynağı ve porsiyon doğrulaması eklenmeden tarif kalorisi veya makrosu kesin sayı olarak yayınlanmaz.

## 5. Fit ve sağlık sınırı

- Sağlık sağlayıcısı bağlantıları ayrı bir `health_connections` alanında tutulur.
- Apple HealthKit ve Health Connect token/izin kapsamı backend’e ham sağlık geçmişi olarak yazılmaz; yalnızca izin verilen ve gerekli özetler işlenir.
- Sağlık verisi market, marka, sponsorlu içerik veya reklam olaylarına aktarılmaz.
- Kullanıcı bağlantıyı kesince yeni öneriler sağlık girdisi olmadan devam eder.

## 6. Market sınırı

- Market teklifleri, kullanıcı alışveriş listesini açıkça onayladıktan sonra istenir.
- Teklif isteği boş veya tekrarlı aday kimliklerini kabul etmez; aday listesi doğrulanmadan sağlayıcıya iletilmez.
- Her teklif `quoted_at`, teslimat ücreti, minimum sepet ve stok durumunu taşır.
- Eksik koşullarda “En ucuz” yerine “Tahmini toplam” gösterilir.
- Sipariş veya dış market yönlendirmesi öncesi komisyon/iş birliği bilgisi kullanıcıya gösterilir.

## 7. Geçiş sırası

1. Anonymous kullanıcı + PantryItem CRUD
2. Tarif kataloğu ve deterministik recommendation endpoint’i
3. Plan ve alışveriş adayları
4. Geri bildirim olayları ve açıklanabilir ağırlıklandırma
5. Apple HealthKit / Health Connect izinli özetleri
6. Market quote adapter’ları
7. Google/Apple hesap bağlama, silme ve dışa aktarma

`/v1/me/export` ve `/v1/me/data` referans sunucuda veri taşınabilirliği ve silme davranışını prova eder. Gerçek üründe bu endpoint’ler kimlik doğrulama, yeniden doğrulama, açık kullanıcı onayı, audit kaydı ve geri döndürülemez silme politikasıyla korunmalıdır.

Gerçek AI çözümleme, fiş OCR, canlı fiyat ve ödeme bu temel kayıt/izin davranışı doğrulanmadan etkinleştirilmez.

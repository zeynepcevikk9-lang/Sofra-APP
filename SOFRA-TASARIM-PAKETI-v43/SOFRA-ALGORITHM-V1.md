# Sofra — Öneri Motoru v1

Bu sürüm gerçek AI değildir. Backend kurulana kadar ürün kararlarının tarayıcıda tutarlı ve test edilebilir biçimde uygulanması için deterministik bir temel sağlar.

## Girdi

- Seçili mod: `sofra`, `fit` veya `tatli`
- Dolap ürünleri: ad, miktar/not, durum (`var`, `az`, `yok`)
- İsteğe bağlı son kullanma tarihi: ürün kaydının beşinci alanı
- Tarif: malzemeler, süre, etiketler ve Fit uygunluğu

## Puanlama

| Sinyal | Etki |
|---|---:|
| Eşleşen her malzeme | +28 |
| Durumu `az` olan eşleşme | +8 |
| Tarihe 3 gün veya daha az kalması | +16 |
| Tarihe 7 gün veya daha az kalması | +8 |
| Fit modunda Fit tarifi | +42 |
| Tatlı modunda tatlı tarifi | +55 |
| Sofra modunda ana yemek etiketi | +12 |
| Süre sınırına uyan tarif | +18 |
| Eşleşmeyen tarif malzemesi | -2 |
| Daha önce görülen tarif | -8 / tekrar, en fazla -18 |
| Benzer tarifte açık olumlu/olumsuz geri bildirim | ±2 / ortak etiket, en fazla ±6 |

Son kullanma tarihi zorunlu değildir. Tarih yoksa ürün normal stok sinyaliyle değerlendirilir; tarih girilmedi diye ürün yok sayılmaz.

## Güvenlik ve ürün ilkeleri

- Kullanıcının eklemediği ürün otomatik olarak yok kabul edilmez.
- `Bitti` ürün aktif eşleşme sayılmaz.
- Bilinmeyen miktar aynen korunur; sistem miktar uydurmaz.
- Öneri sonucu “kesin sende var” diye gösterilmez; “uyumlu” veya “tamamlamak için gerekebilir” dili kullanılır.
- Gerçek AI çözümlemesi ve besin doğrulaması backend aşamasında ayrıca yapılacak.

## Mevcut kullanım

`outputs/sofra-motoru-home-v43.html` içindeki `sofraEngineV38` katmanı:

- Ana sayfadaki kişisel öneriyi sıralar.
- `Dolabımdan` tarif filtresini puanlı sonuçlarla doldurur.
- Sofra Fit moduna geçince Fit uyumlu tarifleri öne alır.
- İleride backend’e taşınabilecek `catalog`, `recommend` ve `activeInventory` ayrımını korur.

## Öğrenme sinyali v1.1

Kullanıcının açık “İşe yaradı / Başka fikir” seçimi, aynı tarifi doğrudan `learning_boost` ile etkiler. Ayrıca aynı etiketleri taşıyan diğer tariflere sınırlı `preference_boost` yansır. Yakın zamanda gösterilen tarif kimlikleri `recent_recipe_ids` ile gönderilirse aynı tarif tekrarını azaltan `repeat_penalty` uygulanır. Bu sinyaller açıklanabilir, sınırlı ve silinebilir tutulur; sağlık, kimlik veya market davranışı öğrenme girdisine katılmaz.

API yanıtı bu iki yeni sinyali `preference_boost` ve `repeat_penalty` alanlarıyla açıkça döndürür. Skor sürümü `deterministic-v1.1` olarak işaretlenir.

## Sonraki adım

Bu motor gerçek tarif veri tabanına, besin veri kaynağına ve kullanıcı geçmişine bağlanacak. API katmanında Apple Health verisi yalnızca Fit bağlamı olarak normalize edilir; V1 deterministik motoru bunu normal Sofra akışına taşımaz veya kalori telafisi olarak kullanmaz. Besin doğrulaması ve ürün kararı hazır olduğunda Fit’e özel ek sinyaller ayrı bir skor sürümüyle tanımlanmalıdır.

Model ve geri bildirim sınırları için `SOFRA-AI-V1.md` dosyasındaki veri sözleşmesi kullanılacak. Prototipteki puanlar açıklanabilir kalacak; gerçek model devreye alınsa bile kullanıcıya neden önerildiği gösterilmeye devam edecek.

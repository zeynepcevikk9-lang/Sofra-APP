# Sofra — AI ve Öğrenme Sınırı V1

Sofra’da “AI” yalnızca gizemli bir sonuç üretmek anlamına gelmez. İlk aşamada deterministik öneri motoru güvenilir bir temel oluşturur; gerçek model ancak veri kalitesi, izinler ve geri bildirim sözleşmesi hazır olduğunda eklenir.

Kod tarafındaki `SOFRA-AI-V1.mjs`, gelecekteki model sağlayıcısı için güvenli sınırdır. İstek `auto_save: false` ve `user_confirmation_required: true` olarak kurulur; model cevabı `known_item_required` kontrolünden geçmeyen ürünü dolaba yazamaz. Canlı sağlayıcı bağlı değilken `/v1/ai/status` deterministik fallback durumunu ve görev bazındaki hazır olma durumunu açıkça bildirir.

## AI’nin ilk görevleri

1. Kullanıcının doğal cümlesini malzeme kaydına ayırmak: “6 yumurta aldım, peynir azaldı”.
2. Tarif malzemelerini kanonik ada, birime ve miktara dönüştürmek.
3. Dolap, süre, mod ve tercih sinyallerine göre tarifleri sıralamak.
4. Önerinin nedenini kısa ve anlaşılır biçimde açıklamak.

AI sonucu hiçbir zaman kullanıcının söylemediği bir ürünü kesin stok, alerji bilgisi veya besin değeri olarak uydurmaz.

## Öneri açıklaması

Her öneri backend’de şu sinyallerle birlikte tutulabilir:

```json
{
  "recipeId": "recipe_123",
  "mode": "sofra",
  "matchedIngredients": ["patates", "peynir"],
  "missingIngredients": ["soğan"],
  "timeFit": true,
  "fitVerified": false,
  "reasonCode": "inventory_match",
  "scoreVersion": "deterministic-v1.2",
  "fitGoalBoost": 20
}
```

Kullanıcıya gösterilecek dil bu veriden üretilir: “Dolabındaki 2 ürünle uyumlu · 1 ürün daha gerekebilir.”

## Geri bildirim sözleşmesi

Kullanıcı her öneri için zorunlu olmayan tek dokunuşlu geri bildirim verebilir:

```json
{
  "event": "recommendation_feedback",
  "recipeId": "recipe_123",
  "value": "helpful",
  "mode": "sofra",
  "source": "home_smart_card",
  "createdAt": "2026-10-14T12:00:00Z"
}
```

İzin verilmeden sağlık, kilo, ses kaydı veya market davranışı bu olaya eklenmez. Geri bildirim silinebilir ve kullanıcıyı profilinden tanımlayan ham veri yerine uygulama içi anonim bir kimlik kullanılır.

### Prototipteki ilk adım

v43 prototipinde ana öneri kartına iki küçük seçenek eklendi: “İşe yaradı” ve “Başka fikir”. Seçim, sağlık veya kimlik verisi eklenmeden yalnızca cihazdaki `sofraFeedbackV1` LocalStorage kaydına yazılır ve sonraki yerel öneri sıralamasına yansır. Referans API’de bu olaylar tarif kimliğine göre sınırlı bir `learning_boost` sinyaline dönüşür: olumlu ve olumsuz geri bildirimler sırasıyla `+6`/`-6` etkilerle, toplamda `-12..+12` aralığında tutulur. Gerçek ürün bu sinyali daha geniş model eğitimi yerine önce açıklanabilir, silinebilir ve anonim bir kişiselleştirme girdisi olarak kullanmalıdır.

Dolap notu girişinde de güvenli bir deterministik önizleme bulunur: “6 yumurta aldım, peynir azaldı, süt bitti” gibi temel cümlelerde bilinen ürün, miktar ve durum ayrıştırılır; kullanıcı onaylamadan dolaba yazılmaz. Tanınmayan cümleler ürün uydurulmadan not olarak saklanabilir. Bu katman gerçek model değildir ve düşük güvenli sonuçları kesin stok olarak göstermemelidir.

`POST /v1/pantry/parse-note` yanıtı da `parser: deterministic_fallback`, `ai_status: not_connected`, `requires_user_confirmation: true` ve `auto_saved: false` alanlarını taşır. Böylece arayüz, model bağlı değilken canlı AI kullanıyormuş gibi davranmaz.

Fit öneri API’si Apple HealthKit veya Health Connect’ten gelen normalize edilmiş `health_summary` bağlamını kabul edebilir. V1’de bu bağlam yalnızca izinli veri sınırını ve güncelliği taşır; kalori yakımından “daha fazla ye” sonucu çıkarmaz, market/sponsor akışına aktarılmaz ve besin verisi doğrulanmadan tarif kalorisi üretmez.

Fit profili hedefi (`balanced`, `lose`, `gain`) öneri sıralamasında ayrı ve açıklanabilir bir `fit_goal_boost` sinyalidir. Bu sinyal tarifin hedefe uygun metadata’sından gelir; tek başına tıbbi veya kesin kalori iddiası değildir.

## Öğrenme sırası

### Aşama 0 — deterministik temel

- v38’den beri puanlama kuralları sabit ve test edilebilir.
- Boş dolap, kısmi dolap ve Fit/Sofra/Tatlı modları ayrı davranır.
- Kullanıcıya öneri nedeni gösterilir.

### Aşama 1 — güvenli kişiselleştirme

- Kullanıcının açık geri bildirimi ağırlıklandırılır.
- Aynı tarifi tekrar tekrar göstermeme ve süre/tercih sinyalleri eklenir.
- Sağlık verisi yalnızca Fit modunda ve izin kapsamıyla kullanılır.

### Aşama 2 — model destekli çözümleme

- Ses/fiş/natural language girdisi yapılandırılmış malzeme kaydına çevrilir.
- Düşük güvenli çözümlemeler kullanıcı onayına bırakılır.
- Model çıktısı kanonik ürün ve miktar doğrulamasından geçmeden dolaba yazılmaz.

## Yasaklar ve kalite kapıları

- Öneri motoru alerji veya tıbbi uygunluk garantisi vermez.
- Model, kullanıcı eklemediği ürünü dolapta var saymaz.
- Sponsorlu içerik, doğal puanı gizlice değiştiremez.
- Model cevabı kaynağı doğrulanmamış kalori veya sağlık iddiasını kesinleştiremez.
- Üretime geçişte düşük güvenli malzeme çözümlemeleri için insan/onay akışı bulunur.

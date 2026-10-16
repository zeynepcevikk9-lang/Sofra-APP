# Sofra — Market ve Fiyat Karşılaştırması V1

Bu belge, Sofra’nın alışveriş listesi ve ilerideki market yönlendirmesinin ürün kurallarını tanımlar. Amaç, kullanıcı eklemediği bir ürünü kesin eksik saymamak ve fiyat karşılaştırmasını eksik bilgiyle “en ucuz” diye sunmamaktır.

Teknoloji bağımsız teklif kuralları: `SOFRA-MARKET-V1.mjs`. Sözleşme testi: `node SOFRA-MARKET-CONTRACT-TEST.mjs`.

## Aşamalar

### Aşama 1 — marketten bağımsız liste

- Planlanan menülerden alışverişe aday ürünler çıkarılır.
- Dolapta `var` görünen ürünler listeden düşürülür.
- Dolapta `azaldı` veya `bitti` görünen ürünler ayrı durum etiketiyle gösterilir.
- Kullanıcının hiç eklemediği ürünler `Kontrol et` olarak gösterilir; otomatik olarak kesin eksik sayılmaz.
- Liste kopyalanabilir. Kullanıcı listeyi kontrol etmeden dış markete yönlendirilmez.

v40 bu aşamanın prototipidir.

### Aşama 2 — tahmini market seçenekleri

Kullanıcı listeyi onayladıktan sonra her market için ürün eşleştirmesi yapılır. Gösterilecek veri:

```json
{
  "retailer": "Migros",
  "items": [{
    "canonicalIngredient": "yoğurt",
    "productName": "Süzme yoğurt 500 g",
    "quantity": 1,
    "unitPrice": 74.90,
    "matchedQuantity": "500 g",
    "inStock": true,
    "alternative": false
  }],
  "subtotal": 348.00,
  "deliveryFee": 29.90,
  "minimumBasket": 400.00,
  "estimatedTotal": 377.90,
  "deliveryEta": "35 dk",
  "updatedAt": "2026-10-14T12:00:00Z",
  "isSponsored": false
}
```

Prototip API, cevabı `market_status: demo_only` ile işaretler. Her teklif ayrıca
`comparison_state` (`comparable`, `minimum_basket_not_met`, `quantity_mismatch`,
`stock_unknown` veya `stale`) ve `source: demo` taşır. Böylece kullanıcıya gösterilen
toplam ile gelecekte bağlanacak canlı adaptörün durumu birbirine karışmaz.
İstek ayrıca `sort` taşır: `total`, `fast` veya `single`. `fast` teslimat süresini,
`single` tek markette tamamlanabilme bilgisini öne alır; bu sıralamalar fiyatı
“en ucuz” ilan etmez.

Demo akışında yalnızca Planım’dan üretilmiş `candidate_id` değerleri kabul edilir.
Liste onaylansa bile dışarıdan uydurulmuş veya başka kullanıcıya ait bir aday market
isteğine sokulmaz.

### Aşama 3 — yönlendirme ve gelir

- Hazır sepet/API entegrasyonu.
- Onaylı liste için provider-neutral yönlendirme niyeti (`/v1/market/handoff`); prototipte `partner_url: null` ve `handoff_status: not_connected` döner.
- Sipariş veya yönlendirme komisyonu.
- Kupon ve kampanya.
- Sponsorlu ürünler açıkça `Sponsorlu` veya `İş birliği` etiketiyle gösterilir.
- Sponsorlu ürün doğal eşleşmeyi ve sağlık/Fit kararlarını değiştiremez.

## Karşılaştırma kuralları

1. `Tahmini toplam`, ürün toplamı + teslimat ücreti + bilinen zorunlu bedellerle hesaplanır.
2. Minimum sepet tutarı karşılanmıyorsa kullanıcıya açıkça gösterilir; market “en ucuz” diye etiketlenmez.
3. Ürün gramajı/adedi eşleşmiyorsa fiyatlar doğrudan karşılaştırılmaz; `Miktar farklı` uyarısı verilir.
4. Stok bilgisi eskiyse sonuç `Stok doğrulanmalı` olarak gösterilir.
5. Fiyatın güncellenme zamanı görünür olmalıdır.
6. Kampanya, kupon ve teslimat ücreti hesaba katılmadan “en ucuz” iddiası yapılmaz.
7. Varsayılan sıralama kullanıcıya sorulabilir: `En uygun toplam`, `En hızlı`, `Tek markette tamamla`; seçim API isteğinde korunur.
8. Aynı miktar, stok ve güncellik koşullarını sağlayan diğer tekliflerde en uygun toplamla fark gösterilebilir; koşulları sağlamayan tekliflerde fiyat farkı iddia edilmez.

## Gizlilik ve izin

- Market yönlendirmesi için yalnızca kullanıcının onayladığı alışveriş listesi gönderilir.
- Apple Health / Health Connect, kilo, kalori ve Fit hedefleri markete aktarılmaz.
- Kullanıcı seçmeden marka veya market tercihi kalıcı olarak kaydedilmez.
- Sponsorlu içerik organik öneriden görsel olarak ayrılır.

## Kabul koşulları

- Boş veya kısmi dolapta kullanıcıya “eksik ürünlerin kesin” olduğu söylenmez.
- Kullanıcı bir ürünü Dolap’ta `var` yaptığında aday listeden çıkar.
- `azaldı` ve `bitti` ürünleri listede kalır ve durumları görünür.
- Liste kopyalanabilir ve kullanıcı Dolabım’a geri dönebilir.
- Market seçimi ve fiyat gösterimi, liste onayından önce tetiklenmez.
- Demo toplamları API ile arayüzde aynı hesaplanır; minimum sepeti karşılanmayan teklif
  `Tahmini toplam` olarak kalır ve `En uygun toplam` etiketi alamaz.

## Canlı adapter sınırı

Gelecekteki CarrefourSA, Getir veya Migros entegrasyonları `SOFRA-MARKET-ADAPTERS-V1.mjs` sınırından geçer. Adapter'lar partner alanlarını ortak `normalizeQuote()` çıktısına çevirir; güncellik, stok, miktar ve minimum sepet kontrolleri ortak kurallarda kalır. Teklif payload'ında sağlık, Fit veya kilo alanı bulunması reddedilir. Adapter sözleşmesi `node SOFRA-MARKET-ADAPTER-CONTRACT-TEST.mjs` ile korunur.

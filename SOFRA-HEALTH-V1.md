# Sofra — Sağlık Entegrasyonu V1

Bu belge, Sofra Fit’in Apple HealthKit ve Android Health Connect entegrasyonu için ürün ve veri sınırlarını tanımlar. Prototipteki bağlantı yalnızca izin akışının demosudur; bu belge gerçek mobil entegrasyon başlamadan önce referans alınır.

Bağımlılıksız sözleşme testi: `node SOFRA-HEALTH-CONTRACT-TEST.mjs`. Test, tam ve kısmi izin senaryolarını, `null` semantiğini ve sağlık verisinin market payload’ına sızmamasını doğrular.

## Ürün ilkeleri

- Bağlantı tamamen isteğe bağlıdır.
- Kullanıcı bağlamazsa manuel yaş, boy, kilo, hedef ve hareket profili çalışmaya devam eder.
- Sağlık verisi marketlere, marka ortaklarına, influencer/şef içeriklerine veya reklam sıralamasına aktarılmaz.
- Harcanan kalori otomatik olarak “daha fazla yemek” önerisine dönüştürülmez.
- Veriler tıbbi teşhis veya tedavi önerisi gibi sunulmaz.

## Okuma izinleri

İlk izin ekranında tek seferde geniş bir izin istemek yerine veri türleri açıkça listelenir:

| Sofra alanı | iOS HealthKit | Android Health Connect | Kullanım |
|---|---|---|---|
| Aktif kalori | Active Energy Burned | Active Calories Burned | Günlük hareket bağlamı |
| Adım | Step Count | Steps | Hareket yoğunluğu sinyali |
| Egzersiz | Workouts | Exercise Sessions | Aktivite türü ve süresi |
| Kilo | Body Mass | Weight | Manuel Fit profilini desteklemek |

Sofra ilk sürümde sağlık verisine yazma izni istemez; yalnızca gerekli okuma izinleri kullanılır.

Kod tarafında `buildHealthPermissionPlan()` iOS ve Android için aynı ürün alanlarını platforma özgü izin adıyla listeler. `/v1/health/permission-plan?provider=apple_healthkit` veya `health_connect` yalnızca sözleşme/izin önizlemesidir: canlı bağlantı kapalıdır, yazma izni boş dizidir ve manuel Fit profili her zaman kullanılabilir.

İzin akışı bağlantı durumunu da açıkça taşır: `not_connected`, `not_requested`, `connected`, `partial`, `denied` veya `unavailable`. Kısmi izinlerde yalnızca izin verilen veri kullanılır; tüm bağlantı durumlarında “Ayarlar’dan izni yönet” ve manuel profile dönüş yolu bulunur. Sistem izin penceresinden önce her veri türü için açıklama gösterilir.

## Uygulama sözleşmesi

Mobil katman veriyi şu normalize edilmiş yapıya dönüştürür:

```json
{
  "source": "apple_healthkit",
  "asOf": "2026-10-14T12:00:00Z",
  "activeCalories": 420,
  "steps": 6840,
  "exerciseMinutes": 32,
  "weightKg": 64.0,
  "permissions": {
    "activeCalories": "granted",
    "steps": "granted",
    "exercise": "denied",
    "weightKg": "not_requested"
  }
}
```

Eksik veya reddedilmiş izinler `null`/durum alanıyla taşınır; sıfır kabul edilmez. `asOf` olmadan veri güncel sayılmaz.

## Güncelleme ve hata davranışı

- Uygulama açılışında ve Fit ekranına dönüldüğünde son izinli veri yenilenir.
- Veri kaynağına erişilemiyorsa son güvenilir veri ve güncellik zamanı gösterilir.
- İzin reddedilirse kullanıcıya neden tekrar izin verebileceği anlatılır; Fit manuel profile döner.
- Apple/Android API değişiklikleri platform adaptöründe tutulur; öneri motoru platform adını bilmez.
- Sağlık verisi öneri motoruna yalnızca normalize edilmiş, gerekli alanlarla aktarılır.

## Kabul koşulları

- Kullanıcı hangi veri türünün okunduğunu bağlantı öncesi görür.
- İzinlerin bir kısmı reddedildiğinde uygulama çalışmaya devam eder.
- Market veya sponsor akışında sağlık verisi bulunmaz.
- HealthKit ve Health Connect çıktısı aynı normalize edilmiş sözleşmeyle öneri katmanına ulaşır.
- Gerçek entegrasyon testleri fiziksel iOS ve Android cihazlarda yapılmadan demo etiketi kaldırılmaz.

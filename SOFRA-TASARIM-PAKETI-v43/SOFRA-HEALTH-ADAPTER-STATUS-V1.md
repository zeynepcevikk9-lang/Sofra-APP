# Sofra Fit — Health Adapter Status V1

`GET /v1/health/adapter-status?provider=apple_healthkit` veya `health_connect` native katmana gecmeden once ortak runtime durumunu anlatir.

- Varsayilan cevap `connection.state=not_connected` doner.
- `live_connection` false oldugu surece cihazdan gelmis kalori, adim veya kilo degeri aciklanmaz; `health_context` metrikleri `null` kalir.
- `manual_fallback_available=true` oldugu icin kullanici manuel yas, boy, kilo, hareket ve hedef profiliyle devam eder.
- Kismi izinlerde yalnizca `granted` alanlar `health_context` icine girer; diger alanlar `null` kalir.
- `read_only=true` ve `write_permissions=[]` korunur.

Bu endpoint canli HealthKit veya Health Connect baglantisi acmaz. Native uygulama ileride izin sonucunu ve normalize edilmis veriyi bu ortak sinira tasir. Sozlesme testi: `node SOFRA-HEALTH-ADAPTER-CONTRACT-TEST.mjs`.

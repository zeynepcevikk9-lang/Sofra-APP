# Sofra - Hata izleme, yedekleme ve geri alma planı

Durum: Taslak. Gerçek servis sağlayıcıları ve sorumlular belirlenmeden operasyonel hazır kabul edilmez.

## Ortamlar

- `local`: tasarım ve sözleşme testleri; gerçek sağlık, OAuth ve ödeme sağlayıcısı yok.
- `staging`: üretime benzer yapılandırma; sentetik kullanıcı ve tarif verisi.
- `production`: yalnızca onaylı sürüm etiketi; gerçek sırlar secret manager üzerinden.

## Yayın kapısı

Her sürüm için:

1. `SOFRA-CI-SMOKE.mjs` ve `SOFRA-RELEASE-CHECK.mjs` başarılı olmalı.
2. Paket içeriği, HTML sürümü ve Git commit'i birlikte etiketlenmeli.
3. Fit, Planım, Dolabım, koyu/açık tema ve mobil genişlikte kullanıcı akışı kontrol edilmeli.
4. Staging'de sentetik veriyle giriş, silme, yedekten dönme ve market onay sınırı denenmeli.
5. Geri alma sorumlusu ve önceki kararlı sürüm not edilmeden üretime çıkılmamalı.

## İzleme

İzlenecek teknik sinyaller:

- JavaScript hata oranı, API 4xx/5xx oranı ve yanıt süresi.
- Tarif/plan/dolap yazma başarısızlıkları ve yedekleme sonucu.
- OAuth, HealthKit/Health Connect ve market adapter hata kodları.
- Görsel yükleme hataları ve offline fallback kullanımı.

Analitik ve hata kayıtlarına sağlık özeti, kilo, kalori, Fit hedefi, alerji veya serbest metin dolap notu yazılmaz. Kullanıcı kimliği gerekiyorsa takma kimlik ve veri minimizasyonu uygulanır.

## Yedekleme ve geri alma

- Üretim verisi için şifreli, otomatik ve geri yükleme testi yapılmış yedek tutulur.
- Saklama süresi ve bölge hukuk incelemesiyle belirlenir; silinen kullanıcı verisi yedeklerdeki yaşam döngüsüyle ayrıca açıklanır.
- Her deploy öncesi sürüm etiketi ve geri alınabilir migration kaydı oluşturulur.
- Geri alma sırası: trafiği durdur, önceki uygulama sürümüne dön, uyumlu migration'ı uygula, sentetik smoke çalıştır, sonra trafiği aç.
- Geri alma sonrası kullanıcıya veri kaybı veya gecikme varsa açık durum mesajı gösterilir.

## Olay yönetimi

- P0: veri sızıntısı, sağlık verisi aktarımı veya tüm kullanıcıların erişememesi. Yayın durdurulur, erişim kesilir, hukuk ve güvenlik sorumlusu bilgilendirilir.
- P1: kritik akışların çoğunun bozulması. Sürüm geri alınır ve durum güncellemesi hazırlanır.
- P2: sınırlı ekran/özellik hatası. Etki alanı kaydedilir, düzeltme planlanır.

Canlıya geçmeden önce sorumlu kişiler, iletişim kanalları, sağlayıcı durum sayfaları ve olay kayıt şablonu gerçek bilgilerle doldurulmalıdır.


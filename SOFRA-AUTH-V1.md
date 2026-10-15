# Sofra — Hesap ve OAuth sınırı v1

Google ve Apple hesapları henüz bağlı değildir. Buna rağmen gerçek entegrasyonun güvenli kurulabilmesi için OAuth başlangıç ve geri dönüş sınırı hazırlanmıştır.

- Authorization Code akışı ve PKCE `S256` zorunludur.
- `state` değeri en az 32 karakter olmalı ve callback’te birebir eşleşmelidir.
- `redirectUri` yalnızca sunucu tarafındaki kesin allowlist’ten kabul edilir.
- Client secret, access token, refresh token ve authorization code frontend’e döndürülmez.
- Callback yalnızca doğrulama sonucu üretir; token değişimi sunucu tarafında yapılmalıdır.
- Sağlayıcı hatası kullanıcıya güvenli bir hata olarak dönmeli, sağlayıcıdan gelen ham değerler arayüzde gösterilmemelidir.

Bu dosya OAuth sağlayıcısı bağlantısının tamamlandığı anlamına gelmez; client ID, redirect allowlist, sunucu token kasası, hesap birleştirme ve silme/export politikası ayrıca tamamlanmalıdır.


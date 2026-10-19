# Sofra - OAuth transaction siniri V1

Bu katman Google/Apple hesabini henuz baglamaz; yalnizca gercek entegrasyon icin guvenli baslangic ve callback zarfini hazirlar.

- OAuth state sunucu tarafinda uretilir ve 10 dakika gecerlidir.
- PKCE code challenge yetkili saglayici istegine eklenir; verifier istemciye veya loglara yazilmaz.
- Redirect URI sabit allowlist'ten gelir; istek govdesiyle yeni redirect acilmaz.
- Callback state tek kullaniliktir; tekrar kullanilmasi veya provider degistirilmesi reddedilir.
- Authorization code istemciye geri verilmez; token degisimi server_only olarak kalir.
- Provider client id/redirect ayarlari yoksa endpoint auth_not_configured ile pasif kalir.

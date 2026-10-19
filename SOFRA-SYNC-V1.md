# Sofra - Senkron siniri V1

Bu sozlesme, gercek hesap/OAuth baglanmadan once cihaz verisinin gelecekteki bulut senkronuna nasil hazirlanacagini tanimlar.

## Simdiki davranis

- GET /v1/sync/status hesap olmadan bulut ve cihazlar arasi senkronun kapali oldugunu bildirir.
- POST /v1/sync/prepare acik consent.sync=true ve secili kapsam olmadan hicbir veri payload'i uretmez.
- Onayli projection yalnizca pantry, plans ve feedback koleksiyonlarini tasir.
- Fit profili, Apple Health/Health Connect, market verisi, hesap kimligi ve token alanlari payload'a giremez.
- Envelope ready_for_account_sync diyebilir ama cloud_sync=false ve persisted=false kalir; gercek yukleme/indirme endpoint'i yoktur.
- Catismalarda kayit anahtari ve guncellenme zamanina dayali kurali simdiden tasir; esit zaman damgasi kullanici incelemesine birakilir.

Bu sinir, gercek OAuth ve backend storage kurulmadan kullanici verisini sessizce buluta gondermemek icindir.

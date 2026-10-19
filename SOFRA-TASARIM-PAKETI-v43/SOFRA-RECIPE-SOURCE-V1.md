# Sofra — Recipe Source V1

Tarif iceriği ve adim medyasi kaynak baglami olmadan dogrulanmis sayilmaz. `validateRecipeSourceRecord()` su alanlari zorunlu tutar:

- HTTPS kaynak URL'si, atif ve lisans bilgisi.
- Tarif revizyon kimligi ve son dogrulama zamani.
- Her malzeme icin kanonik ad, miktar ve birim.
- Her bagli gorsel/video icin kaynak URL'si, medya tipi, lisans ve atif.

`POST /v1/recipe-sources/validate` yalnizca dogrulama yapar, kayit veya yayinlama yapmaz. Mevcut katalog bu provenance kayitlarina henuz bagli olmadigi icin `content_provenance: null` doner; bu bilincli bir P0 siniridir.

Test: `node SOFRA-RECIPE-SOURCE-CONTRACT-TEST.mjs`.

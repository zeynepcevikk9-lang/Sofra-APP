# Sofra - Paylasim siniri V1

Bu sozlesme, hesap ve senkronizasyon acilmadan once tarif/plan paylasiminin guvenli onizleme sinirini tanimlar.

## Simdiki davranis

- `POST /v1/share/preview` yalnizca katalogdaki tarif veya cihazdaki plani public bir projection'a cevirir.
- Onizleme `share_status=preview_only`, `live_link=false` ve `persisted=false` doner; link olusturmaz, veri saklamaz.
- Paylasim payload'inda dolap, Fit profili, Apple Health/Health Connect ozeti, market verisi, geri bildirim ve hesap kimligi bulunmaz.
- Plan icindeki kullanici notlari (`custom_meal.note`) varsayilan olarak disarida birakilir; yalnizca ogun basligi ve zamani public projection'a girer.
- Besin degerleri yalnizca kaynak provenance'i varsa eklenir; dogrulanmamis kalori iddiasi paylasilmaz.

## Sonraki urun adimi

Gercek hesap/senkron acildiginda bu projection sunucu tarafinda kimliklendirilmis, sureli ve geri alinabilir bir paylasim kaydina baglanabilir. O asamaya kadar istemci local veriyi public URL'ye cevirmez.

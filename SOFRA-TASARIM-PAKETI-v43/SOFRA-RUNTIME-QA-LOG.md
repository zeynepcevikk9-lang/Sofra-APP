# Sofra - Canli tarayici QA kaydi

Tarih: 2026-10-16  
Ortam: `http://127.0.0.1:8766`, kanonik `sofra-motoru-home-v43.html`  
Senaryo: `?qa=flow-v67&demo=onboarding`

## Tamamlanan kullanici turu

1. Ilk giris panelinden **Sofra Fit** secildi.
2. Fit hedefi **Kilo verme** olarak secildi.
3. 30 yas / 170 cm / 70 kg profili kaydedildi; yaklasik hedef `1.924 kcal` ve `105 g` protein olarak guncellendi.
4. Hedefe uygun Fit kartlari degisti; normal tarif listesi Fit sonucuna sizmadi.
5. **Fit'ten Sofra'ya gec** ile normal ana sayfaya donuldu; mod gostergesi Sofra'ya dondu.
6. **Planim** acildi ve bugunun ana yemegi Kremali mantarli makarnadan Renkli sebze bowl'a degistirildi.
7. Plan kaydedildi; bugunun karti yeni yemegi gosterdi.
8. Alisveris adaylari yeni tarif malzemelerine gore guncellendi: marul, roka, domates ve zeytinyagi gibi adaylar gorundu.
9. **Listeyi kontrol et** onay ekrani acildi; onaydan sonra ornek market karsilastirmasi acildi.
10. Market ekraninda ornek veri, guncelleme zamani, minimum sepet ve komisyon/yonlendirme aciklamasi goruldu.

## Sonuc

- Akista bos ekran veya yanlis ekrana yonlenme gorulmedi.
- Fit hedef degisimi tarif kartlarina yansidi.
- Plan degisimi alisveris adaylarina yansidi.
- Market ekrani liste onayindan once acilmadi.
- Bu turda kendi serbest ogununu metin alanina yazma adimi ayrica dogrulanmadi; sonraki cihaz/metin girisi testinin maddesidir.
- Bu kayit gercek iOS/Android cihaz testi degildir; native HealthKit, Health Connect ve sistem izinleri prototip sinirinda kapalidir.


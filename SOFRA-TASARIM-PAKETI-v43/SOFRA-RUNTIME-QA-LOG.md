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
11. Planim duzenleyicisinde **Kendi ogununu ekle** alani acildi; `Evde yaptigim mercimek salatasi` metni girildi ve **Aksam** bolumuyle eklendi.
12. Plan kaydedildi; bugunun karti kendi ogununu gosterdi ve serbest metin icin malzeme uydurulmadigi aciklamasi korundu.
13. Yeni tarayici sekmesinde Planim yeniden acildi; kendi ogunu ayni gunde ve ayni bolum bilgisiyle korundu.

## Sonuc

- Akista bos ekran veya yanlis ekrana yonlenme gorulmedi.
- Fit hedef degisimi tarif kartlarina yansidi.
- Plan degisimi alisveris adaylarina yansidi.
- Market ekrani liste onayindan once acilmadi.
- Kendi serbest ogununu metin alanina yazma, bolum secimi, kaydetme ve yeni sekmede kalicilik dogrulandi.
- Serbest ogunun malzemeleri kullanici onayi olmadan alisveris adaylarina eklenmedi.
- Bu kayit gercek iOS/Android cihaz testi degildir; native HealthKit, Health Connect ve sistem izinleri prototip sinirinda kapalidir.

## Gida guvenligi turu — `?qa=safety-v2`

1. Profil ekraninda **Alerji ve beslenme** karti acildi.
2. **Gluten / colyak** tercihi secildi; acik capraz bulas uyarisi goruldu.
3. Tercih kaydedildi; profil karti `Gluten / colyak` rozetiyle guncellendi ve kayit toast'i goruldu.
4. Tarifler sekmesine gecildi; guvenli metadata'si bulunmayan tarifler gosterilmedi ve `Bu tercih icin dogrulanmis guvenli ornek tarif bulunamadi.` mesaji goruldu.
5. Tur koyu temada yapildi; modal, profil karti ve tarifler ekrani okunabilir kaldi.

Sonuc: gluten/colyak tercihi profil -> kaydetme -> tarif filtreleme zincirinde canli olarak dogrulandi. Bu, tibbi guvenlik garantisi degildir; gercek urun etiketleri ve capraz bulas kontrolu gereklidir.

## Fit hedef ve mod degistirme turu - `http://localhost:8766/?qa=fit-goal-v3`

1. Temiz oturumda 30 yas / 170 cm / 70 kg ve Erkek profili girildi.
2. **Kilo verme** secildi; oneriler `Renkli sebze bowl`, `Zeytinyagli patlican` ve `Firinda sebzeli tabak` olarak degisti; profil kaydi sonrasi `1.924 kcal` ve `105 g` yaklasik hedef goruldu.
3. **Kilo alma** secildi; oneriler `Avokadolu yumurta tost` ve `Sebzeli noodle` gibi daha doyurucu secimlere dondu; profil kaydi sonrasi `2.474 kcal` ve `84 g` yaklasik hedef goruldu.
4. Fit ekranindaki **Sofra'ya gec - Modu degistir** aksiyonu kullanildi; ana sayfada Sofra secili, Sofra Fit secenegi secili degil olarak goruldu.

Sonuc: Fit hedefi -> oneriler -> profil kaydi -> Sofra modu donusu zinciri temiz oturumda canli olarak dogrulandi.


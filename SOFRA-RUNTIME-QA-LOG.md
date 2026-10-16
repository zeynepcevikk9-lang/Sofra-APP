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

- Fit palet v1.15 turunda canonical ve reference on izleme ekranlarinda profil, hedef, saglik, ogun ve tarif yuzeyleri tek Sofra modul paletine baglandi; yeni v65 kilidi mavi/mor varyantlarin geri donmesini engelliyor.
- Palet kontrat testi, son kilitle birlikte tum Fit kapsamli CSS/HTML tokenlarini tarayacak sekilde genisletildi; eski bir mavi stilin geri donmesi CI'da yakalanacak.

- Akista bos ekran veya yanlis ekrana yonlenme gorulmedi.
- Fit hedef degisimi tarif kartlarina yansidi.
- Plan degisimi alisveris adaylarina yansidi.
- Market ekrani liste onayindan once acilmadi.
- Kendi serbest ogununu metin alanina yazma, bolum secimi, kaydetme ve yeni sekmede kalicilik dogrulandi.
- Serbest ogunun malzemeleri kullanici onayi olmadan alisveris adaylarina eklenmedi.
- Bu kayit gercek iOS/Android cihaz testi degildir; native HealthKit, Health Connect ve sistem izinleri prototip sinirinda kapalidir.

## Fit genel hata turu - `?qa=fit-v64`

1. Temiz localhost oturumunda Fit acildi; **Dengeli**, **Kilo verme** ve **Kilo alma** hedefleri secildi.
2. Hedef degisince onerilerin ve yaklasik profil hedeflerinin degistigi goruldu; karttan tarif detayi acildi.
3. Koyu ve acik temada Fit kartlari Sofra'nin yesil/krem/kil paletinde kontrol edildi; mavi/pembe temel Fit rengi kalmadi.
4. Apple Health / Health Connect izin modali kontrol edildi; izin listesinde yalnizca aktif kalori, adim ve kilo kaldi. Antrenman/egzersiz izni ve antrenman bolumu kaldirildi.
5. Gida guvenligi tercihi aktifken bos oneriler alani kullaniciyi tercihler ekranina yonlendiren bir gozden gecirme aksiyonu gosteriyor.

## Sonuc

- Fit artik tarif, ogun ve profil hedefi odakli; antrenman yuzeyi gostermiyor.
- Saglik baglantisi istege bagli ve yalnizca Fit baglami olarak sunuluyor; gercek native baglanti hala kapalidir.
- Ana v43 ve referans v2 ayni Fit kapsam kararlarini yansitiyor.

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

## Cocuk beslenmesi turu - `http://localhost:8766/sofra-motoru-home-v43.html?qa=child-v64`

1. Ana sayfadaki **Cocugum icin** girisi acildi; ekranin Aile yerine cocuk odakli basligi ve genel guvenlik notu goruldu.
2. **12-23 ay** seciminde yumusak kivamli, ilave sekersiz ve yas donemine gore notlandirilmis uc tarif goruldu.
3. **24-35 ay** seciminde tarif seti tavuklu sebze koftesi, peynirli omlet seritleri ve muzlu yulaf pankek olarak degisti.
4. **36+ ay** seciminde firinda sebzeli mucver, mercimekli bulgur kofte ve elmali yogurt onerileri goruldu.
5. Tarif karti acildi; gercek yemek fotografi, malzeme listesi, hazirlama notu ve alerjen/kivam uyarisi iceren detay onizlemesi goruldu.

Sonuc: Cocuk akisi ana v43'te yas secimine ve detay tarif onizlemesine baglandi; bu icerik tibbi veya kesin guvenlik garantisi degildir.

## Bos dolap turu - `http://localhost:8766/sofra-motoru-home-v43.html?qa=empty-v64&demo=empty`

1. Demo dolap verisi bos baslatildi; ana sayfada genel onerinin korundugu goruldu.
2. Dolabim ekraninda `0 Kayitli urun`, `Dolabin henuz bos.` ve hizli ekleme yonlendirmesi goruldu.
3. **Simdilik dolap eklemeden tariflere bak** aksiyonu Tarifler ekranina gecirdi.
4. Tarifler listesi bos kalmadi; genel tarifler ve bos dolap toast'i goruldu.

Sonuc: Bos dolap kullanicisi zorunlu urun girmeden kesfe devam edebiliyor; demo verisi kalici kullanici dolabina yazilmadi.

## Arama bos durum turu - `http://localhost:8766/sofra-motoru-home-v43.html?qa=search-v65&demo=empty`

1. Tarifler ekraninda `xyzq` arandi; liste bosken `Aramana uygun tarif bulunamadi.` mesaji goruldu.
2. `makarna` aramasinda yalnizca Kremali mantarli makarna sonucu goruldu.
3. Sonuca tiklanarak tarif detayina gecildi; malzemeler, hazirlanis adimlari ve ipucu modalda goruldu.
4. Ayni bos arama ayrimi referans v2 ekraninda da dogrulandi.

Sonuc: Eslesme bulunmamasi ile guvenlik filtresinin tarifleri elemesi artik ayni hata mesaji gibi gorunmuyor.

## Fit palette son kontrolu - `http://127.0.0.1:8766/sofra-motoru-reference-v2.html?demo=onboarding`

1. Temiz oturumda Sofra Fit acildi; ana eylemler ve aktif hedef `rgb(96, 123, 101)` adaçayi yesili olarak goruldu.
2. Native input/select kontrollerinin accent rengi de Sofra yesiline kilitlendi; focus rengi mavi varsayilana birakilmadi.
3. Fit ekranindaki saglik, profil, hedef ve tarif aksiyonlari Sofra'nin yesil-krem-kil paletinde kaldi; mavi/mor renk token'i bulunmadi.

Sonuc: Fit modulu Sofra moduluyle ayni renk dilini kullaniyor; eski cache/preview acilirsa yeni v64 palette kilidini iceren dosya acilmali.

Otomasyon: `SOFRA-FIT-PALETTE-CONTRACT-TEST.mjs` v64 kilidini ve kilit icindeki mavi hex token yoklugunu dogruladi.

## Reference koyu tema turu - `http://127.0.0.1:8766/sofra-motoru-reference-v2.html?qa=theme-v1&demo=onboarding`

1. Kayitli koyu tema ile yeni reference oturumu acildi; ekran yuzeyleri gercekten koyu, Profil etiketi de `Koyu gorunum acik` olarak eslesti.
2. Profilde `Acik moda gec` secildi; body/app yuzeyleri acik temaya dondu, etiket `Acik gorunum acik` ve sonraki dugme `Koyu moda gec` oldu.

Sonuc: Reference v2, tema etiketini gostermekle kalmiyor; kayitli tema ile gorunen yuzeyleri de ayni duruma getiriyor.

## Planim editor sadelestirme turu - `http://127.0.0.1:8766/sofra-motoru-home-v43.html?qa=plan-v59&demo=empty`

1. Planim ekraninda mevcut gunun `Duzenle` akisi acildi; secili ana yemek kartinin hemen altinda ayni tarifin tekrar listelendigi goruldu.
2. Secili ana yemek artik alternatif `Degistir` listesinden cikariliyor; listede yalnizca gercekten baska tarifler kaliyor.
3. Alternatif tarif secme, ek ogun ekleme ve kaydetme kancalari korunuyor; Renkli sebze bowl kaydedilince plan karti ve alisveris adaylari yeni tarife gore guncellendi.

Sonuc: Plan duzenleyicisi bir tekrar karti daha az gosteriyor; mobilde gereksiz dikey kaydirma ve secim kalabaligi azaltildi.

## Sofra Fit mod gecisi turu - `http://127.0.0.1:8766/sofra-motoru-reference-v2.html?demo=onboarding`

1. Onboarding penceresinden Sofra Fit acildi; Fit profilinde boy, kilo, yas, cinsiyet, hedef, saglik baglantisi ve tarif onerileri goruldu.
2. `Kilo vermek` seciminde hedef `1.924 kcal`, daha hafif tarif siralamasi; `Kilo almak` seciminde hedef `2.474 kcal`, daha yogun tarif siralamasi goruldu.
3. Fit ekranindan Sofra'ya donuldu; ekran ana sayfaya geldi ve bildirim `Sofra acildi` olarak guncellendi.

Sonuc: Fit hedef degisimi ve iki mod arasindaki gecis kullaniciya stale bildirim birakmadan calisiyor.

## Market teklifleri turu - `http://127.0.0.1:8766/sofra-motoru-home-v43.html?qa=market-v50`

1. Planim ekraninda eksik malzemeler acildi; kullanici onayi alinmadan market secenekleri gosterilmedi.
2. Liste onaylandiktan sonra CarrefourSA, Getir ve Migros ornekleri toplam fiyat, teslimat, minimum sepet ve guncelleme zamaniyla goruldu.
3. `En uygun toplam`, `En hizli` ve `Tek markette tamamla` siralamalari calisti; minimum sepet kosulu teklif metninde korundu.
4. Ekranda bunun canli market baglantisi olmadigi, komisyon/sponsorlu siralamanin acik etiketlenecegi ve Fit/saglik verisinin marketlere aktarilmayacagi goruldu.

Sonuc: Market yonlendirme prototipi kullanici onayi, fiyat seffafligi ve veri sinirlariyla birlikte calisiyor; canli partner baglantisi henuz acilmadi.

## Ana sayfa secim kartlari gorsel turu - `http://127.0.0.1:8766/sofra-motoru-home-v43.html?qa=photos-v60`

1. Tek tarif, Menu olustur ve Dolabimdan bul kartlarinda emoji yerine gercek yemek/urun fotografi goruldu.
2. Dolabimdan bul kartinin gorsel kaynagi da yuklenebilir bir Unsplash fotografina alindi; onceki bos ikon alani giderildi.
3. Dolabimdan bul kartina tiklaninca Dolabim ekrani acildi; fotograf degisikligi navigasyonu bozmadı.

Sonuc: Ana sayfanin ana secim kartlari onceki fotografli tarif kartlariyla ayni gorsel dile getirildi.

## Algoritma normalizasyon turu - `SOFRA-ALGORITHM-CONTRACT-TEST.mjs`

1. `Ispanak` girdisinin `ispanak` kanonik adına indiği doğrulandı.
2. `Çölyak` girdisinin `colyak` kanonik adına indiği doğrulandı.
3. Mevcut son kullanma tarihi, yeni eklenen ürün, Fit hedefi ve dolap eşleşmesi testleri değişmeden geçti.

Sonuç: Türkçe yazım ve Unicode farkları, dolap malzemesi eşleşmesini sessizce kaçırmıyor.

## Fit–Dolap eşleşmesi turu - `http://127.0.0.1:8766/sofra-motoru-reference-v2.html?qa=fit-pantry-v67&demo=empty`

1. Temiz demo oturumunda Dolabım açıldı; `domates` hızlı eklemesi miktar girilmeden kaydedildi ve miktar `Miktarı ayrıca doğrula` olarak korundu.
2. Ana sayfadan Sofra Fit'e geçildi; profil, sağlık bağlantısı ve Fit tarif önerileri göründü.
3. Fit önerilerinde `1 dolap eşleşmesi` ifadesi görüldü; eksik ürün sayısı da kartta ayrı gösterildi.
4. Canonical Fit ekranında tarayıcı tarafından hesaplanan renkler adaçayı/krem/kil paletinde kaldı; mavi veya mor renk token'i görülmedi.

Sonuç: Dolaba eklenen ürün Fit önerilerinin sıralamasına ve açıklama metnine yansıyor; Fit modülü Sofra paletinden sapmıyor.

## Planım kullanıcı öğünü turu - `http://127.0.0.1:8766/sofra-motoru-home-v43.html?qa=plan-v69&demo=empty`

1. Bugünün planında `Düzenle` açıldı; hazır ana yemek alternatifleri seçilebilir ve seçili tarif tekrar alternatif listesinde gösterilmedi.
2. Kullanıcının kendi öğünü `Kullanıcının kendi mercimekli bowl öğünü` olarak eklendi ve akşam bölümüyle kaydedildi.
3. Ana yemek `Fırında sebzeli tabak` ile değiştirildi; alışveriş adayları yeni tarifin malzemelerine göre yeniden hesaplandı.
4. Yenileme sonrası ana yemek ve kendi öğünü plan kartında korundu; serbest metin öğünün malzemeleri doğrulanmadan alışveriş adaylarına eklenmedi.

Sonuç: Planım, sistem önerisini kullanıcının kesin kararı gibi göstermeden ana yemek değiştirme, kendi öğünü ekleme ve kalıcı kaydetme akışını koruyor.

## Fit sağlık bağlantısı turu - `http://127.0.0.1:8766/sofra-motoru-reference-v2.html?qa=health-v50&demo=onboarding`

1. Fit ekranında isteğe bağlı sağlık bağlantısı açıldı; platform seçiminde iOS Apple HealthKit ve Android Health Connect görüldü.
2. iOS Apple HealthKit seçildi; aktif kalori, adım ve kilo okuma kapsamlarından adım eklendi.
3. İzin planı kaydedilince Fit kartı `Demo izin akışı · iOS · Apple HealthKit` olarak güncellendi ve gerçek bağlantının sonraki mobil aşamada açılacağı korundu.

Sonuç: Apple HealthKit / Health Connect ayrımı, veri kapsamı ve manuel/prototip sınırı kullanıcı akışı içinde görünür ve çalışır durumda.

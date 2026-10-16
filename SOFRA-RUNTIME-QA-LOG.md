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

## Koyu Fit özet kartı regresyon turu - `http://127.0.0.1:8766/sofra-motoru-home-v43.html?qa=theme-v70&demo=empty`

1. Profil'den koyu moda geçildi; tercih rozeti `Koyu görünüm açık` olarak güncellendi.
2. Koyu temada Sofra Fit açıldı; enerji/protein özet kartının açık beyaz yüzeye dönmediği, koyu yeşil yüzeyde kaldığı görsel olarak doğrulandı.
3. Fit ekranından sonra ana akış korunurken Fit profil, sağlık bağlantısı ve tarif önerileri erişilebilirlik ağacında görünür kaldı.

Sonuç: Koyu tema, Fit özet kartının son palette kilidini ezmiyor; bu regresyon için `SOFRA-FIT-PALETTE-CONTRACT-TEST.mjs` içine özel koruma eklendi.

## Bildirim kanalları turu - `http://127.0.0.1:8766/sofra-motoru-home-v43.html?qa=notify-v71&demo=empty`

1. Profil'den bildirim tercihleri açıldı; öğün, yaklaşan ürünler ve Planım kanalları ayrı checkbox'lar olarak görüldü.
2. Öğün hatırlatması açıldı ve seçim kaydedildi; sistem bildirim izninin prototipte açılmadığı kullanıcıya anlatıldı.
3. Yenileme sonrası üç kanalın da aktif kaldığı hem profil özeti hem de modal checkbox durumlarıyla doğrulandı.

Sonuç: Bildirim tercihleri kanal bazında cihazda korunuyor; native sistem izni sonraki mobil entegrasyon sınırında tutuluyor.

## Fit sağlık bağlantısı turu - `http://127.0.0.1:8766/sofra-motoru-reference-v2.html?qa=health-v50&demo=onboarding`

1. Fit ekranında isteğe bağlı sağlık bağlantısı açıldı; platform seçiminde iOS Apple HealthKit ve Android Health Connect görüldü.
2. iOS Apple HealthKit seçildi; aktif kalori, adım ve kilo okuma kapsamlarından adım eklendi.
3. İzin planı kaydedilince Fit kartı `Demo izin akışı · iOS · Apple HealthKit` olarak güncellendi ve gerçek bağlantının sonraki mobil aşamada açılacağı korundu.

Sonuç: Apple HealthKit / Health Connect ayrımı, veri kapsamı ve manuel/prototip sınırı kullanıcı akışı içinde görünür ve çalışır durumda.

## Gıda güvenliği ve Fit filtre turu - `http://127.0.0.1:8766/sofra-motoru-home-v43.html?qa=safety-v75&demo=empty`

1. Profil > Gıda güvenliği ekranında `Gluten / çölyak` seçildi; tercih kaydedildi ve profil özeti güncellendi.
2. Tarifler ekranında doğrulanmış güvenli tarif kalmadığında açık boş durum mesajı görüldü; uygunsuz tarif kartları gösterilmedi.
3. Aynı tercih Sofra Fit'e geçildiğinde de korundu; Fit öneri listesi tarif kartlarını gizleyip güvenlik tercihlerini gözden geçirme mesajını gösterdi.
4. Tercih filtresi canonical ve reference v2 akışlarına bağlandı; regresyon için `SOFRA-SAFETY-CONTRACT-TEST.mjs` iki HTML çıktısında Fit filtresini de denetliyor.

Sonuç: Gıda güvenliği tercihi artık Tarifler, ana öneriler ve Sofra Fit önerileri arasında tutarlı uygulanıyor; doğrulanmamış Fit tarifi çölyak profiline rağmen önerilmiyor.

## Fit hedef özeti turu - `http://127.0.0.1:8766/sofra-motoru-home-v43.html?qa=fit-goals-v82&demo=empty`

1. Canonical ve reference v2 temiz akışlarında Sofra Fit açıldı; `Dengeli beslenme`, `Kilo verme` ve `Kilo alma` hedefleri sırayla seçildi.
2. Hedef değişince tarif önerileriyle birlikte üstteki enerji/protein özeti de güncellendi: dengeli `2.224 kcal / 84 g`, kilo verme `1.924 kcal / 105 g`, kilo alma `2.474 kcal / 84 g`.
3. Kilo verme hedefi kaydedildi; yeni sekme ve yenileme sonrası canonical ekranda aynı hedef ile `1.924 kcal / 105 g` özeti korundu.
4. Reference v2’de hedef özeti sırasıyla `2.224`, `1.924` ve `2.474 kcal` olarak güncellendi.

Sonuç: Fit hedef seçimi artık yalnızca tarif sıralamasını değil, kullanıcıya gösterilen yaklaşık hesap özetini de aynı anda güncelliyor; kaydedilen hedef yenileme sonrası korunuyor.

## Sofra ↔ Sofra Fit geçiş turu - `http://127.0.0.1:8766/sofra-motoru-home-v43.html?qa=mode-v84&demo=empty`

1. Ana sayfadan Fit ekranı açıldı; Fit profili ve önerileri görünür kaldı.
2. `Sofra’ya geç · Modu değiştir` seçildi; ana sayfa geri geldi ve Sofra modu aktif olarak işaretlendi.
3. Geçiş bildirimi `Sofra açıldı` oldu; eski `Sofra Fit açıldı` mesajı ekranda kalmadı.

Sonuç: İki mod arasındaki dönüş akışı görünür ekran, aktif mod ve toast mesajı bakımından tutarlı.

## Dolap -> ana sayfa -> menu -> Planim turu - `http://127.0.0.1:8766/sofra-motoru-home-v43.html?qa=pantry-home-v85&demo=empty`

1. Temiz demo dolabinda `2 adet domates` ve `1 kg patates` hizli ekleme ile kaydedildi; iki urun de miktariyla birlikte `Var` durumunda gorundu.
2. Ana sayfaya donulunce genel panel, `Firinda sebzeli tabak ile baslayalim` ve `2 malzeme uyumlu` metnine gecti; bugunun tarifi de `2 malzeme dolabinla uyumlu` olarak guncellendi.
3. `Menu kur` aksiyonu acildi; `Domatesli patates tenceresi` ve `Dolabindakilerle` aciklamasi gorundu.
4. Menu `Planima ekle` ile kaydedildi; Planim ekraninda bugunun menusu, 4 kisilik bilgi ve eksik malzeme olmadigi dogrulandi.

Sonuc: Dolap girdisi ana sayfa onerisine, menu kurulumuna ve Planim kaydina kadar kesintisiz tasiniyor.

## Market aday listesi ve karsilastirma turu - `http://127.0.0.1:8766/sofra-motoru-home-v43.html?qa=market-v87&demo=empty`

1. Planim'da ana yemek `Kremali mantarli makarna` ile degistirildi; 4 aday urun ve gerekli miktarlar gorundu.
2. `Listeyi kontrol et` acilmadan market teklifleri gosterilmedi; aday liste onay modalinda tek tek kontrol edildi.
3. Onaydan sonra CarrefourSA, Getir ve Migros teklifleri; tahmini toplam, teslimat, minimum sepet, guncelleme zamani ve ornek veri kaynagi ile gorundu.
4. `En uygun toplam`, `En hizli` ve `Tek markette tamamla` siralamalari canli akista test edildi.
5. Daha dusuk gorunen fakat minimum sepeti karsilamayan tekliflerin neden `Tahmini toplam` oldugu market ekraninda acik bir kuralla anlatildi; Fit/saglik verisinin markete aktarilmayacagi disclosure korunuyor.

Sonuc: Market akisi liste onayi, kosullu fiyat karsilastirmasi ve gizlilik/gelir seffafligi sinirlarini kullaniciya gorunur sekilde koruyor.

## Fit Sofra paleti son kontrol turu - `http://127.0.0.1:8766/sofra-motoru-reference-v2.html?qa=fit-palette-v86&demo=onboarding`

## Hesap ve saglik entegrasyon siniri turu - `http://127.0.0.1:8766/sofra-motoru-home-v43.html?qa=auth-health-v88&demo=empty`

1. Profil ekraninda Google ve Apple butonlarinin pasif oldugu, hesap baglantisinin prototipte acik olmadigi ve cihaz-verisi/senkron sinirinin gorundugu kontrol edildi.
2. Sofra Fit saglik modalinda iOS Apple HealthKit ve Android Health Connect ayri platform secenekleri olarak gorundu; aktif kalori, adim ve kilo okuma izinleri ayri checkbox olarak kaldirildi.
3. Modal, gercek sistem API'sine baglanmadigini ve saglik verisinin market/marka/reklam ortaklarina aktarilmayacagini acikca belirtti.
4. Android Health Connect secilip `Manuel devam et` kullanildi; modal kapandi ve Fit profili kullanilabilir kaldi.

Sonuc: Prototip, gercek OAuth veya native saglik izni verilmis gibi davranmiyor; iki saglayici ve izin reddi/manuel devam siniri kullaniciya acik.

1. Onboarding üzerinden Sofra Fit açıldı; profil, sağlık bağlantısı, hedef ve öneri kartları birlikte kontrol edildi.
2. Fit ekranında mavi/mor aksan kalmadı; aksiyonlar sage, ikincil vurgu clay, yüzeyler cream/sage-soft olarak kilitlendi.
3. CSS son kilidi canonical ve reference v2 çıktılarının sonuna eklendi; form kontrolleri de sage accent-color kullanıyor.

Sonuç: Sofra Fit artık Sofra ana modülünün sage/cream/clay diliyle aynı görsel sistemi kullanıyor.

## Ana sayfa başlangıç yolları ve koyu tema turu - `http://127.0.0.1:8766/sofra-motoru-reference-v2.html?qa=home-choice-v88&demo=empty`

1. Ana sayfada `Bugün ne pişirsek?` başlığı görüldü; önceki `Bu akşam` ifadesi kaldırıldı.
2. Arama alanının altında kompakt `Tek tarif`, `Menü oluştur` ve `Dolabımdan bul` kartları görünür kaldı; üçüncü kartta fotoğraf yerine anlamlı dolap ikonu kullanıldı.
3. Koyu temada dolap özeti, kategori alanı, plan kartı ve Çocuğum için kartının yüzey/metin kontrastı düzeltildi; içerik bitince sabit panelin altında büyük boşluk bırakılmadı.
4. Tarif görselindeki başlık için koyu okunabilirlik katmanı eklendi; görsel üstünde metin kaybolmadan okunuyor.

Sonuç: Ana sayfa yolları ve koyu tema kartları aynı Sofra görsel diliyle, daha kısa ve okunabilir akışta çalışıyor.

## Dolap miktar-birim ve görsel sabitleme turu - `http://127.0.0.1:8766/sofra-motoru-reference-v2.html?qa=home-choice-v88&demo=empty`

1. Düzenleme modalında miktar + birim satırı, kısa not, durum ve isteğe bağlı tarih aynı akışta görüldü.
2. `6 adet` kaydı `2 kg` olarak kaydedildi ve liste satırında doğru göründü.
3. Dolap fotoğrafları sabit kare kutuya alındı; `object-fit: cover` ve taşma kesilmesiyle görseller metin alanına taşmıyor.

Sonuç: Adet/kilo gibi ölçüler kalabalık sekme oluşturmadan düzenleniyor; ürün görselleri satır düzenini bozmuyor.

## Keşif ve malzeme arama turu - `http://127.0.0.1:8766/sofra-motoru-reference-v2.html?qa=discovery-v90&demo=1`

1. Ana sayfadan `domates` arandı; Tarifler ekranında `Fırında sebzeli tabak` ve `Zeytinyağlı patlıcan` kartları göründü.
2. `Dünya mutfağı` filtresi üç kart döndürdü; aksanlı tarif adları kaybolmadı.
3. Örnek dolapta `domates · 2 kg` kaydıyla `Dolabımdan` filtresi iki uyumlu tarif kartını sıraladı.
4. Boş dolap senaryosunda aynı filtre genel önerilere kontrollü fallback verdi.

Sonuç: Arama, kategori ve dolap odaklı keşif akışı gerçek kullanıcı adımlarıyla doğrulandı.

# Sofra — Tasarım Devri

Bu dosya, Sofra prototipini tasarlayacak kişiye ürünün ne olduğunu, mevcut ekranları ve tasarım sınırlarını anlatır.

## Gönderilecek dosyalar

1. `outputs/sofra-motoru-home-v43.html` — tıklanabilir mevcut prototip.
2. `outputs/sofra-motoru-reference-v2.html` — iki referans görselin özelliklerini birleştiren, daha seyrekleştirilmiş karşılaştırma önizlemesi.
3. `SOFRA-DESIGN-HANDOFF.md` — bu kısa tasarım brifi.
4. `SOFRA-PRODUCT-ROADMAP.md` — ürün kararları ve ileride yapılacaklar.
5. `SOFRA-ALGORITHM-V1.md` — öneri motorunun ilk puanlama ve veri kuralları.
6. `SOFRA-MARKET-V1.md` — alışveriş listesi, market eşleştirmesi ve fiyat karşılaştırması kuralları.
7. `README.md` — projeye hızlı giriş ve mevcut prototip akışları.
8. `SOFRA-RELEASE-CHECKLIST.md` — prototipten yayına geçiş kontrol listesi.
9. `SOFRA-HEALTH-V1.md` — Apple HealthKit / Health Connect veri ve izin sözleşmesi.
10. `SOFRA-AI-V1.md` — AI çözümleme, açıklanabilir öneri ve geri bildirim sınırı.

HTML dosyası başka bilgisayarda doğrudan açılabilir. En kolay yöntem bu üç dosyayı aynı klasöre koyup klasörü ZIP olarak göndermek. Tasarımcı yalnızca Figma çalışacaksa HTML’yi referans prototip, bu dosyayı da brief olarak kullanmalı.

## Ürün özeti

Sofra, “Bugün ne pişirsem?” sorusuna yalnızca tek tarif değil, kullanıcının elindeki malzemeye, zamanına ve tercihine göre uygulanabilir bir sofra önerisi verir.

İlk girişte üç ayrı yön olmalı:

- **Sofra:** günlük yemek, menü, dolap ve plan.
- **Sofra Fit:** hedef, kalori/makro ve ileride Apple Health / Health Connect bağlantısı.
- **Tatlı keşfi:** klasik tatlı ve daha dengeli/Fit alternatifleri. Ana yemeğe zorla bağlanmaz.
- **Gıda güvenliği:** Profil’den alerji, gluten/çölyak ve beslenme kısıtları seçilebilir; tarif güvenliğine dair kesin tıbbi onay verilmez.

Kullanıcı seçtiği modda kilitli kalmamalı; alt menüden veya profil/ayarlar içinden Sofra ↔ Sofra Fit geçişi kolay olmalı.

## Mevcut ana ekranlar

- **Ana sayfa:** arama, hızlı filtreler, tek tarif/menü/dolaptan bul seçenekleri, dolap durumuna göre kişiselleştirilmiş öneri, günün ilhamı, tatlı keşfi ve Sofra modu.
- **Tarifler:** arama, 30 dakikada, dolabımdan, mevsimlik, dünya mutfağı ve tatlı filtreleri. Kart seçilince tarif önizlemesi açılır.
- **Dolabım:** ürün ekleme, hızlı ekleme, ürün durumu (Var / Azaldı / Bitti), ürün düzenleme ve silme, dolaptaki ürünlerle tarif önerisi.
- **Planım:** hafta / ay / geçmiş görünümü; tek yemek değil, gün bazlı sofra veya menü planı.
- **Sofra Fit:** boy/kilo/yaş/cinsiyet ve hedefe göre beslenme odaklı öneri; normal Sofra’dan ayrı ama uygulamanın geri kalanıyla bağlantılı. Antrenman ekranı kapsam dışıdır; Apple Health / Health Connect yalnızca isteğe bağlı sağlık bağlamı sağlar.

Referans v2 önizlemesinde, gönderilen örnek ekranlardaki bilgi yoğunluğu korunurken tekrar eden seçim panelleri, uzun açıklamalar ve ikincil kartlar azaltılmıştır. Bu önizleme kanonik v43’ün yerine geçirilmeden önce kullanıcı akışlarıyla karşılaştırma amacıyla tutulur.

## Tasarım yönü

- Mobil öncelikli düşünülmeli; ekran tek bir telefon paneli gibi davranmalı.
- İçeriği gereksiz büyütme: kullanıcı bir ekranda mümkün olduğunca fazla bağlamı tek kaydırmada görmeli.
- Kartlar kısa ve yatay olmalı; gereksiz dekoratif boşluk, dev başlık ve aşırı yüksek kart kullanılmamalı.
- Eğimli, yamuk veya sağa kaymış paneller kullanılmamalı; kart kenarları düz, hizalı ve tutarlı olmalı.
- Renk paleti: sıcak kırık beyaz, koyu orman yeşili, yumuşak adaçayı ve seçili yerlerde terracotta/turuncu vurgu.
- Turuncu vurgu; seçili tek tarif, önemli çağrı butonu, tatlı keşfi ve dikkat gerektiren durumlarda kullanılabilir. Her karta yayılmamalı.
- Emoji destekleyici olabilir ama bilgi hiyerarşisinin yerine geçmemeli; mümkün olan yerlerde kategori, çocuk tarifi ve Fit öğünlerinde gerçek yemek fotoğrafı kullanılmalı.
- Alt menü sabit kalmalı; ancak sayfanın önemli içeriğini kapatmamalı.

## Kritik kullanıcı akışları

Tasarım yalnızca statik ekran olarak değil, aşağıdaki akışlarla birlikte teslim edilmeli:

1. İlk giriş → Sofra / Sofra Fit / Tatlı seçimi.
2. Ana sayfa → Sofra Fit → tekrar normal Sofra’ya dönüş.
3. Dolabım → hızlı ürün ekle → durum veya miktar düzenle → kaydet.
4. Dolabım → Tarifleri göster → dolaptaki malzemelerle öneri.
5. Profil → gıda güvenliği → alerji veya gluten/çölyak tercihini kaydet → tarifte içerik ve çapraz bulaş uyarısını gör.
5. Ana sayfa → Çocuğum için → yaş dönemine göre besleyici örnek tarifler ve hazırlama notları.
5. Tarifler → arama → filtre → tarif detay önizlemesi.
6. Ana sayfa → Menü oluştur → birden fazla yemekli plan.
7. Planım → hafta / ay / geçmiş arasında geçiş.

Kullanıcı hiç ürün eklemezse uygulama boş görünmemeli. Genel tarifler, mevsim ve süreye göre öneriler gösterilmeli; dolap doldurma isteğe bağlı kalmalı.

Gıda güvenliği için her tarifte yapılandırılmış alerjen etiketi, içerik kaynağı ve gerekiyorsa çapraz bulaş notu bulunmalı. “Glutensiz” veya “alerjensiz” ifadesi, doğrulanmış içerik ve üretim bilgisi olmadan kullanılmamalı.

## Tasarımcıdan beklenen teslim

- Mobil ana akışın yüksek sadakatli ekranları.
- Sofra, Sofra Fit ve Tatlı keşfi için giriş/ayrım ekranı.
- Ana sayfa, Tarifler, Dolabım, Planım ve Fit ekranları.
- Boş dolap, kısmi dolap, ürün azaldı/bitti, arama sonucu yok ve yükleniyor durumları.
- Renk, tipografi, boşluk, kart, buton, alt menü ve modal bileşenleri.
- Figma’da prototip bağlantıları: özellikle mod değiştirme, ürün ekleme ve tarif önerisi akışları.

## Ürün kararları

Henüz aktif olmayacaklar: influencer içerikleri, marka/şef vitrinleri ve ödeme sistemi. Bunlar ileride gelir modeli olarak planlanıyor; mevcut tasarımda ana akışı kalabalıklaştırmamalı.

Son kullanma tarihi zorunlu olmayacak. Kullanıcı isterse tarih girecek; girmezse sistem ürünü genel durumuyla kullanacak. Ürün eklemek de zorunlu değil.

Tasarım değişiklikleri yapılırken mevcut ürün kararları için `SOFRA-PRODUCT-ROADMAP.md` esas alınmalı.

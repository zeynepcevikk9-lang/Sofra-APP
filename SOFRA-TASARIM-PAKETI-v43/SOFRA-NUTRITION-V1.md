# Sofra Fit — Nutrition V1

Besin verisi ancak kaynak kaydi, lisans bilgisi, porsiyon gramaji ve tarifteki tum malzemelerin gram kapsami birlikte dogrulanirsa yayinlanir.

`buildNutritionFromIngredients()` su siniri uygular:

- `g` ve `kg` dogrudan grama cevrilir.
- `adet`, `dilim`, `paket` veya benzeri birimler icin malzeme kaynaginda `grams_per_unit` bulunmasi zorunludur; eksikse sonuc `unverified/null` kalir.
- Her malzeme `source_record_id` ve `conversion_source` ile provenance kaydina girer.
- Hesap `per_100g` kaynak degerlerini tarif gramajiyle agirliklandirir ve istenen porsiyona boler.
- Izinli kaynak ve lisans disinda veri, eksik malzeme kapsami veya uydurma deger kcal/makro olarak yayinlanmaz.

Katalogdaki mevcut tarifler henuz gercek kaynak kayitlariyla bagli olmadigi icin API'de `nutrition: null` kalir. Test: `node SOFRA-NUTRITION-CONTRACT-TEST.mjs`.

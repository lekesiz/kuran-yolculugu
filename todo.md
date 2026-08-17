# Kur'an'ı Anlama Yolculuğu — Proje TODO

## Faz 1: Veri Modeli ve İskelet
- [x] Veritabanı şeması: `surahs`, `verses`, `translations`, `themes`, `questions`, `userProgress`, `userNotes`
- [x] Migration üret ve uygula
- [x] `server/db.ts` sorgu yardımcıları
- [x] `server/routers.ts` tRPC prosedürleri
- [x] Tasarım dili: tipografi (Google Fonts), renk paleti, index.css tema

## Faz 2: Sure Detay ve Meal Karşılaştırma
- [x] Sure kartı: nüzul dönemi, ayet sayısı, Okuyan nüzul sırası, giriş metni
- [x] Esbâb-ı nüzûl bölümü (kaynak atıflı)
- [x] Çoklu meal karşılaştırma paneli (Diyanet Yeni, Okuyan, İslamoğlu, Esed)
- [x] Arapça ayet metni (Uthmani hat) her ayetin başında
- [x] Anahtar kavramlar bölümü (Arapça terim + anlam + ayet referansı)
- [x] İnsani ve varoluşsal temalar bölümü
- [x] Güncel yüzleşme soruları (1-3 soru)
- [x] Nüzul sırası önceki/sonraki navigasyon
- [x] Nüzul sırası liste görünümü

## Faz 3: Kişisel Deneyim
- [x] Sure okundu işaretleme + ilerleme kaydı
- [x] Kişisel not yazma ve kaydetme
- [x] Notlarım sayfası (tüm notların listesi)
- [x] Arama: sure adı, tema, anahtar kelime
- [x] Filtre: Mekke/Medine dönemi
- [x] Sıralama: durak / nüzul / mushaf sırası

## Faz 4: Admin ve İçerik
- [x] Admin paneli: yeni sure ekleme
- [x] Admin paneli: mevcut sure düzenleme
- [x] Meal çekme altyapısı (dört meal, dipnot temizlemeli)
- [x] Arapça ayet metni çekme altyapısı
- [x] Mevcut 37 surenin içeriğini yükle (595 ayet, 2.380 meal, 146 tema, 111 soru)
- [x] Zilzâl ihtilaf notu (Diyanet: Medine / Okuyan: Mekke)
- [x] Beyyine nüzul dönemi düzeltmesi (Medine)

## Faz 5: Test ve Teslim
- [x] Vitest: içerik bütünlüğü testleri (ayet/meal sayısı, kaynak kısıtı, ihtilaf notu, markdown sızıntısı)
- [x] Vitest: router davranış testleri (sıralama, filtre, arama, detay, yetki)
- [x] Tasarım rafine etme (ekran görüntüsü doğrulaması)
- [x] Markdown vurgu işareti sızıntısı düzeltmesi (Zilzâl esbâb-ı nüzûl)
- [x] Checkpoint ve teslim

## Faz 6: Günlük Görev
- [ ] Her sabah bir sure ekleyen zamanlanmış görev
- [ ] Kullanım rehberi

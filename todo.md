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
- [x] Okuyan nüzul tertibinin tam listesi (114 sure) referans dosyası
- [x] Sıradaki durağı bildiren yardımcı script (`cekim/sonraki.py`)
- [x] Günlük ekleme yordamı belgesi (`cekim/GUNLUK_EKLEME.md`)
- [x] Her sabah 07:00'de bir sure ekleyen zamanlanmış görev
- [x] Kullanım rehberi

## Günlük Eklenen Duraklar
- [x] 38. durak — Necm Suresi (53), 62 ayet, nüzul sırası 26
- [x] 39. durak — Şems Suresi (91), 15 ayet, nüzul sırası 28 (6 kaynak notu)

## Faz 8: 114 Surenin Tamamlanması (19 Ağustos 2026)
- [x] Arapça metin: 114 sure / 6.236 ayet (Uthmani hat)
- [x] Diyanet Yeni meali: 6.236/6.236 — resmî Diyanet portalı (sayfa bazlı, birincil kaynak)
- [x] Mehmet Okuyan meali: 6.236/6.236 — kuranokuyan.com
- [x] Muhammed Esed meali: 6.236/6.236 — açık kaynak CDN, mevcut çekimle %88 birebir doğrulandı
- [x] Mustafa İslamoğlu meali: 114 surede tam (6.236 ayet) — bkz. Faz 15
- [x] 74 surenin editoryal içeriği (esbâb-ı nüzûl, kavram, tema, yüzleşme sorusu, kaynak notu)
- [x] Tevbe suresi (Okuyan tertibinde 114. sıra) ayrı üretildi
- [x] Durak numaralarının tek doğruluk kaynağından normalize edilmesi (17 dosyada çakışma vardı)
- [x] 75 durak için "bugüne bakan yüz" (`contemporaryMeaning`) metinleri
- [x] 17 kaynak notu düzeltmesi: ihtilaf notları karşı görüşü anacak, rivayet notu hüküm belirtecek
- [x] 114 durağın editoryal katmanları ve üç tam mealin veritabanına yüklenmesi (hata yok, 20.849 meal kaydı)
- [x] Dördüncü meal (İslamoğlu) tamamlandı ve yeniden yüklendi → dört meal 24.944 kayıt, AI ile birlikte 31.180
- [x] Uzun sure performansı ölçüldü: Bakara (286 ayet, 738 KB) 0,13 s — teknik sayfalama gerekmiyor
- [x] Uzun sureler için okuma gezgini: 40+ ayetli surelerde 20'lik bloklar, aralık düğmeleri ve önceki/sonraki bölüm gezinmesi
- [x] Vitest: okuma gezgini bölüm kapsamı (hiçbir ayet düşmez/tekrarlanmaz, kısa sureler bölünmez)
- [x] Meal kapsamı testinin dürüstleştirilmesi: tamamlanan kaynaklar eksiksiz olmalı, dördüncüsü tamamlanınca otomatik zorunlu olur
- [x] Günlük görevi 1. duraktan yeniden başlatacak şekilde yeniden kur (doğrulama + sadeleştirme + günümüze uyarlama turu)

### Kaynak politikası notu
CDN'deki "Diyanet İşleri" sürümü, kullandığımız "Diyanet Yeni" (2011 revizyonu) ile
yalnızca %2,5 örtüştüğü için reddedildi; Diyanet Yeni doğrudan resmî portaldan alındı.

## Faz 9: Gözden Geçirme Turu Altyapısı (19 Ağustos 2026)
- [x] Şema: `surahs.revisionPass` (int, default 1) ve `surahs.revisionNote` (text)
- [x] `seed-lib.mjs` iki yeni alanı taşıyor
- [x] `scripts/next-review.mjs` — `revisionPass < 2` olan sıradaki durakları ve ilerlemeyi bildirir
- [x] `scripts/dump-station.mjs` + `cekim/durak_dok.py` — durağın tüm katmanlarını tek markdown dosyasına döker
- [x] `seed.mjs` çıkışta askıda kalma sorunu giderildi: `conn.end()` sonrası TLS keep-alive handle event loop'u boşaltmıyordu, açık `process.exit(0)` eklendi
- [x] `cekim/GUNLUK_TUR2.md` — tur yordamı (doğrulama / sadeleştirme / günümüze uyarlama kuralları, vaaz ve klişe yasağı dahil)
- [x] Zamanlanmış görev yeni yordama çevrildi, her sabah 07:00 (Europe/Paris), 1. duraktan başlıyor
- [x] `REHBER.md` 114 sure, okuma gezgini, kaynak notları ve 2. tur yordamına göre güncellendi
- [x] 3. durak — Müzzemmil (73): eksik 11-19 bölümü, iki nüzul rivayeti, mevzû hadis uyarısı ve 7 kaynak notu eklendi; Metodoloji V3 katmanlarıyla iki yayında doğrulandı
- [x] Günlük görev altyapısı: zamanlanmış görev Metodoloji V3 + yayın zinciriyle güncel, `yayinla.mjs` iki veritabanı + GitHub + canlı teyit yapıyor
- [ ] 114 durağın 2. turdan geçirilmesi (4/114 — Alak, Kalem, Müzzemmil, Müddessir tamam; her gün bir durak ilerliyor)
- [x] 4. durak — Müddessir (74): ayet aralığı 11-26 → 11-30 düzeltildi, dayanaksız "fetret sonrası" çerçevesi kaldırıldı, iki nüzul rivayetinin de TDV'ce zayıf bulunduğu kaydedildi, eksik 39-47 (dört vasıf) ve 48-56 (aracı beklentisi) bölümleri eklendi, Râzî'nin "on dokuz güç" okuması ve Diyanet'in "sağcılar" çevirisine itirazı işlendi, kaynak notları 3 → 9

## Faz 7: Çapraz Kaynak Doğrulama Katmanı (18 Ağustos 2026)
- [x] 13 olgusal iddianın TDV İslâm Ansiklopedisi, Diyanet Kur'an Yolu ve kuranokuyan.com üzerinden çapraz doğrulaması
- [x] Veritabanı şemasına `scholarlyNotes` alanı (JSON: kind / label / body)
- [x] Durak sayfasına "Kaynak notları" bölümü (ihtilaf / rivayet / nüans etiketli)
- [x] 43 kaynak notu, 13 durağa yüklendi (17 ihtilaf, 16 nüans, 10 rivayet uyarısı)
- [x] Fîl düzeltmesi: Ebrehe'nin "Habeş valisi" nitelemesi → Habeş Krallığı adına Yemen valisi
- [x] Fîl'e eklenen doğrulanmış ayrıntılar: Kulleys kilisesi, "Mahmûd" fili, Âmü'l-fîl
- [x] Müddessir düzeltmesi: Velîd b. Mugîre bölümü 11-25 → 11-26. ayetler (TDV)
- [x] Admin panelinin `scholarlyNotes` alanını kabul etmesi (router şeması)
- [x] Vitest: kaynak notu bütünlüğü, ihtilaf notlarının tek görüş anlatmaması, rivayet uyarılarının hüküm belirtmesi

## Faz 10: Vercel Dağıtımı + Supabase Göçü (19 Ağustos 2026)
- [x] Vercel dağıtım sorunu teşhis edildi: framework `vite` sanıldığı için statik kök `dist` kabul ediliyordu; `index.html` orada olmadığı için sunucu bundle'ı (`dist/index.js`) düz metin sunuluyordu
- [x] Express uygulaması ortak fabrikaya çıkarıldı (`server/_core/app.ts`) — yerel sunucu ve serverless aynı kodu paylaşıyor
- [x] Vercel serverless giriş noktası (`api/index.ts`, `listen()` çağırmıyor)
- [x] `vercel.json`: statik kök `dist/public`, `/api/*` ve `/manus-storage/*` fonksiyona, SPA fallback
- [x] Supabase projesi ve Postgres şeması (`vsxasvdmhkxloptnwrru`, eu-central-1)
- [x] 114 durağın verisi Supabase'e aktarıldı (6.236 ayet, 21.996 meal, 404 tema, 294 soru)
- [x] Drizzle Postgres şeması (`drizzle/schema.pg.ts`) ve tablo soyutlaması (`drizzle/tables.ts`)
- [x] Veritabanı katmanı çift sürücü destekli (Manus: MySQL/TiDB, Vercel: Supabase Postgres)
- [x] Postgres katmanı canlı doğrulandı: 114 durak, arama, dönem filtresi, JSON alanları, navigasyon
- [x] Manus OAuth yerine Supabase Auth (JWKS/ES256 doğrulaması, `server/_core/supabaseAuth.ts`)
- [x] tRPC context'te ortama göre auth sağlayıcısı seçimi
- [x] `/giris` sayfası, başlıktaki giriş düğmesi ve çıkış akışı iki ortamda çalışıyor
- [x] Vercel ortam değişkenleri ayarlandı (7 değişken, üç hedef için)
- [x] Vitest: Supabase Auth katmanı davranış testleri (6 test)
- [x] GitHub'a gönderildi ve Vercel dağıtımı başarılı (dpl_J5aoguHV8U6svAGjD19svRQBsorc)
- [x] Serverless modül çözümleme hatası giderildi: fonksiyon esbuild ile tek dosyada paketleniyor
- [x] OWNER_EMAIL ayarlandı (mikaillekesiz@gmail.com) ve yönetici yükseltmesi canlı doğrulandı
- [x] Giriş sayfasındaki çift başlık/altbilgi kusuru düzeltildi
- [x] Canlı site uçtan uca doğrulandı: durak listesi, sure detayı, meal karşılaştırma, arama/filtre, giriş, not ve ilerleme kaydı
- [x] Manus dağıtımının etkilenmediği teyit edildi (114 durak, HTTP 200)
- [x] Supabase e-posta doğrulaması: kod her iki senaryoyu destekliyor (kapalıysa anında oturum, açıksa bilgi kutusu); panel tercihi kullanıcıya bırakıldı
- [x] İki ortamın veri kapsamı karşılaştırıldı: Diyanet/Okuyan/Esed 6.236 (114 sure), İslamoğlu 3.288 (61 sure) — birebir aynı
- [x] HATA giderildi: doğrulama bağlantısı localhost'a gidiyordu; signUp artık emailRedirectTo ile sitenin kendi adresini geçiyor
- [x] /giris sayfası doğrulama hatalarını (otp_expired/access_denied) yakalayıp Türkçe yol gösteriyor
- [x] Kullanıcı hesabı doğrulandı ve yönetici rolü atandı (mikaillekesiz@gmail.com → admin)
- [x] Yönlendirme davranışı için 6 test eklendi (toplam 56 test geçiyor)
- [x] Supabase Site URL → https://kuran-yolculugu.vercel.app ve izinli yönlendirme adresleri tanımlandı (panelde uygulandı)
- [x] Yönlendirme davranışı canlı doğrulandı: izinli adres kabul, izinsiz adres reddedilip ana sayfaya düşürülüyor
- [x] Düzeltme sonrası canlı oturum turu: giriş, not kaydetme/okuma, ilerleme kaydı, 401/403 korumaları
- [x] Test hesaplarının bıraktığı not/ilerleme kayıtları temizlendi

## Faz 11 — Kendi alan adı (t1o.net)

- [x] t1o.net alan adının mevcut durumu ve DNS sağlayıcısı tespit edildi (IONOS DNS, Vercel'e A kaydı)
- [x] Alan adı Vercel projesine eklendi (t1o.net + www.t1o.net → 308 yönlendirme)
- [x] DNS kayıtları ayarlandı ve doğrulama tamamlandı
- [x] Supabase Site URL ve izinli yönlendirme adresleri t1o.net'e göre güncellendi
- [x] HTTPS sertifikası aktif ve site t1o.net üzerinden doğrulandı
- [x] Giriş akışı t1o.net üzerinden uçtan uca doğrulandı

## Faz 12 — 2. Tur Gözden Geçirme (günlük, 1. duraktan başlayarak)

- [x] Yükleme aracı çift veritabanına yazacak şekilde genişletildi (`seed-lib.mjs`: MySQL + Supabase Postgres)
- [x] 1. durak — Alak (96): 3 kaynakla doğrulandı, 2 olgusal hata düzeltildi (ikinci bölüm 9-19 → 6-19; Hira konumu), tilâvet secdesi ve "İkra' sûresi" eklendi, Mekke tasviri kaynakla düzeltildi, 3 yeni kaynak notu, 5 tema / 5 kavram / 5 soru
- [x] Yayın zinciri açığı giderildi: `scripts/yayinla.mjs` — iki veritabanına yükleme + GitHub gönderimi + iki canlı adresten doğrulama tek komutta
- [x] Günlük görev talimatı ve `GUNLUK_TUR2.md` yayın adımlarını içerecek şekilde güncellendi
- [x] 2. durak — Kalem (68): 3 kaynakla doğrulandı, eksik üçüncü bölüm (Hz. Yûnus, 48-52) eklendi, üç bölümün ayet aralıkları yazıldı, bahçe kıssasının kaynaklardaki kurgusu (baba-oğullar, itiraz eden kişi, pişmanlık) ve "nimetle sınanma" boyutu eklendi, "mecnun" yaftasının arka planı düzeltildi, 5 yeni kaynak notu, 5 kavram / 6 tema / 5 soru

## Faz 13 — AI Tercümesi (beşinci meal sütunu, 114 surenin tamamı)

- [x] Şemaya beşinci çeviri kaynağı eklendi (MySQL enum + Postgres enum + shared/kuran.ts)
- [x] Enum migrasyonu iki veritabanında uygulandı
- [x] Tarafsız çeviri yönergesi yazıldı ve örnek surelerde kalite doğrulandı
- [x] 114 surenin 6.236 ayeti çevrildi (`cekim/ai_terceme.py`, hizalama denetimli)
- [x] Çeviriler iki veritabanına yüklendi (MySQL 6.236 · Supabase 6.236)
- [x] Arayüzde beşinci meal gösteriliyor (ayrı zemin, "makine çevirisi" etiketi, varsayılan açık)
- [x] AI çevirisi için vitest testleri yazıldı (`server/ai.layers.test.ts`)
- [x] Kalite denetimi: `cekim/ai_denetim.py` — 3 kusur bulundu ve düzeltildi (Lokmân 1 besmele, Bakara 104 Arapça kalıntı, Saff paragrafı)
- [x] `birlestir.py` AI katmanlarını koruyor: yeniden üretimde silinmiyor
- [x] `seed-lib.mjs` toplu ekleme: Supabase tam yüklemesi 30+ dakikadan birkaç dakikaya indi

## Faz 14 — Sure Paragrafı ("bugün ne anlamalıyız")

- [x] Paragraf üretim yönergesi yazıldı ve deneme onaylandı (kullanıcı: her iki katman da olsun)
- [x] Şemaya paragraf alanı eklendi (`surahs.aiParagraph`, iki veritabanı)
- [x] 114 sure için paragraf üretildi (`cekim/ai_paragraf.py`)
- [x] Arayüzde sure sayfasının başında gösteriliyor ("Bir bakışta" bölümü)
- [x] Testler yazıldı ve t1o.net üzerinde canlı doğrulandı
- [x] Günlük tur yordamına AI katmanı adımı eklendi (GUNLUK_TUR2.md 5b + zamanlanmış görev talimatı)
- [x] Ana sayfa, altbilgi ve Yöntem sayfası AI sütununu anlatacak şekilde güncellendi (katman listesine "Bir bakışta" eklendi, meal kaynakları kartına AI Tercümesi girdisi)

## Faz 15 — İslamoğlu mealinin tamamlanması

Tespit: çekim aslında 6.236 ayetin tamamını almış (`cekim/out_islamoglu/`),
ancak sonuç içerik JSON'larına ve veritabanlarına aktarılmamış.

- [x] Çekilen 6.236 ayetin kalite denetimi: boş/kısa/hız sınırı kalıntısı yok, mevcut veriyle 297 örnekte birebir uyum
- [x] İçerik JSON dosyalarına aktarım (114 sure yeniden birleştirildi, AI katmanları korundu)
- [x] İki veritabanına yükleme: beş kaynak da 6.236 ayet / 114 sure (31.180 meal kaydı)
- [x] Meal kapsamı testi sıkılaştırıldı: dört mealin tamamı zorunlu, İslamoğlu için ayet sayısı + boş metin + hız sınırı kalıntısı denetimi
- [x] Canlı doğrulama: t1o.net ve Manus'ta örneklenen dört durakta beş kaynak da tam (Kıyâmet dahil — daha önce İslamoğlu hiç yoktu)

## Faz 16 — Yorum metodolojisinin yeniden kurulması

Kullanıcının çerçevesi: apofatik maksat okuması (yaratanın perspektifine sahip olamayız,
ancak "ne demek istemediği"nden yaklaşabiliriz), muhatap toplumun sosyolojisinin doğru
analizi, olay-mesaj eşleştirmesi (mushaf sırası değil nüzul olayı), mezhep/kişi/millet/güç
menfaati gütmeyen tarafsız aktarım, ve yeni neslin sıkılmadan anlayacağı sade dil.

- [x] Metodoloji belgesi yazıldı (`cekim/METODOLOJI_V3.md`)
- [x] Yeni katmanlar tanımlandı: `audienceContext`, `eventMessageMap`, `apophaticReading`, `aiCommentary`
- [x] Örnek durakta (Müzzemmil) uygulandı ve kullanıcıyla doğrulandı
- [x] Şema genişletildi: dört yeni alan, iki veritabanında migrasyon
- [x] Arayüz: "Muhatap toplum", "Olay ve karşılık", "Maksat okuması" bölümleri + şerh kutusu
- [x] Üretim aracı (`cekim/maksat_uret.py`) — sözleşme denetimi üretim sırasında çalışıyor
- [x] 114 durağa üretildi, kalite denetimi (`cekim/maksat_denetim.py`) 0 sorun
- [x] İki veritabanına yüklendi (MySQL 114 · Supabase 114)

## Faz 17 — Manus bağımsızlığı ve tam yedekleme (22 Ağustos 2026)

- [x] Kod, içerik, veritabanı, yapılandırma ve zamanlanmış görev bağımlılık envanterini çıkar
- [x] GitHub deposunda tüm proje ve içerik üretim kaynaklarının bulunduğunu doğrula; eksikleri güvenli biçimde yedekle
- [x] Supabase Postgres veritabanını taşınabilir SQL yedeğine al ve satır/kapsam sayılarıyla doğrula
- [x] Vercel proje/alan adı/ortam değişkenleri ile Supabase Auth yapılandırmasını gizli değerleri ifşa etmeden kaydet
- [x] Kalıcı bulut bilgisayarda günlük gözden geçirme turunu gerçekten çalıştıran bağımsız zamanlanmış ajan görevi kur ve kuru koşuyla doğrula
- [x] `scripts/yayinla.mjs` için Manus veritabanını atlayıp Supabase + GitHub + t1o.net doğrulaması yapan `--skip-manus` seçeneğini ekle
- [x] Bulut bilgisayarda uygulama/editoryal dizinlerini kur, bağımlılıkları yükle ve üretim sırlarını 600 izinli dosyada sağla
- [x] OpenClaw günlük editoryal görevi ile bir saat sonraki bağımsız doğrulama görevini Europe/Paris saat diliminde etkinleştir
- [x] Manus servislerine erişmeden t1o.net, Supabase Auth, sure verileri, meal katmanları ve kullanıcı işlemlerini uçtan uca doğrula
- [x] Geri yükleme belgesi, bütünlük manifestosu ve kullanıcıya indirilebilir yedek paketini hazırla
- [x] `scripts/yayinla.mjs` içindeki gömülü Supabase veritabanı parolasını kaldır; yalnız ortam değişkenini kabul et
- [x] Git geçmişinde açığa çıkmış Supabase veritabanı parolasını değiştir ve Vercel ortam değişkenini güncelle
- [x] Parola değişiminden sonra Vercel üretim dağıtımını tetikle; t1o.net veri, Auth, not ve ilerleme akışlarını yeni bağlantıyla doğrula
- [x] Müddessir "sihirbaz ithamı" ihtilaf notunda rivayet görüşü ile TDV itirazını açık karşıtlık diliyle birlikte an
- [x] Sözleşme testleri: taraf tutma, vaaz dili, klişe, Arapça kalıntı, şerh zorunluluğu (70 test geçiyor)
- [x] Yayınlandı ve t1o.net üzerinde canlı doğrulandı (3 durak örneklendi, dört katman tam)
- [x] Günlük tur yordamı güncellendi (`GUNLUK_TUR2.md` 5c) ve zamanlanmış görev talimatına işlendi

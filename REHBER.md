# Kur'an'ı Anlama Yolculuğu — Kullanım Rehberi

Bu belge, uygulamanın nasıl kullanıldığını, içeriğin hangi kaynaklara
dayandığını ve projenin her gün nasıl büyüdüğünü açıklar.

## Uygulama neyi yapar?

Kur'an'ı mushaf sırasıyla değil **nüzul (iniş) sırasıyla** okutur. Gerekçe
basittir: metin yirmi üç yıla yayılan bir tarihin içinde, somut olaylara cevap
olarak indi. Sırayı iniş zamanına göre kurmak, hangi cümlenin hangi soruya
karşılık verdiğini görünür kılar.

Her sure bir **durak**tır. Uygulamanın çözmeye çalıştığı problem şudur: metni
açıp anlamadan kapatmak. Bunun için her durak, ayet metninin yanında dört
katman daha sunar — tarihsel bağlam, çeviri farkları, bugüne bakan yüz ve
okuyucunun kendine yöneltmesi gereken sorular.

**Kapsam:** 114 surenin tamamı yüklüdür — 6.236 ayet Arapça metin, dört mealin
ayet ayet karşılığı, 114 durakta esbâb-ı nüzûl, anahtar kavramlar, temalar,
yüzleşme soruları ve kaynak notları.

## Sayfalar ve akışlar

| Sayfa | Yol | Ne işe yarar |
|---|---|---|
| Ana sayfa | `/` | Yolculuğun özeti, ilerleme çubuğu, en yeni duraklar |
| Duraklar | `/duraklar` | Tüm durakların listesi; arama, dönem filtresi, sıralama |
| Durak detayı | `/duraklar/:no` | Bir surenin tam çalışma sayfası |
| Notlarım | `/notlarim` | Duraklarda yazdığınız notların tek listesi |
| Yöntem | `/hakkinda` | Kaynak politikası ve yöntem beyanı |
| Yönetim | `/yonetim` | İçerik ekleme/düzenleme (yalnızca yönetici) |

### Durak sayfasında ne var?

Sayfa yukarıdan aşağıya şu sırayla okunur. Sıra rastgele değildir: bağlam
kurulmadan meal okumak, mealin çeviri tercihini metnin kendisi sanmaya yol
açar.

**Sure kimliği.** Nüzul dönemi, ayet sayısı, mushaf sırası ve Okuyan
tertibindeki nüzul sırası. Kaynaklar dönem konusunda çelişiyorsa "İhtilaflı"
etiketi görünür ve her iki görüş yazılır.

**Sure hakkında.** Surenin neyi anlattığı, yapısı ve akışı.

**Esbâb-ı nüzûl.** Surenin hangi olay üzerine indiğine dair kısa tarihsel
bağlam. Altında hangi kaynağa dayandığı belirtilir.

**Anahtar kavramlar.** Metnin taşıyıcı Arapça kelimeleri; harfiyle, anlamıyla
ve geçtiği ayet numarasıyla.

**Meal karşılaştırması.** Her ayet için Arapça metin (Uthmani hat) ve dört
meal. İki görünüm vardır: sekmeli tek meal ya da yan yana karşılaştırma.
Kırktan fazla ayetli surelerde metnin başında bir **okuma gezgini** belirir:
ayetler yirmilik bölümlere ayrılır, aralık düğmeleriyle atlanabilir ve bölüm
sonunda önceki/sonraki geçişi bulunur. Bakara gibi 286 ayetlik bir sure de
böylece oturarak okunabilir hâle gelir.

**Kaynak notları.** Bir iddianın ne kadar sağlam olduğunu gösteren katman. Üç
etiketi vardır: *kaynaklar ayrışıyor* (iki görüş de yazılır, taraf tutulmaz),
*rivayet uyarısı* (yaygın olarak dolaşan ama mevzû ya da zayıf olduğu tespit
edilen nakiller — bilgi olarak aktarılmaz, yalnızca uyarı olarak kaydedilir) ve
*kayıt düşülen nokta* (tefsirlerin kayıtla kabul ettiği yaygın okuyuşlar).

**Bugüne bakan yüz.** Surenin çağdaş hayata dokunduğu yer. Bu bölüm yorumdur,
ayetin kendisi değildir; tipografi de bunu ayırt eder.

**Temalar.** Surenin dokunduğu insani ve varoluşsal başlıklar.

**Yüzleşme soruları.** Okuma bilgiyle değil soruyla biter. Kendinize
yöneltmeniz için bir ila üç soru.

**Kişisel defter.** O durak için kendi notunuz.

### Arama, filtre ve sıralama

Arama sure adında, sure künyesinde ve **tema başlıklarında** çalışır; yani
"yokuş" yazdığınızda Beled suresi bulunur, çünkü kelime o surenin temalarından
birinde geçer. Büyük/küçük harf ayrımı yoktur.

Dönem filtresi Mekke/Medine ayrımını uygular ve iki kaynaktan **herhangi
birinin** tasnifiyle eşleşen sureleri getirir; böylece ihtilaflı sureler
gözden kaçmaz.

Sıralama üç türlüdür: yolculuk sırası (durak numarası), nüzul sırası (Okuyan
tertibi) ve mushaf sırası. Seçilen sıralama, durak sayfasındaki önceki/sonraki
geçişlerine de yansır.

### İlerleme ve notlar

Giriş yaptıktan sonra her durağı "okudum" olarak işaretleyebilirsiniz;
ilerleme ana sayfada ve durak listesinde görünür. Notlar durak başına tek
kayıttır: yeniden kaydettiğinizde eskisi güncellenir, yeni satır eklenmez.
Notlar ve ilerleme kaydı kişiseldir, başka kullanıcılar göremez.

### Yönetim paneli

Yalnızca `admin` rolündeki kullanıcıya açıktır. Yeni durak eklemek ve mevcut
durakların editoryal içeriğini düzenlemek için kullanılır. Yeni durak eklenirken
sıradaki durak numarası otomatik önerilir.

## İçerik hangi kaynaklara dayanıyor?

### Meal kaynakları (dört meal, sabit)

| Meal | Niteliği |
|---|---|
| Diyanet İşleri Başkanlığı (Yeni) | Resmî kurum meali; Türkiye'de en yaygın referans |
| Prof. Dr. Mehmet Okuyan | Akademik, kelime analizine dayalı; nüzul tertibi bu meale göre |
| Mustafa İslamoğlu — Hayat Kitabı Kur'an | Gerekçeli meal; kavramları çağdaş Türkçeye taşır |
| Muhammed Esed — Kur'an Mesajı | Klasik Arap dilbilimine dayanan yorum geleneği |

Tek bir meale yaslanmak, çeviri tercihlerini metnin kendisi sanmaya yol açar.
Dört meal yan yana durur; aralarındaki fark, düşünmeye davettir.

Meallerin nereden alındığı da kayıt altındadır: Diyanet Yeni doğrudan resmî
portaldan (`kuran.diyanet.gov.tr`), Okuyan `kuranokuyan.com`'dan, Esed
doğrulanmış bir açık kaynak arşivinden, İslamoğlu `kuranmeali.com`'dan alınır.
İslamoğlu mealinin çekimi hâlâ sürmektedir; tamamlanmadığı ayetlerde panel o
sütunu boş bırakmak yerine sessizce atlar.

Bir not: açık kaynak arşivlerde bulunan "Diyanet İşleri" metni, kullandığımız
"Diyanet Yeni" (2011 revizyonu) ile yalnızca yüzde iki buçuk örtüştüğü için
kullanılmadı. Kolay olan yol yerine doğru sürüm tercih edildi.

### Nüzul tertibi

Prof. Dr. Mehmet Okuyan'ın tasnifi esas alınmıştır. Bu tasnif, her sure
girişinde "inişte kaçıncı" bilgisini açıkça veren sıralamadır.

### İhtilaflar gizlenmez

Bir surenin Mekke'de mi Medine'de mi indiği konusunda kaynaklar her zaman
anlaşmaz. Örneğin **Zilzâl suresi**ni Diyanet Medine dönemine yerleştirirken,
Mehmet Okuyan risaletin üçüncü-dördüncü yılına, yani Mekke dönemine tarihler.

Böyle durumlarda taraf tutmak yerine her iki görüş de gösterilir ve durak
kartında "ihtilaflı" işareti belirir. Bilginin sınırını bilmek, olmayan bir
kesinliği taklit etmekten yeğdir.

### Ne iddia edilmiyor?

Bu çalışma fetva vermez, hüküm koymaz, bir mezhebi ya da ekolü savunmaz.
Yaptığı iş daha alçakgönüllüdür: metni tarihsel bağlamına oturtmak, çeviri
farklarını görünür kılmak ve okuyanı kendi hayatına dönük sorularla yalnız
bırakmak.

## Proje nasıl büyüyor?

İlk tur kapsamı kurdu: 114 surenin tamamı yüklendi. İkinci tur kaliteyi kuruyor.

Artık her sabah 07:00'de (Europe/Paris) çalışan görev yeni sure eklemez;
**1. duraktan başlayarak** her gün bir durağı üç açıdan elden geçirir:

**Doğrulama.** Her olgusal iddia — nüzul dönemi ve yılı, ayet aralıkları, kişi
ve yer adları, rivayetler — en az iki bağımsız kaynakla denetlenir. Kaynaklar
çelişirse taraf tutulmaz, ihtilaf notu düşülür. Bir rivayetin uydurma ya da
zayıf olduğu tespit edilirse içerik olarak aktarılmaz.

**Sadeleştirme.** Ölçüt tek cümleyle konur: dinî terminoloji bilmeyen bir
okuyucu metni tek okuyuşta anlayabilmeli. Açıklanmadan geçen terim bırakılmaz,
uzun zincirli cümleler bölünür, ansiklopedik üslup anlatıya çevrilir.

**Günümüze uyarlama.** "Bugüne bakan yüz" ve yüzleşme soruları somutlaştırılır:
soyut ahlaki dil yerine kredi borcu, ekran süresi, iş yerinde susmak, aile içi
statü kavgası, algoritmik onay arayışı gibi tanıdık durumlar. Vaaz verilmez,
emir kipi kullanılmaz; betimlenir ve teşhis edilir.

**Gün içi istek.** Belirli bir sureyi istediğinizde ("Yûsuf suresini gözden
geçir" gibi) aynı yordam sıra beklemeden o sureye uygulanır.

**Sıradaki durağı görmek için:**

```bash
cd /home/ubuntu/kuran-yolculugu && node scripts/next-review.mjs
```

**Bir durağın tüm katmanlarını tek dosyada okumak için:**

```bash
python3 /home/ubuntu/cekim/durak_dok.py 1
```

Ayrıntılı yordam `/home/ubuntu/cekim/GUNLUK_TUR2.md` dosyasındadır; ilk turun
yordamı `GUNLUK_EKLEME.md` içinde tarihsel kayıt olarak durur.

## Kalite güvencesi

İçerik bütünlüğü otomatik testlerle korunur. Her yükleme sonrası şunlar
denetlenir: her surenin beyan ettiği kadar ayet kaydı olması, tamamlanmış her
meal kaynağının hiçbir ayeti atlamamış olması, çeviri kaynaklarının izin verilen
dört meal dışına çıkmaması, durak numaralarının kesintisiz olması, her surenin
editoryal katmanlarının dolu olması, dönem ihtilaflarının not edilmiş olması,
ihtilaf notlarının tek görüş anlatmaması, rivayet uyarılarının hüküm belirtmesi,
okuma gezgininde hiçbir ayetin düşmemesi ya da tekrarlanmaması ve metinlere ham
markdown işareti sızmamış olması.

Testleri çalıştırmak için:

```bash
cd /home/ubuntu/kuran-yolculugu && pnpm test
```

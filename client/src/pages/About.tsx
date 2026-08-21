import { Card } from "@/components/ui/card";
import { TRANSLATION_LABELS, TRANSLATION_SOURCES } from "@shared/kuran";

export default function About() {
  return (
    <div className="container max-w-3xl py-10 md:py-16">
      <p className="eyebrow">Yöntem</p>
      <h1 className="mt-2 font-serif text-4xl font-semibold tracking-tight md:text-5xl">
        Bu çalışma nasıl kuruldu?
      </h1>

      <div className="prose-kuran mt-8">
        <p>
          Bu platform, Kur'an'ı mushaf sırasıyla değil <strong>nüzul (iniş) sırasıyla</strong>{" "}
          okumayı esas alır. Gerekçe basittir: metin, yirmi üç yıla yayılan bir tarihin içinde,
          somut olaylara cevap olarak indi. Sırayı iniş zamanına göre kurmak, hangi cümlenin
          hangi soruya karşılık verdiğini görünür kılar.
        </p>
        <p>
          Nüzul tertibi olarak <strong>Prof. Dr. Mehmet Okuyan'ın</strong> tasnifi esas alınmıştır.
          Bu tasnif, kuranokuyan.com üzerinde yayımlanan ve her sure girişinde "inişte kaçıncı"
          bilgisini açıkça veren sıralamadır.
        </p>
      </div>

      <section className="mt-12">
        <h2 className="font-serif text-2xl font-semibold tracking-tight">Meal kaynakları</h2>
        <p className="prose-kuran mt-3">
          Tek bir meale yaslanmak, çeviri tercihlerini metnin kendisi sanmaya yol açar. Bu yüzden
          dört meal yan yana sunulur; aralarındaki fark, düşünmeye davettir. Bunlara ek olarak,
          proje içinde Arapça metinden doğrudan üretilen bir AI tercümesi bulunur: yorum ve
          parantez eklemeden, sade Türkçeyle. Yayımlanmış bir meal değildir, dört mealin ilmî
          sorumluluğunu taşımaz ve arayüzde makine çevirisi olarak işaretlenir.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {TRANSLATION_SOURCES.map(source => {
            const meta = TRANSLATION_LABELS[source];
            return (
              <Card key={source} className="gap-0 border-border/70 px-4 py-3.5 shadow-none">
                <p className="font-serif text-lg font-semibold">{meta.full}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{meta.note}</p>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-serif text-2xl font-semibold tracking-tight">
          İhtilaflar gizlenmez
        </h2>
        <div className="prose-kuran mt-3">
          <p>
            Bir surenin Mekke'de mi Medine'de mi indiği konusunda kaynaklar her zaman anlaşmaz.
            Örneğin <strong>Zilzâl suresi</strong>ni Diyanet İşleri Başkanlığı Medine dönemine
            yerleştirirken, Mehmet Okuyan risaletin 3-4. yılına, yani Mekke dönemine tarihler.
          </p>
          <p>
            Böyle durumlarda taraf tutmak yerine her iki görüş de gösterilir ve durak kartında
            "ihtilaflı" işareti belirir. Bilginin sınırını bilmek, olmayan bir kesinliği taklit
            etmekten yeğdir.
          </p>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-serif text-2xl font-semibold tracking-tight">Esbâb-ı nüzûl</h2>
        <div className="prose-kuran mt-3">
          <p>
            Her durakta, surenin hangi olay üzerine indiğine dair kısa bir tarihsel bağlam
            sunulur. Bu bilgiler klasik tefsir ve siyer literatürüne dayanır; her bölümün altında
            hangi kaynağa dayandığı belirtilir.
          </p>
          <p>
            Rivayetlerin güvenilirlik derecesi birbirinden farklıdır. Zayıf ya da tartışmalı
            rivayetler, kesin bilgi gibi değil, "şöyle nakledilir" kaydıyla aktarılır.
          </p>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-serif text-2xl font-semibold tracking-tight">Ne iddia etmiyor?</h2>
        <div className="prose-kuran mt-3">
          <p>
            Bu platform fetva vermez, hüküm koymaz, bir mezhebi ya da ekolü savunmaz. Yaptığı iş
            daha alçakgönüllüdür: metni tarihsel bağlamına oturtmak, çeviri farklarını görünür
            kılmak ve okuyanı kendi hayatına dönük sorularla yalnız bırakmak.
          </p>
          <p>
            "Bugüne bakan yüz" ve "yüzleşme soruları" bölümleri yorumdur, ayetin kendisi değildir.
            Ayet metni ile onun üzerine söylenen söz, bu sayfalarda tipografiyle de birbirinden
            ayrılmıştır.
          </p>
        </div>
      </section>
    </div>
  );
}

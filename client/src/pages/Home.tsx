import PeriodBadge from "@/components/PeriodBadge";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { TRANSLATION_LABELS, TRANSLATION_SOURCES } from "@shared/kuran";
import { ArrowRight, Clock, Layers, MessageCircleQuestion } from "lucide-react";
import { useMemo } from "react";
import { Link } from "wouter";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const { data: surahs, isLoading } = trpc.surah.list.useQuery({ sort: "station" });
  const { data: progress } = trpc.progress.mine.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const readIds = useMemo(
    () => new Set((progress ?? []).filter(p => p.isRead).map(p => p.surahId)),
    [progress],
  );

  const total = surahs?.length ?? 0;
  const readCount = useMemo(
    () => (surahs ?? []).filter(s => readIds.has(s.id)).length,
    [surahs, readIds],
  );

  /** First unread station, or the last one if everything is read. */
  const nextStation = useMemo(() => {
    if (!surahs?.length) return null;
    return surahs.find(s => !readIds.has(s.id)) ?? surahs[surahs.length - 1];
  }, [surahs, readIds]);

  const latest = useMemo(() => (surahs?.length ? surahs.slice(-3).reverse() : []), [surahs]);

  return (
    <div>
      {/* Hero — asymmetric two-column with a ruled manuscript feel */}
      <section className="border-b border-border/70">
        <div className="container grid gap-12 py-16 md:grid-cols-[1.35fr_1fr] md:gap-16 md:py-24">
          <div>
            <p className="eyebrow">Nüzul sırasına göre rehberli okuma</p>
            <h1 className="mt-4 font-serif text-[2.75rem] font-semibold leading-[1.08] tracking-tight md:text-6xl">
              Kur'an'ı,{" "}
              <span className="italic text-accent-foreground">indiği sırayla</span> ve indiği
              soruların içinde oku.
            </h1>
            <p className="prose-kuran mt-6 max-w-xl !text-lg">
              Metni açıp anlamadan kapatmak yaygın bir tecrübedir. Bu çalışma, her sureyi
              tarihsel bağlamına oturtur, dört mealin farkını yan yana gösterir ve okumayı
              bugünün hayatına dönük somut sorularla bitirir.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              {nextStation ? (
                <Button asChild size="lg" className="h-11">
                  <Link href={`/duraklar/${nextStation.stationNo}`}>
                    {isAuthenticated && readCount > 0
                      ? `Kaldığın yerden devam et`
                      : `Yolculuğa başla`}
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              ) : (
                <Button asChild size="lg" className="h-11">
                  <Link href="/duraklar">Duraklara göz at</Link>
                </Button>
              )}
              <Button asChild variant="outline" size="lg" className="h-11">
                <Link href="/hakkinda">Yöntemi oku</Link>
              </Button>
            </div>

            {isAuthenticated && total > 0 && (
              <div className="mt-10 max-w-sm">
                <div className="flex items-baseline justify-between gap-4 text-sm">
                  <span className="eyebrow">İlerlemen</span>
                  <span className="tnum font-serif text-base font-semibold">
                    {readCount} / {total} durak
                  </span>
                </div>
                <Progress value={total ? (readCount / total) * 100 : 0} className="mt-2 h-1.5" />
              </div>
            )}
          </div>

          {/* Stat rail */}
          <aside className="flex flex-col justify-center gap-6 md:border-l md:border-border/70 md:pl-12">
            <Stat
              icon={Layers}
              value={isLoading ? "—" : String(total)}
              label="işlenmiş durak"
              note="Her durak bir sure; nüzul tertibine göre ilerler."
            />
            <div className="rule-ornament" />
            <Stat
              icon={MessageCircleQuestion}
              value="4"
              label="meal karşılaştırması"
              note="Diyanet, Okuyan, İslamoğlu, Esed — yan yana."
            />
            <div className="rule-ornament" />
            <Stat
              icon={Clock}
              value="23"
              label="yıllık nüzul süreci"
              note="Metin bir defada değil, bir tarihin içinde indi."
            />
          </aside>
        </div>
      </section>

      {/* What each station contains */}
      <section className="container py-16 md:py-20">
        <p className="eyebrow">Her durakta ne var?</p>
        <h2 className="mt-2 max-w-2xl font-serif text-3xl font-semibold tracking-tight md:text-4xl">
          Anlamak için gereken beş katman
        </h2>

        <div className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          <Layer
            no="01"
            title="Sure kimliği"
            body="Nüzul dönemi, ayet sayısı, mushaf ve nüzul sırası. Kaynaklar çelişiyorsa ihtilaf açıkça belirtilir."
          />
          <Layer
            no="02"
            title="Esbâb-ı nüzûl"
            body="Surenin hangi olay üzerine indiği, güvenilir tefsir ve siyer kaynaklarına dayandırılarak kısa biçimde anlatılır."
          />
          <Layer
            no="03"
            title="Dört meal, yan yana"
            body="Aynı ayetin farklı çevirileri karşılaştırılır. Fark, çevirmenin tercihini metnin kendisinden ayırmayı öğretir."
          />
          <Layer
            no="04"
            title="Bugüne bakan yüz"
            body="Surenin dokunduğu insani ve varoluşsal temalar, çağdaş hayatın diliyle açıklanır."
          />
          <Layer
            no="05"
            title="Yüzleşme soruları"
            body="Okuma, bilgiyle değil soruyla biter. Kendine yöneltmen gereken bir ila üç soru sunulur."
          />
          <Layer
            no="06"
            title="Kişisel defter"
            body="Her durakta kendi notunu tutabilir, okuduklarını işaretleyebilir ve ilerlemeni izleyebilirsin."
          />
        </div>
      </section>

      {/* Latest stations */}
      {(isLoading || latest.length > 0) && (
        <section className="border-t border-border/70 bg-card/40 py-16 md:py-20">
          <div className="container">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="eyebrow">Son eklenenler</p>
                <h2 className="mt-2 font-serif text-3xl font-semibold tracking-tight">
                  En yeni duraklar
                </h2>
              </div>
              <Button asChild variant="ghost" size="sm">
                <Link href="/duraklar">
                  Tümünü gör <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {isLoading
                ? Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-32 rounded-lg" />
                  ))
                : latest.map(s => (
                    <Link
                      key={s.id}
                      href={`/duraklar/${s.stationNo}`}
                      className="group rounded-lg border border-border/70 bg-background/70 px-5 py-4 transition-[transform,border-color] duration-200 hover:-translate-y-0.5 hover:border-accent-foreground/30"
                      style={{ transitionTimingFunction: "var(--ease-out)" }}>
                      <div className="flex items-center justify-between gap-3">
                        <span className="tnum text-xs text-muted-foreground">
                          {s.stationNo}. durak
                        </span>
                        <PeriodBadge
                          periodDiyanet={s.periodDiyanet}
                          periodOkuyan={s.periodOkuyan}
                          disputeNote={s.periodDisputeNote}
                          className="text-[0.625rem]"
                        />
                      </div>
                      <p className="mt-2 font-serif text-2xl font-semibold leading-tight">
                        {s.name}
                      </p>
                      {s.stationTitle && (
                        <p className="mt-1.5 line-clamp-2 font-serif text-sm italic text-muted-foreground">
                          {s.stationTitle}
                        </p>
                      )}
                    </Link>
                  ))}
            </div>
          </div>
        </section>
      )}

      {/* Sources */}
      <section className="container py-16 md:py-20">
        <p className="eyebrow">Kaynaklar</p>
        <h2 className="mt-2 font-serif text-3xl font-semibold tracking-tight">
          Hangi meallere dayanıyor?
        </h2>
        <div className="mt-8 grid gap-x-10 gap-y-6 sm:grid-cols-2">
          {TRANSLATION_SOURCES.map(source => {
            const meta = TRANSLATION_LABELS[source];
            return (
              <div key={source} className="border-l-2 border-accent/70 pl-4">
                <p className="font-serif text-lg font-semibold">{meta.full}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{meta.note}</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function Stat({
  icon: Icon,
  value,
  label,
  note,
}: {
  icon: React.ComponentType<{ className?: string }>;
  value: string;
  label: string;
  note: string;
}) {
  return (
    <div>
      <div className="flex items-baseline gap-2.5">
        <Icon className="size-4 shrink-0 translate-y-[-2px] text-accent-foreground" />
        <span className="tnum font-serif text-4xl font-semibold leading-none">{value}</span>
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{note}</p>
    </div>
  );
}

function Layer({ no, title, body }: { no: string; title: string; body: string }) {
  return (
    <div>
      <span className="tnum font-serif text-sm font-semibold text-accent-foreground">{no}</span>
      <h3 className="mt-1.5 font-serif text-xl font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}

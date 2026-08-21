import PeriodBadge from "@/components/PeriodBadge";
import TranslationPanel from "@/components/TranslationPanel";
import { useAuth } from "@/_core/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import { NOTE_KIND_LABELS, type KeyTerm, type ScholarlyNote } from "@shared/kuran";
import {
  ArrowLeft,
  ArrowRight,
  BookMarked,
  Check,
  ChevronLeft,
  HelpCircle,
  Loader2,
  NotebookPen,
  Save,
  Scale,
  ScrollText,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "wouter";
import { toast } from "sonner";

export default function StationDetail() {
  const params = useParams<{ stationNo: string }>();
  const stationNo = Number(params.stationNo);
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();

  const { data, isLoading, error } = trpc.surah.detail.useQuery(
    { stationNo, sort: "station" },
    { enabled: Number.isFinite(stationNo) && stationNo > 0 },
  );

  const [noteDraft, setNoteDraft] = useState("");
  const [noteDirty, setNoteDirty] = useState(false);

  // Sync the draft when a different station loads, without clobbering edits.
  useEffect(() => {
    setNoteDraft(data?.note ?? "");
    setNoteDirty(false);
  }, [data?.surah.id, data?.note]);

  const toggleProgress = trpc.progress.toggle.useMutation({
    onMutate: async ({ isRead }) => {
      // Optimistic flip so the checkmark responds instantly.
      const key = { stationNo, sort: "station" as const };
      const previous = utils.surah.detail.getData(key);
      utils.surah.detail.setData(key, old => (old ? { ...old, isRead } : old));
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        utils.surah.detail.setData({ stationNo, sort: "station" }, context.previous);
      }
      toast.error("İşaretleme kaydedilemedi.");
    },
    onSettled: () => {
      utils.progress.mine.invalidate();
    },
  });

  const saveNote = trpc.notes.save.useMutation({
    onSuccess: () => {
      setNoteDirty(false);
      utils.surah.detail.invalidate({ stationNo, sort: "station" });
      utils.notes.mine.invalidate();
      toast.success("Not kaydedildi.");
    },
    onError: () => toast.error("Not kaydedilemedi."),
  });

  if (isLoading) {
    return (
      <div className="container max-w-4xl py-12">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="mt-4 h-14 w-72" />
        <Skeleton className="mt-8 h-40 w-full" />
        <Skeleton className="mt-4 h-64 w-full" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container max-w-2xl py-24 text-center">
        <h1 className="font-serif text-3xl font-semibold">Durak bulunamadı</h1>
        <p className="mt-3 text-muted-foreground">
          {stationNo ? `${stationNo}. durak` : "Bu durak"} henüz yolculuğa eklenmemiş.
        </p>
        <Button asChild className="mt-6">
          <Link href="/duraklar">
            <ChevronLeft className="size-4" /> Duraklara dön
          </Link>
        </Button>
      </div>
    );
  }

  const { surah, verses, translations, themes, questions, adjacent, isRead } = data;
  const keyTerms = (surah.keyTerms ?? []) as KeyTerm[];
  const scholarlyNotes = (surah.scholarlyNotes ?? []) as ScholarlyNote[];

  return (
    <article className="pb-16">
      {/* Header band */}
      <div className="border-b border-border/70 bg-card/50">
        <div className="container max-w-4xl py-8 md:py-12">
          <Link
            href="/duraklar"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
            <ChevronLeft className="size-4" /> Duraklar
          </Link>

          <div className="mt-5 flex flex-wrap items-start justify-between gap-6">
            <div className="min-w-0">
              <div className="flex items-center gap-2.5">
                <span className="flex size-9 items-center justify-center rounded-md border border-accent-foreground/30 bg-accent/40">
                  <span className="tnum font-serif text-base font-semibold text-accent-foreground">
                    {surah.stationNo}
                  </span>
                </span>
                <span className="eyebrow">{surah.stationNo}. Durak</span>
              </div>

              <h1 className="mt-3 font-serif text-4xl font-semibold tracking-tight md:text-5xl">
                {surah.name} Suresi
              </h1>

              {surah.nameMeaning && (
                <p className="mt-1.5 font-serif text-lg italic text-muted-foreground">
                  {surah.nameMeaning}
                </p>
              )}

              {surah.stationTitle && (
                <p className="prose-kuran mt-4 max-w-2xl !text-lg">{surah.stationTitle}</p>
              )}
            </div>

            {surah.nameArabic && (
              <span className="arabic shrink-0 font-serif text-4xl text-muted-foreground/60">
                {surah.nameArabic}
              </span>
            )}
          </div>

          {/* Meta strip */}
          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
            <PeriodBadge
              periodDiyanet={surah.periodDiyanet}
              periodOkuyan={surah.periodOkuyan}
              disputeNote={surah.periodDisputeNote}
            />
            <span className="tnum">{surah.verseCount} ayet</span>
            <span className="text-border">·</span>
            <span className="tnum">Mushaf sırası {surah.surahNo}</span>
            <span className="text-border">·</span>
            <span className="tnum">Nüzul sırası {surah.nuzulOrderOkuyan} (Okuyan)</span>
            {surah.revelationTiming && (
              <>
                <span className="text-border">·</span>
                <span>{surah.revelationTiming}</span>
              </>
            )}
          </div>

          {/* Read toggle */}
          <div className="mt-6">
            {isAuthenticated ? (
              <Button
                variant={isRead ? "default" : "outline"}
                size="sm"
                disabled={toggleProgress.isPending}
                onClick={() =>
                  toggleProgress.mutate({ surahId: surah.id, isRead: !isRead })
                }
                className="h-9 bg-transparent data-[read=true]:bg-primary"
                data-read={isRead}>
                {isRead ? (
                  <>
                    <Check className="size-4" /> Okundu olarak işaretli
                  </>
                ) : (
                  <>
                    <BookMarked className="size-4" /> Okudum olarak işaretle
                  </>
                )}
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={() => startLogin()} className="h-9">
                İlerlemeni kaydetmek için giriş yap
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="container max-w-4xl">
        {/* AI reading — produced from the Arabic text, first thing the reader meets */}
        {surah.aiParagraph && (
          <section className="mt-10">
            <div className="rounded-xl border border-border/70 bg-secondary/25 px-5 py-5 sm:px-6 sm:py-6">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <p className="eyebrow">Bir bakışta</p>
                <span className="rounded-md border border-border/60 bg-background/60 px-1.5 py-0.5 text-[0.625rem] uppercase tracking-wider text-muted-foreground">
                  AI okuması
                </span>
              </div>
              <p className="prose-kuran !text-[1.0625rem]">{surah.aiParagraph}</p>
              <p className="mt-3.5 text-xs leading-relaxed text-muted-foreground">
                Bu paragraf, surenin Arapça metninden yapay zekâ tarafından üretildi; bir
                âlimin yorumu değil, bir giriş okumasıdır. Aşağıdaki bölümler kaynaklara dayanır.
              </p>
            </div>
          </section>
        )}

        {/* Introduction */}
        {surah.introduction && (
          <Section icon={ScrollText} eyebrow="Sure hakkında" title="Bu sure neyi anlatıyor?">
            <div className="prose-kuran">
              {surah.introduction.split("\n\n").map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </Section>
        )}

        {/* Occasion of revelation */}
        {surah.occasionOfRevelation && (
          <Section
            icon={Sparkles}
            eyebrow="Esbâb-ı nüzûl"
            title="Hangi olay üzerine indi?">
            <div className="prose-kuran">
              {surah.occasionOfRevelation.split("\n\n").map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            {surah.occasionSources && (
              <p className="mt-4 border-l-2 border-accent-foreground/30 pl-3 text-xs leading-relaxed text-muted-foreground">
                <span className="font-medium">Kaynak:</span> {surah.occasionSources}
              </p>
            )}
          </Section>
        )}

        {/* Source-criticism layer */}
        {scholarlyNotes.length > 0 && (
          <Section
            icon={Scale}
            eyebrow="Kaynak notları"
            title="Bu surede neyi kesin, neyi tartışmalı bilmelisin?">
            <p className="prose-kuran !text-base !text-muted-foreground">
              Aşağıdaki notlar, bu durağın içeriği hazırlanırken yapılan çapraz kaynak
              denetiminin çıktısıdır. Amaç, tartışmalı bir okuyuşu yerleşik bir bilgi gibi
              sunmamaktır.
            </p>
            <div className="mt-5 space-y-3">
              {scholarlyNotes.map((note, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-border/70 bg-card/40 px-4 py-3.5">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1.5">
                    <Badge
                      variant="outline"
                      className="shrink-0 border-accent-foreground/30 bg-accent/30 text-[0.7rem] font-medium tracking-wide text-accent-foreground">
                      {NOTE_KIND_LABELS[note.kind] ?? note.kind}
                    </Badge>
                    <p className="font-serif text-lg font-semibold">{note.label}</p>
                  </div>
                  <p className="prose-kuran mt-2 !text-base">{note.body}</p>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Key terms */}
        {keyTerms.length > 0 && (
          <Section eyebrow="Anahtar kavramlar" title="Metnin taşıyıcı kelimeleri">
            <div className="grid gap-3 sm:grid-cols-2">
              {keyTerms.map((term, i) => (
                <Card
                  key={i}
                  className="gap-0 border-border/70 px-4 py-3.5 shadow-none">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="font-serif text-lg font-semibold italic">{term.term}</p>
                    {term.arabic && (
                      <span className="arabic text-base text-muted-foreground">
                        {term.arabic}
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-foreground/80">
                    {term.meaning}
                  </p>
                  {term.verseRef && (
                    <p className="tnum mt-2 text-xs text-muted-foreground">{term.verseRef}</p>
                  )}
                </Card>
              ))}
            </div>
          </Section>
        )}

        {/* Translation comparison */}
        <Section eyebrow="Meal karşılaştırması" title="Aynı ayet, farklı okuyuşlar">
          <TranslationPanel
            translations={translations}
            verses={verses}
            verseCount={surah.verseCount}
          />
        </Section>

        {/* Contemporary meaning */}
        {surah.contemporaryMeaning && (
          <Section eyebrow="Bugüne bakan yüz" title="Bu sure bugünün insanına ne söylüyor?">
            <div className="prose-kuran">
              {surah.contemporaryMeaning.split("\n\n").map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </Section>
        )}

        {/* Themes */}
        {themes.length > 0 && (
          <Section eyebrow="İnsani ve varoluşsal temalar" title="Sure hangi insani soruna dokunuyor?">
            <div className="space-y-3">
              {themes.map(theme => (
                <div
                  key={theme.id}
                  className="rounded-lg border border-border/70 bg-card/50 px-4 py-3.5">
                  <p className="font-serif text-lg font-semibold">{theme.label}</p>
                  {theme.body && (
                    <p className="prose-kuran mt-1.5 !text-base">{theme.body}</p>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Confrontation questions */}
        {questions.length > 0 && (
          <Section
            icon={HelpCircle}
            eyebrow="Güncel yüzleşme soruları"
            title="Bugün kendine ne sormalısın?">
            <ol className="space-y-3">
              {questions.map((q, i) => (
                <li
                  key={q.id}
                  className="flex gap-3.5 rounded-lg border border-accent-foreground/20 bg-accent/25 px-4 py-3.5">
                  <span className="tnum mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-accent-foreground/85 font-serif text-xs font-semibold text-background">
                    {i + 1}
                  </span>
                  <p className="prose-kuran !text-base !text-foreground/90">{q.body}</p>
                </li>
              ))}
            </ol>
          </Section>
        )}

        {/* Personal note */}
        <Section icon={NotebookPen} eyebrow="Kişisel defter" title="Bu durakta senin notun">
          {isAuthenticated ? (
            <div className="space-y-3">
              <Textarea
                value={noteDraft}
                onChange={e => {
                  setNoteDraft(e.target.value);
                  setNoteDirty(true);
                }}
                placeholder="Bu sure sana ne söyledi? Hangi soru seni durdurdu? Buraya yaz…"
                className="min-h-[160px] resize-y font-serif text-base leading-relaxed"
              />
              <div className="flex items-center gap-3">
                <Button
                  size="sm"
                  disabled={!noteDirty || saveNote.isPending}
                  onClick={() => saveNote.mutate({ surahId: surah.id, body: noteDraft })}
                  className="h-9">
                  {saveNote.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Save className="size-4" />
                  )}
                  Notu kaydet
                </Button>
                {noteDirty && (
                  <span className="text-xs text-muted-foreground">Kaydedilmemiş değişiklik var</span>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-border px-5 py-8 text-center">
              <p className="text-sm text-muted-foreground">
                Kendi notlarını tutmak için giriş yapman gerekiyor.
              </p>
              <Button variant="outline" size="sm" onClick={() => startLogin()} className="mt-4">
                Giriş yap
              </Button>
            </div>
          )}
        </Section>

        {/* Prev / next */}
        <nav className="mt-14 grid gap-3 border-t border-border/70 pt-8 sm:grid-cols-2">
          {adjacent.prev ? (
            <Link
              href={`/duraklar/${adjacent.prev.stationNo}`}
              className="group rounded-lg border border-border/70 px-4 py-3.5 transition-colors duration-200 hover:border-accent-foreground/30 hover:bg-accent/20">
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <ArrowLeft className="size-3.5" /> Önceki durak
              </span>
              <p className="mt-1 font-serif text-lg font-semibold">
                <span className="tnum text-muted-foreground">{adjacent.prev.stationNo}.</span>{" "}
                {adjacent.prev.name}
              </p>
            </Link>
          ) : (
            <div />
          )}

          {adjacent.next && (
            <Link
              href={`/duraklar/${adjacent.next.stationNo}`}
              className="group rounded-lg border border-border/70 px-4 py-3.5 text-right transition-colors duration-200 hover:border-accent-foreground/30 hover:bg-accent/20 sm:col-start-2">
              <span className="flex items-center justify-end gap-1.5 text-xs text-muted-foreground">
                Sonraki durak <ArrowRight className="size-3.5" />
              </span>
              <p className="mt-1 font-serif text-lg font-semibold">
                <span className="tnum text-muted-foreground">{adjacent.next.stationNo}.</span>{" "}
                {adjacent.next.name}
              </p>
            </Link>
          )}
        </nav>
      </div>
    </article>
  );
}

/** Consistent section shell: eyebrow label, serif heading, ornamented rule. */
function Section({
  eyebrow,
  title,
  icon: Icon,
  children,
}: {
  eyebrow: string;
  title: string;
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-12">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="size-3.5 text-accent-foreground" />}
        <p className="eyebrow">{eyebrow}</p>
      </div>
      <h2 className="mt-1.5 font-serif text-2xl font-semibold tracking-tight md:text-[1.75rem]">
        {title}
      </h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  TRANSLATION_LABELS,
  TRANSLATION_SOURCES,
  type TranslationSource,
} from "@shared/kuran";
import { Columns2, Info, Rows3 } from "lucide-react";
import { useMemo, useState } from "react";

type TranslationRow = {
  id: number;
  verseNo: number;
  verseNoEnd: number | null;
  source: TranslationSource;
  text: string;
};

type VerseRow = { id: number; verseNo: number; textArabic: string };

/** Formats "6" or "6-7" for grouped verses. */
function verseLabel(verseNo: number, verseNoEnd: number | null) {
  return verseNoEnd && verseNoEnd !== verseNo ? `${verseNo}-${verseNoEnd}` : `${verseNo}`;
}

export default function TranslationPanel({
  translations,
  verses,
  verseCount,
}: {
  translations: TranslationRow[];
  verses: VerseRow[];
  verseCount: number;
}) {
  /** Only offer sources that actually have rows for this surah. */
  const availableSources = useMemo(() => {
    const present = new Set(translations.map(t => t.source));
    return TRANSLATION_SOURCES.filter(s => present.has(s));
  }, [translations]);

  const [active, setActive] = useState<TranslationSource[]>(() =>
    availableSources.length ? availableSources.slice(0, 2) : [],
  );
  const [layout, setLayout] = useState<"compare" | "stack">("compare");
  const [showArabic, setShowArabic] = useState(true);

  const arabicByVerse = useMemo(
    () => new Map(verses.map(v => [v.verseNo, v.textArabic])),
    [verses],
  );

  /** Group translations by starting verse so each row lines the sources up. */
  const rows = useMemo(() => {
    const byVerse = new Map<number, { verseNoEnd: number | null; bySource: Map<TranslationSource, string> }>();
    for (const t of translations) {
      const entry = byVerse.get(t.verseNo) ?? { verseNoEnd: t.verseNoEnd, bySource: new Map() };
      // Keep the widest grouping any source uses, so the label covers all of them.
      if ((t.verseNoEnd ?? t.verseNo) > (entry.verseNoEnd ?? t.verseNo)) {
        entry.verseNoEnd = t.verseNoEnd;
      }
      entry.bySource.set(t.source, t.text);
      byVerse.set(t.verseNo, entry);
    }
    return Array.from(byVerse.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([verseNo, v]) => ({ verseNo, verseNoEnd: v.verseNoEnd, bySource: v.bySource }));
  }, [translations]);

  const toggleSource = (source: TranslationSource) => {
    setActive(prev =>
      prev.includes(source)
        ? prev.length > 1
          ? prev.filter(s => s !== source)
          : prev
        : [...prev, source],
    );
  };

  if (!availableSources.length) {
    return (
      <div className="rounded-lg border border-dashed border-border py-12 text-center">
        <p className="font-serif text-lg text-muted-foreground">
          Bu sure için henüz meal metni girilmedi.
        </p>
      </div>
    );
  }

  const activeOrdered = availableSources.filter(s => active.includes(s));
  const coverage = rows.length;

  return (
    <div className="space-y-4">
      {/* Source selector */}
      <div className="flex flex-col gap-3 rounded-lg border border-border/70 bg-card/60 p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-1.5">
          {availableSources.map(source => {
            const isActive = active.includes(source);
            const meta = TRANSLATION_LABELS[source];
            return (
              <Tooltip key={source}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => toggleSource(source)}
                    aria-pressed={isActive}
                    className={cn(
                      "rounded-md border px-2.5 py-1.5 text-xs font-medium transition-all duration-200 active:scale-[0.97]",
                      isActive
                        ? "border-accent-foreground/40 bg-accent/50 text-accent-foreground"
                        : "border-border/70 bg-transparent text-muted-foreground hover:border-border hover:text-foreground",
                    )}
                    style={{ transitionTimingFunction: "var(--ease-out)" }}>
                    {meta.short}
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-[15rem] text-left">
                  <p className="font-medium">{meta.full}</p>
                  <p className="mt-0.5 text-xs opacity-90">{meta.note}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowArabic(v => !v)}
            className="h-8 px-2.5 text-xs">
            {showArabic ? "Arapçayı gizle" : "Arapçayı göster"}
          </Button>
          <div className="flex rounded-md border border-border/70 p-0.5">
            <button
              type="button"
              onClick={() => setLayout("compare")}
              aria-label="Yan yana"
              aria-pressed={layout === "compare"}
              className={cn(
                "rounded p-1.5 transition-colors duration-150",
                layout === "compare"
                  ? "bg-secondary text-secondary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}>
              <Columns2 className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setLayout("stack")}
              aria-label="Alt alta"
              aria-pressed={layout === "stack"}
              className={cn(
                "rounded p-1.5 transition-colors duration-150",
                layout === "stack"
                  ? "bg-secondary text-secondary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}>
              <Rows3 className="size-3.5" />
            </button>
          </div>
        </div>
      </div>

      {coverage < verseCount && (
        <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
          <Info className="mt-0.5 size-3.5 shrink-0" />
          <span>
            Bu durakta {verseCount} ayetin <span className="tnum">{coverage}</span> tanesi için
            meal metni girilmiş durumda.
          </span>
        </p>
      )}

      {/* Verse rows */}
      <div className="space-y-3">
        {rows.map(row => (
          <Card key={row.verseNo} className="gap-0 overflow-hidden border-border/70 py-0 shadow-none">
            <div className="flex items-center gap-2 border-b border-border/60 bg-secondary/35 px-4 py-2">
              <span className="tnum font-serif text-sm font-semibold">
                {verseLabel(row.verseNo, row.verseNoEnd)}
              </span>
              <span className="text-[0.625rem] uppercase tracking-wider text-muted-foreground">
                ayet
              </span>
            </div>

            {showArabic && arabicByVerse.has(row.verseNo) && (
              <div className="border-b border-border/50 bg-background/40 px-4 py-3.5">
                <p className="arabic text-[1.375rem] text-foreground/90">
                  {arabicByVerse.get(row.verseNo)}
                </p>
              </div>
            )}

            <div
              className={cn(
                "divide-border/50",
                layout === "compare" && activeOrdered.length > 1
                  ? "grid divide-y sm:divide-x sm:divide-y-0"
                  : "divide-y",
                layout === "compare" && activeOrdered.length === 2 && "sm:grid-cols-2",
                layout === "compare" && activeOrdered.length === 3 && "sm:grid-cols-3",
                layout === "compare" && activeOrdered.length >= 4 && "sm:grid-cols-2 lg:grid-cols-4",
              )}>
              {activeOrdered.map(source => {
                const text = row.bySource.get(source);
                return (
                  <div key={source} className="px-4 py-3.5">
                    <p className="eyebrow mb-1.5">{TRANSLATION_LABELS[source].short}</p>
                    {text ? (
                      <p className="prose-kuran !text-base">{text}</p>
                    ) : (
                      <p className="text-sm italic text-muted-foreground/70">
                        Bu ayet için metin girilmedi.
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

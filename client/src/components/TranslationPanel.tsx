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
import { useEffect, useMemo, useState } from "react";

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

/**
 * Above this many verse rows a surah stops being readable as one scroll — Bakara
 * alone is 286 verses. Long surahs get split into fixed blocks the reader can
 * jump between; short ones stay untouched so nothing changes for most stations.
 */
const CHUNK_THRESHOLD = 40;
const CHUNK_SIZE = 20;

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

  // Open on Diyanet plus the AI reading: the pairing a newcomer benefits from
  // most, since the machine rendering carries no parenthetical commentary.
  const [active, setActive] = useState<TranslationSource[]>(() => {
    if (!availableSources.length) return [];
    const preferred = availableSources.filter(s => s === "diyanet" || s === "ai");
    return preferred.length >= 2 ? preferred : availableSources.slice(0, 2);
  });
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

  const chunked = rows.length > CHUNK_THRESHOLD;
  const chunks = useMemo(() => {
    if (!chunked) return [rows];
    const out: typeof rows[] = [];
    for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
      out.push(rows.slice(i, i + CHUNK_SIZE));
    }
    return out;
  }, [rows, chunked]);

  const [chunkIndex, setChunkIndex] = useState(0);
  // Switching surah remounts with new rows; clamp so a stale index cannot
  // leave the reader staring at an empty panel.
  useEffect(() => {
    setChunkIndex(i => (i < chunks.length ? i : 0));
  }, [chunks.length]);

  const visibleRows = chunked ? (chunks[chunkIndex] ?? chunks[0] ?? []) : rows;

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
                    {source === "ai" && (
                      <span className="ml-1 opacity-60" aria-hidden>
                        ✦
                      </span>
                    )}
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

      {/* Reading navigator — only for surahs long enough to need it */}
      {chunked && (
        <div className="flex flex-col gap-2.5 rounded-lg border border-border/70 bg-secondary/25 p-3">
          <div className="flex items-center justify-between gap-3">
            <p className="eyebrow">Okuma bölümü</p>
            <p className="tnum text-xs text-muted-foreground">
              {visibleRows.length ? verseLabel(visibleRows[0].verseNo, null) : "—"}
              {visibleRows.length > 1 &&
                `–${verseLabel(visibleRows[visibleRows.length - 1].verseNo, null)}`}
              {" / "}
              {verseCount} ayet
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {chunks.map((chunk, i) => {
              const first = chunk[0]?.verseNo ?? 0;
              const last = chunk[chunk.length - 1]?.verseNo ?? first;
              const isActive = i === chunkIndex;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setChunkIndex(i)}
                  aria-pressed={isActive}
                  className={cn(
                    "tnum rounded-md border px-2 py-1 text-xs transition-all duration-200 active:scale-[0.97]",
                    isActive
                      ? "border-accent-foreground/40 bg-accent/50 text-accent-foreground"
                      : "border-border/70 text-muted-foreground hover:border-border hover:text-foreground",
                  )}
                  style={{ transitionTimingFunction: "var(--ease-out)" }}>
                  {first}–{last}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Verse rows */}
      <div className="space-y-3">
        {visibleRows.map(row => (
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
                  <div
                    key={source}
                    className={cn("px-4 py-3.5", source === "ai" && "bg-muted/25")}>
                    <p className="eyebrow mb-1.5">
                      {TRANSLATION_LABELS[source].short}
                      {source === "ai" && (
                        <span className="ml-1.5 font-normal normal-case tracking-normal opacity-70">
                          makine çevirisi
                        </span>
                      )}
                    </p>
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

      {chunked && (
        <div className="flex items-center justify-between gap-3 border-t border-border/60 pt-3">
          <Button
            variant="outline"
            size="sm"
            disabled={chunkIndex === 0}
            onClick={() => setChunkIndex(i => Math.max(0, i - 1))}
            className="bg-background">
            Önceki bölüm
          </Button>
          <span className="tnum text-xs text-muted-foreground">
            {chunkIndex + 1} / {chunks.length}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={chunkIndex >= chunks.length - 1}
            onClick={() => setChunkIndex(i => Math.min(chunks.length - 1, i + 1))}
            className="bg-background">
            Sonraki bölüm
          </Button>
        </div>
      )}
    </div>
  );
}

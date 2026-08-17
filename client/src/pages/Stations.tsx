import StationCard from "@/components/StationCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { SORT_LABELS, SURAH_SORT_KEYS, type SurahSortKey } from "@shared/kuran";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";

type PeriodFilter = "all" | "Mekke" | "Medine";

export default function Stations() {
  const { isAuthenticated } = useAuth();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SurahSortKey>("station");
  const [period, setPeriod] = useState<PeriodFilter>("all");

  const listInput = useMemo(
    () => ({
      sort,
      period: period === "all" ? undefined : period,
      search: search.trim() || undefined,
    }),
    [sort, period, search],
  );

  const { data: surahs, isLoading } = trpc.surah.list.useQuery(listInput);
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

  const hasFilters = search.trim() !== "" || period !== "all" || sort !== "station";

  return (
    <div className="container py-10 md:py-14">
      <header className="max-w-2xl">
        <p className="eyebrow">Yolculuk</p>
        <h1 className="mt-2 font-serif text-4xl font-semibold tracking-tight md:text-5xl">
          Duraklar
        </h1>
        <p className="prose-kuran mt-4">
          Her durak bir suredir. Sıralama, Prof. Dr. Mehmet Okuyan'ın nüzul tertibine dayanır;
          yolculuk sırası ise bu tertibi izleyerek okunan surelerin kişisel kaydıdır.
        </p>
      </header>

      {/* Progress summary — only meaningful when signed in */}
      {isAuthenticated && total > 0 && (
        <div className="mt-8 max-w-md rounded-lg border border-border/70 bg-card/70 p-4">
          <div className="flex items-baseline justify-between gap-4">
            <span className="eyebrow">Okunan duraklar</span>
            <span className="tnum font-serif text-lg font-semibold">
              {readCount} / {total}
            </span>
          </div>
          <Progress
            value={total ? (readCount / total) * 100 : 0}
            className="mt-2.5 h-1.5"
          />
        </div>
      )}

      {/* Controls */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Sure adı, tema veya anahtar kelime ara…"
            className="h-10 pl-9 pr-9"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Aramayı temizle"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground">
              <X className="size-4" />
            </button>
          )}
        </div>

        <Select value={period} onValueChange={v => setPeriod(v as PeriodFilter)}>
          <SelectTrigger className="h-10 w-full sm:w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm dönemler</SelectItem>
            <SelectItem value="Mekke">Mekke dönemi</SelectItem>
            <SelectItem value="Medine">Medine dönemi</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sort} onValueChange={v => setSort(v as SurahSortKey)}>
          <SelectTrigger className="h-10 w-full sm:w-[210px]">
            <SlidersHorizontal className="size-3.5 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SURAH_SORT_KEYS.map(key => (
              <SelectItem key={key} value={key}>
                {SORT_LABELS[key]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {hasFilters && (
        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="secondary" className="tnum font-normal">
            {total} sonuç
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={() => {
              setSearch("");
              setPeriod("all");
              setSort("station");
            }}>
            Filtreleri sıfırla
          </Button>
        </div>
      )}

      {/* Grid */}
      {isLoading ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[168px] rounded-lg" />
          ))}
        </div>
      ) : total === 0 ? (
        <div className="mt-16 rounded-lg border border-dashed border-border py-16 text-center">
          <p className="font-serif text-xl text-muted-foreground">Sonuç bulunamadı</p>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Farklı bir anahtar kelime veya dönem filtresi deneyin.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {surahs!.map((s, i) => (
            <StationCard key={s.id} surah={s} isRead={readIds.has(s.id)} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}


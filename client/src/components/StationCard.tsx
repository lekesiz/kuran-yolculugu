import PeriodBadge from "@/components/PeriodBadge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { Link } from "wouter";

export type StationCardData = {
  id: number;
  stationNo: number;
  surahNo: number;
  nuzulOrderOkuyan: number;
  name: string;
  nameArabic: string | null;
  nameMeaning: string | null;
  verseCount: number;
  periodDiyanet: "Mekke" | "Medine";
  periodOkuyan: "Mekke" | "Medine";
  periodDisputeNote: string | null;
  revelationTiming: string | null;
  stationTitle: string | null;
};

export default function StationCard({
  surah,
  isRead,
  index,
}: {
  surah: StationCardData;
  isRead: boolean;
  index: number;
}) {
  return (
    <Link href={`/duraklar/${surah.stationNo}`} className="group block">
      <Card
        className="relative h-full gap-0 overflow-hidden border-border/70 py-0 shadow-none transition-[transform,box-shadow,border-color] duration-200 group-hover:-translate-y-0.5 group-hover:border-accent-foreground/30 group-hover:shadow-[0_8px_24px_-12px_rgba(0,0,0,0.18)]"
        style={{
          transitionTimingFunction: "var(--ease-out)",
          animationDelay: `${Math.min(index, 12) * 40}ms`,
        }}>
        {/* Station number rail */}
        <div className="flex items-stretch">
          <div
            className={cn(
              "flex w-14 shrink-0 flex-col items-center justify-center gap-1 border-r border-border/70 py-5",
              isRead ? "bg-accent/35" : "bg-secondary/40",
            )}>
            <span className="tnum font-serif text-xl font-semibold leading-none">
              {surah.stationNo}
            </span>
            <span className="text-[0.5625rem] uppercase tracking-wider text-muted-foreground">
              durak
            </span>
            {isRead && (
              <span className="mt-0.5 flex size-4 items-center justify-center rounded-full bg-accent-foreground/85">
                <Check className="size-2.5 text-background" strokeWidth={3} />
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1 px-4 py-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="truncate font-serif text-xl font-semibold leading-tight">
                  {surah.name}
                </h3>
                {surah.nameMeaning && (
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {surah.nameMeaning}
                  </p>
                )}
              </div>
              {surah.nameArabic && (
                <span className="arabic shrink-0 text-lg leading-none text-muted-foreground/80">
                  {surah.nameArabic}
                </span>
              )}
            </div>

            {surah.stationTitle && (
              <p className="mt-2.5 line-clamp-2 font-serif text-[0.9375rem] italic leading-snug text-foreground/75">
                {surah.stationTitle}
              </p>
            )}

            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[0.6875rem] text-muted-foreground">
              <PeriodBadge
                periodDiyanet={surah.periodDiyanet}
                periodOkuyan={surah.periodOkuyan}
                disputeNote={surah.periodDisputeNote}
                className="text-[0.625rem]"
              />
              <span className="tnum">{surah.verseCount} ayet</span>
              <span className="text-border">·</span>
              <span className="tnum">Mushaf {surah.surahNo}</span>
              <span className="text-border">·</span>
              <span className="tnum">Nüzul {surah.nuzulOrderOkuyan}</span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}

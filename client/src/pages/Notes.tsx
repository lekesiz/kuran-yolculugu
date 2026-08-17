import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import { NotebookPen } from "lucide-react";
import { Link } from "wouter";

export default function Notes() {
  const { isAuthenticated, loading } = useAuth();
  const { data: notes, isLoading } = trpc.notes.mine.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  if (loading) {
    return (
      <div className="container max-w-3xl py-12">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="mt-6 h-32 w-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container max-w-xl py-24 text-center">
        <NotebookPen className="mx-auto size-8 text-muted-foreground" />
        <h1 className="mt-4 font-serif text-3xl font-semibold">Notlarım</h1>
        <p className="prose-kuran mt-3">
          Her durakta tuttuğun notlar burada toplanır. Görmek için giriş yapman gerekiyor.
        </p>
        <Button onClick={() => startLogin()} className="mt-6">
          Giriş yap
        </Button>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl py-10 md:py-14">
      <p className="eyebrow">Kişisel defter</p>
      <h1 className="mt-2 font-serif text-4xl font-semibold tracking-tight">Notlarım</h1>
      <p className="prose-kuran mt-3">
        Duraklarda yazdığın notlar, yolculuk sırasına göre burada birikir.
      </p>

      {isLoading ? (
        <div className="mt-8 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-lg" />
          ))}
        </div>
      ) : !notes?.length ? (
        <div className="mt-10 rounded-lg border border-dashed border-border py-16 text-center">
          <p className="font-serif text-xl text-muted-foreground">Henüz not yok</p>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Bir durağa gidip aşağıdaki kişisel defter bölümüne yazdıklarını buradan izleyebilirsin.
          </p>
          <Button asChild variant="outline" size="sm" className="mt-5">
            <Link href="/duraklar">Duraklara göz at</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-8 space-y-3">
          {notes.map(note => (
            <Card key={note.surahId} className="gap-0 border-border/70 px-5 py-4 shadow-none">
              <Link
                href={`/duraklar/${note.stationNo}`}
                className="group flex items-baseline gap-2 transition-colors hover:text-accent-foreground">
                <span className="tnum font-serif text-sm text-muted-foreground">
                  {note.stationNo}. durak
                </span>
                <span className="font-serif text-lg font-semibold">{note.surahName}</span>
              </Link>
              <p className="prose-kuran mt-2 whitespace-pre-wrap !text-base">{note.body}</p>
              <p className="mt-3 text-xs text-muted-foreground">
                {new Date(note.updatedAt).toLocaleString("tr-TR", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

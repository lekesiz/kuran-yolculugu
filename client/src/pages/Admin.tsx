import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import { TRANSLATION_LABELS, TRANSLATION_SOURCES, type TranslationSource } from "@shared/kuran";
import { Loader2, Lock, Plus, Save, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type KeyTermDraft = { term: string; arabic: string; meaning: string; verseRef: string };
type ThemeDraft = { label: string; body: string };
type TranslationDraft = {
  verseNo: string;
  verseNoEnd: string;
  source: TranslationSource;
  text: string;
};
type VerseDraft = { verseNo: string; textArabic: string };

type FormState = {
  stationNo: string;
  surahNo: string;
  nuzulOrderOkuyan: string;
  name: string;
  nameArabic: string;
  nameMeaning: string;
  verseCount: string;
  periodDiyanet: "Mekke" | "Medine";
  periodOkuyan: "Mekke" | "Medine";
  periodDisputeNote: string;
  revelationTiming: string;
  stationTitle: string;
  introduction: string;
  occasionOfRevelation: string;
  occasionSources: string;
  contemporaryMeaning: string;
};

const emptyForm: FormState = {
  stationNo: "",
  surahNo: "",
  nuzulOrderOkuyan: "",
  name: "",
  nameArabic: "",
  nameMeaning: "",
  verseCount: "",
  periodDiyanet: "Mekke",
  periodOkuyan: "Mekke",
  periodDisputeNote: "",
  revelationTiming: "",
  stationTitle: "",
  introduction: "",
  occasionOfRevelation: "",
  occasionSources: "",
  contemporaryMeaning: "",
};

export default function Admin() {
  const { user, loading, isAuthenticated } = useAuth();
  const utils = trpc.useUtils();

  const [mode, setMode] = useState<"create" | "edit">("create");
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [keyTerms, setKeyTerms] = useState<KeyTermDraft[]>([]);
  const [themes, setThemes] = useState<ThemeDraft[]>([]);
  const [questions, setQuestions] = useState<string[]>([]);
  const [translationRows, setTranslationRows] = useState<TranslationDraft[]>([]);
  const [verseRows, setVerseRows] = useState<VerseDraft[]>([]);

  const isAdmin = user?.role === "admin";

  const { data: surahs } = trpc.surah.list.useQuery(
    { sort: "station" },
    { enabled: isAdmin },
  );
  const { data: nextNo } = trpc.admin.nextStationNo.useQuery(undefined, { enabled: isAdmin });
  const { data: editData } = trpc.admin.surahForEdit.useQuery(
    { id: editId! },
    { enabled: isAdmin && editId !== null },
  );

  // Default the station number for new records once the server tells us the next free slot.
  useEffect(() => {
    if (mode === "create" && nextNo && !form.stationNo) {
      setForm(f => ({ ...f, stationNo: String(nextNo) }));
    }
  }, [mode, nextNo, form.stationNo]);

  // Populate the form when an existing surah is selected for editing.
  useEffect(() => {
    if (mode !== "edit" || !editData) return;
    const s = editData.surah;
    setForm({
      stationNo: String(s.stationNo),
      surahNo: String(s.surahNo),
      nuzulOrderOkuyan: String(s.nuzulOrderOkuyan),
      name: s.name,
      nameArabic: s.nameArabic ?? "",
      nameMeaning: s.nameMeaning ?? "",
      verseCount: String(s.verseCount),
      periodDiyanet: s.periodDiyanet,
      periodOkuyan: s.periodOkuyan,
      periodDisputeNote: s.periodDisputeNote ?? "",
      revelationTiming: s.revelationTiming ?? "",
      stationTitle: s.stationTitle ?? "",
      introduction: s.introduction ?? "",
      occasionOfRevelation: s.occasionOfRevelation ?? "",
      occasionSources: s.occasionSources ?? "",
      contemporaryMeaning: s.contemporaryMeaning ?? "",
    });
    const terms = (s.keyTerms ?? []) as { term: string; arabic?: string; meaning: string; verseRef?: string }[];
    setKeyTerms(
      terms.map(t => ({
        term: t.term,
        arabic: t.arabic ?? "",
        meaning: t.meaning,
        verseRef: t.verseRef ?? "",
      })),
    );
    setThemes(editData.themes.map(t => ({ label: t.label, body: t.body ?? "" })));
    setQuestions(editData.questions.map(q => q.body));
    setTranslationRows(
      editData.translations.map(t => ({
        verseNo: String(t.verseNo),
        verseNoEnd: t.verseNoEnd ? String(t.verseNoEnd) : "",
        source: t.source,
        text: t.text,
      })),
    );
    setVerseRows(
      editData.verses.map(v => ({ verseNo: String(v.verseNo), textArabic: v.textArabic })),
    );
  }, [mode, editData]);

  const resetToCreate = () => {
    setMode("create");
    setEditId(null);
    setForm({ ...emptyForm, stationNo: nextNo ? String(nextNo) : "" });
    setKeyTerms([]);
    setThemes([]);
    setQuestions([]);
    setTranslationRows([]);
    setVerseRows([]);
  };

  const createMutation = trpc.admin.createSurah.useMutation({
    onSuccess: () => {
      toast.success("Yeni durak eklendi.");
      utils.surah.list.invalidate();
      utils.admin.nextStationNo.invalidate();
      resetToCreate();
    },
    onError: err => toast.error(err.message || "Durak eklenemedi."),
  });

  const updateMutation = trpc.admin.updateSurah.useMutation({
    onSuccess: () => {
      toast.success("Durak güncellendi.");
      utils.surah.list.invalidate();
      utils.surah.detail.invalidate();
      if (editId) utils.admin.surahForEdit.invalidate({ id: editId });
    },
    onError: err => toast.error(err.message || "Güncelleme başarısız."),
  });

  const buildPayload = () => {
    const num = (v: string) => Number(v);
    return {
      stationNo: num(form.stationNo),
      surahNo: num(form.surahNo),
      nuzulOrderOkuyan: num(form.nuzulOrderOkuyan),
      name: form.name.trim(),
      nameArabic: form.nameArabic.trim() || null,
      nameMeaning: form.nameMeaning.trim() || null,
      verseCount: num(form.verseCount),
      periodDiyanet: form.periodDiyanet,
      periodOkuyan: form.periodOkuyan,
      periodDisputeNote: form.periodDisputeNote.trim() || null,
      revelationTiming: form.revelationTiming.trim() || null,
      stationTitle: form.stationTitle.trim() || null,
      introduction: form.introduction.trim() || null,
      occasionOfRevelation: form.occasionOfRevelation.trim() || null,
      occasionSources: form.occasionSources.trim() || null,
      contemporaryMeaning: form.contemporaryMeaning.trim() || null,
      keyTerms: keyTerms
        .filter(t => t.term.trim() && t.meaning.trim())
        .map(t => ({
          term: t.term.trim(),
          arabic: t.arabic.trim() || undefined,
          meaning: t.meaning.trim(),
          verseRef: t.verseRef.trim() || undefined,
        })),
      content: {
        verses: verseRows
          .filter(v => v.verseNo && v.textArabic.trim())
          .map(v => ({ verseNo: Number(v.verseNo), textArabic: v.textArabic.trim() })),
        translations: translationRows
          .filter(t => t.verseNo && t.text.trim())
          .map(t => ({
            verseNo: Number(t.verseNo),
            verseNoEnd: t.verseNoEnd ? Number(t.verseNoEnd) : null,
            source: t.source,
            text: t.text.trim(),
          })),
        themes: themes
          .filter(t => t.label.trim())
          .map((t, i) => ({ label: t.label.trim(), body: t.body.trim() || null, sortOrder: i })),
        questions: questions
          .filter(q => q.trim())
          .map((q, i) => ({ body: q.trim(), sortOrder: i })),
      },
    };
  };

  const handleSubmit = () => {
    const payload = buildPayload();
    if (!payload.name || !payload.stationNo || !payload.surahNo || !payload.verseCount) {
      toast.error("Sure adı, durak no, sure no ve ayet sayısı zorunludur.");
      return;
    }
    if (mode === "create") {
      createMutation.mutate(payload);
    } else if (editId) {
      const { content, ...values } = payload;
      updateMutation.mutate({ id: editId, values, content });
    }
  };

  if (loading) {
    return (
      <div className="container max-w-3xl py-12">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="mt-6 h-64 w-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container max-w-xl py-24 text-center">
        <Lock className="mx-auto size-8 text-muted-foreground" />
        <h1 className="mt-4 font-serif text-3xl font-semibold">İçerik Yönetimi</h1>
        <p className="mt-3 text-muted-foreground">Bu bölüm yönetici girişi gerektirir.</p>
        <Button onClick={() => startLogin()} className="mt-6">
          Giriş yap
        </Button>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container max-w-xl py-24 text-center">
        <Lock className="mx-auto size-8 text-muted-foreground" />
        <h1 className="mt-4 font-serif text-3xl font-semibold">Yetki yok</h1>
        <p className="mt-3 text-muted-foreground">
          Bu bölüme yalnızca yönetici hesapları erişebilir.
        </p>
      </div>
    );
  }

  const busy = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="container max-w-4xl py-10 md:py-14">
      <p className="eyebrow">Yönetim</p>
      <h1 className="mt-2 font-serif text-4xl font-semibold tracking-tight">İçerik Yönetimi</h1>
      <p className="prose-kuran mt-3">
        Yeni durak ekleyebilir veya mevcut bir durağın içeriğini düzenleyebilirsin. Alt
        koleksiyonlar (ayetler, mealler, temalar, sorular) kaydedildiğinde tamamen yenisiyle
        değiştirilir.
      </p>

      {/* Mode switch */}
      <div className="mt-8 flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[220px]">
          <Label className="mb-1.5 block text-xs">Düzenlenecek durak</Label>
          <Select
            value={editId ? String(editId) : "new"}
            onValueChange={v => {
              if (v === "new") {
                resetToCreate();
              } else {
                setMode("edit");
                setEditId(Number(v));
              }
            }}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new">+ Yeni durak ekle</SelectItem>
              {(surahs ?? []).map(s => (
                <SelectItem key={s.id} value={String(s.id)}>
                  {s.stationNo}. {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleSubmit} disabled={busy} className="h-10">
          {busy ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          {mode === "create" ? "Durağı ekle" : "Değişiklikleri kaydet"}
        </Button>
      </div>

      {/* Identity */}
      <FieldSet title="Sure kimliği">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Durak no" value={form.stationNo} onChange={v => setForm(f => ({ ...f, stationNo: v }))} type="number" />
          <Field label="Sure no (mushaf)" value={form.surahNo} onChange={v => setForm(f => ({ ...f, surahNo: v }))} type="number" />
          <Field label="Nüzul sırası (Okuyan)" value={form.nuzulOrderOkuyan} onChange={v => setForm(f => ({ ...f, nuzulOrderOkuyan: v }))} type="number" />
          <Field label="Sure adı" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} />
          <Field label="Arapça adı" value={form.nameArabic} onChange={v => setForm(f => ({ ...f, nameArabic: v }))} />
          <Field label="Ayet sayısı" value={form.verseCount} onChange={v => setForm(f => ({ ...f, verseCount: v }))} type="number" />
          <Field label="Adının anlamı" value={form.nameMeaning} onChange={v => setForm(f => ({ ...f, nameMeaning: v }))} className="sm:col-span-2" />
          <Field label="Nüzul zamanı" value={form.revelationTiming} onChange={v => setForm(f => ({ ...f, revelationTiming: v }))} placeholder="Risaletin 3-4. yılı" />
          <div>
            <Label className="mb-1.5 block text-xs">Dönem — Diyanet</Label>
            <Select value={form.periodDiyanet} onValueChange={v => setForm(f => ({ ...f, periodDiyanet: v as "Mekke" | "Medine" }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Mekke">Mekke</SelectItem>
                <SelectItem value="Medine">Medine</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-1.5 block text-xs">Dönem — Okuyan</Label>
            <Select value={form.periodOkuyan} onValueChange={v => setForm(f => ({ ...f, periodOkuyan: v as "Mekke" | "Medine" }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Mekke">Mekke</SelectItem>
                <SelectItem value="Medine">Medine</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {form.periodDiyanet !== form.periodOkuyan && (
          <div className="mt-4">
            <Label className="mb-1.5 block text-xs">İhtilaf notu (kullanıcıya gösterilir)</Label>
            <Textarea
              value={form.periodDisputeNote}
              onChange={e => setForm(f => ({ ...f, periodDisputeNote: e.target.value }))}
              placeholder="Diyanet Medine dönemine yerleştirir; Okuyan risaletin 3-4. yılına, yani Mekke dönemine tarihler."
              className="min-h-[80px]"
            />
          </div>
        )}
      </FieldSet>

      {/* Prose */}
      <FieldSet title="Metinler">
        <LongField label="Durak başlığı / özet cümle" value={form.stationTitle} onChange={v => setForm(f => ({ ...f, stationTitle: v }))} rows={2} />
        <LongField label="Sure hakkında (giriş)" value={form.introduction} onChange={v => setForm(f => ({ ...f, introduction: v }))} rows={6} hint="Paragrafları boş satırla ayır." />
        <LongField label="Esbâb-ı nüzûl" value={form.occasionOfRevelation} onChange={v => setForm(f => ({ ...f, occasionOfRevelation: v }))} rows={6} hint="Paragrafları boş satırla ayır." />
        <LongField label="Kaynak künyesi" value={form.occasionSources} onChange={v => setForm(f => ({ ...f, occasionSources: v }))} rows={2} />
        <LongField label="Bugüne bakan yüz" value={form.contemporaryMeaning} onChange={v => setForm(f => ({ ...f, contemporaryMeaning: v }))} rows={6} hint="Paragrafları boş satırla ayır." />
      </FieldSet>

      {/* Key terms */}
      <FieldSet
        title="Anahtar kavramlar"
        action={
          <Button variant="outline" size="sm" onClick={() => setKeyTerms(p => [...p, { term: "", arabic: "", meaning: "", verseRef: "" }])}>
            <Plus className="size-3.5" /> Ekle
          </Button>
        }>
        {keyTerms.length === 0 && <Empty text="Kavram eklenmedi." />}
        <div className="space-y-3">
          {keyTerms.map((t, i) => (
            <Card key={i} className="gap-3 border-border/70 p-3 shadow-none">
              <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                <Input value={t.term} placeholder="Kavram (ör. istiğnâ)" onChange={e => setKeyTerms(p => p.map((x, j) => (j === i ? { ...x, term: e.target.value } : x)))} />
                <Input value={t.arabic} placeholder="Arapça" onChange={e => setKeyTerms(p => p.map((x, j) => (j === i ? { ...x, arabic: e.target.value } : x)))} />
                <Button variant="ghost" size="icon" onClick={() => setKeyTerms(p => p.filter((_, j) => j !== i))} aria-label="Kaldır">
                  <Trash2 className="size-4" />
                </Button>
              </div>
              <Textarea value={t.meaning} placeholder="Anlamı" className="min-h-[60px]" onChange={e => setKeyTerms(p => p.map((x, j) => (j === i ? { ...x, meaning: e.target.value } : x)))} />
              <Input value={t.verseRef} placeholder="Ayet referansı (ör. 96:7)" onChange={e => setKeyTerms(p => p.map((x, j) => (j === i ? { ...x, verseRef: e.target.value } : x)))} />
            </Card>
          ))}
        </div>
      </FieldSet>

      {/* Themes */}
      <FieldSet
        title="Temalar"
        action={
          <Button variant="outline" size="sm" onClick={() => setThemes(p => [...p, { label: "", body: "" }])}>
            <Plus className="size-3.5" /> Ekle
          </Button>
        }>
        {themes.length === 0 && <Empty text="Tema eklenmedi." />}
        <div className="space-y-3">
          {themes.map((t, i) => (
            <Card key={i} className="gap-2 border-border/70 p-3 shadow-none">
              <div className="flex gap-2">
                <Input value={t.label} placeholder="Tema başlığı" onChange={e => setThemes(p => p.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} />
                <Button variant="ghost" size="icon" onClick={() => setThemes(p => p.filter((_, j) => j !== i))} aria-label="Kaldır">
                  <Trash2 className="size-4" />
                </Button>
              </div>
              <Textarea value={t.body} placeholder="Açıklama" className="min-h-[70px]" onChange={e => setThemes(p => p.map((x, j) => (j === i ? { ...x, body: e.target.value } : x)))} />
            </Card>
          ))}
        </div>
      </FieldSet>

      {/* Questions */}
      <FieldSet
        title="Yüzleşme soruları"
        action={
          <Button variant="outline" size="sm" onClick={() => setQuestions(p => [...p, ""])}>
            <Plus className="size-3.5" /> Ekle
          </Button>
        }>
        {questions.length === 0 && <Empty text="Soru eklenmedi." />}
        <div className="space-y-2">
          {questions.map((q, i) => (
            <div key={i} className="flex gap-2">
              <Textarea value={q} placeholder={`${i + 1}. soru`} className="min-h-[60px]" onChange={e => setQuestions(p => p.map((x, j) => (j === i ? e.target.value : x)))} />
              <Button variant="ghost" size="icon" onClick={() => setQuestions(p => p.filter((_, j) => j !== i))} aria-label="Kaldır">
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      </FieldSet>

      {/* Arabic verses */}
      <FieldSet
        title="Arapça ayetler"
        action={
          <Button variant="outline" size="sm" onClick={() => setVerseRows(p => [...p, { verseNo: String(p.length + 1), textArabic: "" }])}>
            <Plus className="size-3.5" /> Ekle
          </Button>
        }>
        {verseRows.length === 0 && <Empty text="Arapça metin eklenmedi." />}
        <div className="space-y-2">
          {verseRows.map((v, i) => (
            <div key={i} className="flex gap-2">
              <Input value={v.verseNo} type="number" className="w-20 shrink-0" onChange={e => setVerseRows(p => p.map((x, j) => (j === i ? { ...x, verseNo: e.target.value } : x)))} />
              <Textarea value={v.textArabic} dir="rtl" className="min-h-[60px] font-arabic text-lg" onChange={e => setVerseRows(p => p.map((x, j) => (j === i ? { ...x, textArabic: e.target.value } : x)))} />
              <Button variant="ghost" size="icon" onClick={() => setVerseRows(p => p.filter((_, j) => j !== i))} aria-label="Kaldır">
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      </FieldSet>

      {/* Translations */}
      <FieldSet
        title="Meal metinleri"
        action={
          <Button variant="outline" size="sm" onClick={() => setTranslationRows(p => [...p, { verseNo: "1", verseNoEnd: "", source: "diyanet", text: "" }])}>
            <Plus className="size-3.5" /> Ekle
          </Button>
        }>
        {translationRows.length === 0 && <Empty text="Meal metni eklenmedi." />}
        <div className="space-y-3">
          {translationRows.map((t, i) => (
            <Card key={i} className="gap-2 border-border/70 p-3 shadow-none">
              <div className="grid gap-2 sm:grid-cols-[80px_80px_1fr_auto]">
                <Input value={t.verseNo} type="number" placeholder="Ayet" onChange={e => setTranslationRows(p => p.map((x, j) => (j === i ? { ...x, verseNo: e.target.value } : x)))} />
                <Input value={t.verseNoEnd} type="number" placeholder="Bitiş" onChange={e => setTranslationRows(p => p.map((x, j) => (j === i ? { ...x, verseNoEnd: e.target.value } : x)))} />
                <Select value={t.source} onValueChange={v => setTranslationRows(p => p.map((x, j) => (j === i ? { ...x, source: v as TranslationSource } : x)))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TRANSLATION_SOURCES.map(s => (
                      <SelectItem key={s} value={s}>{TRANSLATION_LABELS[s].full}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="ghost" size="icon" onClick={() => setTranslationRows(p => p.filter((_, j) => j !== i))} aria-label="Kaldır">
                  <Trash2 className="size-4" />
                </Button>
              </div>
              <Textarea value={t.text} placeholder="Meal metni" className="min-h-[70px] font-serif" onChange={e => setTranslationRows(p => p.map((x, j) => (j === i ? { ...x, text: e.target.value } : x)))} />
            </Card>
          ))}
        </div>
      </FieldSet>

      <div className="mt-10 flex justify-end gap-3 border-t border-border/70 pt-6">
        <Button variant="outline" onClick={resetToCreate} disabled={busy}>
          Formu temizle
        </Button>
        <Button onClick={handleSubmit} disabled={busy}>
          {busy ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          {mode === "create" ? "Durağı ekle" : "Değişiklikleri kaydet"}
        </Button>
      </div>
    </div>
  );
}

function FieldSet({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-10">
      <div className="flex items-center justify-between gap-3 border-b border-border/70 pb-2.5">
        <h2 className="font-serif text-xl font-semibold">{title}</h2>
        {action}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label className="mb-1.5 block text-xs">{label}</Label>
      <Input type={type} value={value} placeholder={placeholder} onChange={e => onChange(e.target.value)} />
    </div>
  );
}

function LongField({
  label,
  value,
  onChange,
  rows,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows: number;
  hint?: string;
}) {
  return (
    <div className="mt-4 first:mt-0">
      <Label className="mb-1.5 block text-xs">{label}</Label>
      <Textarea
        value={value}
        rows={rows}
        onChange={e => onChange(e.target.value)}
        className="font-serif leading-relaxed"
      />
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <p className="rounded-md border border-dashed border-border py-6 text-center text-sm text-muted-foreground">
      {text}
    </p>
  );
}

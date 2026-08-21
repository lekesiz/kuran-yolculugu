/**
 * Translation sources shown side by side. The first four are published,
 * human-authored meals; `ai` is a machine translation produced inside this
 * project and is labelled as such wherever it appears.
 */
export const TRANSLATION_SOURCES = [
  "diyanet",
  "okuyan",
  "islamoglu",
  "esed",
  "ai",
] as const;
export type TranslationSource = (typeof TRANSLATION_SOURCES)[number];

/** The four published meals, excluding the in-project machine translation. */
export const PUBLISHED_TRANSLATION_SOURCES = [
  "diyanet",
  "okuyan",
  "islamoglu",
  "esed",
] as const;

export const TRANSLATION_LABELS: Record<
  TranslationSource,
  { short: string; full: string; note: string }
> = {
  diyanet: {
    short: "Diyanet",
    full: "Diyanet İşleri Başkanlığı Meali (Yeni)",
    note: "Resmî kurum meali; Türkiye'de en yaygın referans.",
  },
  okuyan: {
    short: "Okuyan",
    full: "Prof. Dr. Mehmet Okuyan Meali",
    note: "Akademik, kelime analizine dayalı; nüzul tertibi bu meale göre.",
  },
  islamoglu: {
    short: "İslamoğlu",
    full: "Mustafa İslamoğlu — Hayat Kitabı Kur'an",
    note: "Gerekçeli meal; kavramları çağdaş Türkçeye taşır.",
  },
  esed: {
    short: "Esed",
    full: "Muhammed Esed — Kur'an Mesajı",
    note: "Modernist yorum geleneği; klasik Arap dilbilimine dayanır.",
  },
  ai: {
    short: "AI",
    full: "AI Tercümesi — bu proje içinde üretildi",
    note: "Yayımlanmış bir meal değildir. Arapça metinden, yorum katmadan ve parantez içi açıklama eklemeden üretilmiş birebir çeviridir.",
  },
};

/** A key Arabic term explained for the reader. */
export type KeyTerm = {
  term: string;
  arabic?: string;
  meaning: string;
  verseRef?: string;
};

export type RevelationPeriod = "Mekke" | "Medine";

/**
 * Source-criticism kinds. Everything here is attributed, but not every
 * attributed claim carries the same weight — labelling the difference keeps the
 * reader from taking a contested reading for a settled one.
 */
export const NOTE_KINDS = ["ihtilaf", "rivayet", "nuans"] as const;
export type NoteKind = (typeof NOTE_KINDS)[number];

export const NOTE_KIND_LABELS: Record<NoteKind, string> = {
  ihtilaf: "Kaynaklar ayrışıyor",
  rivayet: "Rivayet uyarısı",
  nuans: "Kayıt düşülen nokta",
};

/** One entry in the source-criticism layer attached to a surah. */
export type ScholarlyNote = {
  kind: NoteKind;
  label: string;
  body: string;
};

export const SURAH_SORT_KEYS = ["station", "nuzul", "mushaf"] as const;
export type SurahSortKey = (typeof SURAH_SORT_KEYS)[number];

/**
 * One row of the event-to-message mapping. The mushaf order is not the order
 * of events, so each station carries an explicit map: what was on the ground,
 * what the text said to it, and what that shifted.
 */
export type EventMessageRow = {
  /** What was happening when this passage came: the concrete situation. */
  situation: string;
  /** What the text said in response to it. */
  response: string;
  /** What that changed for the people who first heard it. */
  shift: string;
};

export const SORT_LABELS: Record<SurahSortKey, string> = {
  station: "Yolculuk sırası",
  nuzul: "Nüzul sırası (Okuyan)",
  mushaf: "Mushaf sırası",
};

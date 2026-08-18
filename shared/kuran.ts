/** The four translation sources permitted in this project. */
export const TRANSLATION_SOURCES = ["diyanet", "okuyan", "islamoglu", "esed"] as const;
export type TranslationSource = (typeof TRANSLATION_SOURCES)[number];

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

export const SORT_LABELS: Record<SurahSortKey, string> = {
  station: "Yolculuk sırası",
  nuzul: "Nüzul sırası (Okuyan)",
  mushaf: "Mushaf sırası",
};

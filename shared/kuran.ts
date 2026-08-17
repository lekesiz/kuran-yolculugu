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

export const SURAH_SORT_KEYS = ["station", "nuzul", "mushaf"] as const;
export type SurahSortKey = (typeof SURAH_SORT_KEYS)[number];

export const SORT_LABELS: Record<SurahSortKey, string> = {
  station: "Yolculuk sırası",
  nuzul: "Nüzul sırası (Okuyan)",
  mushaf: "Mushaf sırası",
};

import {
  boolean,
  index,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * A "durak" (station) in the reading journey. One row per surah studied.
 * `stationNo` is the user's personal journey order (1..N).
 * `nuzulOrderOkuyan` is Prof. Dr. Mehmet Okuyan's revelation-order number (1..114).
 * `surahNo` is the canonical mushaf number (1..114).
 */
export const surahs = mysqlTable(
  "surahs",
  {
    id: int("id").autoincrement().primaryKey(),
    /** Personal journey station number — the order the user studies them in. */
    stationNo: int("stationNo").notNull(),
    /** Canonical mushaf order, 1-114. */
    surahNo: int("surahNo").notNull(),
    /** Mehmet Okuyan revelation-order number, 1-114. */
    nuzulOrderOkuyan: int("nuzulOrderOkuyan").notNull(),
    /** Turkish surah name, e.g. "Alak". */
    name: varchar("name", { length: 64 }).notNull(),
    /** Arabic surah name, e.g. "العلق". */
    nameArabic: varchar("nameArabic", { length: 64 }),
    /** Meaning of the surah's name, e.g. "Asılıp Tutunan / Embriyo". */
    nameMeaning: varchar("nameMeaning", { length: 160 }),
    /** Total verse count. */
    verseCount: int("verseCount").notNull(),
    /** Revelation period per Diyanet classification. */
    periodDiyanet: mysqlEnum("periodDiyanet", ["Mekke", "Medine"]).notNull(),
    /** Revelation period per Mehmet Okuyan; may differ from Diyanet. */
    periodOkuyan: mysqlEnum("periodOkuyan", ["Mekke", "Medine"]).notNull(),
    /** Set when the two sources disagree; holds the explanation shown to the user. */
    periodDisputeNote: text("periodDisputeNote"),
    /** Approximate revelation timing, e.g. "Risaletin 3-4. yılı". */
    revelationTiming: text("revelationTiming"),
    /** Short editorial title for the station, e.g. "İlk Emir: Oku". */
    stationTitle: varchar("stationTitle", { length: 200 }),
    /** Introductory text about the surah ("Sure Hakkında"). */
    introduction: text("introduction"),
    /** Historical circumstances of revelation (esbâb-ı nüzûl). */
    occasionOfRevelation: text("occasionOfRevelation"),
    /** Source attribution for the occasion of revelation. */
    occasionSources: text("occasionSources"),
    /** What the surah says to a person living today. */
    contemporaryMeaning: text("contemporaryMeaning"),
    /** Key Arabic terms with explanations, stored as JSON array. */
    keyTerms: json("keyTerms"),
    /**
     * Source-criticism layer, stored as a JSON array of
     * `{ kind, label, body }`. `kind` is one of `ihtilaf` (sources disagree),
     * `rivayet` (report-authenticity warning) or `nuans` (a common reading the
     * commentaries actually qualify). Lets the reader see which claims are
     * settled and which are contested, instead of presenting everything flat.
     */
    scholarlyNotes: json("scholarlyNotes"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => ({
    stationNoIdx: uniqueIndex("surahs_stationNo_idx").on(table.stationNo),
    surahNoIdx: uniqueIndex("surahs_surahNo_idx").on(table.surahNo),
    nuzulIdx: index("surahs_nuzulOrderOkuyan_idx").on(table.nuzulOrderOkuyan),
  }),
);

export type Surah = typeof surahs.$inferSelect;
export type InsertSurah = typeof surahs.$inferInsert;

/** The four permitted translation sources. */
export const TRANSLATION_SOURCES = [
  "diyanet",
  "okuyan",
  "islamoglu",
  "esed",
] as const;

/**
 * One row per (surah, verse, translation source).
 * `verseNo` is the starting verse; `verseNoEnd` is set when a source groups
 * consecutive verses together (e.g. Okuyan renders Alak 6-7 as one unit).
 */
export const translations = mysqlTable(
  "translations",
  {
    id: int("id").autoincrement().primaryKey(),
    surahId: int("surahId").notNull(),
    verseNo: int("verseNo").notNull(),
    /** Set only for grouped verses; null for single verses. */
    verseNoEnd: int("verseNoEnd"),
    source: mysqlEnum("source", TRANSLATION_SOURCES).notNull(),
    /** The translated text in Turkish. */
    text: text("text").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => ({
    lookupIdx: index("translations_surah_verse_idx").on(
      table.surahId,
      table.verseNo,
    ),
    uniqueIdx: uniqueIndex("translations_unique_idx").on(
      table.surahId,
      table.verseNo,
      table.source,
    ),
  }),
);

export type Translation = typeof translations.$inferSelect;
export type InsertTranslation = typeof translations.$inferInsert;

/** Arabic verse text, kept separate from translations since it has one canonical form. */
export const verses = mysqlTable(
  "verses",
  {
    id: int("id").autoincrement().primaryKey(),
    surahId: int("surahId").notNull(),
    verseNo: int("verseNo").notNull(),
    /** Vowelled Arabic text of the verse. */
    textArabic: text("textArabic").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => ({
    uniqueIdx: uniqueIndex("verses_unique_idx").on(table.surahId, table.verseNo),
  }),
);

export type Verse = typeof verses.$inferSelect;
export type InsertVerse = typeof verses.$inferInsert;

/** Human / existential themes the surah addresses. */
export const themes = mysqlTable(
  "themes",
  {
    id: int("id").autoincrement().primaryKey(),
    surahId: int("surahId").notNull(),
    /** Short theme label, e.g. "Bilgiyle kibirlenme". */
    label: varchar("label", { length: 200 }).notNull(),
    /** Longer explanation of how the theme speaks to a person today. */
    body: text("body"),
    /** Display order within the surah. */
    sortOrder: int("sortOrder").default(0).notNull(),
  },
  table => ({
    surahIdx: index("themes_surahId_idx").on(table.surahId),
  }),
);

export type Theme = typeof themes.$inferSelect;
export type InsertTheme = typeof themes.$inferInsert;

/** Confrontation questions the reader should ask themselves today. */
export const questions = mysqlTable(
  "questions",
  {
    id: int("id").autoincrement().primaryKey(),
    surahId: int("surahId").notNull(),
    /** The question text. */
    body: text("body").notNull(),
    sortOrder: int("sortOrder").default(0).notNull(),
  },
  table => ({
    surahIdx: index("questions_surahId_idx").on(table.surahId),
  }),
);

export type Question = typeof questions.$inferSelect;
export type InsertQuestion = typeof questions.$inferInsert;

/** Per-user reading progress for a surah. */
export const userProgress = mysqlTable(
  "userProgress",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    surahId: int("surahId").notNull(),
    isRead: boolean("isRead").default(false).notNull(),
    readAt: timestamp("readAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => ({
    uniqueIdx: uniqueIndex("userProgress_unique_idx").on(
      table.userId,
      table.surahId,
    ),
  }),
);

export type UserProgress = typeof userProgress.$inferSelect;
export type InsertUserProgress = typeof userProgress.$inferInsert;

/** Per-user free-form notes for a surah. */
export const userNotes = mysqlTable(
  "userNotes",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    surahId: int("surahId").notNull(),
    body: text("body").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => ({
    uniqueIdx: uniqueIndex("userNotes_unique_idx").on(
      table.userId,
      table.surahId,
    ),
  }),
);

export type UserNote = typeof userNotes.$inferSelect;
export type InsertUserNote = typeof userNotes.$inferInsert;

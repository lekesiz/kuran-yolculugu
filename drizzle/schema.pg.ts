/**
 * Postgres (Supabase) karşılığı şema.
 *
 * Neden ayrı dosya: Drizzle'ın tablo nesneleri sürücüye bağlıdır
 * (`mysqlTable` ≠ `pgTable`). Manus dağıtımı MySQL/TiDB üzerinde, Vercel
 * dağıtımı Supabase Postgres üzerinde çalıştığı için iki tanım yan yana durur.
 *
 * Kolon adları MySQL şemasıyla BİREBİR aynı (camelCase, çift tırnaklı) —
 * böylece `server/db.ts` içindeki sorgu kodu iki sürücüde de aynı alan
 * adlarını görür ve tek kod tabanı ikisini de besler.
 */
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role_enum", ["user", "admin"]);
export const periodEnum = pgEnum("period_enum", ["Mekke", "Medine"]);
export const translationSourceEnum = pgEnum("translation_source_enum", [
  "diyanet",
  "okuyan",
  "islamoglu",
  "esed",
  "ai",
]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn", { withTimezone: true }).defaultNow().notNull(),
});

export const surahs = pgTable(
  "surahs",
  {
    id: serial("id").primaryKey(),
    stationNo: integer("stationNo").notNull(),
    surahNo: integer("surahNo").notNull(),
    nuzulOrderOkuyan: integer("nuzulOrderOkuyan").notNull(),
    name: varchar("name", { length: 64 }).notNull(),
    nameArabic: varchar("nameArabic", { length: 64 }),
    nameMeaning: varchar("nameMeaning", { length: 160 }),
    verseCount: integer("verseCount").notNull(),
    periodDiyanet: periodEnum("periodDiyanet").notNull(),
    periodOkuyan: periodEnum("periodOkuyan").notNull(),
    periodDisputeNote: text("periodDisputeNote"),
    revelationTiming: text("revelationTiming"),
    stationTitle: varchar("stationTitle", { length: 200 }),
    introduction: text("introduction"),
    occasionOfRevelation: text("occasionOfRevelation"),
    occasionSources: text("occasionSources"),
    contemporaryMeaning: text("contemporaryMeaning"),
    /** AI-written paragraph read straight from the Arabic: "what does this surah say today?" */
    aiParagraph: text("aiParagraph"),
    keyTerms: jsonb("keyTerms"),
    scholarlyNotes: jsonb("scholarlyNotes"),
    revisionPass: integer("revisionPass").default(1).notNull(),
    revisionNote: text("revisionNote"),
    createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull(),
  },
  table => ({
    stationNoIdx: uniqueIndex("surahs_stationNo_idx").on(table.stationNo),
    surahNoIdx: uniqueIndex("surahs_surahNo_idx").on(table.surahNo),
    nuzulIdx: index("surahs_nuzulOrderOkuyan_idx").on(table.nuzulOrderOkuyan),
  }),
);

export const translations = pgTable(
  "translations",
  {
    id: serial("id").primaryKey(),
    surahId: integer("surahId").notNull(),
    verseNo: integer("verseNo").notNull(),
    verseNoEnd: integer("verseNoEnd"),
    source: translationSourceEnum("source").notNull(),
    text: text("text").notNull(),
    createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull(),
  },
  table => ({
    lookupIdx: index("translations_surah_verse_idx").on(table.surahId, table.verseNo),
    uniqueIdx: uniqueIndex("translations_unique_idx").on(
      table.surahId,
      table.verseNo,
      table.source,
    ),
  }),
);

export const verses = pgTable(
  "verses",
  {
    id: serial("id").primaryKey(),
    surahId: integer("surahId").notNull(),
    verseNo: integer("verseNo").notNull(),
    textArabic: text("textArabic").notNull(),
    createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  },
  table => ({
    uniqueIdx: uniqueIndex("verses_unique_idx").on(table.surahId, table.verseNo),
  }),
);

export const themes = pgTable(
  "themes",
  {
    id: serial("id").primaryKey(),
    surahId: integer("surahId").notNull(),
    label: varchar("label", { length: 200 }).notNull(),
    body: text("body"),
    sortOrder: integer("sortOrder").default(0).notNull(),
  },
  table => ({
    surahIdx: index("themes_surahId_idx").on(table.surahId),
  }),
);

export const questions = pgTable(
  "questions",
  {
    id: serial("id").primaryKey(),
    surahId: integer("surahId").notNull(),
    body: text("body").notNull(),
    sortOrder: integer("sortOrder").default(0).notNull(),
  },
  table => ({
    surahIdx: index("questions_surahId_idx").on(table.surahId),
  }),
);

export const userProgress = pgTable(
  "userProgress",
  {
    id: serial("id").primaryKey(),
    userId: integer("userId").notNull(),
    surahId: integer("surahId").notNull(),
    isRead: boolean("isRead").default(false).notNull(),
    readAt: timestamp("readAt", { withTimezone: true }),
    createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull(),
  },
  table => ({
    uniqueIdx: uniqueIndex("userProgress_unique_idx").on(table.userId, table.surahId),
  }),
);

export const userNotes = pgTable(
  "userNotes",
  {
    id: serial("id").primaryKey(),
    userId: integer("userId").notNull(),
    surahId: integer("surahId").notNull(),
    body: text("body").notNull(),
    createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull(),
  },
  table => ({
    uniqueIdx: uniqueIndex("userNotes_unique_idx").on(table.userId, table.surahId),
  }),
);

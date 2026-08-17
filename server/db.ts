import { and, asc, desc, eq, inArray, like, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertQuestion,
  InsertSurah,
  InsertTheme,
  InsertTranslation,
  InsertUser,
  InsertVerse,
  questions,
  surahs,
  themes,
  translations,
  userNotes,
  userProgress,
  users,
  verses,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

/** Throws when the database is unavailable, so procedures fail loudly instead of returning empty data. */
async function requireDb() {
  const db = await getDb();
  if (!db) throw new Error("Veritabanı bağlantısı kurulamadı.");
  return db;
}

/* ------------------------------------------------------------------ */
/* Users                                                               */
/* ------------------------------------------------------------------ */

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/* ------------------------------------------------------------------ */
/* Surahs                                                              */
/* ------------------------------------------------------------------ */

/** Lightweight columns used by list views, so we never ship long prose to the index page. */
const surahListColumns = {
  id: surahs.id,
  stationNo: surahs.stationNo,
  surahNo: surahs.surahNo,
  nuzulOrderOkuyan: surahs.nuzulOrderOkuyan,
  name: surahs.name,
  nameArabic: surahs.nameArabic,
  nameMeaning: surahs.nameMeaning,
  verseCount: surahs.verseCount,
  periodDiyanet: surahs.periodDiyanet,
  periodOkuyan: surahs.periodOkuyan,
  periodDisputeNote: surahs.periodDisputeNote,
  revelationTiming: surahs.revelationTiming,
  stationTitle: surahs.stationTitle,
};

export type SurahListItem = {
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

export type SurahSortKey = "station" | "nuzul" | "mushaf";

export async function listSurahs(options: {
  sort?: SurahSortKey;
  period?: "Mekke" | "Medine";
  search?: string;
}) {
  const db = await requireDb();
  const { sort = "station", period, search } = options;

  const filters = [];
  if (period) {
    // A surah counts as belonging to a period if either source classifies it there,
    // so disputed surahs (e.g. Zilzâl) surface under both filters rather than vanishing.
    filters.push(or(eq(surahs.periodDiyanet, period), eq(surahs.periodOkuyan, period)));
  }
  if (search && search.trim()) {
    const term = `%${search.trim()}%`;
    filters.push(
      or(
        like(surahs.name, term),
        like(surahs.nameMeaning, term),
        like(surahs.stationTitle, term),
        like(surahs.introduction, term),
        like(surahs.contemporaryMeaning, term),
        like(surahs.occasionOfRevelation, term),
      ),
    );
  }

  const orderColumn =
    sort === "nuzul"
      ? surahs.nuzulOrderOkuyan
      : sort === "mushaf"
        ? surahs.surahNo
        : surahs.stationNo;

  const query = db.select(surahListColumns).from(surahs).orderBy(asc(orderColumn));
  const rows = filters.length
    ? await query.where(filters.length === 1 ? filters[0] : and(...filters))
    : await query;

  return rows as SurahListItem[];
}

/** Also returns theme labels so search-by-theme can match without a second round trip. */
export async function findSurahIdsByThemeLabel(search: string) {
  const db = await requireDb();
  const rows = await db
    .select({ surahId: themes.surahId })
    .from(themes)
    .where(like(themes.label, `%${search.trim()}%`));
  return rows.map(r => r.surahId);
}

export async function getSurahsByIds(ids: number[]) {
  if (!ids.length) return [] as SurahListItem[];
  const db = await requireDb();
  const rows = await db
    .select(surahListColumns)
    .from(surahs)
    .where(inArray(surahs.id, ids))
    .orderBy(asc(surahs.stationNo));
  return rows as SurahListItem[];
}

export async function getSurahByStationNo(stationNo: number) {
  const db = await requireDb();
  const rows = await db.select().from(surahs).where(eq(surahs.stationNo, stationNo)).limit(1);
  return rows[0];
}

export async function getSurahById(id: number) {
  const db = await requireDb();
  const rows = await db.select().from(surahs).where(eq(surahs.id, id)).limit(1);
  return rows[0];
}

/** Neighbouring stations for prev/next navigation, ordered by the requested key. */
export async function getAdjacentSurahs(current: SurahListItem, sort: SurahSortKey) {
  const db = await requireDb();
  const column =
    sort === "nuzul"
      ? surahs.nuzulOrderOkuyan
      : sort === "mushaf"
        ? surahs.surahNo
        : surahs.stationNo;
  const value =
    sort === "nuzul"
      ? current.nuzulOrderOkuyan
      : sort === "mushaf"
        ? current.surahNo
        : current.stationNo;

  const [prev] = await db
    .select({ stationNo: surahs.stationNo, name: surahs.name })
    .from(surahs)
    .where(sql`${column} < ${value}`)
    .orderBy(desc(column))
    .limit(1);

  const [next] = await db
    .select({ stationNo: surahs.stationNo, name: surahs.name })
    .from(surahs)
    .where(sql`${column} > ${value}`)
    .orderBy(asc(column))
    .limit(1);

  return { prev: prev ?? null, next: next ?? null };
}

export async function insertSurah(values: InsertSurah) {
  const db = await requireDb();
  const [result] = await db.insert(surahs).values(values).$returningId();
  return result.id;
}

export async function updateSurah(id: number, values: Partial<InsertSurah>) {
  const db = await requireDb();
  await db.update(surahs).set(values).where(eq(surahs.id, id));
}

export async function getMaxStationNo() {
  const db = await requireDb();
  const [row] = await db
    .select({ value: sql<number | null>`max(${surahs.stationNo})` })
    .from(surahs);
  return row?.value ?? 0;
}

/* ------------------------------------------------------------------ */
/* Verses, translations, themes, questions                             */
/* ------------------------------------------------------------------ */

export async function getVersesBySurahId(surahId: number) {
  const db = await requireDb();
  return db.select().from(verses).where(eq(verses.surahId, surahId)).orderBy(asc(verses.verseNo));
}

export async function getTranslationsBySurahId(surahId: number) {
  const db = await requireDb();
  return db
    .select()
    .from(translations)
    .where(eq(translations.surahId, surahId))
    .orderBy(asc(translations.verseNo));
}

export async function getThemesBySurahId(surahId: number) {
  const db = await requireDb();
  return db
    .select()
    .from(themes)
    .where(eq(themes.surahId, surahId))
    .orderBy(asc(themes.sortOrder));
}

export async function getQuestionsBySurahId(surahId: number) {
  const db = await requireDb();
  return db
    .select()
    .from(questions)
    .where(eq(questions.surahId, surahId))
    .orderBy(asc(questions.sortOrder));
}

export async function replaceVerses(surahId: number, rows: Omit<InsertVerse, "surahId">[]) {
  const db = await requireDb();
  await db.delete(verses).where(eq(verses.surahId, surahId));
  if (rows.length) {
    await db.insert(verses).values(rows.map(r => ({ ...r, surahId })));
  }
}

export async function replaceTranslations(
  surahId: number,
  rows: Omit<InsertTranslation, "surahId">[],
) {
  const db = await requireDb();
  await db.delete(translations).where(eq(translations.surahId, surahId));
  if (rows.length) {
    await db.insert(translations).values(rows.map(r => ({ ...r, surahId })));
  }
}

export async function replaceThemes(surahId: number, rows: Omit<InsertTheme, "surahId">[]) {
  const db = await requireDb();
  await db.delete(themes).where(eq(themes.surahId, surahId));
  if (rows.length) {
    await db.insert(themes).values(rows.map(r => ({ ...r, surahId })));
  }
}

export async function replaceQuestions(surahId: number, rows: Omit<InsertQuestion, "surahId">[]) {
  const db = await requireDb();
  await db.delete(questions).where(eq(questions.surahId, surahId));
  if (rows.length) {
    await db.insert(questions).values(rows.map(r => ({ ...r, surahId })));
  }
}

/* ------------------------------------------------------------------ */
/* Progress & notes                                                    */
/* ------------------------------------------------------------------ */

export async function getProgressForUser(userId: number) {
  const db = await requireDb();
  return db.select().from(userProgress).where(eq(userProgress.userId, userId));
}

export async function setProgress(userId: number, surahId: number, isRead: boolean) {
  const db = await requireDb();
  const readAt = isRead ? new Date() : null;
  await db
    .insert(userProgress)
    .values({ userId, surahId, isRead, readAt })
    .onDuplicateKeyUpdate({ set: { isRead, readAt } });
}

export async function getNote(userId: number, surahId: number) {
  const db = await requireDb();
  const rows = await db
    .select()
    .from(userNotes)
    .where(and(eq(userNotes.userId, userId), eq(userNotes.surahId, surahId)))
    .limit(1);
  return rows[0] ?? null;
}

export async function saveNote(userId: number, surahId: number, body: string) {
  const db = await requireDb();
  if (!body.trim()) {
    await db
      .delete(userNotes)
      .where(and(eq(userNotes.userId, userId), eq(userNotes.surahId, surahId)));
    return;
  }
  await db
    .insert(userNotes)
    .values({ userId, surahId, body })
    .onDuplicateKeyUpdate({ set: { body } });
}

export async function listNotesForUser(userId: number) {
  const db = await requireDb();
  return db
    .select({
      surahId: userNotes.surahId,
      body: userNotes.body,
      updatedAt: userNotes.updatedAt,
      surahName: surahs.name,
      stationNo: surahs.stationNo,
    })
    .from(userNotes)
    .innerJoin(surahs, eq(surahs.id, userNotes.surahId))
    .where(eq(userNotes.userId, userId))
    .orderBy(asc(surahs.stationNo));
}

/**
 * Aktif sürücüye göre doğru tablo nesnelerini seçer.
 *
 * `DB_DRIVER=postgres` (Vercel/Supabase) ise Postgres tanımları,
 * aksi halde (Manus/TiDB) MySQL tanımları döner. `server/db.ts` yalnızca bu
 * modülü import eder; böylece sorgu kodu sürücüden bağımsız kalır.
 *
 * Tipler her zaman MySQL şemasından alınır — iki tanım alan adı ve tip
 * bakımından birebir aynı olduğu için tip düzeyinde fark yaratmaz.
 */
import * as mysqlSchema from "./schema";
import * as pgSchema from "./schema.pg";

export const IS_POSTGRES =
  (process.env.DB_DRIVER ?? "").toLowerCase() === "postgres";

const active = IS_POSTGRES ? pgSchema : mysqlSchema;

type MysqlTables = typeof mysqlSchema;

export const users = active.users as unknown as MysqlTables["users"];
export const surahs = active.surahs as unknown as MysqlTables["surahs"];
export const translations =
  active.translations as unknown as MysqlTables["translations"];
export const verses = active.verses as unknown as MysqlTables["verses"];
export const themes = active.themes as unknown as MysqlTables["themes"];
export const questions = active.questions as unknown as MysqlTables["questions"];
export const userProgress =
  active.userProgress as unknown as MysqlTables["userProgress"];
export const userNotes =
  active.userNotes as unknown as MysqlTables["userNotes"];

export type {
  InsertQuestion,
  InsertSurah,
  InsertTheme,
  InsertTranslation,
  InsertUser,
  InsertUserNote,
  InsertUserProgress,
  InsertVerse,
  Question,
  Surah,
  Theme,
  Translation,
  User,
  UserNote,
  UserProgress,
  Verse,
} from "./schema";

export { TRANSLATION_SOURCES } from "./schema";


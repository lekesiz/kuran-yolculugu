/**
 * Content integrity guards.
 *
 * These run against the real database, because the whole value of this project
 * rests on the loaded content being complete and internally consistent. A
 * missing translation or a mismatched verse count is a correctness bug, not a
 * cosmetic one.
 *
 * Counts are gathered by fetching rows and grouping in JS rather than with
 * correlated subqueries: Drizzle does not interpolate column references inside
 * `sql` template subqueries the way raw SQL would.
 */
import { describe, expect, it } from "vitest";
import { getDb } from "./db";
import { questions, surahs, themes, translations, verses } from "../drizzle/schema";

const SOURCES = ["diyanet", "okuyan", "islamoglu", "esed"] as const;

function tally<T, K>(rows: T[], key: (row: T) => K) {
  const counts = new Map<K, number>();
  for (const row of rows) {
    const k = key(row);
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  return counts;
}

describe("content integrity", () => {
  it("every surah has as many verse rows as its declared verseCount", async () => {
    const db = await getDb();
    if (!db) return;

    const surahRows = await db
      .select({ id: surahs.id, name: surahs.name, declared: surahs.verseCount })
      .from(surahs);
    const verseRows = await db.select({ surahId: verses.surahId }).from(verses);
    const counts = tally(verseRows, r => r.surahId);

    expect(surahRows.length).toBeGreaterThan(0);
    const mismatched = surahRows
      .filter(s => (counts.get(s.id) ?? 0) !== s.declared)
      .map(s => `${s.name}: beyan ${s.declared}, kayıt ${counts.get(s.id) ?? 0}`);

    expect(mismatched, mismatched.join(" · ")).toEqual([]);
  });

  it("every verse carries all four translations", async () => {
    const db = await getDb();
    if (!db) return;

    const verseRows = await db
      .select({ surahId: verses.surahId, verseNo: verses.verseNo })
      .from(verses);
    // Translations key off (surahId, verseNo), not a verse row id.
    const transRows = await db
      .select({ surahId: translations.surahId, verseNo: translations.verseNo })
      .from(translations);
    const counts = tally(transRows, r => `${r.surahId}:${r.verseNo}`);

    const incomplete = verseRows
      .filter(v => (counts.get(`${v.surahId}:${v.verseNo}`) ?? 0) !== SOURCES.length)
      .map(
        v =>
          `sure#${v.surahId} ayet ${v.verseNo} ` +
          `(${counts.get(`${v.surahId}:${v.verseNo}`) ?? 0} meal)`,
      );

    expect(incomplete, incomplete.slice(0, 10).join(" · ")).toEqual([]);
  });

  it("translation sources are limited to the four declared meals", async () => {
    const db = await getDb();
    if (!db) return;

    const rows = await db.selectDistinct({ source: translations.source }).from(translations);
    const found = rows.map(r => r.source).sort();
    expect(found).toEqual([...SOURCES].sort());
  });

  it("station numbers and surah numbers are unique", async () => {
    const db = await getDb();
    if (!db) return;

    const rows = await db
      .select({ stationNo: surahs.stationNo, surahNo: surahs.surahNo })
      .from(surahs);

    const stationNos = rows.map(r => r.stationNo);
    const surahNos = rows.map(r => r.surahNo);
    expect(new Set(stationNos).size).toBe(stationNos.length);
    expect(new Set(surahNos).size).toBe(surahNos.length);
  });

  it("station numbers form an unbroken sequence starting at 1", async () => {
    const db = await getDb();
    if (!db) return;

    const rows = await db.select({ stationNo: surahs.stationNo }).from(surahs);
    const sorted = rows.map(r => r.stationNo).sort((a, b) => a - b);
    expect(sorted).toEqual(sorted.map((_, i) => i + 1));
  });

  it("every surah has editorial prose, themes and questions", async () => {
    const db = await getDb();
    if (!db) return;

    const surahRows = await db
      .select({
        id: surahs.id,
        name: surahs.name,
        introduction: surahs.introduction,
        occasion: surahs.occasionOfRevelation,
        sources: surahs.occasionSources,
        contemporary: surahs.contemporaryMeaning,
      })
      .from(surahs);
    const themeRows = await db.select({ surahId: themes.surahId }).from(themes);
    const questionRows = await db.select({ surahId: questions.surahId }).from(questions);
    const themeCounts = tally(themeRows, r => r.surahId);
    const questionCounts = tally(questionRows, r => r.surahId);

    const gaps: string[] = [];
    for (const r of surahRows) {
      if (!r.introduction?.trim()) gaps.push(`${r.name}: giriş yok`);
      if (!r.occasion?.trim()) gaps.push(`${r.name}: esbâb-ı nüzûl yok`);
      if (!r.sources?.trim()) gaps.push(`${r.name}: kaynak künyesi yok`);
      if (!r.contemporary?.trim()) gaps.push(`${r.name}: bugüne bakan yüz yok`);
      if ((themeCounts.get(r.id) ?? 0) < 3) gaps.push(`${r.name}: 3'ten az tema`);
      if ((questionCounts.get(r.id) ?? 0) < 1) gaps.push(`${r.name}: soru yok`);
    }
    expect(gaps, gaps.slice(0, 10).join(" · ")).toEqual([]);
  });

  it("surahs whose two sources disagree on the period carry a dispute note", async () => {
    const db = await getDb();
    if (!db) return;

    const rows = await db
      .select({
        name: surahs.name,
        periodDiyanet: surahs.periodDiyanet,
        periodOkuyan: surahs.periodOkuyan,
        note: surahs.periodDisputeNote,
      })
      .from(surahs);

    const undocumented = rows
      .filter(r => r.periodDiyanet !== r.periodOkuyan && !r.note?.trim())
      .map(r => r.name);

    expect(undocumented, `ihtilaf notu eksik: ${undocumented.join(", ")}`).toEqual([]);
  });

  it("editorial prose carries no raw markdown emphasis markers", async () => {
    const db = await getDb();
    if (!db) return;

    const rows = await db
      .select({
        name: surahs.name,
        introduction: surahs.introduction,
        occasion: surahs.occasionOfRevelation,
        contemporary: surahs.contemporaryMeaning,
      })
      .from(surahs);

    // Prose is rendered as plain paragraphs, so `**bold**` would leak to the UI.
    const offenders: string[] = [];
    for (const r of rows) {
      for (const [field, value] of Object.entries({
        giriş: r.introduction,
        "esbâb-ı nüzûl": r.occasion,
        bugün: r.contemporary,
      })) {
        if (value && /\*\*|__/.test(value)) offenders.push(`${r.name} → ${field}`);
      }
    }
    expect(offenders, offenders.join(" · ")).toEqual([]);
  });
});

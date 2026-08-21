/**
 * Guards for the two AI-produced layers.
 *
 * The project's editorial promise is that a reader can always tell a published
 * meal apart from machine output. These tests hold that line: the AI rows must
 * exist, must be labelled as machine translation, and must never quietly
 * replace a scholar's work.
 */
import { describe, expect, it } from "vitest";
import { getDb } from "./db";
import { surahs, translations, verses } from "../drizzle/schema";
import {
  PUBLISHED_TRANSLATION_SOURCES,
  TRANSLATION_LABELS,
  TRANSLATION_SOURCES,
} from "../shared/kuran";

describe("AI layers", () => {
  it("keeps the four published meals distinct from the machine translation", () => {
    expect(PUBLISHED_TRANSLATION_SOURCES).toEqual([
      "diyanet",
      "okuyan",
      "islamoglu",
      "esed",
    ]);
    expect(PUBLISHED_TRANSLATION_SOURCES).not.toContain("ai");
    expect(TRANSLATION_SOURCES).toContain("ai");
  });

  it("labels the AI source as something other than a published meal", () => {
    const meta = TRANSLATION_LABELS.ai;
    expect(meta.full).toMatch(/AI/i);
    // The reader must be told, in the tooltip itself, that this is not a meal.
    expect(meta.note).toMatch(/yayımlanmış bir meal değildir/i);
  });

  it("gives every surah an AI paragraph", async () => {
    const db = await getDb();
    if (!db) return;
    const rows = await db
      .select({ name: surahs.name, paragraph: surahs.aiParagraph })
      .from(surahs);
    if (!rows.length) return;
    const missing = rows.filter(r => !r.paragraph?.trim()).map(r => r.name);
    expect(missing, missing.slice(0, 10).join(" · ")).toEqual([]);
  });

  it("writes AI paragraphs as a single readable block, not a verse list", async () => {
    const db = await getDb();
    if (!db) return;
    const rows = await db
      .select({ name: surahs.name, paragraph: surahs.aiParagraph })
      .from(surahs);
    const offenders = rows
      .filter(r => r.paragraph?.trim())
      // A leading "1." or a bullet means the model slipped into listing verses.
      .filter(r => /^\s*(?:\d+\.|[-*•])\s/m.test(r.paragraph!))
      .map(r => r.name);
    expect(offenders, offenders.slice(0, 10).join(" · ")).toEqual([]);
  });

  it("covers every verse it claims, leaving no Arabic text untranslated", async () => {
    const db = await getDb();
    if (!db) return;
    const verseRows = await db
      .select({ surahId: verses.surahId, verseNo: verses.verseNo })
      .from(verses);
    const aiRows = (
      await db
        .select({
          surahId: translations.surahId,
          verseNo: translations.verseNo,
          source: translations.source,
          text: translations.text,
        })
        .from(translations)
    ).filter(r => r.source === "ai");
    if (!aiRows.length) return;

    // Every AI row must belong to a real verse.
    const known = new Set(verseRows.map(v => `${v.surahId}:${v.verseNo}`));
    const orphans = aiRows
      .filter(r => !known.has(`${r.surahId}:${r.verseNo}`))
      .map(r => `sure#${r.surahId} ayet ${r.verseNo}`);
    expect(orphans, orphans.slice(0, 10).join(" · ")).toEqual([]);

    // An untranslated row (Arabic left as-is) is worse than a missing one,
    // because it looks finished.
    const untranslated = aiRows
      .filter(r => !/[A-Za-zÇĞİÖŞÜçğıöşü]/.test(r.text))
      .map(r => `sure#${r.surahId} ayet ${r.verseNo}`);
    expect(untranslated, untranslated.slice(0, 10).join(" · ")).toEqual([]);
  });

  it("translates every verse in the corpus, with no gaps and no duplicates", async () => {
    const db = await getDb();
    if (!db) return;
    const verseRows = await db
      .select({ surahId: verses.surahId, verseNo: verses.verseNo })
      .from(verses);
    const aiRows = (
      await db
        .select({
          surahId: translations.surahId,
          verseNo: translations.verseNo,
          source: translations.source,
        })
        .from(translations)
    ).filter(r => r.source === "ai");
    if (!aiRows.length) return;

    // Coverage has to be exact: a partial pass would show blank cells next to
    // the published meals, and a duplicated row would render the verse twice.
    const keys = aiRows.map(r => `${r.surahId}:${r.verseNo}`);
    expect(new Set(keys).size, "AI çevirisinde yinelenen ayet var").toBe(keys.length);
    expect(aiRows.length, "AI çevirisi ayet sayısıyla eşleşmiyor").toBe(verseRows.length);
  });

  it("never lets the AI text stand in for a published meal", async () => {
    const db = await getDb();
    if (!db) return;
    const rows = await db
      .select({
        surahId: translations.surahId,
        verseNo: translations.verseNo,
        source: translations.source,
        text: translations.text,
      })
      .from(translations);
    const ai = new Map(
      rows.filter(r => r.source === "ai").map(r => [`${r.surahId}:${r.verseNo}`, r.text]),
    );
    if (!ai.size) return;

    // If a published meal ever carried byte-identical text to the machine
    // output across many verses, the scholar's column would be a copy.
    for (const source of PUBLISHED_TRANSLATION_SOURCES) {
      const own = rows.filter(r => r.source === source);
      if (own.length < 50) continue;
      const identical = own.filter(
        r => ai.get(`${r.surahId}:${r.verseNo}`)?.trim() === r.text.trim(),
      ).length;
      expect(
        identical / own.length,
        `${source} meali AI metniyle örtüşüyor (${identical}/${own.length})`,
      ).toBeLessThan(0.02);
    }
  });
});

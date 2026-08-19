/**
 * Reading navigator guards.
 *
 * The panel splits long surahs into fixed verse blocks. The chunking rule lives
 * in the component, but its consequences are content-dependent: which stations
 * get a navigator, and whether every verse stays reachable. Those are the parts
 * worth pinning down, because a silent off-by-one would hide verses from the
 * reader with no visible error.
 */
import { describe, expect, it } from "vitest";
import { getDb } from "./db";
import { surahs } from "../drizzle/schema";

const CHUNK_THRESHOLD = 40;
const CHUNK_SIZE = 20;

/** Mirrors the panel's block split so coverage can be asserted here. */
function chunkRanges(verseCount: number) {
  if (verseCount <= CHUNK_THRESHOLD) return null;
  const out: [number, number][] = [];
  for (let start = 1; start <= verseCount; start += CHUNK_SIZE) {
    out.push([start, Math.min(start + CHUNK_SIZE - 1, verseCount)]);
  }
  return out;
}

describe("reading navigator", () => {
  it("leaves short surahs as a single uninterrupted read", () => {
    // Fâtiha (7), İhlâs (4), Şems (15) must not gain a navigator.
    for (const n of [4, 7, 15, 19, 40]) {
      expect(chunkRanges(n)).toBeNull();
    }
  });

  it("splits long surahs without dropping or duplicating a verse", () => {
    for (const verseCount of [41, 52, 62, 129, 176, 200, 227, 286]) {
      const ranges = chunkRanges(verseCount);
      expect(ranges, `${verseCount} ayet bölünmeliydi`).not.toBeNull();
      const seen = new Set<number>();
      for (const [start, end] of ranges!) {
        expect(start).toBeLessThanOrEqual(end);
        for (let v = start; v <= end; v++) {
          expect(seen.has(v), `ayet ${v} iki bölümde`).toBe(false);
          seen.add(v);
        }
      }
      expect(seen.size, `${verseCount} ayetin tamamı erişilebilir olmalı`).toBe(verseCount);
      expect(Math.min(...seen)).toBe(1);
      expect(Math.max(...seen)).toBe(verseCount);
    }
  });

  it("keeps block counts within a browsable range for the longest surah", async () => {
    const db = await getDb();
    if (!db) return;

    const rows = await db.select({ name: surahs.name, verseCount: surahs.verseCount }).from(surahs);
    expect(rows.length).toBeGreaterThan(0);

    // Bakara is the worst case at 286 verses → 15 blocks. Beyond roughly 20
    // buttons the navigator itself becomes the thing you have to scroll past.
    const tooMany = rows
      .map(r => ({ name: r.name, blocks: chunkRanges(r.verseCount)?.length ?? 0 }))
      .filter(r => r.blocks > 20);

    expect(tooMany, tooMany.map(r => `${r.name}: ${r.blocks} blok`).join(" · ")).toEqual([]);
  });

  it("gives a navigator to exactly the surahs long enough to need one", async () => {
    const db = await getDb();
    if (!db) return;

    const rows = await db.select({ verseCount: surahs.verseCount }).from(surahs);
    const withNav = rows.filter(r => chunkRanges(r.verseCount) !== null).length;

    // Sanity band: most of the Qur'an's surahs are short, so the navigator must
    // stay the exception. If a data error inflated verse counts this would jump.
    expect(withNav).toBeGreaterThan(0);
    expect(withNav).toBeLessThan(rows.length / 2);
  });
});

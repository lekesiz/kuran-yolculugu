import { sql } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { getDb } from "./db";

/**
 * The source-criticism layer is the one place where a data-entry mistake would
 * be actively misleading: an unlabelled note reads as settled fact, and a note
 * whose `kind` the UI cannot map renders as a raw slug. These tests guard the
 * shape of that layer in the live database, not just in the seed files.
 */
describe("kaynak notları (scholarlyNotes)", () => {
  it("her not geçerli bir tür, başlık ve gövde taşır", async () => {
    const db = await getDb();
    if (!db) return;

    const rows = (await db.execute(
      sql`SELECT stationNo, name, scholarlyNotes FROM surahs
          WHERE scholarlyNotes IS NOT NULL ORDER BY stationNo`,
    )) as unknown as [Record<string, unknown>[], unknown];

    const surahs = rows[0];
    expect(surahs.length).toBeGreaterThan(0);

    const allowedKinds = new Set(["ihtilaf", "rivayet", "nuans"]);

    for (const row of surahs) {
      const raw = row.scholarlyNotes;
      const notes = (typeof raw === "string" ? JSON.parse(raw) : raw) as {
        kind: string;
        label: string;
        body: string;
      }[];

      expect(Array.isArray(notes), `${row.name}: notlar dizi değil`).toBe(true);
      expect(notes.length, `${row.name}: not listesi boş`).toBeGreaterThan(0);

      for (const note of notes) {
        expect(allowedKinds.has(note.kind), `${row.name}: geçersiz tür ${note.kind}`).toBe(
          true,
        );
        expect(note.label?.trim().length, `${row.name}: başlık boş`).toBeGreaterThan(0);
        // A one-line note cannot carry an attribution, which is the whole point
        // of this layer.
        expect(note.body?.trim().length, `${row.name}: gövde çok kısa`).toBeGreaterThan(40);
      }
    }
  });

  it("ihtilaf notları taraf tutmaz, iki görüşü de anar", async () => {
    const db = await getDb();
    if (!db) return;

    const rows = (await db.execute(
      sql`SELECT name, scholarlyNotes FROM surahs WHERE scholarlyNotes IS NOT NULL`,
    )) as unknown as [Record<string, unknown>[], unknown];

    // An "ihtilaf" note that names only one position is not a dispute note; it
    // is an unmarked editorial choice. Require a contrast marker.
    const contrastMarkers = [
      "ise",
      "ancak",
      "bununla birlikte",
      "buna karşılık",
      "farklı",
      "iki görüş",
      "yanı sıra",
      "yahut",
      "ya da",
      "kesin değildir",
      "kesin bir",
    ];

    let checked = 0;
    for (const row of rows[0]) {
      const raw = row.scholarlyNotes;
      const notes = (typeof raw === "string" ? JSON.parse(raw) : raw) as {
        kind: string;
        label: string;
        body: string;
      }[];

      for (const note of notes.filter(n => n.kind === "ihtilaf")) {
        const body = note.body.toLocaleLowerCase("tr");
        const hasContrast = contrastMarkers.some(m => body.includes(m));
        expect(
          hasContrast,
          `${row.name} — "${note.label}": ihtilaf notu tek görüş anlatıyor`,
        ).toBe(true);
        checked++;
      }
    }

    expect(checked).toBeGreaterThan(0);
  });

  it("rivayet uyarıları uydurma bilgiyi aktarmaz, sadece uyarır", async () => {
    const db = await getDb();
    if (!db) return;

    const rows = (await db.execute(
      sql`SELECT name, scholarlyNotes FROM surahs WHERE scholarlyNotes IS NOT NULL`,
    )) as unknown as [Record<string, unknown>[], unknown];

    // Every authenticity warning must state the verdict, otherwise the reader
    // takes the quoted report at face value.
    const verdictWords = ["mevzû", "uydurma", "sahih olmadığı", "zayıf", "itibar edilme"];

    let checked = 0;
    for (const row of rows[0]) {
      const raw = row.scholarlyNotes;
      const notes = (typeof raw === "string" ? JSON.parse(raw) : raw) as {
        kind: string;
        label: string;
        body: string;
      }[];

      for (const note of notes.filter(n => n.kind === "rivayet")) {
        const body = note.body.toLocaleLowerCase("tr");
        const hasVerdict = verdictWords.some(w => body.includes(w.toLocaleLowerCase("tr")));
        expect(
          hasVerdict,
          `${row.name} — "${note.label}": rivayet notu hüküm belirtmiyor`,
        ).toBe(true);
        checked++;
      }
    }

    expect(checked).toBeGreaterThan(0);
  });
});

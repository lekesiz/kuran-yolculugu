/**
 * Shared seeding helpers.
 *
 * Content lives in JSON files under `scripts/content/`. Each file describes one
 * station (surah) and is validated here before it reaches the database, so a
 * malformed hand-written file fails loudly instead of silently inserting junk.
 */
import mysql from "mysql2/promise";

const SOURCES = new Set(["diyanet", "okuyan", "islamoglu", "esed"]);
const PERIODS = new Set(["Mekke", "Medine"]);

export async function connect() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL yok.");
  return mysql.createConnection(url);
}

/** Throws with a readable message when a station file is malformed. */
export function validateStation(s, file) {
  const fail = msg => {
    throw new Error(`${file}: ${msg}`);
  };

  for (const key of [
    "stationNo",
    "surahNo",
    "nuzulOrderOkuyan",
    "name",
    "verseCount",
    "periodDiyanet",
    "periodOkuyan",
  ]) {
    if (s[key] === undefined || s[key] === null || s[key] === "") {
      fail(`zorunlu alan eksik: ${key}`);
    }
  }

  if (!Number.isInteger(s.surahNo) || s.surahNo < 1 || s.surahNo > 114) {
    fail(`geçersiz surahNo: ${s.surahNo}`);
  }
  if (!Number.isInteger(s.verseCount) || s.verseCount < 1) {
    fail(`geçersiz verseCount: ${s.verseCount}`);
  }
  if (!PERIODS.has(s.periodDiyanet)) fail(`geçersiz periodDiyanet: ${s.periodDiyanet}`);
  if (!PERIODS.has(s.periodOkuyan)) fail(`geçersiz periodOkuyan: ${s.periodOkuyan}`);

  // A disagreement between sources must be explained, never left bare.
  if (s.periodDiyanet !== s.periodOkuyan && !s.periodDisputeNote) {
    fail("dönem ihtilafı var ama periodDisputeNote yazılmamış");
  }

  for (const t of s.translations ?? []) {
    if (!SOURCES.has(t.source)) fail(`geçersiz meal kaynağı: ${t.source}`);
    if (!Number.isInteger(t.verseNo) || t.verseNo < 1 || t.verseNo > s.verseCount) {
      fail(`meal ayet no aralık dışı: ${t.source} ${t.verseNo} (1-${s.verseCount})`);
    }
    if (t.verseNoEnd != null && t.verseNoEnd > s.verseCount) {
      fail(`meal bitiş ayet no aralık dışı: ${t.source} ${t.verseNo}-${t.verseNoEnd}`);
    }
    if (!t.text || !t.text.trim()) fail(`boş meal metni: ${t.source} ${t.verseNo}`);
  }

  // Scholarly notes must declare their kind, otherwise the UI cannot label them.
  const NOTE_KINDS = new Set(["ihtilaf", "rivayet", "nuans"]);
  for (const n of s.scholarlyNotes ?? []) {
    if (!NOTE_KINDS.has(n.kind)) fail(`geçersiz kaynak notu türü: ${n.kind}`);
    if (!n.label || !n.label.trim()) fail(`kaynak notu başlığı boş: ${n.kind}`);
    if (!n.body || !n.body.trim()) fail(`kaynak notu gövdesi boş: ${n.label}`);
  }

  for (const v of s.verses ?? []) {
    if (!Number.isInteger(v.verseNo) || v.verseNo < 1 || v.verseNo > s.verseCount) {
      fail(`Arapça ayet no aralık dışı: ${v.verseNo}`);
    }
  }

  // Duplicate (verse, source) pairs would violate the unique index.
  const seen = new Set();
  for (const t of s.translations ?? []) {
    const key = `${t.verseNo}:${t.source}`;
    if (seen.has(key)) fail(`yinelenen meal kaydı: ${key}`);
    seen.add(key);
  }

  return s;
}

/**
 * Upserts one station and replaces all of its child collections.
 * Idempotent: running the seed twice leaves the same rows.
 */
export async function upsertStation(conn, s) {
  const keyTerms = s.keyTerms?.length ? JSON.stringify(s.keyTerms) : null;
  const scholarlyNotes = s.scholarlyNotes?.length ? JSON.stringify(s.scholarlyNotes) : null;

  await conn.execute(
    `INSERT INTO surahs
       (stationNo, surahNo, nuzulOrderOkuyan, name, nameArabic, nameMeaning, verseCount,
        periodDiyanet, periodOkuyan, periodDisputeNote, revelationTiming, stationTitle,
        introduction, occasionOfRevelation, occasionSources, contemporaryMeaning, keyTerms,
        scholarlyNotes, revisionPass, revisionNote)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
     ON DUPLICATE KEY UPDATE
       stationNo=VALUES(stationNo),
       nuzulOrderOkuyan=VALUES(nuzulOrderOkuyan),
       name=VALUES(name),
       nameArabic=VALUES(nameArabic),
       nameMeaning=VALUES(nameMeaning),
       verseCount=VALUES(verseCount),
       periodDiyanet=VALUES(periodDiyanet),
       periodOkuyan=VALUES(periodOkuyan),
       periodDisputeNote=VALUES(periodDisputeNote),
       revelationTiming=VALUES(revelationTiming),
       stationTitle=VALUES(stationTitle),
       introduction=VALUES(introduction),
       occasionOfRevelation=VALUES(occasionOfRevelation),
       occasionSources=VALUES(occasionSources),
       contemporaryMeaning=VALUES(contemporaryMeaning),
       keyTerms=VALUES(keyTerms),
       scholarlyNotes=VALUES(scholarlyNotes),
       revisionPass=VALUES(revisionPass),
       revisionNote=VALUES(revisionNote)`,
    [
      s.stationNo,
      s.surahNo,
      s.nuzulOrderOkuyan,
      s.name,
      s.nameArabic ?? null,
      s.nameMeaning ?? null,
      s.verseCount,
      s.periodDiyanet,
      s.periodOkuyan,
      s.periodDisputeNote ?? null,
      s.revelationTiming ?? null,
      s.stationTitle ?? null,
      s.introduction ?? null,
      s.occasionOfRevelation ?? null,
      s.occasionSources ?? null,
      s.contemporaryMeaning ?? null,
      keyTerms,
      scholarlyNotes,
      s.revisionPass ?? 1,
      s.revisionNote ?? null,
    ],
  );

  const [rows] = await conn.execute("SELECT id FROM surahs WHERE surahNo = ?", [s.surahNo]);
  const surahId = rows[0].id;

  // Replace children wholesale so edits to the JSON always win.
  for (const table of ["verses", "translations", "themes", "questions"]) {
    await conn.execute(`DELETE FROM ${table} WHERE surahId = ?`, [surahId]);
  }

  for (const v of s.verses ?? []) {
    await conn.execute(
      "INSERT INTO verses (surahId, verseNo, textArabic) VALUES (?,?,?)",
      [surahId, v.verseNo, v.textArabic],
    );
  }

  for (const t of s.translations ?? []) {
    await conn.execute(
      "INSERT INTO translations (surahId, verseNo, verseNoEnd, source, text) VALUES (?,?,?,?,?)",
      [surahId, t.verseNo, t.verseNoEnd ?? null, t.source, t.text],
    );
  }

  let order = 0;
  for (const th of s.themes ?? []) {
    await conn.execute(
      "INSERT INTO themes (surahId, label, body, sortOrder) VALUES (?,?,?,?)",
      [surahId, th.label, th.body ?? null, order++],
    );
  }

  order = 0;
  for (const q of s.questions ?? []) {
    await conn.execute("INSERT INTO questions (surahId, body, sortOrder) VALUES (?,?,?)", [
      surahId,
      typeof q === "string" ? q : q.body,
      order++,
    ]);
  }

  return {
    surahId,
    counts: {
      verses: (s.verses ?? []).length,
      translations: (s.translations ?? []).length,
      themes: (s.themes ?? []).length,
      questions: (s.questions ?? []).length,
    },
  };
}

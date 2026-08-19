/**
 * Dumps one station's editorial layers as JSON on stdout.
 *
 * Used by the daily pass-2 review to read a station in full without hand-writing
 * six queries. Lives inside the project so `dotenv` and `mysql2` resolve, and
 * exits explicitly because the TLS keep-alive handle otherwise keeps node alive
 * after `conn.end()`.
 *
 * Usage: node scripts/dump-station.mjs <stationNo>
 */
import "dotenv/config";
import { connect } from "./seed-lib.mjs";

const station = Number(process.argv[2]);
if (!Number.isFinite(station)) {
  console.error("Kullanım: node scripts/dump-station.mjs <durakNo>");
  process.exit(1);
}

const conn = await connect();
const [surahRows] = await conn.execute("SELECT * FROM surahs WHERE stationNo = ?", [station]);

if (!surahRows.length) {
  console.error(`${station}. durak bulunamadı.`);
  await conn.end();
  process.exit(1);
}

const s = surahRows[0];
const [themes] = await conn.execute(
  "SELECT label, body FROM themes WHERE surahId = ? ORDER BY sortOrder, id",
  [s.id],
);
const [questions] = await conn.execute(
  "SELECT body FROM questions WHERE surahId = ? ORDER BY sortOrder, id",
  [s.id],
);
const [[verseStats]] = await conn.execute(
  "SELECT COUNT(*) AS verses FROM verses WHERE surahId = ?",
  [s.id],
);
const [translationStats] = await conn.execute(
  "SELECT source, COUNT(*) AS n FROM translations WHERE surahId = ? GROUP BY source",
  [s.id],
);

await conn.end();
console.log(JSON.stringify({ surah: s, themes, questions, verseStats, translationStats }));
process.exit(0);

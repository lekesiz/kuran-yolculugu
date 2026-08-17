/**
 * Loads every station JSON under scripts/content/ into the database.
 *
 * Usage:
 *   node scripts/seed.mjs             # all files
 *   node scripts/seed.mjs 96 68       # only these surah numbers
 */
import "dotenv/config";
import { readdir, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { connect, upsertStation, validateStation } from "./seed-lib.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const contentDir = join(here, "content");

const only = process.argv.slice(2).map(Number).filter(Number.isFinite);

const files = (await readdir(contentDir)).filter(f => f.endsWith(".json")).sort();
if (!files.length) {
  console.error("scripts/content/ içinde JSON bulunamadı.");
  process.exit(1);
}

const conn = await connect();
let ok = 0;
let skipped = 0;
const problems = [];

for (const file of files) {
  const raw = await readFile(join(contentDir, file), "utf8");
  let station;
  try {
    station = JSON.parse(raw);
  } catch (err) {
    problems.push(`${file}: JSON parse hatası — ${err.message}`);
    continue;
  }

  if (only.length && !only.includes(station.surahNo)) {
    skipped++;
    continue;
  }

  try {
    validateStation(station, file);
    const { counts } = await upsertStation(conn, station);
    console.log(
      `✓ ${String(station.stationNo).padStart(2)}. ${station.name.padEnd(12)} ` +
        `ayet:${String(counts.verses).padStart(3)} meal:${String(counts.translations).padStart(4)} ` +
        `tema:${counts.themes} soru:${counts.questions}`,
    );
    ok++;
  } catch (err) {
    problems.push(err.message);
  }
}

await conn.end();

console.log(`\nYüklenen: ${ok}${skipped ? ` · atlanan: ${skipped}` : ""}`);
if (problems.length) {
  console.error(`\nHatalar (${problems.length}):`);
  for (const p of problems) console.error(`  ✗ ${p}`);
  process.exit(1);
}


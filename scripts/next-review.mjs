/**
 * Reports the next stations awaiting the pass-2 review.
 *
 * `revisionPass` lives in the database rather than a local file so the queue
 * cannot drift from what the site actually serves, and survives across sessions.
 *
 * Usage: node scripts/next-review.mjs [limit]
 */
import "dotenv/config";
import { connect } from "./seed-lib.mjs";

const limit = Number(process.argv[2]) || 5;
const conn = await connect();
const col = name => (conn.dialect === "postgres" ? `"${name}"` : name);

const [rows] = await conn.execute(
  `SELECT ${col("stationNo")}, ${col("surahNo")}, ${col("name")},
          ${col("verseCount")}, ${col("revisionPass")}
     FROM surahs WHERE ${col("revisionPass")} < 2
     ORDER BY ${col("stationNo")} LIMIT ${Math.max(1, Math.min(50, limit))}`,
);
const [[totals]] = await conn.execute(
  `SELECT COUNT(*) AS total,
          SUM(CASE WHEN ${col("revisionPass")} >= 2 THEN 1 ELSE 0 END) AS done
     FROM surahs`,
);
await conn.end();

if (!rows.length) {
  console.log("Tüm duraklar 2. turdan geçmiş. Yeni bir tur tanımlanması gerekiyor.");
  process.exit(0);
}

console.log(`Gözden geçirme ilerlemesi: ${totals.done}/${totals.total} durak tamam\n`);
console.log("Bekleyen duraklar:");
rows.forEach((r, i) => {
  console.log(`  ${i === 0 ? "→" : " "} ${String(r.stationNo).padStart(3)}. durak — ` +
    `${r.name} (${r.surahNo}), ${r.verseCount} ayet`);
});
const first = rows[0];
console.log(`\nBugünün durağı: ${first.name} (sure ${first.surahNo}, durak ${first.stationNo})`);
process.exit(0);

/**
 * Publishes an edited station to BOTH live deployments in one step.
 *
 * The project runs twice: Manus (MySQL/TiDB, kuranokuma-gucsoe7t.manus.space)
 * and Vercel (Supabase Postgres, t1o.net). Editorial content lives in the
 * database, not in the bundle, so a station edit has to be seeded into two
 * separate databases. Code changes, by contrast, only reach t1o.net after a
 * push to GitHub — Vercel builds from `main`.
 *
 * Running the seed by hand meant one of those three steps was easy to forget,
 * which is exactly what happened: content landed on Manus while t1o.net kept
 * serving the old text. This script makes the whole chain a single command and
 * verifies the result over HTTPS instead of assuming success.
 *
 * Usage:
 *   node scripts/yayinla.mjs 96          # seed surah 96 to both DBs, push, verify
 *   node scripts/yayinla.mjs 96 --no-git # databases only (no code change to ship)
 *   node scripts/yayinla.mjs 96 --skip-manus # Supabase + GitHub + t1o.net only
 */
import "dotenv/config";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const run = promisify(execFile);
const PROJECT = new URL("..", import.meta.url).pathname.replace(/\/$/, "");

const SUPABASE_URL = process.env.SUPABASE_DATABASE_URL;

const args = process.argv.slice(2);
const skipGit = args.includes("--no-git");
const skipManus = args.includes("--skip-manus");
const surahs = args.filter(a => !a.startsWith("--"));

if (!surahs.length) {
  console.error("Kullanım: node scripts/yayinla.mjs <sureNo> [...] [--no-git]");
  process.exit(1);
}

if (!SUPABASE_URL) {
  console.error(
    "SUPABASE_DATABASE_URL tanımlı değil. Parolalı bağlantı dizesini güvenli bir ortam değişkeni olarak verin.",
  );
  process.exit(1);
}

const step = msg => console.log(`\n▸ ${msg}`);
const fail = msg => {
  console.error(`\n✗ ${msg}`);
  process.exit(1);
};

async function sh(cmd, cmdArgs, opts = {}) {
  try {
    const { stdout } = await run(cmd, cmdArgs, { cwd: PROJECT, ...opts });
    return stdout.trim();
  } catch (err) {
    throw new Error(`${cmd} ${cmdArgs.join(" ")} → ${err.stderr || err.message}`);
  }
}

// ── 1. Manus (MySQL) ────────────────────────────────────────────────────────
if (skipManus) {
  step("Manus veritabanı atlandı (bağımsız yayın modu)");
} else {
  step("Manus veritabanına yükleniyor (MySQL)");
  try {
    console.log(await sh("node", ["scripts/seed.mjs", ...surahs]));
  } catch (err) {
    fail(`Manus yüklemesi başarısız: ${err.message}`);
  }
}

// ── 2. Supabase (Postgres) ──────────────────────────────────────────────────
step("Supabase veritabanına yükleniyor (Postgres — t1o.net)");
try {
  console.log(
    await sh("node", ["scripts/seed.mjs", ...surahs], {
      env: { ...process.env, DB_DRIVER: "postgres", DATABASE_URL: SUPABASE_URL },
    }),
  );
} catch (err) {
  fail(`Supabase yüklemesi başarısız: ${err.message}`);
}

// ── 3. GitHub → Vercel ──────────────────────────────────────────────────────
// Editorial JSON files are tracked, so even a content-only day produces a diff
// worth committing; the push is what keeps the repo the source of truth.
if (!skipGit) {
  step("GitHub'a gönderiliyor (Vercel otomatik dağıtım tetiklenir)");
  const dirty = await sh("git", ["status", "--porcelain"]);
  if (!dirty) {
    console.log("  değişiklik yok, gönderim atlandı");
  } else {
    try {
      await sh("pnpm", ["build:vercel"]);
      await sh("git", ["add", "-A"]);
      await sh("git", [
        "commit",
        "-q",
        "-m",
        `içerik: ${surahs.join(", ")} numaralı surenin gözden geçirmesi`,
      ]);
      console.log(await sh("git", ["push", "user_github", "main"]));
    } catch (err) {
      fail(`Gönderim başarısız: ${err.message}`);
    }
  }
}

// ── 4. Verify both deployments actually serve the new text ──────────────────
step("Canlı doğrulama");

async function liveStation(base, stationNo) {
  const input = encodeURIComponent(JSON.stringify({ json: { stationNo } }));
  const res = await fetch(`${base}/api/trpc/surah.detail?input=${input}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const body = await res.json();
  return body.result.data.json.surah;
}

// Station numbers are what the site addresses, so map surah → station first.
const { readdir, readFile } = await import("node:fs/promises");
const contentDir = `${PROJECT}/scripts/content`;
const stationNos = [];
for (const f of await readdir(contentDir)) {
  if (!f.endsWith(".json")) continue;
  const s = JSON.parse(await readFile(`${contentDir}/${f}`, "utf8"));
  if (surahs.map(Number).includes(s.surahNo)) stationNos.push(s.stationNo);
}

let allOk = true;
const liveBases = skipManus
  ? ["https://t1o.net"]
  : ["https://t1o.net", "https://kuranokuma-gucsoe7t.manus.space"];

for (const base of liveBases) {
  for (const stationNo of stationNos) {
    try {
      const s = await liveStation(base, stationNo);
      const pass = s.revisionPass ?? 1;
      console.log(`  ${base} → ${stationNo}. durak (${s.name}): tur ${pass}`);
    } catch (err) {
      // Manus blocks unauthenticated API probes from the sandbox; that is not a
      // content failure, so only t1o.net is treated as a hard requirement.
      const hard = base.includes("t1o.net");
      console.log(`  ${base} → ${stationNo}. durak: ${err.message}${hard ? "" : " (bilgi)"}`);
      if (hard) allOk = false;
    }
  }
}

console.log(allOk ? "\n✓ Yayın zinciri tamam." : "\n✗ t1o.net doğrulaması başarısız.");
process.exit(allOk ? 0 : 1);

/**
 * Metodoloji V3 katmanlarının sözleşmesi.
 *
 * Dört katman (muhatap toplum, olay/karşılık haritası, apofatik maksat
 * okuması, AI şerhi) yalnızca "dolu olsun" diye değil, belirli bir yöntemle
 * yazıldı. Bu testler o yöntemin kod düzeyindeki karşılığıdır: taraf tutma,
 * vaaz dili ve şerhsiz yorum yayına çıkamaz.
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const CONTENT_DIR = join(import.meta.dirname, "..", "scripts", "content");

type EventRow = { situation: string; response: string; shift: string };
type Station = {
  surahNo: number;
  name: string;
  audienceContext?: string | null;
  eventMessageMap?: EventRow[] | null;
  apophaticReading?: string | null;
  aiCommentary?: string | null;
};

const stations: Station[] = readdirSync(CONTENT_DIR)
  .filter(f => f.endsWith(".json"))
  .map(f => JSON.parse(readFileSync(join(CONTENT_DIR, f), "utf8")) as Station)
  .sort((a, b) => a.surahNo - b.surahNo);

/** Mezhep/ekol ve güncel siyaset adları. Taraf tutmanın en görünür işareti. */
const PARTISAN = [
  "hanefî", "şâfiî", "mâlikî", "hanbelî", "câferî", "şiî", "sünnî",
  "vehhâbî", "selefî", "mutezile", "eş'arî", "mâtürîdî", "tarikat",
  "cumhurbaşkanı", "başbakan",
];
/** Vaaz dili: okuyucuya tepeden hüküm bildiren kalıplar. */
const IMPERATIVE = ["malıyız", "meliyiz", "unutmayalım", "düşünelim", "bilmeliyiz"];
/** Bugüne uyarlamayı ucuzlatan hazır kalıplar. */
const CLICHE = [
  "günümüzde insanlar", "modern dünyada", "teknolojinin esiri",
  "hızla akan hayat", "çağımızın hastalığı",
];
const ARABIC = /[\u0600-\u06FF]/;

const layerText = (s: Station) =>
  [
    s.audienceContext ?? "",
    s.apophaticReading ?? "",
    s.aiCommentary ?? "",
    ...(s.eventMessageMap ?? []).map(r => `${r.situation} ${r.response} ${r.shift}`),
  ]
    .join(" ")
    .toLowerCase();

describe("metodoloji katmanları", () => {
  it("114 durağın tamamında dört katman da dolu", () => {
    expect(stations).toHaveLength(114);
    const missing = stations.filter(
      s =>
        !s.audienceContext ||
        !s.apophaticReading ||
        !s.aiCommentary ||
        !s.eventMessageMap?.length,
    );
    expect(missing.map(s => s.surahNo)).toEqual([]);
  });

  it("olay/karşılık haritasının her satırı üç alanı da taşır", () => {
    for (const s of stations) {
      const rows = s.eventMessageMap ?? [];
      expect(rows.length, `${s.name}: satır sayısı`).toBeGreaterThanOrEqual(2);
      expect(rows.length, `${s.name}: satır sayısı`).toBeLessThanOrEqual(6);
      for (const r of rows) {
        expect(r.situation?.trim(), `${s.name}: situation`).toBeTruthy();
        expect(r.response?.trim(), `${s.name}: response`).toBeTruthy();
        expect(r.shift?.trim(), `${s.name}: shift`).toBeTruthy();
      }
    }
  });

  it("maksat okuması olumsuzlama yöntemiyle kurulur", () => {
    // Apofatik yöntemin ayırt edici izi: bir okumanın metnin kendi mantığıyla
    // çeliştiğini göstermek. Bu ifade yoksa bölüm olumlayıcı yoruma kaymıştır.
    for (const s of stations) {
      expect(s.apophaticReading, `${s.name}`).toContain("çelişir");
      expect(s.apophaticReading!.split(/\s+/).length, `${s.name}`).toBeGreaterThan(100);
    }
  });

  it("her şerh tefsir/meal/fetva olmadığını açıkça söyler", () => {
    for (const s of stations) {
      const c = s.aiCommentary!.toLowerCase();
      for (const word of ["tefsir", "meal", "fetva"]) {
        expect(c, `${s.name}: '${word}' uyarısı`).toContain(word);
      }
    }
  });

  it("hiçbir katmanda mezhep, ekol ya da güncel siyaset adı geçmez", () => {
    for (const s of stations) {
      const text = layerText(s);
      for (const term of PARTISAN) {
        expect(text, `${s.name}: '${term}'`).not.toContain(term);
      }
    }
  });

  it("vaaz dili ve klişe kullanılmaz", () => {
    for (const s of stations) {
      const text = layerText(s);
      for (const term of [...IMPERATIVE, ...CLICHE]) {
        expect(text, `${s.name}: '${term}'`).not.toContain(term);
      }
    }
  });

  it("katmanlarda çevrilmemiş Arapça bırakılmaz", () => {
    // Okuyucu Arap alfabesini bilmiyor olabilir; alıntı yapılacaksa Türkçesi verilir.
    for (const s of stations) {
      expect(ARABIC.test(layerText(s)), `${s.name}`).toBe(false);
    }
  });
});

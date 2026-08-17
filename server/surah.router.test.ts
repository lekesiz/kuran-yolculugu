/**
 * Behaviour tests for the public reading surface: listing, sorting, filtering,
 * search and the station detail payload.
 */
import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

/** Anonymous visitor: no personal layers (notes, progress) should be attached. */
function anonContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as unknown as TrpcContext["res"],
  } as TrpcContext;
}

const caller = () => appRouter.createCaller(anonContext());

describe("surah.list", () => {
  it("returns stations ordered by station number by default", async () => {
    const rows = await caller().surah.list({ sort: "station" });
    expect(rows.length).toBeGreaterThan(0);
    const nos = rows.map(r => r.stationNo);
    expect(nos).toEqual([...nos].sort((a, b) => a - b));
  });

  it("orders by Okuyan's nuzul sequence when asked", async () => {
    const rows = await caller().surah.list({ sort: "nuzul" });
    const order = rows.map(r => r.nuzulOrderOkuyan);
    expect(order).toEqual([...order].sort((a, b) => a - b));
  });

  it("orders by mushaf sequence when asked", async () => {
    const rows = await caller().surah.list({ sort: "mushaf" });
    const order = rows.map(r => r.surahNo);
    expect(order).toEqual([...order].sort((a, b) => a - b));
  });

  it("filters by period, matching either source's classification", async () => {
    const medina = await caller().surah.list({ sort: "station", period: "Medine" });
    expect(medina.length).toBeGreaterThan(0);
    for (const row of medina) {
      expect(
        row.periodDiyanet === "Medine" || row.periodOkuyan === "Medine",
        `${row.name} Medine filtresine düşmemeliydi`,
      ).toBe(true);
    }
  });

  it("finds a surah by its Turkish name", async () => {
    const rows = await caller().surah.list({ sort: "station", search: "Zilzâl" });
    expect(rows.some(r => r.name === "Zilzâl")).toBe(true);
  });

  it("search is not case sensitive", async () => {
    const rows = await caller().surah.list({ sort: "station", search: "beyyine" });
    expect(rows.some(r => r.name === "Beyyine")).toBe(true);
  });

  it("finds surahs through theme labels, not just their own columns", async () => {
    // "yokuş" appears in Beled's theme labels, not in the surah row itself.
    const rows = await caller().surah.list({ sort: "station", search: "yokuş" });
    expect(rows.some(r => r.name === "Beled")).toBe(true);
  });

  it("returns an empty list for a term that matches nothing", async () => {
    const rows = await caller().surah.list({ sort: "station", search: "zzzqqqxyz" });
    expect(rows).toEqual([]);
  });
});

describe("surah.detail", () => {
  it("returns verses, four translations per verse, themes and questions", async () => {
    const detail = await caller().surah.detail({ stationNo: 1, sort: "station" });

    expect(detail.surah.name).toBeTruthy();
    expect(detail.verses.length).toBe(detail.surah.verseCount);
    expect(detail.translations.length).toBe(detail.surah.verseCount * 4);
    expect(detail.themes.length).toBeGreaterThanOrEqual(3);
    expect(detail.questions.length).toBeGreaterThanOrEqual(1);
  });

  it("omits personal layers for anonymous visitors", async () => {
    const detail = await caller().surah.detail({ stationNo: 1, sort: "station" });
    expect(detail.note).toBeNull();
    expect(detail.isRead).toBe(false);
  });

  it("exposes previous/next neighbours consistent with the chosen order", async () => {
    const detail = await caller().surah.detail({ stationNo: 2, sort: "station" });
    expect(detail.adjacent.prev?.stationNo).toBe(1);
    expect(detail.adjacent.next?.stationNo).toBe(3);
  });

  it("has no previous neighbour at the first station", async () => {
    const detail = await caller().surah.detail({ stationNo: 1, sort: "station" });
    expect(detail.adjacent.prev).toBeFalsy();
  });

  it("rejects an unknown station with NOT_FOUND", async () => {
    await expect(
      caller().surah.detail({ stationNo: 9999, sort: "station" }),
    ).rejects.toThrow(/bulunamadı/i);
  });

  it("keeps every translation within the surah's verse range", async () => {
    const detail = await caller().surah.detail({ stationNo: 5, sort: "station" });
    for (const t of detail.translations) {
      expect(t.verseNo).toBeGreaterThanOrEqual(1);
      expect(t.verseNo).toBeLessThanOrEqual(detail.surah.verseCount);
    }
  });
});

describe("write surfaces require authentication", () => {
  it("rejects anonymous progress toggling", async () => {
    await expect(caller().progress.toggle({ surahId: 1, isRead: true })).rejects.toThrow();
  });

  it("rejects anonymous note saving", async () => {
    await expect(caller().notes.save({ surahId: 1, body: "deneme" })).rejects.toThrow();
  });

  it("rejects anonymous admin access", async () => {
    await expect(caller().admin.nextStationNo()).rejects.toThrow();
  });
});

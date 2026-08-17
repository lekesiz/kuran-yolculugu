/**
 * Signed-in behaviour for the personal layers: progress markers and notes.
 *
 * A synthetic user is used so the flow is exercised end to end (write → read
 * back → overwrite) without depending on a real OAuth session. Rows written
 * here are cleaned up afterwards.
 */
import { afterAll, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { appRouter } from "./routers";
import { getDb, upsertUser } from "./db";
import { surahs, userNotes, userProgress, users } from "../drizzle/schema";
import type { TrpcContext } from "./_core/context";

const TEST_OPEN_ID = "vitest-personal-layers";

async function ensureTestUser() {
  const db = await getDb();
  if (!db) return null;
  await upsertUser({ openId: TEST_OPEN_ID, name: "Vitest Okuyucu", loginMethod: "vitest" });
  const rows = await db.select().from(users).where(eq(users.openId, TEST_OPEN_ID)).limit(1);
  return rows[0] ?? null;
}

function contextFor(user: NonNullable<TrpcContext["user"]>): TrpcContext {
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as unknown as TrpcContext["res"],
  } as TrpcContext;
}

afterAll(async () => {
  const db = await getDb();
  if (!db) return;
  const rows = await db.select().from(users).where(eq(users.openId, TEST_OPEN_ID)).limit(1);
  const user = rows[0];
  if (!user) return;
  await db.delete(userNotes).where(eq(userNotes.userId, user.id));
  await db.delete(userProgress).where(eq(userProgress.userId, user.id));
  await db.delete(users).where(eq(users.id, user.id));
});

describe("progress tracking", () => {
  it("marks a station read, reflects it in detail, then un-marks it", async () => {
    const db = await getDb();
    if (!db) return;
    const user = await ensureTestUser();
    if (!user) return;

    const caller = appRouter.createCaller(contextFor(user));
    const [first] = await db.select().from(surahs).where(eq(surahs.stationNo, 1)).limit(1);
    expect(first).toBeTruthy();

    await caller.progress.toggle({ surahId: first.id, isRead: true });

    const mine = await caller.progress.mine();
    expect(mine.some(p => p.surahId === first.id && p.isRead)).toBe(true);

    const detail = await caller.surah.detail({ stationNo: 1, sort: "station" });
    expect(detail.isRead).toBe(true);

    await caller.progress.toggle({ surahId: first.id, isRead: false });
    const after = await caller.surah.detail({ stationNo: 1, sort: "station" });
    expect(after.isRead).toBe(false);
  });

  it("toggling the same station twice does not create duplicate rows", async () => {
    const db = await getDb();
    if (!db) return;
    const user = await ensureTestUser();
    if (!user) return;

    const caller = appRouter.createCaller(contextFor(user));
    const [second] = await db.select().from(surahs).where(eq(surahs.stationNo, 2)).limit(1);

    await caller.progress.toggle({ surahId: second.id, isRead: true });
    await caller.progress.toggle({ surahId: second.id, isRead: true });

    const rows = await db
      .select()
      .from(userProgress)
      .where(eq(userProgress.userId, user.id));
    expect(rows.filter(r => r.surahId === second.id).length).toBe(1);
  });
});

describe("personal notes", () => {
  it("saves a note, reads it back on the station page and in the notes list", async () => {
    const db = await getDb();
    if (!db) return;
    const user = await ensureTestUser();
    if (!user) return;

    const caller = appRouter.createCaller(contextFor(user));
    const [station] = await db.select().from(surahs).where(eq(surahs.stationNo, 3)).limit(1);

    await caller.notes.save({ surahId: station.id, body: "İlk deneme notu." });

    const detail = await caller.surah.detail({ stationNo: 3, sort: "station" });
    expect(detail.note).toBe("İlk deneme notu.");

    const list = await caller.notes.mine();
    expect(list.some(n => n.surahId === station.id)).toBe(true);
  });

  it("overwrites an existing note instead of appending a second row", async () => {
    const db = await getDb();
    if (!db) return;
    const user = await ensureTestUser();
    if (!user) return;

    const caller = appRouter.createCaller(contextFor(user));
    const [station] = await db.select().from(surahs).where(eq(surahs.stationNo, 4)).limit(1);

    await caller.notes.save({ surahId: station.id, body: "Birinci hâl." });
    await caller.notes.save({ surahId: station.id, body: "İkinci hâl." });

    const rows = await db.select().from(userNotes).where(eq(userNotes.userId, user.id));
    const forStation = rows.filter(r => r.surahId === station.id);
    expect(forStation.length).toBe(1);
    expect(forStation[0].body).toBe("İkinci hâl.");
  });

  it("rejects a note longer than the allowed limit", async () => {
    const user = await ensureTestUser();
    if (!user) return;

    const caller = appRouter.createCaller(contextFor(user));
    await expect(
      caller.notes.save({ surahId: 1, body: "x".repeat(20001) }),
    ).rejects.toThrow();
  });

  it("keeps one reader's notes invisible to another reader", async () => {
    const db = await getDb();
    if (!db) return;
    const user = await ensureTestUser();
    if (!user) return;

    const caller = appRouter.createCaller(contextFor(user));
    const [station] = await db.select().from(surahs).where(eq(surahs.stationNo, 5)).limit(1);
    await caller.notes.save({ surahId: station.id, body: "Yalnız bana ait." });

    // A different (fabricated) user id must not see the note.
    const otherCaller = appRouter.createCaller(
      contextFor({ ...user, id: user.id + 100000, openId: "vitest-other" }),
    );
    const detail = await otherCaller.surah.detail({ stationNo: 5, sort: "station" });
    expect(detail.note).toBeNull();
  });
});

describe("admin gating", () => {
  it("refuses admin procedures for a plain reader", async () => {
    const user = await ensureTestUser();
    if (!user) return;

    const caller = appRouter.createCaller(contextFor({ ...user, role: "user" }));
    await expect(caller.admin.nextStationNo()).rejects.toThrow();
  });

  it("offers the next free station number to an admin", async () => {
    const db = await getDb();
    if (!db) return;
    const user = await ensureTestUser();
    if (!user) return;

    const caller = appRouter.createCaller(contextFor({ ...user, role: "admin" }));
    const next = await caller.admin.nextStationNo();
    const rows = await db.select({ stationNo: surahs.stationNo }).from(surahs);
    const max = Math.max(...rows.map(r => r.stationNo));
    expect(next).toBe(max + 1);
  });
});

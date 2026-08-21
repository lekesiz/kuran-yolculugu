import { COOKIE_NAME } from "@shared/const";
import { TRANSLATION_SOURCES } from "@shared/kuran";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import * as db from "./db";

const periodSchema = z.enum(["Mekke", "Medine"]);
const sortSchema = z.enum(["station", "nuzul", "mushaf"]);
const sourceSchema = z.enum(TRANSLATION_SOURCES);

/** Admin-only guard used by the content management panel. */
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Bu işlem için yönetici yetkisi gerekir." });
  }
  return next({ ctx });
});

const keyTermSchema = z.object({
  term: z.string(),
  arabic: z.string().optional(),
  meaning: z.string(),
  verseRef: z.string().optional(),
});

const scholarlyNoteSchema = z.object({
  kind: z.enum(["ihtilaf", "rivayet", "nuans"]),
  label: z.string().min(1),
  body: z.string().min(1),
});

const surahInputSchema = z.object({
  stationNo: z.number().int().positive(),
  surahNo: z.number().int().min(1).max(114),
  nuzulOrderOkuyan: z.number().int().min(1).max(114),
  name: z.string().min(1).max(64),
  nameArabic: z.string().max(64).nullish(),
  nameMeaning: z.string().max(160).nullish(),
  verseCount: z.number().int().positive(),
  periodDiyanet: periodSchema,
  periodOkuyan: periodSchema,
  periodDisputeNote: z.string().nullish(),
  revelationTiming: z.string().max(160).nullish(),
  stationTitle: z.string().max(200).nullish(),
  introduction: z.string().nullish(),
  occasionOfRevelation: z.string().nullish(),
  occasionSources: z.string().nullish(),
  contemporaryMeaning: z.string().nullish(),
  keyTerms: z.array(keyTermSchema).nullish(),
  scholarlyNotes: z.array(scholarlyNoteSchema).nullish(),
});

const contentInputSchema = z.object({
  verses: z
    .array(z.object({ verseNo: z.number().int().positive(), textArabic: z.string() }))
    .optional(),
  translations: z
    .array(
      z.object({
        verseNo: z.number().int().positive(),
        verseNoEnd: z.number().int().positive().nullish(),
        source: sourceSchema,
        text: z.string(),
      }),
    )
    .optional(),
  themes: z
    .array(
      z.object({
        label: z.string().min(1).max(200),
        body: z.string().nullish(),
        sortOrder: z.number().int().default(0),
      }),
    )
    .optional(),
  questions: z
    .array(z.object({ body: z.string().min(1), sortOrder: z.number().int().default(0) }))
    .optional(),
});

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  surah: router({
    /** List view with sorting, period filter and full-text search across prose fields and themes. */
    list: publicProcedure
      .input(
        z
          .object({
            sort: sortSchema.default("station"),
            period: periodSchema.optional(),
            search: z.string().max(120).optional(),
          })
          .default({ sort: "station" }),
      )
      .query(async ({ input }) => {
        const direct = await db.listSurahs(input);

        // Themes live in a separate table, so a keyword may match a theme label
        // without matching any column on `surahs`. Merge those in.
        if (input.search && input.search.trim()) {
          const themeIds = await db.findSurahIdsByThemeLabel(input.search);
          const missing = themeIds.filter(id => !direct.some(s => s.id === id));
          if (missing.length) {
            const extra = await db.getSurahsByIds(missing);
            const filtered = input.period
              ? extra.filter(
                  s => s.periodDiyanet === input.period || s.periodOkuyan === input.period,
                )
              : extra;
            const merged = [...direct, ...filtered];
            const key =
              input.sort === "nuzul"
                ? "nuzulOrderOkuyan"
                : input.sort === "mushaf"
                  ? "surahNo"
                  : "stationNo";
            merged.sort((a, b) => a[key] - b[key]);
            return merged;
          }
        }

        return direct;
      }),

    /** Everything needed to render one station page. */
    detail: publicProcedure
      .input(z.object({ stationNo: z.number().int().positive(), sort: sortSchema.default("station") }))
      .query(async ({ input, ctx }) => {
        const surah = await db.getSurahByStationNo(input.stationNo);
        if (!surah) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Bu durak bulunamadı." });
        }

        const [verses, translations, themes, questions, adjacent] = await Promise.all([
          db.getVersesBySurahId(surah.id),
          db.getTranslationsBySurahId(surah.id),
          db.getThemesBySurahId(surah.id),
          db.getQuestionsBySurahId(surah.id),
          db.getAdjacentSurahs(surah as never, input.sort),
        ]);

        // Personal layers only when signed in.
        let note: string | null = null;
        let isRead = false;
        if (ctx.user) {
          const [noteRow, progressRows] = await Promise.all([
            db.getNote(ctx.user.id, surah.id),
            db.getProgressForUser(ctx.user.id),
          ]);
          note = noteRow?.body ?? null;
          isRead = progressRows.some(p => p.surahId === surah.id && p.isRead);
        }

        return { surah, verses, translations, themes, questions, adjacent, note, isRead };
      }),
  }),

  progress: router({
    /** All read-markers for the signed-in user, used by list badges and the summary bar. */
    mine: protectedProcedure.query(({ ctx }) => db.getProgressForUser(ctx.user.id)),

    toggle: protectedProcedure
      .input(z.object({ surahId: z.number().int().positive(), isRead: z.boolean() }))
      .mutation(async ({ ctx, input }) => {
        await db.setProgress(ctx.user.id, input.surahId, input.isRead);
        return { success: true } as const;
      }),
  }),

  notes: router({
    mine: protectedProcedure.query(({ ctx }) => db.listNotesForUser(ctx.user.id)),

    save: protectedProcedure
      .input(z.object({ surahId: z.number().int().positive(), body: z.string().max(20000) }))
      .mutation(async ({ ctx, input }) => {
        await db.saveNote(ctx.user.id, input.surahId, input.body);
        return { success: true } as const;
      }),
  }),

  admin: router({
    /** Next free station number, offered as the default when adding a surah. */
    nextStationNo: adminProcedure.query(async () => (await db.getMaxStationNo()) + 1),

    createSurah: adminProcedure
      .input(surahInputSchema.extend({ content: contentInputSchema.optional() }))
      .mutation(async ({ input }) => {
        const { content, keyTerms, scholarlyNotes, ...rest } = input;
        const id = await db.insertSurah({
          ...rest,
          keyTerms: keyTerms ?? null,
          scholarlyNotes: scholarlyNotes ?? null,
        });
        if (content) await applyContent(id, content);
        return { id } as const;
      }),

    updateSurah: adminProcedure
      .input(
        z.object({
          id: z.number().int().positive(),
          values: surahInputSchema.partial(),
          content: contentInputSchema.optional(),
        }),
      )
      .mutation(async ({ input }) => {
        const existing = await db.getSurahById(input.id);
        if (!existing) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Sure bulunamadı." });
        }
        const { keyTerms, scholarlyNotes, ...rest } = input.values;
        await db.updateSurah(input.id, {
          ...rest,
          ...(keyTerms !== undefined ? { keyTerms: keyTerms ?? null } : {}),
          ...(scholarlyNotes !== undefined
            ? { scholarlyNotes: scholarlyNotes ?? null }
            : {}),
        });
        if (input.content) await applyContent(input.id, input.content);
        return { success: true } as const;
      }),

    /** Full record including prose, for populating the edit form. */
    surahForEdit: adminProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .query(async ({ input }) => {
        const surah = await db.getSurahById(input.id);
        if (!surah) throw new TRPCError({ code: "NOT_FOUND" });
        const [verses, translations, themes, questions] = await Promise.all([
          db.getVersesBySurahId(surah.id),
          db.getTranslationsBySurahId(surah.id),
          db.getThemesBySurahId(surah.id),
          db.getQuestionsBySurahId(surah.id),
        ]);
        return { surah, verses, translations, themes, questions };
      }),
  }),
});

/** Replaces child collections when the caller supplies them; untouched keys are left alone. */
async function applyContent(
  surahId: number,
  content: z.infer<typeof contentInputSchema>,
): Promise<void> {
  if (content.verses) await db.replaceVerses(surahId, content.verses);
  if (content.translations) {
    await db.replaceTranslations(
      surahId,
      content.translations.map(t => ({ ...t, verseNoEnd: t.verseNoEnd ?? null })),
    );
  }
  if (content.themes) {
    await db.replaceThemes(
      surahId,
      content.themes.map(t => ({ ...t, body: t.body ?? null })),
    );
  }
  if (content.questions) await db.replaceQuestions(surahId, content.questions);
}

export type AppRouter = typeof appRouter;

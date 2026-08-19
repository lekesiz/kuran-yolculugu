import { createApp } from "../server/_core/app";

/**
 * Vercel serverless entrypoint.
 *
 * On Vercel the static client is served straight from `dist/public` by the CDN
 * (see `vercel.json`), so this function only has to answer the dynamic routes:
 * `/api/trpc/*`, `/api/oauth/*` and the storage proxy. No `listen()` call here —
 * Vercel invokes the exported handler per request.
 */
const app = createApp();

export default app;


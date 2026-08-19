import { createApp } from "../server/_core/app";

/**
 * Vercel serverless giriş noktasının kaynağı.
 *
 * Bu dosya derleme sırasında `api/index.js` olarak tek parça hâlinde
 * paketlenir (bkz. `pnpm run build:api`). Paketleme şart: Vercel'in
 * `api/*.ts` derleyicisi yalnızca dosyanın kendisini alıp `server/` ve
 * `drizzle/` altındaki içe aktarmaları fonksiyon paketine kopyalamıyor,
 * bu da çalışma anında `ERR_MODULE_NOT_FOUND` veriyor.
 *
 * Statik istemci `dist/public` üzerinden CDN'den servis edilir; burada
 * yalnızca dinamik yollar (`/api/trpc/*`, `/api/oauth/*`, depolama vekili)
 * karşılanır. `listen()` çağrılmaz — Vercel her istek için handler'ı çağırır.
 */
const app = createApp();
export default app;


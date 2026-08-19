/**
 * Supabase Auth ile kimlik doğrulama (Vercel dağıtımı için).
 *
 * Manus dağıtımında Manus OAuth kullanılır; bu modül yalnızca
 * `SUPABASE_URL` tanımlıysa devreye girer.
 * İstemci Supabase'den aldığı access token'ı `Authorization: Bearer <token>`
 * başlığında gönderir; burada imza doğrulanır ve kullanıcı yerel `users`
 * tablosuna eşlenir (openId = Supabase user id).
 *
 * İmza doğrulama iki yol destekler:
 *  1. Asimetrik anahtar (ES256/RS256) — projenin JWKS uç noktasından okunur;
 *     Supabase'in güncel varsayılanı budur ve gizli anahtar gerektirmez.
 *  2. Simetrik anahtar (HS256) — yalnızca `SUPABASE_JWT_SECRET` tanımlıysa
 *     yedek yol olarak denenir.
 */
import type { Request } from "express";
import { createRemoteJWKSet, jwtVerify, type JWTVerifyGetKey } from "jose";
import { getUserByOpenId, upsertUser } from "../db";
import type { User } from "../../drizzle/schema";

const SUPABASE_URL = (process.env.SUPABASE_URL ?? "").replace(/\/+$/, "");
const LEGACY_SECRET = process.env.SUPABASE_JWT_SECRET ?? "";
const OWNER_EMAIL = (process.env.OWNER_EMAIL ?? "").toLowerCase();

/** Supabase Auth bu ortamda yapılandırılmış mı? */
export const isSupabaseAuthEnabled = () => Boolean(SUPABASE_URL);

/** JWKS uç noktası bir kez kurulur; jose anahtarları kendisi önbelleğe alır. */
let jwks: JWTVerifyGetKey | null = null;
function getJwks(): JWTVerifyGetKey {
  if (!jwks) {
    jwks = createRemoteJWKSet(
      new URL(`${SUPABASE_URL}/auth/v1/.well-known/jwks.json`),
    );
  }
  return jwks;
}

/**
 * Token imzasını doğrular: önce JWKS (asimetrik), gerekirse eski simetrik gizli
 * anahtar denenir.
 */
async function verifyToken(token: string) {
  const options = {
    // Supabase `aud` alanını "authenticated" olarak set eder.
    audience: "authenticated",
    issuer: `${SUPABASE_URL}/auth/v1`,
  } as const;

  try {
    const { payload } = await jwtVerify(token, getJwks(), options);
    return payload;
  } catch (error) {
    if (!LEGACY_SECRET) throw error;
    const key = new TextEncoder().encode(LEGACY_SECRET);
    const { payload } = await jwtVerify(token, key, options);
    return payload;
  }
}

type SupabaseClaims = {
  sub?: string;
  email?: string;
  user_metadata?: { name?: string; full_name?: string };
  app_metadata?: { provider?: string };
};

function bearerToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (typeof header === "string" && header.startsWith("Bearer ")) {
    return header.slice(7).trim() || null;
  }
  return null;
}

/**
 * İsteği Supabase access token'ı üzerinden doğrular.
 * Geçerli değilse `null` döner — public prosedürler etkilenmez.
 */
export async function authenticateSupabaseRequest(
  req: Request,
): Promise<User | null> {
  if (!isSupabaseAuthEnabled()) return null;

  const token = bearerToken(req);
  if (!token) return null;

  let claims: SupabaseClaims;
  try {
    claims = (await verifyToken(token)) as SupabaseClaims;
  } catch {
    return null;
  }

  const openId = claims.sub;
  if (!openId) return null;

  const email = claims.email ?? null;
  const name =
    claims.user_metadata?.name ??
    claims.user_metadata?.full_name ??
    (email ? email.split("@")[0] : null);

  // Sahip e-postası tanımlıysa o hesap admin olur; böylece içerik yönetimi
  // paneline Vercel tarafında da erişilebilir. Her girişte yeniden uygulanır,
  // böylece hesap sahip e-postası tanımlanmadan önce oluşturulmuş olsa bile
  // yetki doğru şekilde yükselir.
  const isOwner = Boolean(
    OWNER_EMAIL && email && email.toLowerCase() === OWNER_EMAIL,
  );

  await upsertUser({
    openId,
    email,
    name,
    loginMethod: claims.app_metadata?.provider ?? "supabase",
    lastSignedIn: new Date(),
    ...(isOwner ? { role: "admin" as const } : {}),
  });

  // `upsertUser` rolü hem ekleme hem güncelleme yolunda yazdığı için, sahip
  // hesabı daha önce normal kullanıcı olarak oluşturulmuş olsa bile bu girişte
  // admin'e yükselir.
  const user = await getUserByOpenId(openId);
  return user ?? null;
}

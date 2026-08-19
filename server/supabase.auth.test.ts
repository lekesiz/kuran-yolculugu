/**
 * Supabase Auth katmanının davranış testleri.
 *
 * Amaç: iki dağıtımın (Manus OAuth / Supabase Auth) doğru ortamda devreye
 * girdiğini ve geçersiz token'ların oturum açmadığını garanti etmek.
 */
import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";

const ORIGINAL = { ...process.env };

async function freshModule() {
  vi.resetModules();
  return import("./_core/supabaseAuth");
}

function req(headers: Record<string, string> = {}) {
  return { headers } as any;
}

describe("Supabase Auth katmanı", () => {
  beforeEach(() => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_JWT_SECRET;
    delete process.env.OWNER_EMAIL;
  });

  afterEach(() => {
    process.env = { ...ORIGINAL };
  });

  it("SUPABASE_URL tanımlı değilse devre dışı kalır (Manus dağıtımı bozulmaz)", async () => {
    const mod = await freshModule();
    expect(mod.isSupabaseAuthEnabled()).toBe(false);
  });

  it("SUPABASE_URL tanımlıysa etkinleşir", async () => {
    process.env.SUPABASE_URL = "https://ornek.supabase.co";
    const mod = await freshModule();
    expect(mod.isSupabaseAuthEnabled()).toBe(true);
  });

  it("devre dışıyken hiçbir isteği doğrulamaz", async () => {
    const mod = await freshModule();
    await expect(
      mod.authenticateSupabaseRequest(req({ authorization: "Bearer x.y.z" })),
    ).resolves.toBeNull();
  });

  it("Authorization başlığı yoksa kullanıcı döndürmez", async () => {
    process.env.SUPABASE_URL = "https://ornek.supabase.co";
    const mod = await freshModule();
    await expect(mod.authenticateSupabaseRequest(req())).resolves.toBeNull();
  });

  it("Bearer olmayan başlığı yok sayar", async () => {
    process.env.SUPABASE_URL = "https://ornek.supabase.co";
    const mod = await freshModule();
    await expect(
      mod.authenticateSupabaseRequest(req({ authorization: "Basic abc" })),
    ).resolves.toBeNull();
  });

  it("geçersiz imzalı token'ı reddeder (fırlatmadan null döner)", async () => {
    process.env.SUPABASE_URL = "https://ornek.supabase.co";
    process.env.SUPABASE_JWT_SECRET = "dogru-gizli-anahtar";
    const mod = await freshModule();
    // Rastgele/uydurma bir token: ne JWKS ne de simetrik anahtar doğrular.
    const uydurma = [
      Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url"),
      Buffer.from(JSON.stringify({ sub: "sahte", aud: "authenticated" })).toString("base64url"),
      "gecersizimza",
    ].join(".");
    await expect(
      mod.authenticateSupabaseRequest(req({ authorization: `Bearer ${uydurma}` })),
    ).resolves.toBeNull();
  });
});

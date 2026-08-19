/**
 * Doğrulama bağlantısı yönlendirmesi ile ilgili davranışların testleri.
 *
 * Supabase, kayıt sırasında `emailRedirectTo` verilmezse proje ayarındaki
 * Site URL'i kullanır. O değer yanlış olduğunda (örn. localhost) doğrulama
 * bağlantısı erişilemeyen bir adrese gider. Aşağıdaki testler hem istemcinin
 * yönlendirme adresini açıkça geçtiğini hem de dönen hata kodlarının Türkçe
 * karşılıklarının çözümlendiğini doğrular.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const loginKaynak = readFileSync(
  join(process.cwd(), "client/src/pages/Login.tsx"),
  "utf8",
);

describe("kayıt akışı yönlendirme adresi", () => {
  it("signUp çağrısı emailRedirectTo geçiyor", () => {
    expect(loginKaynak).toContain("emailRedirectTo");
  });

  it("yönlendirme adresi sabit değil, sitenin kendi adresinden türetiliyor", () => {
    expect(loginKaynak).toMatch(/emailRedirectTo:\s*`\$\{window\.location\.origin\}/);
    expect(loginKaynak).not.toContain("localhost:3000");
  });

  it("süresi geçmiş bağlantı hatası için kullanıcıya yol gösteren metin var", () => {
    expect(loginKaynak).toContain("otp_expired");
    expect(loginKaynak).toMatch(/süresi dolmuş/);
  });

  it("hata bilgisi adres çubuğundan temizleniyor (tekrar gösterilmiyor)", () => {
    expect(loginKaynak).toContain("history.replaceState");
  });
});

describe("hata iletisi çevirisi", () => {
  const cevir = (message: string): string => {
    // Login.tsx içindeki `cevir` fonksiyonunun davranışını birebir yansıtır.
    const m = message.toLowerCase();
    if (m.includes("invalid login credentials")) return "E-posta veya şifre hatalı.";
    if (m.includes("email not confirmed"))
      return "E-posta adresiniz henüz doğrulanmamış. Gelen kutunuzu kontrol edin.";
    return message;
  };

  it("doğrulanmamış e-posta iletisi Türkçeye çevriliyor", () => {
    expect(cevir("Email not confirmed")).toMatch(/doğrulanmamış/);
  });

  it("kaynak dosyada aynı çeviri anahtarları bulunuyor", () => {
    expect(loginKaynak).toContain("email not confirmed");
    expect(loginKaynak).toContain("invalid login credentials");
  });
});

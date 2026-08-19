/**
 * Giriş / kayıt sayfası (Supabase Auth).
 *
 * Yalnızca Vercel dağıtımında görünür. Manus dağıtımında OAuth portalı
 * kullanıldığı için bu sayfaya yönlendirme yapılmaz.
 */
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isSupabaseAuth, supabase } from "@/lib/supabase";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

type Mode = "giris" | "kayit";

export default function Login() {
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();
  const [mode, setMode] = useState<Mode>("giris");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [bilgi, setBilgi] = useState<string | null>(null);
  const client = supabase;

  if (!isSupabaseAuth || !client) {
    return (
      <div className="container max-w-lg py-20">
        <h1 className="font-serif text-2xl">Giriş bu ortamda kullanılmıyor</h1>
        <p className="mt-3 text-muted-foreground">
          Bu dağıtımda kimlik doğrulama farklı bir sağlayıcı üzerinden
          yürütülüyor. Sayfanın üstündeki giriş düğmesini kullanabilirsiniz.
        </p>
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      if (mode === "kayit") {
        const { error } = await client.auth.signUp({ email, password });
        if (error) throw error;
        // E-posta doğrulaması kapalıysa oturum hemen açılır.
        const { data } = await client.auth.getSession();
        if (data.session) {
          await utils.auth.me.invalidate();
          toast.success("Hesabınız oluşturuldu.");
          navigate("/");
          return;
        }
        toast.success(
          "Kayıt alındı. E-posta adresinize gelen doğrulama bağlantısına tıklayın.",
        );
        setBilgi(
          "Kayıt alındı. Adresinize gönderilen doğrulama bağlantısına tıkladıktan sonra buradan giriş yapabilirsiniz. E-posta görünmüyorsa istenmeyen (spam) klasörünü kontrol edin.",
        );
        setMode("giris");
        return;
      }

      const { error } = await client.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      await utils.auth.me.invalidate();
      toast.success("Hoş geldiniz.");
      navigate("/");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Beklenmeyen bir hata oluştu.";
      toast.error(cevir(message));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container max-w-md py-16 md:py-24">
      <header className="mb-8">
        <p className="text-[0.7rem] uppercase tracking-[0.22em] text-muted-foreground">
          Kişisel defter
        </p>
        <h1 className="mt-2 font-serif text-3xl leading-tight">
          {mode === "giris" ? "Giriş yap" : "Hesap oluştur"}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Sureleri okumak ve mealleri karşılaştırmak için girişe gerek yok.
          Giriş yalnızca okuma ilerlemenizi işaretlemek ve kişisel notlarınızı
          kaydetmek için gereklidir.
        </p>
      </header>

      {bilgi && (
        <div
          role="status"
          className="mb-6 rounded-md border border-accent/60 bg-accent/20 px-4 py-3 text-sm leading-relaxed">
          {bilgi}
        </div>
      )}

      <form onSubmit={submit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email">E-posta</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="ornek@eposta.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Şifre</Label>
          <Input
            id="password"
            type="password"
            autoComplete={mode === "giris" ? "current-password" : "new-password"}
            required
            minLength={6}
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="En az 6 karakter"
          />
        </div>
        <Button type="submit" className="w-full" disabled={busy}>
          {busy && <Loader2 className="mr-2 size-4 animate-spin" />}
          {mode === "giris" ? "Giriş yap" : "Hesap oluştur"}
        </Button>
      </form>

      <p className="mt-6 text-sm text-muted-foreground">
        {mode === "giris" ? "Hesabınız yok mu? " : "Hesabınız var mı? "}
        <button
          type="button"
          onClick={() => setMode(mode === "giris" ? "kayit" : "giris")}
          className="font-medium text-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground">
          {mode === "giris" ? "Hesap oluşturun" : "Giriş yapın"}
        </button>
      </p>
    </div>
  );
}

/** Supabase'in İngilizce hata iletilerini Türkçeye çevirir. */
function cevir(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) {
    return "E-posta veya şifre hatalı.";
  }
  if (m.includes("user already registered")) {
    return "Bu e-posta adresiyle bir hesap zaten var.";
  }
  if (m.includes("password should be at least")) {
    return "Şifre en az 6 karakter olmalı.";
  }
  if (m.includes("email not confirmed")) {
    return "E-posta adresiniz henüz doğrulanmamış. Gelen kutunuzu kontrol edin.";
  }
  if (m.includes("unable to validate email address")) {
    return "E-posta adresi geçersiz görünüyor.";
  }
  return message;
}

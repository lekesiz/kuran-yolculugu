/**
 * Supabase istemcisi (yalnızca Vercel dağıtımında etkin).
 *
 * Ortam değişkenleri tanımlı değilse `supabase` null döner ve uygulama
 * Manus OAuth akışına düşer — böylece iki dağıtım aynı kod tabanını paylaşır.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseAuth = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = isSupabaseAuth
  ? createClient(url!, anonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

/** Geçerli access token; tRPC isteklerinde Bearer başlığı olarak gönderilir. */
export async function getAccessToken(): Promise<string | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}


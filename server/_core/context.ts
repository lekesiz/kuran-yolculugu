import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";
import {
  authenticateSupabaseRequest,
  isSupabaseAuthEnabled,
} from "./supabaseAuth";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  // Vercel dağıtımında Supabase Auth, Manus dağıtımında Manus OAuth kullanılır.
  // Hangisinin yapılandırıldığı ortam değişkenlerinden anlaşılır; ikisi de
  // başarısız olursa kullanıcı `null` kalır ve yalnızca public prosedürler çalışır.
  if (isSupabaseAuthEnabled()) {
    try {
      user = await authenticateSupabaseRequest(opts.req);
    } catch {
      user = null;
    }
  } else {
    try {
      user = await sdk.authenticateRequest(opts.req);
    } catch {
      // Authentication is optional for public procedures.
      user = null;
    }
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}

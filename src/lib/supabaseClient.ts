// src/lib/supabaseClient.ts
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim();
const key = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim();

/** Handig om in debug te checken of env goed staat */
export const isSupabaseConfigured = Boolean(url && key);

function makeThrowingClient(): SupabaseClient {
  const handler: ProxyHandler<object> = {
    get() {
      throw new Error(
        "Supabase niet geconfigureerd. Zet VITE_SUPABASE_URL en VITE_SUPABASE_ANON_KEY in .env."
      );
    },
    apply() {
      throw new Error(
        "Supabase niet geconfigureerd. Zet VITE_SUPABASE_URL en VITE_SUPABASE_ANON_KEY in .env."
      );
    },
  };
  // Cast via unknown om 'any' te vermijden
  return new Proxy({}, handler) as unknown as SupabaseClient;
}

export const supabase: SupabaseClient =
  url && key
    ? createClient(url, key, {
        auth: {
          /** Sessie in localStorage bewaren */
          persistSession: true,
          /** Tokens automatisch verversen */
          autoRefreshToken: true,
          /** Supabase pikt ?code=…/?#access_token=… op na OAuth */
          detectSessionInUrl: true,
          /** PKCE is de aanbevolen flow voor SPA’s */
          flowType: "pkce",
          /** Eigen key om botsingen met andere apps te voorkomen */
          storageKey: "fp_auth",
        },
        global: {
          /** Optioneel: simpele identificatie van de client */
          headers: { "x-client-info": "fitprove.app" },
        },
      })
    : (console.warn(
        "[supabase] Env vars ontbreken: VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY"
      ),
      makeThrowingClient());

export type { User, Session } from "@supabase/supabase-js";

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

function makeThrowingClient(): SupabaseClient {
  const handler: ProxyHandler<any> = {
    get() {
      throw new Error('Supabase niet geconfigureerd. Zet VITE_SUPABASE_URL en VITE_SUPABASE_ANON_KEY in .env.');
    },
    apply() {
      throw new Error('Supabase niet geconfigureerd. Zet VITE_SUPABASE_URL en VITE_SUPABASE_ANON_KEY in .env.');
    },
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new Proxy({} as any as SupabaseClient, handler);
}

export const supabase: SupabaseClient =
  url && key
    ? createClient(url, key, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
      })
    : (console.warn('Supabase env vars missing: VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY'), makeThrowingClient());

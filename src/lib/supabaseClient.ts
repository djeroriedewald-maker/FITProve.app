// src/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anon) {
  throw new Error(
    'Supabase URL en ANON key zijn vereist. Controleer of je .env bestand correct is ingesteld.'
  );
}

/**
 * Eén gedeelde Supabase client (v2).
 * - Sessies blijven behouden
 * - Auto-refresh tokens
 * - OAuth redirects worden opgevangen
 */
export const supabase = createClient(url, anon, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

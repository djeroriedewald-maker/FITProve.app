// src/lib/supabaseClient.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types';

// Controleer omgevingsvariabelen
const checkEnvVariables = () => {
  const url = process.env.VITE_SUPABASE_URL;
  const anon = process.env.VITE_SUPABASE_ANON_KEY;

  if (!url || url === 'undefined') {
    console.error('VITE_SUPABASE_URL is niet correct geconfigureerd');
    return null;
  }
  if (!anon || anon === 'undefined') {
    console.error('VITE_SUPABASE_ANON_KEY is niet correct geconfigureerd');
    return null;
  }

  return { url, anon };
};

const { url, anon } = checkEnvVariables();

/**
 * Gedeelde Supabase client instance met type safety.
 * - Sessies blijven behouden in localStorage
 * - Tokens worden automatisch ververst
 * - OAuth redirects worden correct afgehandeld
 */
export const supabase: SupabaseClient<Database> = createClient(url, anon, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'X-Client-Info': 'fitprove-app'
    }
  }
});

// Test de connectie
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Supabase auth event:', event, session?.user?.email ?? 'No user');
});

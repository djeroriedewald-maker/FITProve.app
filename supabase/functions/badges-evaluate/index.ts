// Badges evaluator: award simple milestone badges when a workout gets completed.
// Usage patterns:
// - Call on DB trigger or webhook with { user_id, completed: true }
// - Deployed as Edge Function: POST JSON body { user_id, completed }

import { createClient } from '@supabase/supabase-js';

type Payload = { user_id: string; completed?: boolean | null };

function getClient() {
  const url = (globalThis as any)?.SUPABASE_URL || (globalThis as any)?.process?.env?.SUPABASE_URL;
  const key = (globalThis as any)?.SUPABASE_SERVICE_ROLE_KEY || (globalThis as any)?.process?.env?.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  return createClient(url as string, key as string);
}

export async function award10in30(userId: string) {
  const supabase = getClient();
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { count, error } = await supabase
    .from('workout_sessions')
    .select('id', { count: 'exact', head: false })
    .eq('user_id', userId)
    .eq('status', 'completed')
    .gte('completed_at', since);
  if (error) throw error;

  const eligible = (count ?? 0) >= 10;
  if (!eligible) return { awarded: false, count: count ?? 0 };

  // Check existing
  const { data: existing, error: exErr } = await supabase
    .from('user_badges')
    .select('id')
    .eq('user_id', userId)
    .eq('badge_code', '10in30')
    .maybeSingle();
  if (exErr) throw exErr;
  if (existing) return { awarded: false, count: count ?? 0, already: true };

  // Award
  const { error: insErr } = await supabase
    .from('user_badges')
    .insert({ user_id: userId, badge_code: '10in30', awarded_at: new Date().toISOString() });
  if (insErr) throw insErr;
  return { awarded: true, code: '10in30', count: count ?? 0 };
}

export async function onWorkoutLogged(payload: Payload) {
  if (!payload?.user_id || !payload?.completed) return { ok: true, skipped: true };
  try {
    const res = await award10in30(payload.user_id);
    return { ok: true, ...res };
  } catch (e: any) {
    return { ok: false, error: e?.message || String(e) };
  }
}

// Optional Edge Function handler
export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
  try {
    const body = (await req.json()) as Payload;
    const res = await onWorkoutLogged(body);
    return new Response(JSON.stringify(res), { status: 200, headers: { 'content-type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ ok: false, error: e?.message || String(e) }), { status: 500, headers: { 'content-type': 'application/json' } });
  }
}

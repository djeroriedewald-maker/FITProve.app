// src/lib/workouts/logs.ts
import { SupabaseClient } from '@supabase/supabase-js';

const validateUUID = (id: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

export type Session = {
  id: string;
  user_id: string;
  workout_id: string;
  workout_title?: string | null;
  status: 'active' | 'completed' | 'cancelled';
  started_at: string;
  completed_at?: string | null;
  duration_sec?: number | null;
};

export type SetLog = {
  id?: string;
  session_id: string;
  exercise_id: string;
  exercise_name?: string;
  set_index: number;
  reps?: number | null;
  weight_kg?: number | null;
  time_sec?: number | null;
  distance_m?: number | null;
  rpe?: number | null;
  completed?: boolean | null;
  notes?: string | null;
};

export async function getActiveOrLastSession(
  sb: SupabaseClient,
  workoutId: string,
  workoutTitle?: string
): Promise<Session | null> {
  const { data, error } = await sb
    .from('workout_sessions')
    .select('*')
    .eq('workout_id', workoutId)
    .order('started_at', { ascending: false })
    .limit(1);
  if (error) throw error;
  if (data && data.length > 0 && data[0]) return data[0] as Session;

  // create fresh
  const { data: created, error: insErr } = await sb
    .from('workout_sessions')
    .insert({ workout_id: workoutId, workout_title: workoutTitle ?? null, status: 'active' })
    .select()
    .single();
  if (insErr) throw insErr;
  return created as Session;
}

export async function listSessionSets(sb: SupabaseClient, sessionId: string): Promise<SetLog[]> {
  const { data, error } = await sb
    .from('set_logs')
    .select('*')
    .eq('session_id', sessionId)
    .order('exercise_id', { ascending: true })
    .order('set_index', { ascending: true });
  if (error) throw error;
  return data as SetLog[];
}

export async function addOrUpdateSet(sb: SupabaseClient, payload: SetLog): Promise<SetLog> {
  if (!validateUUID(payload.session_id)) {
    throw new Error("Invalid session ID format");
  }
  if (!validateUUID(payload.exercise_id)) {
    throw new Error("Invalid exercise ID format");
  }
  
  const { data, error } = await sb.from('set_logs').upsert(payload, { onConflict: 'session_id,exercise_id,set_index' }).select().single();
  if (error) {
    console.error("[addOrUpdateSet] Database error:", error);
    throw new Error("Error saving set: " + error.message);
  }
  return data as SetLog;
}

export async function completeSession(
  sb: SupabaseClient,
  sessionId: string,
  durationSec?: number
): Promise<void> {
  const { error } = await sb
    .from('workout_sessions')
    .update({ status: 'completed', completed_at: new Date().toISOString(), duration_sec: durationSec ?? null })
    .eq('id', sessionId);
  if (error) throw error;
}

export async function latestCompletedSessionForWorkout(
  sb: SupabaseClient,
  workoutId: string
): Promise<Session | null> {
  const { data, error } = await sb
    .from('workout_sessions')
    .select('*')
    .eq('workout_id', workoutId)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })
    .limit(1);
  if (error) throw error;
  return data?.[0] ?? null;
}

export async function latestSessionSetsForWorkout(
  sb: SupabaseClient,
  workoutId: string
): Promise<SetLog[]> {
  const last = await latestCompletedSessionForWorkout(sb, workoutId);
  if (!last) return [];
  return listSessionSets(sb, last.id);
}

export async function listSessionsForUser(
  sb: SupabaseClient,
  opts?: { limit?: number }
): Promise<Session[]> {
  const { data, error } = await sb
    .from('workout_sessions')
    .select('*')
    .order('started_at', { ascending: false })
    .limit(opts?.limit ?? 50);
  if (error) throw error;
  return data as Session[];
}

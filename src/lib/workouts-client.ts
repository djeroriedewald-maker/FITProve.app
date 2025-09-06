// src/lib/workouts-client.ts
import type {
    Workout,
    WorkoutBlock,
    WorkoutExercise,
    UserWorkoutSession,
    UserWorkoutSet,
  } from '@/types/workouts';
  import { supabase } from '@/lib/supabaseClient';
  
  // ----- Workouts lijst -----
  export async function listWorkouts(filters: {
    q?: string;
    goal?: string;
    level?: string;
    location?: string;
    equipment?: 'with'|'without';
    duration?: '15'|'30'|'45'|'60'|'90';
  }) {
    let qb = supabase.from('workouts').select('*').eq('is_published', true);
  
    if (filters.goal) qb = qb.eq('goal', filters.goal);
    if (filters.level) qb = qb.eq('level', filters.level);
    if (filters.location) qb = qb.eq('location', filters.location);
  
    if (filters.equipment === 'with') qb = qb.eq('equipment_required', true);
    if (filters.equipment === 'without') qb = qb.eq('equipment_required', false);
  
    if (filters.duration) {
      const mins = Number(filters.duration);
      qb = qb.gte('duration_minutes', Math.max(mins - 10, 1))
             .lte('duration_minutes', mins + 10);
    }
    if (filters.q && filters.q.trim()) {
      const t = filters.q.trim();
      qb = qb.or(`title.ilike.%${t}%,description.ilike.%${t}%`);
    }
  
    const { data, error } = await qb.order('duration_minutes', { ascending: true });
    if (error) throw error;
    return (data ?? []) as Workout[];
  }
  
  // ----- Workout + blokken + oefeningen -----
  export async function getWorkoutFull(id: string) {
    const { data: workout, error: e1 } =
      await supabase.from('workouts').select('*').eq('id', id).single();
    if (e1) throw e1;
  
    const { data: blocks, error: e2 } =
      await supabase.from('workout_blocks')
        .select('*').eq('workout_id', id).order('sequence', { ascending: true });
    if (e2) throw e2;
  
    const blockIds = (blocks ?? []).map(b => b.id);
    let exs: WorkoutExercise[] = [];
    if (blockIds.length) {
      const { data, error: e3 } =
        await supabase.from('workout_exercises')
          .select('*').in('block_id', blockIds).order('sequence', { ascending: true });
      if (e3) throw e3;
      exs = (data ?? []) as WorkoutExercise[];
    }
  
    return {
      workout: workout as Workout,
      blocks: (blocks ?? []) as WorkoutBlock[],
      exercises: exs,
    };
  }
  
  // ----- Sessies & logging -----
  /**
   * Start een sessie. `user_id` is optioneel:
   * - Meesturen mag (moet gelijk zijn aan auth.uid() i.v.m. RLS)
   * - Niet meesturen mag ook; trigger zet user_id := auth.uid()
   */
  export async function startSession(workout_id: string, user_id?: string) {
    const payload: Partial<UserWorkoutSession> = { workout_id };
    if (user_id) payload.user_id = user_id;
  
    const { data, error } = await supabase
      .from('user_workout_sessions')
      .insert(payload)
      .select('*')
      .single();
  
    if (error) throw error;
    return data as UserWorkoutSession;
  }
  
  export async function completeSession(
    session_id: string,
    patch?: Partial<UserWorkoutSession>
  ) {
    const { data, error } = await supabase
      .from('user_workout_sessions')
      .update({
        ...patch,
        ended_at: new Date().toISOString(),
        is_completed: true,
      })
      .eq('id', session_id)
      .select('*')
      .single();
  
    if (error) throw error;
    return data as UserWorkoutSession;
  }
  
  export async function addOrUpdateSet(payload: Partial<UserWorkoutSet> & {
    session_id: string; workout_exercise_id: string; set_index: number;
  }) {
    const { data, error } = await supabase.rpc('upsert_user_set', {
      p_session_id: payload.session_id,
      p_workout_exercise_id: payload.workout_exercise_id,
      p_set_index: payload.set_index,
      p_reps: payload.reps ?? null,
      p_weight_kg: payload.weight_kg ?? null,
      p_time_seconds: payload.time_seconds ?? null,
      p_rpe: payload.rpe ?? null,
    });
    if (error) throw error;
    return data as UserWorkoutSet;
  }
  
  export async function listSessionSets(session_id: string) {
    const { data, error } = await supabase
      .from('user_workout_sets')
      .select('*')
      .eq('session_id', session_id)
      .order('set_index', { ascending: true });
    if (error) throw error;
    return (data ?? []) as UserWorkoutSet[];
  }
  
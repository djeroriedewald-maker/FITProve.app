// src/lib/workouts-client.ts
import { supabase } from "@/lib/supabaseClient";
import type {
  Workout,
  WorkoutBlock,
  WorkoutExercise,
  UserWorkoutSession,
  SetLog,
  SetLogUpsert,
} from "@/types/workout";

/** Lijst met workouts */
export async function listWorkouts(params: {
  q?: string; goal?: string; level?: string; location?: string;
  equipment?: "with" | "without"; duration?: "15" | "30" | "45" | "60" | "90";
} = {}): Promise<Workout[]> {
  let query = supabase.from("workouts").select("*");
  if (params.q?.trim()) {
    const s = `%${params.q.trim()}%`;
    query = query.or(`title.ilike.${s},description.ilike.${s}`);
  }
  if (params.goal) query = query.eq("goal", params.goal);
  if (params.level) query = query.eq("level", params.level);
  if (params.location) query = query.eq("location", params.location);
  if (params.equipment === "with") query = query.eq("equipment_required", true);
  if (params.equipment === "without") query = query.eq("equipment_required", false);
  if (params.duration) query = query.eq("duration_minutes", Number(params.duration));
  const { data, error } = await query.order("title", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Workout[];
}

/** Workout detail + blocks + oefeningen (exercises via block_id i.p.v. workout_id) */
export async function getWorkoutFull(id: string): Promise<{
  workout: Workout; blocks: WorkoutBlock[]; exercises: WorkoutExercise[];
}> {
  const w = supabase.from("workouts").select("*").eq("id", id).maybeSingle();
  const b = supabase.from("workout_blocks").select("*").eq("workout_id", id).order("sequence", { ascending: true });

  const [{ data: workout, error: we }, { data: blocks, error: be }] = await Promise.all([w, b]);
  if (we) throw we;
  if (!workout) throw new Error("Workout niet gevonden");
  if (be) throw be;

  const blockIds = (blocks ?? []).map((x) => x.id);
  let exercises: WorkoutExercise[] = [];
  if (blockIds.length) {
    const { data: exData, error: ee } = await supabase
      .from("workout_exercises")
      .select("*")
      .in("block_id", blockIds)
      .order("block_id", { ascending: true })
      .order("sequence", { ascending: true });
    if (ee) throw ee;
    exercises = (exData ?? []) as WorkoutExercise[];
  }
  return { workout: workout as Workout, blocks: (blocks ?? []) as WorkoutBlock[], exercises };
}

/** Sessions & Set logs */
export async function startSession(workoutId: string, userId?: string): Promise<UserWorkoutSession> {
  // ✅ geen non-null assertion meer
  let uid = userId;
  if (!uid) {
    const { data: auth } = await supabase.auth.getUser();
    uid = auth?.user?.id;
  }
  if (!uid) throw new Error("Not authenticated");

  const payload: Partial<UserWorkoutSession> = {
    workout_id: workoutId, user_id: uid, status: "active", started_at: new Date().toISOString(),
  };
  const { data, error } = await supabase.from("workout_sessions").insert(payload).select("*").single();
  if (error) throw error;
  return data as UserWorkoutSession;
}

export async function completeSession(sessionId: string): Promise<UserWorkoutSession> {
  const { data, error } = await supabase
    .from("workout_sessions")
    .update({ status: "completed", completed_at: new Date().toISOString() })
    .eq("id", sessionId)
    .select("*")
    .single();
  if (error) throw error;
  return data as UserWorkoutSession;
}

export async function listSessionSets(sessionId: string): Promise<SetLog[]> {
  const { data, error } = await supabase
    .from("set_logs")
    .select("*")
    .eq("session_id", sessionId)
    .order("exercise_id", { ascending: true })   // ✅ alleen exercise_id gebruiken
    .order("set_index", { ascending: true });
  if (error) throw error;
  return (data ?? []) as SetLog[];
}

export async function addOrUpdateSet(payload: SetLogUpsert): Promise<any> {
  // ✅ jouw tabel heeft geen workout_exercise_id; neem exercise_id als sleutel
  const record: any = {
    session_id: payload.session_id,
    exercise_id: payload.exercise_id ?? payload.workout_exercise_id,
    exercise_name: payload.exercise_name ?? null,
    set_index: payload.set_index,
    reps: payload.reps ?? null,
    weight_kg: payload.weight_kg ?? null,
    time_seconds: payload.time_seconds ?? payload.time_sec ?? null,
    rpe: payload.rpe ?? null,
    completed: payload.completed ?? null,
    notes: payload.notes ?? null,
  };
  const { data, error } = await supabase
    .from("set_logs")
    .upsert(record, { onConflict: "session_id,exercise_id,set_index" })
    .select("*");
  if (error) throw error;
  return data;
}

// src/types/workout.ts
// ✅ Types afgestemd op jouw huidige code én client.
//    Inclusief alias + SetLog types die zowel exercise_id/time_sec
//    als workout_exercise_id/time_seconds ondersteunen.

export type Workout = {
  id: string;
  title: string;
  description?: string | null;
  goal?: string | null;
  level?: string | null;
  location?: string | null;
  duration_minutes?: number | null;
  equipment_required?: boolean | null;
};

export type WorkoutBlock = {
  id: string;
  workout_id: string;
  sequence: number;
  title?: string | null;
  note?: string | null;
};

export type WorkoutExercise = {
  id: string;
  block_id: string;
  sequence: number;
  display_name: string;
  exercise_id?: string;
  target_sets?: number | null;
  target_reps?: number | null;
  target_time_seconds?: number | null;
  rest_seconds?: number | null;
  tempo?: string | null;

  // optionele media velden
  video_url?: string | null;
  gif_url?: string | null;
  image_url?: string | null;
  thumbnail?: string | null;

  media?: {
    videos?: string[];
    gifs?: string[];
    images?: string[];
  };
};

export type UserWorkoutSession = {
  id: string;
  workout_id: string;
  user_id: string;
  status: "active" | "completed" | "cancelled";
  started_at: string;
  completed_at?: string | null;
  duration_sec?: number | null;
  workout_title?: string | null;
};

/** Alias die soms in code gebruikt wordt */
export type WorkoutSession = UserWorkoutSession;

/** Set-log uit DB. Ondersteunt beide naamvarianten voor compat. */
export type SetLog = {
  id: string;
  session_id: string;

  // sommige implementaties gebruiken 'exercise_id', andere 'workout_exercise_id'
  exercise_id?: string;
  workout_exercise_id?: string;

  exercise_name?: string | null;
  set_index: number;

  reps?: number | null;
  weight_kg?: number | null;

  // beide varianten gedoogd
  time_sec?: number | null;
  time_seconds?: number | null;

  distance_m?: number | null;
  rpe?: number | null;
  completed?: boolean | null;
  notes?: string | null;

  created_at?: string;
  updated_at?: string;
};

/** Upsert payload richting client/DB – beide naamvarianten toegestaan */
export type SetLogUpsert = {
  session_id: string;

  exercise_id?: string;
  workout_exercise_id?: string;

  exercise_name?: string;
  set_index: number;

  reps?: number | null;
  weight_kg?: number | null;

  time_sec?: number | null;
  time_seconds?: number | null;

  distance_m?: number | null;
  rpe?: number | null;
  completed?: boolean | null;
  notes?: string | null;
};


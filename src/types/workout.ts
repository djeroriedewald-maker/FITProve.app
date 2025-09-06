export type WorkoutGoal = 'strength'|'hypertrophy'|'fat_loss'|'conditioning'|'mobility'|'endurance'|'event';
export type WorkoutLevel = 'beginner'|'intermediate'|'advanced';
export type WorkoutLocation = 'gym'|'outdoor'|'home';
export type LoadType = 'bodyweight'|'dumbbell'|'barbell'|'kettlebell'|'machine'|'band'|'cable'|'other';

export interface Workout {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  goal: WorkoutGoal;
  level: WorkoutLevel;
  location: WorkoutLocation;
  equipment_required: boolean;
  duration_minutes: number;
  estimated_difficulty: number; // 1..5
  is_published: boolean;
  created_at: string;
  updated_at: string;
  tags?: string[];
}

export interface WorkoutBlock {
  id: string;
  workout_id: string;
  title?: string | null;
  note?: string | null;
  sequence: number;
  type: string;
}

export interface WorkoutExercise {
  id: string;
  block_id: string;
  exercise_ref: string; // "exdb:push_up"
  display_name: string;
  sequence: number;
  target_sets: number;
  target_reps?: number | null;
  target_time_seconds?: number | null;
  target_load?: LoadType | null;
  tempo?: string | null;
  rest_seconds?: number | null;
}

export interface UserWorkoutSession {
  id: string;
  user_id: string;
  workout_id: string;
  started_at: string;
  ended_at?: string | null;
  notes?: string | null;
  device_summary?: Record<string, unknown> | null;
  calories?: number | null;
  avg_hr?: number | null;
  max_hr?: number | null;
  distance_m?: number | null;
  is_completed: boolean;
  created_at: string;
}

export interface UserWorkoutSet {
  id: string;
  session_id: string;
  workout_exercise_id: string;
  set_index: number;
  reps?: number | null;
  weight_kg?: number | null;
  time_seconds?: number | null;
  rpe?: number | null;
  completed_at?: string | null;
}

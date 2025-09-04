export type Media = {
    mp4?: string | null;
    webm?: string | null;
    gif?: string | null;
    poster?: string | null;
  };
  
  export type Exercise = {
    id: string;
    slug: string;
    name: string;
    name_nl?: string | null;
    primary_muscle?: string | null;
    secondary_muscles?: string[] | null;
    equipment?: string[] | null;
    mechanics?: string | null;
    force?: string | null;
    difficulty?: string | null;
    instructions?: string[] | null;
    media?: Media | null;
  };
  
  export type Workout = {
    id: string;
    title: string;
    goal: "strength" | "conditioning" | "hyrox" | "mobility" | "rehab" | "custom";
    duration_min?: number | null;
    level: "beginner" | "intermediate" | "advanced";
    tags?: string[] | null;
    visibility: "public" | "curated" | "private";
  };
  
  export type WorkoutExercise = {
    workout_id: string;
    order: number;
    exercise_id: string;
    scheme_type: "reps" | "time" | "emom" | "amrap" | "tabata" | "distance";
    target_sets?: number | null;
    target_reps?: number | null;
    target_time_sec?: number | null;
    tempo?: string | null;
    rest_sec?: number | null;
    notes?: string | null;
  };
  
// src/lib/workouts/stats.ts
export type WorkoutStats = {
    exercisesInLibrary: number;
    workoutsInLibrary: number;
    workoutsDone: number;
    badgesEarned: number;
  };
  
  async function countFromManifest(url: string): Promise<{ exercises?: number; workouts?: number }> {
    try {
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) throw new Error('manifest fetch failed');
      const manifest = await res.json();
      // Flexible: try common shapes
      if (manifest?.totals) {
        return { exercises: manifest.totals.exercises ?? 0, workouts: manifest.totals.workouts ?? 0 };
      }
      if (typeof manifest?.exercises_count === 'number' || typeof manifest?.workouts_count === 'number') {
        return { exercises: manifest.exercises_count ?? 0, workouts: manifest.workouts_count ?? 0 };
      }
      if (Array.isArray(manifest?.workoutChunks)) {
        const workouts = manifest.workoutChunks.reduce((a: number, c: any) => a + (c.count || 0), 0);
        const exercises = manifest.exerciseChunks?.reduce?.((a: number, c: any) => a + (c.count || 0), 0) ?? 0;
        return { exercises, workouts };
      }
      return { exercises: 0, workouts: 0 };
    } catch {
      return { exercises: 0, workouts: 0 };
    }
  }
  
  export async function getWorkoutStats({
    supabase,
    userId,
  }: {
    supabase: any;
    userId?: string | null;
  }): Promise<WorkoutStats> {
    const base = (import.meta as any).env?.VITE_WORKOUTS_BASE || '/data/workouts';
    const manifestUrl = `${base.replace(/\/$/, '')}/manifest.json`;
    const { exercises = 0, workouts = 0 } = await countFromManifest(manifestUrl);
  
    let workoutsDone = 0;
    if (supabase && userId) {
      const { data, error } = await supabase
        .from('workout_sessions')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'completed');
      if (!error && typeof data === 'undefined') {
        // supabase-js head:true returns null data; count is on error.count or similar;
        // use a second query without head if needed:
        const { count } = await supabase
          .from('workout_sessions')
          .select('id', { count: 'exact' })
          .eq('status', 'completed');
        workoutsDone = count ?? 0;
      } else {
        const { count } = await supabase
          .from('workout_sessions')
          .select('id', { count: 'exact' })
          .eq('status', 'completed');
        workoutsDone = count ?? 0;
      }
    }
  
    // Badges optioneel
    let badgesEarned = 0;
    if (supabase && userId) {
      const { count } = await supabase.from('user_badges').select('id', { count: 'exact' }).eq('user_id', userId);
      badgesEarned = count ?? 0;
    }
  
    return {
      exercisesInLibrary: exercises,
      workoutsInLibrary: workouts,
      workoutsDone,
      badgesEarned,
    };
  }
  
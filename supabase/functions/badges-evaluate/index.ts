// Minimal stub: on workout_logs insert/update, evaluate simple badge rule.
// In Supabase dashboard, set trigger to call this edge function as webhook or use DB trigger => http.

export async function onWorkoutLogged(payload: {
    user_id: string;
    completed: boolean;
  }) {
    if (!payload.completed) return;
  
    // TODO: query last 30 days workout count and grant badge "10in30"
    // This is a stub; real implementation in next PR.
    return { ok: true };
  }
  
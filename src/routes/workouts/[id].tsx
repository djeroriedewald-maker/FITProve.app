import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getWorkoutFull, startSession } from '@/lib/workouts-client';
import type { Workout, WorkoutBlock, WorkoutExercise, UserWorkoutSession } from '@/types/workouts';
import WorkoutLogger from '@/components/workouts/WorkoutLogger';
import { useUser } from '@supabase/auth-helpers-react';

export default function WorkoutDetail() {
  const { id } = useParams();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [blocks, setBlocks] = useState<WorkoutBlock[]>([]);
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | undefined>();
  const [session, setSession] = useState<UserWorkoutSession | null>(null);
  const user = useUser();

  useEffect(() => {
    if (!id) return;
    let on = true;
    setLoading(true);
    getWorkoutFull(id).then(d => {
      if (!on) return;
      setWorkout(d.workout);
      setBlocks(d.blocks);
      setExercises(d.exercises);
    }).catch(e => setErr(e.message)).finally(()=> on && setLoading(false));
    return () => { on = false; };
  }, [id]);

  const grouped = useMemo(() => {
    const map: Record<string, WorkoutExercise[]> = {};
    for (const ex of exercises) {
      map[ex.block_id] ??= [];
      map[ex.block_id].push(ex);
    }
    return map;
  }, [exercises]);

  const onStart = async () => {
    if (!user?.id || !workout) {
      alert('Log in om te starten.');
      return;
    }
    const s = await startSession(workout.id, user.id);
    setSession(s);
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  if (loading) return <div className="p-4 max-w-3xl mx-auto"><div className="h-32 rounded-2xl bg-muted animate-pulse"/></div>;
  if (err) return <div className="p-4 text-destructive">{err}</div>;
  if (!workout) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-4">
      <div className="rounded-2xl bg-card p-4 shadow-sm">
        <h1 className="text-2xl font-bold">{workout.title}</h1>
        <p className="text-muted-foreground mt-1">{workout.description}</p>
        <div className="text-sm mt-2 flex flex-wrap gap-3">
          <span>Doel: {workout.goal}</span>
          <span>Niveau: {workout.level}</span>
          <span>Locatie: {workout.location}</span>
          <span>Duur: {workout.duration_minutes} min</span>
          <span>Materiaal: {workout.equipment_required ? 'ja' : 'nee'}</span>
        </div>
        {!session && (
          <button className="mt-3 rounded-2xl px-4 py-3 bg-primary text-primary-foreground" onClick={onStart}>
            Start workout
          </button>
        )}
      </div>

      <div className="space-y-4 mt-4">
        {blocks.map(b => (
          <div key={b.id} className="rounded-2xl bg-card p-4 shadow-sm">
            <div className="font-semibold">{b.title ?? 'Blok'}</div>
            {b.note && <p className="text-sm text-muted-foreground">{b.note}</p>}
            <div className="mt-2 space-y-2">
              {(grouped[b.id] ?? []).map(ex => (
                <div key={ex.id} className="rounded-xl bg-muted p-3">
                  <div className="font-medium">{ex.display_name}</div>
                  <div className="text-sm text-muted-foreground">
                    {ex.target_sets} x {ex.target_reps ? `${ex.target_reps} reps` : (ex.target_time_seconds ? `${ex.target_time_seconds}s` : 'reps/tijd vrij')}
                    {ex.rest_seconds ? ` · Rust ${ex.rest_seconds}s` : ''}{ex.tempo ? ` · Tempo ${ex.tempo}` : ''}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {session && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Log je workout</h2>
          <WorkoutLogger session={session} exercises={exercises} onCompleted={(s)=>setSession(s)} />
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import type { WorkoutExercise, UserWorkoutSession, UserWorkoutSet } from '@/types/workouts';
import { addOrUpdateSet, completeSession, listSessionSets } from '@/lib/workouts-client';

type Props = {
  session: UserWorkoutSession;
  exercises: WorkoutExercise[];
  onCompleted: (s: UserWorkoutSession) => void;
};

export default function WorkoutLogger({ session, exercises, onCompleted }: Props) {
  const [sets, setSets] = useState<UserWorkoutSet[]>([]);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let on = true;
    listSessionSets(session.id).then(d => on && setSets(d));
    return () => { on = false; };
  }, [session.id]);

  const upsert = async (ex: WorkoutExercise, setIndex: number, patch: Partial<UserWorkoutSet>) => {
    setSaving(true);
    try {
      const updated = await addOrUpdateSet({
        session_id: session.id,
        workout_exercise_id: ex.id,
        set_index: setIndex,
        reps: patch.reps ?? undefined,
        weight_kg: patch.weight_kg ?? undefined,
        time_seconds: patch.time_seconds ?? undefined,
        rpe: patch.rpe ?? undefined,
      });
      setSets(prev => {
        const other = prev.filter(s => !(s.workout_exercise_id === ex.id && s.set_index === setIndex));
        return [...other, updated].sort((a,b) => a.set_index - b.set_index);
      });
    } finally {
      setSaving(false);
    }
  };

  const finish = async () => {
    setSaving(true);
    try {
      const s = await completeSession(session.id);
      setDone(true);
      onCompleted(s);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {exercises.map(ex => {
        const targetSets = ex.target_sets || 3;
        const rows = Array.from({ length: targetSets });
        return (
          <div key={ex.id} className="rounded-2xl bg-card p-4 shadow-sm">
            <div className="font-semibold mb-2">{ex.display_name}</div>
            <div className="grid grid-cols-5 gap-2 items-center text-sm">
              <div className="font-medium">Set</div>
              <div>Reps</div>
              <div>Gewicht (kg)</div>
              <div>Tijd (s)</div>
              <div>RPE</div>
              {rows.map((_,i)=>{
                const idx = i+1;
                const existing = sets.find(s => s.workout_exercise_id === ex.id && s.set_index === idx);
                return (
                  <FragmentRow
                    key={idx}
                    index={idx}
                    existing={existing}
                    onSave={(p)=>upsert(ex, idx, p)}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
      <button disabled={saving || done} onClick={finish} className="w-full rounded-2xl py-3 bg-primary text-primary-foreground">
        {done ? 'Sessie voltooid' : 'Sessie afronden'}
      </button>
    </div>
  );
}

function FragmentRow({ index, existing, onSave }:{
  index:number;
  existing?: UserWorkoutSet;
  onSave:(p: Partial<UserWorkoutSet>)=>void;
}) {
  const [reps, setReps] = useState<number | ''>(existing?.reps ?? '');
  const [kg, setKg] = useState<number | ''>(existing?.weight_kg ?? '');
  const [secs, setSecs] = useState<number | ''>(existing?.time_seconds ?? '');
  const [rpe, setRpe] = useState<number | ''>(existing?.rpe ?? '');
  useEffect(()=>{ if (existing) { setReps(existing.reps ?? ''); setKg(existing.weight_kg ?? ''); setSecs(existing.time_seconds ?? ''); setRpe(existing.rpe ?? ''); } }, [existing?.id]);

  return (
    <>
      <div className="font-medium">{index}</div>
      <input className="rounded-lg px-2 py-1 bg-muted" inputMode="numeric" value={reps} onChange={e=>setReps(e.target.value===''?'':Number(e.target.value))} />
      <input className="rounded-lg px-2 py-1 bg-muted" inputMode="decimal" value={kg} onChange={e=>setKg(e.target.value===''?'':Number(e.target.value))} />
      <input className="rounded-lg px-2 py-1 bg-muted" inputMode="numeric" value={secs} onChange={e=>setSecs(e.target.value===''?'':Number(e.target.value))} />
      <div className="flex items-center gap-2">
        <input className="rounded-lg px-2 py-1 bg-muted w-full" inputMode="decimal" value={rpe} onChange={e=>setRpe(e.target.value===''?'':Number(e.target.value))} />
        <button onClick={()=>onSave({ reps: reps===''?null:Number(reps), weight_kg: kg===''?null:Number(kg), time_seconds: secs===''?null:Number(secs), rpe: rpe===''?null:Number(rpe) })} className="px-2 py-1 rounded-lg bg-primary/80 text-primary-foreground">Save</button>
      </div>
    </>
  );
}

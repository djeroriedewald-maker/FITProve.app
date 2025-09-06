import { useEffect, useState } from 'react';
import WorkoutFilters from '@/components/workouts/WorkoutFilters';
import WorkoutCard from '@/components/workouts/WorkoutCard';
import { listWorkouts } from '@/lib/workouts-client';
import type { Workout } from '@/types/workouts';

export default function WorkoutsIndex() {
  const [filters, setFilters] = useState<{ q?: string; goal?: string; level?: string; location?: string; equipment?: 'with'|'without'|'any'; duration?: '15'|'30'|'45'|'60'|'90'|'any'; }>({ equipment: 'any', duration: 'any' });
  const [items, setItems] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string|undefined>();

  useEffect(() => {
    let on = true;
    setLoading(true);
    setErr(undefined);
    listWorkouts({
      q: filters.q,
      goal: filters.goal,
      level: filters.level,
      location: filters.location,
      equipment: filters.equipment === 'any' ? undefined : filters.equipment,
      duration: filters.duration === 'any' ? undefined : (filters.duration as any),
    }).then(d => { if (on) setItems(d); }).catch(e => setErr(e.message)).finally(()=> on && setLoading(false));
    return () => { on = false; };
  }, [filters]);

  return (
    <div className="min-h-dvh">
      <WorkoutFilters value={filters} onChange={setFilters} />
      <div className="max-w-3xl mx-auto px-4 py-4">
        {err && <div className="text-destructive mb-3">Error: {err}</div>}
        {loading ? (
          <div className="grid gap-3">
            {Array.from({length:6}).map((_,i)=> <div key={i} className="h-28 rounded-2xl bg-muted animate-pulse" />)}
          </div>
        ) : (
          <div className="grid gap-3">
            {items.map(w => <WorkoutCard key={w.id} w={w} />)}
            {!items.length && <div className="text-muted-foreground">Geen workouts gevonden voor deze filters.</div>}
          </div>
        )}
      </div>
    </div>
  );
}

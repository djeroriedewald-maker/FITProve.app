// src/routes/modules/workouts/logs.tsx
import React from 'react';
import { supabase } from '@/lib/supabaseClient';
import { listSessionsForUser, Session } from '@/lib/workouts/logs';

function formatDate(ts: string) {
  try {
    const d = new Date(ts);
    return d.toLocaleString();
  } catch {
    return ts;
  }
}

export default function WorkoutLogsPage() {
  const [loading, setLoading] = React.useState(true);
  const [sessions, setSessions] = React.useState<Session[]>([]);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      const list = await listSessionsForUser(supabase, { limit: 100 });
      if (mounted) {
        setSessions(list);
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="mx-auto w-full max-w-3xl p-4">
      <h1 className="mb-2 text-2xl font-bold">Mijn Workouts</h1>
      <p className="mb-4 text-sm text-muted-foreground">Overzicht van je opgeslagen sessies.</p>

      {loading ? (
        <div className="space-y-2">
          <div className="h-16 animate-pulse rounded-2xl bg-muted/40" />
          <div className="h-16 animate-pulse rounded-2xl bg-muted/40" />
          <div className="h-16 animate-pulse rounded-2xl bg-muted/40" />
        </div>
      ) : sessions.length === 0 ? (
        <div className="rounded-2xl border bg-card p-6 text-center text-sm text-muted-foreground">
          Nog geen sessies opgeslagen. Start een workout via de library.
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((s) => (
            <a
              key={s.id}
              href={`/modules/programs/${encodeURIComponent(s.workout_id)}?sid=${s.id}`}
              className="block rounded-2xl border bg-card p-4 shadow-sm hover:bg-accent"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-base font-semibold">{s.workout_title ?? 'Workout'}</div>
                  <div className="text-xs text-muted-foreground">
                    Gestart: {formatDate(s.started_at)}
                    {s.completed_at ? ` • Klaar: ${formatDate(s.completed_at)}` : ''}
                  </div>
                </div>
                <span
                  className={`rounded-full px-2 py-1 text-xs ${
                    s.status === 'completed'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                  }`}
                >
                  {s.status}
                </span>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

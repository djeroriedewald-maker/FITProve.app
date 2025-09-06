import { useEffect, useMemo, useState } from "react";
import type { WorkoutExercise, UserWorkoutSession, SetLogUpsert } from "@/types/workout";

type Value = {
  reps?: number | null;
  weight_kg?: number | null;
  time_seconds?: number | null;
  rpe?: number | null;
  notes?: string | null;
  completed?: boolean | null;
};

// key = `${exercise_id}:${set_index}`
type DraftMap = Map<string, Value>;

type ExistingSet = {
  session_id: string;
  exercise_id: string;
  set_index: number;
  reps?: number | null;
  weight_kg?: number | null;
  time_seconds?: number | null;
  rpe?: number | null;
  notes?: string | null;
  completed?: boolean | null;
};

type Props = {
  session: UserWorkoutSession;
  exercises: WorkoutExercise[];
  onSaveSet: (payload: SetLogUpsert) => Promise<unknown> | unknown;
  loadSets: (sessionId: string) => Promise<ExistingSet[]>;
  completeSession: (sid: string) => Promise<UserWorkoutSession>;
  onCompleted: (s: UserWorkoutSession) => void;
};

function keyFor(exId: string, setIndex: number) {
  return `${exId}:${setIndex}`;
}

function parseNum(v: string): number | null {
  if (v === "" || v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export default function WorkoutLogger({
  session,
  exercises,
  onSaveSet,
  loadSets,
  completeSession,
  onCompleted,
}: Props) {
  const [initial, setInitial] = useState<DraftMap>(new Map());
  const [draft, setDraft] = useState<DraftMap>(new Map());
  const [saving, setSaving] = useState<string | null>(null);
  const [busyComplete, setBusyComplete] = useState(false);

  // Load bestaande set-logs
  useEffect(() => {
    let on = true;
    (async () => {
      try {
        const rows = await loadSets(session.id);
        if (!on) return;
        const m: DraftMap = new Map();
        for (const r of rows) {
          m.set(keyFor(r.exercise_id, r.set_index), {
            reps: r.reps ?? null,
            weight_kg: r.weight_kg ?? null,
            time_seconds: r.time_seconds ?? null,
            rpe: r.rpe ?? null,
            notes: r.notes ?? null,
            completed: r.completed ?? null,
          });
        }
        setInitial(m);
        setDraft(new Map(m));
      } catch {
        // ok
      }
    })();
    return () => {
      on = false;
    };
  }, [session.id, loadSets]);

  // Bepaal hoeveel rijen per oefening we tonen
  const setCounts = useMemo(() => {
    const maxByEx = new Map<string, number>();
    for (const ex of exercises) {
      let max = Math.max(2, ex.target_sets ?? 0);
      for (const k of initial.keys()) {
        const [exId, idx] = k.split(":");
        if (exId === ex.id) {
          const i = Number(idx);
          if (i + 1 > max) max = i + 1;
        }
      }
      maxByEx.set(ex.id, max || 2);
    }
    return maxByEx;
  }, [exercises, initial]);

  function getVal(exId: string, idx: number): Value {
    return draft.get(keyFor(exId, idx)) ?? {};
  }

  function update(exId: string, idx: number, patch: Partial<Value>) {
    setDraft((prev) => {
      const k = keyFor(exId, idx);
      const cur = prev.get(k) ?? {};
      const next = { ...cur, ...patch };
      const m = new Map(prev);
      m.set(k, next);
      return m;
    });
  }

  async function persist(exId: string, idx: number) {
    const k = keyFor(exId, idx);
    const v = draft.get(k) ?? {};
    setSaving(k);
    try {
      const payload: SetLogUpsert = {
        session_id: session.id,
        exercise_id: exId,
        set_index: idx,
        reps: v.reps ?? null,
        weight_kg: v.weight_kg ?? null,
        time_seconds: v.time_seconds ?? null,
        rpe: v.rpe ?? null,
        completed: v.completed ?? null,
        notes: v.notes ?? null,
      };
      await onSaveSet(payload);
      setInitial((prev) => {
        const m = new Map(prev);
        m.set(k, { ...v });
        return m;
      });
    } finally {
      setSaving((s) => (s === k ? null : s));
    }
  }

  async function handleComplete() {
    try {
      setBusyComplete(true);
      const s = await completeSession(session.id);
      onCompleted(s);
    } finally {
      setBusyComplete(false);
    }
  }

  return (
    <section className="mt-6 space-y-4">
      <h2 className="text-xl font-semibold">Log je workout</h2>

      {exercises.map((ex) => {
        const rows = setCounts.get(ex.id) ?? 2;
        return (
          <div
            key={ex.id}
            className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
          >
            <div className="p-3 flex items-center justify-between">
              <div>
                <div className="font-medium">{ex.display_name}</div>
                <div className="text-xs text-zinc-600 dark:text-zinc-400">
                  {(ex.target_sets ?? "") && `${ex.target_sets} sets`}{" "}
                  {(ex.target_reps ?? "") && `• ${ex.target_reps} reps`}{" "}
                  {(ex.rest_seconds ?? "") && `• Rust ${ex.rest_seconds}s`}
                </div>
              </div>
              <div className="text-xs text-zinc-500">
                {ex.tempo ? `Tempo ${ex.tempo}` : ""}
              </div>
            </div>

            <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {[...Array(rows)].map((_, i) => {
                const v = getVal(ex.id, i);
                const savingKey = keyFor(ex.id, i);
                const isSaving = saving === savingKey;
                return (
                  <div key={i} className="grid grid-cols-5 gap-2 p-3 items-center">
                    <div className="text-sm">Set {i + 1}</div>
                    <input
                      className="h-9 rounded-lg border px-2 text-sm bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700"
                      placeholder="Reps"
                      value={v.reps ?? ""}
                      onChange={(e) => update(ex.id, i, { reps: parseNum(e.target.value) })}
                      onBlur={() => void persist(ex.id, i)}
                      inputMode="numeric"
                    />
                    <input
                      className="h-9 rounded-lg border px-2 text-sm bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700"
                      placeholder="Gewicht (kg)"
                      value={v.weight_kg ?? ""}
                      onChange={(e) => update(ex.id, i, { weight_kg: parseNum(e.target.value) })}
                      onBlur={() => void persist(ex.id, i)}
                      inputMode="decimal"
                    />
                    <input
                      className="h-9 rounded-lg border px-2 text-sm bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700"
                      placeholder="Tijd (s)"
                      value={v.time_seconds ?? ""}
                      onChange={(e) => update(ex.id, i, { time_seconds: parseNum(e.target.value) })}
                      onBlur={() => void persist(ex.id, i)}
                      inputMode="numeric"
                    />
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="h-4 w-4 accent-orange-500"
                        checked={Boolean(v.completed)}
                        onChange={(e) => update(ex.id, i, { completed: e.target.checked })}
                        onBlur={() => void persist(ex.id, i)}
                      />
                      <span className="text-xs">{isSaving ? "Opslaan…" : "Voltooid"}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      <div className="pt-2">
        <button
          type="button"
          onClick={() => void handleComplete()}
          disabled={busyComplete}
          className="px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {busyComplete ? "Afronden…" : "Sessie afronden"}
        </button>
      </div>
    </section>
  );
}

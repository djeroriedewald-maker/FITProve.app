// src/components/workouts/WorkoutLogger.tsx
import React, { useEffect, useMemo, useState } from "react";
import type {
  WorkoutExercise,
  UserWorkoutSession,
  SetLog,
  SetLogUpsert,
} from "@/types/workout";
import {
  addOrUpdateSet as clientAddOrUpdateSet,
  listSessionSets as clientListSessionSets,
  completeSession as clientCompleteSession,
} from "@/lib/workouts-client";

type Value = {
  reps?: number | null;
  weight_kg?: number | null;
  time_seconds?: number | null;
  rpe?: number | null;
};

type DraftMap = Map<string, Value>; // key = `${exId}:${setIndex}`

interface Props {
  session: UserWorkoutSession;
  exercises: WorkoutExercise[];

  /** Optioneel: override I/O; wanneer niet meegegeven gebruiken we client-functies */
  loadSets?: (sessionId: string) => Promise<SetLog[]>;
  onSaveSet?: (payload: SetLogUpsert) => Promise<any>;
  completeSession?: (sessionId: string) => Promise<UserWorkoutSession | void>;

  onCompleted?: (s: UserWorkoutSession) => void;
}

function keyFor(exId: string, setIndex: number) {
  return `${exId}:${setIndex}`;
}

function parseNum(v: string): number | null {
  if (v === "" || v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

const eqNullish = (a: unknown, b: unknown) =>
  (a ?? null) === (b ?? null); // ✅ voorkomt TS5076 issues

export default function WorkoutLogger({
  session,
  exercises,
  loadSets,
  onSaveSet,
  completeSession,
  onCompleted,
}: Props) {
  // Fallbacks naar client-implementatie
  const _loadSets = loadSets ?? clientListSessionSets;
  const _save = onSaveSet ?? clientAddOrUpdateSet;
  const _complete =
    completeSession ??
    (async (sid: string) => {
      await clientCompleteSession(sid);
      return {
        ...session,
        status: "completed",
        completed_at: new Date().toISOString(),
      } as UserWorkoutSession;
    });

  const [initial, setInitial] = useState<DraftMap>(new Map());
  const [draft, setDraft] = useState<DraftMap>(new Map());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Haal bestaande sets (indien aanwezig)
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const rows = await _loadSets(session.id);
        const m = new Map<string, Value>();
        for (const r of rows) {
          const exId =
            (r as any).workout_exercise_id ?? (r as any).exercise_id;
          m.set(keyFor(exId, r.set_index), {
            reps: r.reps ?? null,
            weight_kg: r.weight_kg ?? null,
            time_seconds: (r as any).time_seconds ?? (r as any).time_sec ?? null,
            rpe: r.rpe ?? null,
          });
        }
        if (active) {
          setInitial(m);
          setDraft(new Map()); // clean slate
          setError(null);
        }
      } catch (e: any) {
        if (active) setError(`Fout: ${e.message ?? String(e)}`);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.id]);

  // Is er iets aangepast vs. initial?
  const dirty = useMemo(() => draft.size > 0, [draft.size]);

  function getValue(exId: string, setIndex: number): Value {
    const k = keyFor(exId, setIndex);
    return draft.get(k) ?? initial.get(k) ?? {};
  }

  function updateValue(exId: string, setIndex: number, patch: Partial<Value>) {
    const k = keyFor(exId, setIndex);
    setDraft((prev) => {
      const init = initial.get(k) ?? {};
      const cur = prev.get(k) ?? init;
      const next = { ...cur, ...patch };

      // ✅ vergelijk elk veld null-safe en plaats haakjes om ?? (eqNullish)
      const equals =
        eqNullish(next.reps, init.reps) &&
        eqNullish(next.weight_kg, init.weight_kg) &&
        eqNullish(next.time_seconds, init.time_seconds) &&
        eqNullish(next.rpe, init.rpe);

      const copy = new Map(prev);
      if (equals) copy.delete(k);
      else copy.set(k, next);
      return copy;
    });
  }

  async function saveAll() {
    if (!dirty || saving) return;
    try {
      setSaving(true);
      setError(null);

      // Schrijf alleen entries uit draft weg (parallel)
      const tasks: Promise<any>[] = [];
      draft.forEach((val, k) => {
        const [exId, idxStr] = k.split(":");
        const set_index = Number(idxStr);
        const payload: SetLogUpsert = {
          session_id: session.id,
          // support beide kolomnamen – server kiest welke bestaat
          workout_exercise_id: exId,
          exercise_id: exId,
          set_index,
          reps: val.reps ?? null,
          weight_kg: val.weight_kg ?? null,
          time_seconds: val.time_seconds ?? null,
          time_sec: val.time_seconds ?? null,
          rpe: val.rpe ?? null,
          completed: true,
        };
        tasks.push(_save(payload));
      });

      await Promise.all(tasks);

      // Na succes: draft -> initial
      const nextInitial = new Map(initial);
      draft.forEach((v, k) => nextInitial.set(k, { ...v }));
      setInitial(nextInitial);
      setDraft(new Map());
    } catch (e: any) {
      setError(`Opslaan mislukt: ${e.message ?? String(e)}`);
    } finally {
      setSaving(false);
    }
  }

  async function finish() {
    try {
      setFinishing(true);
      setError(null);
      if (dirty) {
        await saveAll();
      }
      const updated = (await _complete(session.id)) || {
        ...session,
        status: "completed" as const,
        completed_at: new Date().toISOString(),
      };
      onCompleted?.(updated);
    } catch (e: any) {
      setError(`Afronden mislukt: ${e.message ?? String(e)}`);
    } finally {
      setFinishing(false);
    }
  }

  // Max sets per oefening (val op target_sets)
  function setsFor(ex: WorkoutExercise) {
    const n = Math.max(1, ex.target_sets || 1);
    return Array.from({ length: n }, (_, i) => i + 1);
  }

  return (
    <section className="px-4 py-6 space-y-6">
      <h2 className="text-xl font-semibold">Log je workout</h2>

      {error && (
        <div className="rounded-lg border border-red-300 text-red-700 bg-red-50 px-4 py-3">
          {error}
        </div>
      )}

      {/* Input-tabel per oefening */}
      {exercises.map((ex) => (
        <div key={ex.id} className="rounded-xl border border-zinc-200 dark:border-zinc-800">
          <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
            <h3 className="font-medium">{ex.display_name}</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[720px] w-full text-sm">
              <thead className="bg-zinc-50/60 dark:bg-zinc-900/40">
                <tr>
                  <th className="text-left px-4 py-2 w-16">Set</th>
                  <th className="text-left px-4 py-2 w-28">Reps</th>
                  <th className="text-left px-4 py-2 w-32">Gewicht (kg)</th>
                  <th className="text-left px-4 py-2 w-28">Tijd (s)</th>
                  <th className="text-left px-4 py-2 w-24">RPE</th>
                </tr>
              </thead>
              <tbody>
                {setsFor(ex).map((setIndex) => {
                  const v = getValue(ex.id, setIndex);
                  return (
                    <tr key={setIndex} className="border-t border-zinc-100 dark:border-zinc-800">
                      <td className="px-4 py-2">{setIndex}</td>
                      <td className="px-4 py-2">
                        <input
                          inputMode="numeric"
                          className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 px-3 py-2"
                          value={v.reps ?? ""}
                          onChange={(e) =>
                            updateValue(ex.id, setIndex, { reps: parseNum(e.target.value) })
                          }
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          inputMode="decimal"
                          className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 px-3 py-2"
                          value={v.weight_kg ?? ""}
                          onChange={(e) =>
                            updateValue(ex.id, setIndex, { weight_kg: parseNum(e.target.value) })
                          }
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          inputMode="numeric"
                          className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 px-3 py-2"
                          value={v.time_seconds ?? ""}
                          onChange={(e) =>
                            updateValue(ex.id, setIndex, { time_seconds: parseNum(e.target.value) })
                          }
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          inputMode="decimal"
                          className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 px-3 py-2"
                          value={v.rpe ?? ""}
                          onChange={(e) =>
                            updateValue(ex.id, setIndex, { rpe: parseNum(e.target.value) })
                          }
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {/* Actie-balk (sticky, mobielvriendelijk) */}
      <div className="sticky bottom-0 left-0 right-0 z-10 border-t border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur px-4 py-3 flex items-center gap-3">
        <button
          type="button"
          onClick={saveAll}
          disabled={!dirty || saving || loading}
          className={[
            "rounded-xl px-4 py-2 text-sm font-medium transition",
            dirty && !saving && !loading
              ? "bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
              : "bg-zinc-300/60 text-zinc-600 cursor-not-allowed dark:bg-zinc-700/50 dark:text-zinc-400",
          ].join(" ")}
        >
          {saving ? "Opslaan…" : "Opslaan log"}
        </button>

        <button
          type="button"
          onClick={finish}
          disabled={finishing}
          className="rounded-xl px-4 py-2 text-sm font-medium bg-orange-600 text-white hover:bg-orange-500 disabled:opacity-60"
        >
          {finishing ? "Afronden…" : "Markeer sessie als voltooid"}
        </button>

        <div className="ml-auto text-xs text-zinc-500">
          {loading ? "Laden…" : dirty ? "Wijzigingen nog niet opgeslagen" : "Alle wijzigingen opgeslagen"}
        </div>
      </div>
    </section>
  );
}

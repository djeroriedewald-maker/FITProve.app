// src/routes/modules/programs/[id].tsx
import { useEffect, useMemo, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import WorkoutLogger from "@/components/workouts/WorkoutLogger";

import {
  getWorkoutFull,
  startSession,
  completeSession,
  listSessionSets,
  addOrUpdateSet,
} from "@/lib/workouts-client";

import type {
  Workout,
  WorkoutBlock,
  WorkoutExercise,
  UserWorkoutSession,
  SetLogUpsert,
} from "@/types/workout";

/** Kleine util */
function firstDefined<T>(...vals: Array<T | null | undefined>): T | undefined {
  for (const v of vals) if (v != null) return v as T;
  return undefined;
}

export default function ProgramDetail() {
  const { id } = useParams<{ id: string }>();
  const { search } = useLocation();
  const sidFromUrl = new URLSearchParams(search).get("sid") || undefined;

  const [workout, setWorkout] = useState<Workout | null>(null);
  const [blocks, setBlocks] = useState<WorkoutBlock[]>([]);
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [session, setSession] = useState<UserWorkoutSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load workout + optionally existing session
  useEffect(() => {
    let on = true;
    (async () => {
      try {
        if (!id) throw new Error("Geen id.");
        const data = await getWorkoutFull(id);
        if (!on) return;
        setWorkout(data.workout);
        setBlocks(data.blocks || []);
        setExercises(data.exercises || []);

        // Als er een sid in de URL zit, laat logger direct zien
        if (sidFromUrl) {
          setSession({
            id: sidFromUrl,
            workout_id: id,
            user_id: "me",
            status: "active",
            started_at: new Date().toISOString(),
            completed_at: null,
            duration_sec: null,
          });
        }
      } catch (e: any) {
        if (!on) return;
        setError(e?.message ?? "Kon workout niet laden.");
      } finally {
        if (on) setLoading(false);
      }
    })();
    return () => { on = false; };
  }, [id, sidFromUrl]);

  const exByBlock = useMemo(() => {
    const map = new Map<string, WorkoutExercise[]>();
    for (const ex of exercises) {
      const key = ex.block_id;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(ex);
    }
    for (const list of map.values()) list.sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0));
    return map;
  }, [exercises]);

  async function onStart() {
    try {
      if (!id) return;
      const s = await startSession(id);
      setSession(s);
      // smooth scroll to logger
      window.requestAnimationFrame(() => {
        try {
          window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
        } catch {
          // ignore scroll error
          void 0;
        }
      });
    } catch (e: any) {
      setError(e?.message ?? "Kon sessie niet starten.");
    }
  }

  // Helpers
  function previewUrl(x: WorkoutExercise): string | undefined {
    return firstDefined(
      x.media?.videos?.[0],
      x.media?.gifs?.[0],
      x.media?.images?.[0],
      x.video_url ?? undefined,
      x.gif_url ?? undefined,
      x.image_url ?? undefined,
      x.thumbnail ?? undefined
    );
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-3">
        <div className="h-8 w-48 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
        <div className="h-24 rounded-2xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
        <div className="h-24 rounded-2xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6">
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }
  if (!workout) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6">
        <p className="opacity-70">Workout niet gevonden.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-4">
      <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 shadow-sm">
        <h1 className="text-2xl font-bold">{workout.title}</h1>
        {workout.description ? (
          <p className="text-zinc-600 dark:text-zinc-400 mt-1">{workout.description}</p>
        ) : null}
        <div className="text-sm mt-2 flex flex-wrap gap-3">
          <span>Doel: {workout.goal ?? "-"}</span>
          <span>Niveau: {workout.level ?? "-"}</span>
          <span>Locatie: {workout.location ?? "-"}</span>
          <span>Duur: {workout.duration_minutes ?? 0} min</span>
          <span>Materiaal: {workout.equipment_required ? "ja" : "nee"}</span>
        </div>

        {!session && (
          <div className="mt-4">
            <button
              type="button"
              onClick={onStart}
              className="px-4 py-2 rounded-xl bg-orange-600 text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500/30 shadow-sm"
            >
              Start workout
            </button>
          </div>
        )}
      </div>

      {/* Blokken + oefeningen */}
      {!session && blocks.length > 0 && (
        <div className="mt-6 space-y-4">
          {blocks
            .slice()
            .sort((a, b) => a.sequence - b.sequence)
            .map((b) => (
              <div
                key={b.id}
                className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/60 p-4"
              >
                <div className="font-semibold">{b.title ?? `Circuit ${b.sequence}`}</div>
                {b.note ? (
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">{b.note}</p>
                ) : null}

                <div className="mt-2 space-y-2">
                  {(exByBlock.get(b.id) ?? []).map((x) => {
                    const preview = previewUrl(x);
                    const meta: string[] = [];
                    if (x.target_sets) meta.push(`${x.target_sets}×`);
                    if (x.target_reps) meta.push(`${x.target_reps} reps`);
                    if (x.target_time_seconds) meta.push(`${x.target_time_seconds}s`);
                    if (x.rest_seconds) meta.push(`Rust ${x.rest_seconds}s`);

                    return (
                      <div
                        key={x.id}
                        className="flex items-center justify-between rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3"
                      >
                        <div>
                          <div className="font-medium">{x.display_name}</div>
                          <div className="text-xs text-zinc-600 dark:text-zinc-400">{meta.join(" • ")}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          {preview ? (
                            <a
                              href={preview}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs rounded-lg px-2 py-1 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                              title="Voorbeeld openen"
                            >
                              Voorbeeld
                            </a>
                          ) : (
                            <span className="text-xs opacity-50">Geen media</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Logger */}
      {session && (
        <div className="mt-6">
          <WorkoutLogger
            session={session}
            exercises={exercises}
            onSaveSet={(payload: SetLogUpsert) => addOrUpdateSet(payload)}
            loadSets={(sid: string) => listSessionSets(sid)}
            completeSession={async (sid: string) => {
              const s = await completeSession(sid);
              setSession(s);
              return s;
            }}
            onCompleted={(s) => setSession(s)}
          />
        </div>
      )}
    </div>
  );
}

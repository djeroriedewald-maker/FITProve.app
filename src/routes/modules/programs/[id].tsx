// src/routes/modules/programs/[id].tsx
import { useEffect, useMemo, useRef, useState } from "react";
import SignInDialog from "@/components/auth/SignInDialog";
import { useParams, useLocation } from "react-router-dom";
import WorkoutLogger from "@/components/workouts/WorkoutLogger";

import {
  getWorkoutFull,
  startSession,
  completeSession as completeSessionApi,
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

/** === Types alleen voor deze file (verwacht door WorkoutLogger) === */
type ExistingSet = {
  session_id: string;
  exercise_id: string; // verplicht
  set_index: number;
  reps?: number | null;
  weight_kg?: number | null;
  time_seconds?: number | null;
  rpe?: number | null;
  notes?: string | null;
  completed?: boolean | null;
};

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
  const [info, setInfo] = useState<string | null>(null);
  const [signInOpen, setSignInOpen] = useState(false);

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
    return () => {
      on = false;
    };
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
      try {
        const s = await startSession(id, undefined, workout?.title);
        setSession(s);
        setInfo(null);
      } catch (e: any) {
        // Fallback: lokale sessie zodat publiek kan loggen zonder account
        const msg = String(e?.message || "");
        if (/not authenticated/i.test(msg) || /auth/i.test(msg)) {
          const local: UserWorkoutSession = {
            id: `local_${Date.now()}`,
            workout_id: id!,
            user_id: "local",
            status: "active",
            started_at: new Date().toISOString(),
            completed_at: null,
            duration_sec: null,
            workout_title: workout?.title ?? null,
          };
          setSession(local);
          setInfo("Niet ingelogd: we slaan je sessie lokaal op. Log in om je voortgang te bewaren in je account.");
        } else {
          throw e;
        }
      }
      window.requestAnimationFrame(() => {
        try {
          window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
        } catch {
          /* noop */
        }
      });
    } catch (e: any) {
      setError(e?.message ?? "Kon sessie niet starten.");
    }
  }

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

  // --- Simple block timer from note ("Duur mm:ss") ---
  function parseSecondsFromNote(note?: string | null): number | undefined {
    if (!note) return undefined;
    const m = /Duur\s+(\d{1,2}):(\d{2})/.exec(note);
    if (!m) return undefined;
    const mm = parseInt(m[1], 10);
    const ss = parseInt(m[2], 10);
    if (Number.isFinite(mm) && Number.isFinite(ss)) return mm * 60 + ss;
    return undefined;
  }
  function useCountdown(initialSec: number | undefined) {
    const [sec, setSec] = useState<number>(initialSec ?? 0);
    const [running, setRunning] = useState(false);
    const timer = useRef<number | null>(null);
    useEffect(() => { setSec(initialSec ?? 0); setRunning(false); }, [initialSec]);
    useEffect(() => {
      if (!running) return;
      timer.current = window.setInterval(() => setSec((s) => (s > 0 ? s - 1 : 0)), 1000) as any;
      return () => { if (timer.current) window.clearInterval(timer.current); };
    }, [running]);
    const start = () => setRunning(true);
    const pause = () => setRunning(false);
    const reset = () => { setRunning(false); setSec(initialSec ?? 0); };
    return { sec, running, start, pause, reset };
  }
  function TimerView({ seconds }: { seconds?: number }) {
    if (!seconds || seconds <= 0) return null;
    const { sec, running, start, pause, reset } = useCountdown(seconds);
    const mm = String(Math.floor(sec / 60)).padStart(2, '0');
    const ss = String(sec % 60).padStart(2, '0');
    return (
      <div className="flex items-center gap-2 text-xs">
        <span className="font-mono">{mm}:{ss}</span>
        {!running ? (
          <button className="rounded-lg border px-2 py-0.5" onClick={start}>Start</button>
        ) : (
          <button className="rounded-lg border px-2 py-0.5" onClick={pause}>Pause</button>
        )}
        <button className="rounded-lg border px-2 py-0.5" onClick={reset}>Reset</button>
      </div>
    );
  }

  // Preview modal
  const [preview, setPreview] = useState<string | null>(null);
  function PreviewModal({ url, onClose }: { url: string; onClose: () => void }) {
    const isImg = /\.(png|jpe?g|webp|gif)$/i.test(url) || (!/\.(mp4|webm|mov|m4v)$/i.test(url));
    return (
      <div className="fixed inset-0 z-[100] grid place-items-center bg-black/70 p-4" onClick={onClose}>
        <div className="max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
          <div className="mb-2 flex justify-end">
            <button className="rounded-lg bg-white/90 px-3 py-1 text-sm" onClick={onClose}>Sluiten</button>
          </div>
          <div className="overflow-hidden rounded-2xl border border-zinc-700 bg-black">
            {isImg ? (
              <img src={url} alt="Voorbeeld" className="w-full max-h-[70vh] object-contain" />
            ) : (
              <video src={url} controls className="w-full max-h-[70vh]" />
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- Local fallback storage for anonymous users ---
  function loadLocal(sessionId: string): ExistingSet[] {
    try {
      const raw = localStorage.getItem(`ws:${sessionId}`);
      if (!raw) return [];
      const arr = JSON.parse(raw) as ExistingSet[];
      return Array.isArray(arr) ? arr : [];
    } catch { return []; }
  }
  async function listSetsLocal(sessionId: string): Promise<ExistingSet[]> {
    return loadLocal(sessionId);
  }
  async function saveSetLocal(payload: SetLogUpsert) {
    const sid = payload.session_id;
    const arr = loadLocal(sid);
    const key = `${payload.exercise_id}:${payload.set_index}`;
    const idx = arr.findIndex((r) => `${r.exercise_id}:${r.set_index}` === key);
    const row: ExistingSet = {
      session_id: sid,
      exercise_id: String(payload.exercise_id || payload.workout_exercise_id || ""),
      set_index: payload.set_index,
      reps: payload.reps ?? null,
      weight_kg: payload.weight_kg ?? null,
      time_seconds: (payload as any).time_seconds ?? (payload as any).time_sec ?? null,
      rpe: payload.rpe ?? null,
      completed: payload.completed ?? null,
      notes: payload.notes ?? null,
    };
    if (idx >= 0) arr[idx] = row; else arr.push(row);
    localStorage.setItem(`ws:${sid}`, JSON.stringify(arr));
  }
  async function completeLocal(sid: string): Promise<UserWorkoutSession> {
    const s = session!;
    const started = new Date(s.started_at).getTime();
    const now = Date.now();
    const dur = Math.max(0, Math.floor((now - started) / 1000));
    const out: UserWorkoutSession = { ...s, status: "completed", completed_at: new Date().toISOString(), duration_sec: dur };
    setSession(out);
    return out;
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

      {info ? (
        <div className="mt-3 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-900/30 dark:text-amber-200 flex items-center justify-between gap-3">
          <span>{info}</span>
          <button
            type="button"
            onClick={() => setSignInOpen(true)}
            className="rounded-lg border border-amber-400 bg-white/70 px-3 py-1 text-amber-800 hover:bg-white"
          >
            Inloggen
          </button>
        </div>
      ) : null}

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
                <div className="flex items-center justify-between">
                  <div className="font-semibold">{b.title ?? `Circuit ${b.sequence}`}</div>
                  <TimerView seconds={parseSecondsFromNote(b.note)} />
                </div>
                {b.note ? <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{b.note}</p> : null}

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
                            <button
                              onClick={() => setPreview(preview)}
                              className="text-xs rounded-lg px-2 py-1 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                              title="Voorbeeld openen"
                            >
                              Voorbeeld
                            </button>
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
            onSaveSet={(payload: SetLogUpsert) => (session.id.startsWith('local_') ? saveSetLocal(payload) : addOrUpdateSet(payload))}
            loadSets={async (sid: string): Promise<ExistingSet[]> => {
              // Adapter: map DB-rows → Expected shape
              if (sid.startsWith('local_')) return listSetsLocal(sid);
              const rows = await listSessionSets(sid as string);
              return (rows ?? [])
                .filter((r: any) => typeof r?.exercise_id === "string")
                .map((r: any) => ({
                  session_id: String(r.session_id),
                  exercise_id: String(r.exercise_id),
                  set_index: Number(r.set_index ?? 0),
                  reps: r.reps ?? null,
                  weight_kg: r.weight_kg ?? null,
                  time_seconds: r.time_seconds ?? null,
                  rpe: r.rpe ?? null,
                  notes: r.notes ?? null,
                  completed: r.completed ?? null,
                }));
            }}
            completeSession={async (sid: string) => {
              if (sid.startsWith('local_')) return completeLocal(sid);
              const started = new Date(session.started_at).getTime();
              const now = Date.now();
              const dur = Math.max(0, Math.floor((now - started) / 1000));
              const s = await completeSessionApi(sid, dur);
              setSession(s);
              return s;
            }}
            onCompleted={(s) => setSession(s)}
          />
        </div>
      )}
      {preview ? <PreviewModal url={preview} onClose={() => setPreview(null)} /> : null}
      <SignInDialog open={signInOpen} onClose={() => setSignInOpen(false)} />
    </div>
  );
}

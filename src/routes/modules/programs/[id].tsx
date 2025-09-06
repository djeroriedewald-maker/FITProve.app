// src/routes/modules/programs/[id].tsx
import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";

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
} from "@/types/workout";

import { useAuth } from "@/context/AuthProvider";
import { supabase } from "@/lib/supabaseClient";

/** --------- Kleine inline Modal voor oefeningsmedia ---------- */
type MediaItem = { url: string; type?: "image" | "gif" | "video" };
function ExerciseMediaModal({
  open,
  title,
  media,
  onClose,
}: {
  open: boolean;
  title?: string;
  media?: MediaItem[];
  onClose: () => void;
}) {
  if (!open) return null;
  const m = media?.[0];
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60" onClick={onClose}>
      <div className="w-[92vw] max-w-md rounded-2xl bg-background p-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold">{title ?? "Voorbeeld"}</h3>
          <button className="rounded-xl border px-2 py-1 text-sm hover:bg-accent" onClick={onClose}>
            Sluit
          </button>
        </div>
        <div className="rounded-xl border bg-muted/30 p-2">
          {!m ? (
            <div className="p-8 text-center text-sm text-muted-foreground">Geen media gevonden.</div>
          ) : m.type === "video" ? (
            <video className="w-full rounded-lg" controls src={m.url} />
          ) : (
            <img className="w-full rounded-lg" src={m.url} alt={title ?? "voorbeeld"} />
          )}
        </div>
      </div>
    </div>
  );
}

/** Media-resolver voor verschillende velden */
function resolveExerciseMedia(ex: WorkoutExercise): MediaItem[] {
  const out: MediaItem[] = [];
  const anyEx: any = ex as any;

  const pushUrl = (url?: string | null, type?: MediaItem["type"]) => {
    if (url && typeof url === "string") out.push({ url, type });
  };

  pushUrl(anyEx.video_url || anyEx.video, "video");
  pushUrl(anyEx.gif_url || anyEx.gif, "gif");
  pushUrl(anyEx.image_url || anyEx.image, "image");

  const arrs: Array<string[] | undefined> = [
    anyEx.videos,
    anyEx.images,
    anyEx.gifs,
    anyEx.media?.videos,
    anyEx.media?.images,
    anyEx.media?.gifs,
  ];
  arrs.forEach((arr, i) => {
    if (Array.isArray(arr)) {
      arr.forEach((u) =>
        pushUrl(u, i === 0 || i === 3 ? "video" : i === 2 || i === 5 ? "gif" : "image")
      );
    }
  });

  pushUrl(anyEx.thumbnail, "image");
  return out;
}

/** Laatste VOLTOOIDE sessie + set logs voor dezelfde workout */
async function fetchLatestCompletedSetsForWorkout(workoutId: string) {
  const { data: sess } = await supabase
    .from("workout_sessions")
    .select("id")
    .eq("workout_id", workoutId)
    .eq("status", "completed")
    .order("completed_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!sess?.id) return [];

  const { data: sets } = await supabase
    .from("set_logs")
    .select("exercise_id, exercise_name, set_index, reps, weight_kg, time_sec, distance_m, rpe, notes")
    .eq("session_id", sess.id)
    .order("exercise_id", { ascending: true })
    .order("set_index", { ascending: true });

  return sets ?? [];
}

export default function ProgramDetail() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const auth = useAuth() as any;
  const ctxUserId: string | null = auth?.user?.id ?? auth?.session?.user?.id ?? null;

  const [sbUserId, setSbUserId] = useState<string | null>(null);
  const [checkingSb, setCheckingSb] = useState(true);
  const userId = ctxUserId ?? sbUserId;

  useEffect(() => {
    let unsub: (() => void) | undefined;
    (async () => {
      try {
        const { data } = await supabase.auth.getUser();
        setSbUserId(data.user?.id ?? null);
      } finally {
        setCheckingSb(false);
      }
      const { data: sub } = supabase.auth.onAuthStateChange((_ev, sess) => {
        setSbUserId(sess?.user?.id ?? null);
      });
      unsub = () => sub.subscription.unsubscribe();
    })();
    return () => { try { unsub?.(); } catch {} };
  }, []);

  const [workout, setWorkout] = useState<Workout | null>(null);
  const [blocks, setBlocks] = useState<WorkoutBlock[]>([]);
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [session, setSession] = useState<UserWorkoutSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [mediaOpen, setMediaOpen] = useState(false);
  const [mediaTitle, setMediaTitle] = useState<string>("");
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);

  const [prefillReady, setPrefillReady] = useState(false);
  const [prefillDone, setPrefillDone] = useState(false);

  useEffect(() => {
    let on = true;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const d = await getWorkoutFull(id);
        if (!on) return;
        setWorkout(d.workout);
        setBlocks(d.blocks);
        setExercises(d.exercises);
      } catch (e: any) {
        on && setErr(e?.message ?? "Kon workout niet laden.");
      } finally {
        on && setLoading(false);
      }
    })();
    return () => { on = false; };
  }, [id]);

  const grouped = useMemo(() => {
    const map: Record<string, WorkoutExercise[]> = {};
    for (const ex of exercises) (map[ex.block_id] ??= []).push(ex);
    Object.values(map).forEach((arr) => arr.sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0)));
    return map;
  }, [exercises]);

  const goLogin = () => {
    const redirect = encodeURIComponent(location.pathname + location.search);
    navigate(`/login?redirect=${redirect}`);
  };

  function openPreview(ex: WorkoutExercise) {
    setMediaTitle(ex.display_name || "Voorbeeld");
    setMediaList(resolveExerciseMedia(ex));
    setMediaOpen(true);
  }

  async function onStart() {
    if (!workout) return;
    if (!userId) {
      goLogin();
      return;
    }
    try {
      const s = await (startSession as any)(workout.id, userId);
      setSession(s as UserWorkoutSession);

      const prev = await fetchLatestCompletedSetsForWorkout(workout.id);
      setPrefillReady(prev.length > 0);

      setTimeout(() => {
        try { window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" }); } catch {}
      }, 0);
    } catch (e: any) {
      const msg = String(e?.message || "");
      if (msg.toLowerCase().includes("row-level security")) {
        goLogin();
        return;
      }
      setErr(msg || "Kon sessie niet starten.");
    }
  }

  async function onAcceptPrefill() {
    if (!workout || !session) return;
    const prev = await fetchLatestCompletedSetsForWorkout(workout.id);
    for (const p of prev) {
      await addOrUpdateSet({
        session_id: (session as any).id,
        exercise_id: p.exercise_id,
        exercise_name: p.exercise_name ?? undefined,
        set_index: p.set_index,
        reps: p.reps ?? undefined,
        weight_kg: p.weight_kg ?? undefined,
        time_sec: p.time_sec ?? undefined,
        distance_m: p.distance_m ?? undefined,
        rpe: p.rpe ?? undefined,
        completed: false,
        notes: p.notes ?? undefined,
      });
    }
    setPrefillDone(true);
    setPrefillReady(false);
  }

  if (loading) {
    return (
      <div className="p-4 max-w-3xl mx-auto">
        <div className="h-32 rounded-2xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
      </div>
    );
  }
  if (err) return <div className="p-4 text-red-600 dark:text-red-400">Error: {err}</div>;
  if (!workout) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-4">
      <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 shadow-sm">
        <h1 className="text-2xl font-bold">{workout.title}</h1>
        {workout.description && <p className="text-zinc-600 dark:text-zinc-400 mt-1">{workout.description}</p>}
        <div className="text-sm mt-2 flex flex-wrap gap-3">
          <span>Doel: {workout.goal}</span>
          <span>Niveau: {workout.level}</span>
          <span>Locatie: {workout.location}</span>
          <span>Duur: {workout.duration_minutes} min</span>
          <span>Materiaal: {workout.equipment_required ? "ja" : "nee"}</span>
        </div>

        {!userId && !checkingSb && (
          <div className="mt-3 rounded-xl border border-orange-300/50 bg-orange-50 text-orange-800 dark:bg-orange-950/30 dark:text-orange-200 p-3">
            <div className="text-sm">Je bent niet ingelogd. Log in om je workout te starten en te loggen.</div>
            <button onClick={goLogin} className="mt-2 rounded-xl px-4 py-2 bg-orange-600 text-white">Log in</button>
          </div>
        )}

        {!session && (
          <button className="mt-3 rounded-2xl px-4 py-3 bg-orange-600 text-white" onClick={onStart}>
            Start workout
          </button>
        )}
      </div>

      {session && prefillReady && (
        <div className="mt-3 rounded-2xl border border-amber-300/40 bg-amber-500/10 p-3 text-sm">
          Vorige sessie gevonden. Wil je de vorige logs als startpunt overnemen?
          <div className="mt-2 flex gap-2">
            <button onClick={onAcceptPrefill} className="rounded-lg border px-3 py-1 hover:bg-accent">Ja, overnemen</button>
            <button onClick={() => setPrefillReady(false)} className="rounded-lg border px-3 py-1 hover:bg-accent">Nee</button>
          </div>
        </div>
      )}
      {session && prefillDone && (
        <div className="mt-3 rounded-2xl border border-emerald-300/40 bg-emerald-500/10 p-3 text-sm">
          Vorige logs zijn ingevuld. Je kunt ze nu aanpassen en opslaan.
        </div>
      )}

      <div className="space-y-4 mt-4">
        {blocks.sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0)).map((b) => (
          <div key={b.id} className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 shadow-sm">
            <div className="font-semibold">{b.title ?? `Circuit ${b.sequence}`}</div>
            {b.note && <p className="text-sm text-zinc-600 dark:text-zinc-400">{b.note}</p>}

            <div className="mt-2 space-y-2">
              {(grouped[b.id] ?? []).map((ex) => (
                <div key={ex.id} className="rounded-xl bg-zinc-100 dark:bg-zinc-800 p-3 flex items-center justify-between">
                  <div>
                    <div className="font-medium">{ex.display_name}</div>
                    <div className="text-sm text-zinc-600 dark:text-zinc-400">
                      {ex.target_sets} ×{" "}
                      {ex.target_reps
                        ? `${ex.target_reps} reps`
                        : ex.target_time_seconds
                        ? `${ex.target_time_seconds}s`
                        : "reps/tijd vrij"}
                      {ex.rest_seconds ? ` · Rust ${ex.rest_seconds}s` : ""}
                      {ex.tempo ? ` · Tempo ${ex.tempo}` : ""}
                    </div>
                  </div>
                  <button
                    className="rounded-lg border px-3 py-1 text-xs hover:bg-accent"
                    onClick={() => {
                      setMediaTitle(ex.display_name || "Voorbeeld");
                      setMediaList(resolveExerciseMedia(ex));
                      setMediaOpen(true);
                    }}
                    title="Voorbeeld bekijken"
                  >
                    Voorbeeld
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {session && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Log je workout</h2>

          <WorkoutLogger
            session={session}
            exercises={exercises}
            onSaveSet={addOrUpdateSet}
            loadSets={listSessionSets}
            completeSession={completeSession}
            onCompleted={(s: UserWorkoutSession) => setSession(s)}
          />
        </div>
      )}

      <ExerciseMediaModal open={mediaOpen} title={mediaTitle} media={mediaList} onClose={() => setMediaOpen(false)} />
    </div>
  );
}

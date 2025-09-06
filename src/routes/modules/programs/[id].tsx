// src/routes/modules/programs/[id].tsx
import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import WorkoutLogger from "@/components/workouts/WorkoutLogger";
import { getWorkoutFull, startSession, supabase } from "@/lib/workouts-client";
import type {
  Workout,
  WorkoutBlock,
  WorkoutExercise,
  UserWorkoutSession,
} from "@/types/workouts";

// ✅ haal user uit jouw AuthProvider (primaire bron)
import { useAuth } from "@/context/AuthProvider";

export default function ProgramDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Auth: context is leidend
  const auth = useAuth(); // verwacht { user, session, loading } of iets vergelijkbaars
  const ctxUserId = (auth as any)?.user?.id ?? (auth as any)?.session?.user?.id ?? null;

  const [workout, setWorkout] = useState<Workout | null>(null);
  const [blocks, setBlocks] = useState<WorkoutBlock[]>([]);
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | undefined>();

  // Supabase fallback (indien context nog niet geladen zou zijn)
  const [sbUserId, setSbUserId] = useState<string | null>(null);
  const [checkingSb, setCheckingSb] = useState(true);

  // actieve sessie na "Start workout"
  const [session, setSession] = useState<UserWorkoutSession | null>(null);

  // Workout data
  useEffect(() => {
    if (!id) return;
    let on = true;
    setLoading(true);
    setErr(undefined);

    getWorkoutFull(id)
      .then((d) => {
        if (!on) return;
        setWorkout(d.workout);
        setBlocks(d.blocks);
        setExercises(d.exercises);
      })
      .catch((e) => on && setErr(e.message))
      .finally(() => on && setLoading(false));

    return () => {
      on = false;
    };
  }, [id]);

  // Supabase auth fallback + live updates
  useEffect(() => {
    let unsub: (() => void) | undefined;
    (async () => {
      try {
        const { data } = await supabase.auth.getUser();
        setSbUserId(data.user?.id ?? null);
      } finally {
        setCheckingSb(false);
      }
      const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
        setSbUserId(sess?.user?.id ?? null);
      });
      unsub = () => sub.subscription.unsubscribe();
    })();
    return () => {
      try {
        unsub?.();
      } catch {}
    };
  }, []);

  // Gecombineerde userId (context > supabase)
  const userId = ctxUserId ?? sbUserId;

  // gegroepeerde oefeningen per block
  const grouped = useMemo(() => {
    const map: Record<string, WorkoutExercise[]> = {};
    for (const ex of exercises) {
      map[ex.block_id] ??= [];
      map[ex.block_id].push(ex);
    }
    Object.values(map).forEach((arr) =>
      arr.sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0))
    );
    return map;
  }, [exercises]);

  const goLogin = () => {
    const redirect = encodeURIComponent(location.pathname + location.search);
    navigate(`/login?redirect=${redirect}`);
  };

  const onStart = async () => {
    if (!workout) return;
    if (!userId) {
      // Alleen als beide bronnen geen user geven
      goLogin();
      return;
    }
    try {
      const s = await startSession(workout.id, userId);
      setSession(s);
      try {
        window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
      } catch {}
    } catch (e: any) {
      console.error("startSession failed:", e);
      setErr(e?.message ?? "Kon sessie niet starten.");
    }
  };

  // ---- UI states ----
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
      {/* Header */}
      <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 shadow-sm">
        <h1 className="text-2xl font-bold">{workout.title}</h1>
        {workout.description && (
          <p className="text-zinc-600 dark:text-zinc-400 mt-1">{workout.description}</p>
        )}
        <div className="text-sm mt-2 flex flex-wrap gap-3">
          <span>Doel: {workout.goal}</span>
          <span>Niveau: {workout.level}</span>
          <span>Locatie: {workout.location}</span>
          <span>Duur: {workout.duration_minutes} min</span>
          <span>Materiaal: {workout.equipment_required ? "ja" : "nee"}</span>
        </div>

        {/* Callout alleen als echt niemand herkend is */}
        {!userId && !checkingSb && (
          <div className="mt-3 rounded-xl border border-orange-300/50 bg-orange-50 text-orange-800 dark:bg-orange-950/30 dark:text-orange-200 p-3">
            <div className="text-sm">
              Je bent niet ingelogd. Log in om je workout te starten en te loggen.
            </div>
            <button
              onClick={goLogin}
              className="mt-2 rounded-xl px-4 py-2 bg-orange-600 text-white"
            >
              Log in
            </button>
          </div>
        )}

        {!session && (
          <button
            className="mt-3 rounded-2xl px-4 py-3 bg-orange-600 text-white"
            onClick={onStart}
          >
            Start workout
          </button>
        )}
      </div>

      {/* Blocks & oefeningen */}
      <div className="space-y-4 mt-4">
        {blocks
          .sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0))
          .map((b) => (
            <div
              key={b.id}
              className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 shadow-sm"
            >
              <div className="font-semibold">{b.title ?? `Blok ${b.sequence}`}</div>
              {b.note && (
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{b.note}</p>
              )}
              <div className="mt-2 space-y-2">
                {(grouped[b.id] ?? []).map((ex) => (
                  <div key={ex.id} className="rounded-xl bg-zinc-100 dark:bg-zinc-800 p-3">
                    <div className="font-medium">{ex.display_name}</div>
                    <div className="text-sm text-zinc-600 dark:text-zinc-400">
                      {ex.target_sets} x{" "}
                      {ex.target_reps
                        ? `${ex.target_reps} reps`
                        : ex.target_time_seconds
                        ? `${ex.target_time_seconds}s`
                        : "reps/tijd vrij"}
                      {ex.rest_seconds ? ` · Rust ${ex.rest_seconds}s` : ""}
                      {ex.tempo ? ` · Tempo ${ex.tempo}` : ""}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
      </div>

      {/* Logger na start */}
      {session && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Log je workout</h2>
          <WorkoutLogger
            session={session}
            exercises={exercises}
            onCompleted={(s) => setSession(s)}
          />
        </div>
      )}
    </div>
  );
}

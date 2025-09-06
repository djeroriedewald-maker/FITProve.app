// src/routes/modules/workouts/[id].tsx
import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";

/** Types */
type Media = { images?: string[]; gifs?: string[]; videos?: string[]; thumbnail?: string };
type Exercise = {
  id: string;
  slug: string;
  name: string;
  description?: string;
  instructions?: string[];
  primaryMuscles: string[];
  secondaryMuscles?: string[];
  equipment: string[];
  category?: string;
  media: Media;
  language: "en";
};
type Manifest = { version: string; total: number; chunks: number; chunkSize: number; basePath: string };

const BASE = (import.meta as any).env?.VITE_WORKOUTS_BASE as string | undefined;

async function getJSON<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { "cache-control": "no-cache" } });
  if (!res.ok) throw new Error(`HTTP ${res.status} @ ${url}`);
  return (await res.json()) as T;
}

export default function WorkoutDetail() {
  const { id } = useParams<{ id: string }>();
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [, setError] = useState<string | null>(null); // state setter gebruiken we wel; de waarde zelf renderen we (nog) niet

  useEffect(() => {
    let mounted = true;
    async function loadOne() {
      try {
        if (!BASE) throw new Error("VITE_WORKOUTS_BASE ontbreekt in .env");
        const manifest = await getJSON<Manifest>(`${BASE}/manifest.json`);
        for (let i = 0; i < manifest.chunks; i++) {
          const chunk = await getJSON<Exercise[]>(`${BASE}/chunk-${String(i).padStart(3, "0")}.json`);
          const found = chunk.find((x) => x.id === id);
          if (found) {
            if (mounted) setExercise(found);
            return;
          }
        }
        if (mounted) setExercise(null);
      } catch (e: any) {
        // Loggen is handig voor debugging; UI-melding komt later.
        console.error(e);
        if (mounted) setError(e?.message ?? "Kon oefening niet laden.");
      }
    }
    loadOne();
    return () => {
      mounted = false;
    };
  }, [id]);

  const hasVideo = useMemo(() => (exercise?.media?.videos?.length ?? 0) > 0, [exercise]);

  function addToMyWorkout() {
    if (!exercise) return;
    try {
      const key = "myWorkoutDraft";
      const existing = JSON.parse(localStorage.getItem(key) || "[]") as string[];
      const next = Array.from(new Set([...existing, exercise.id]));
      localStorage.setItem(key, JSON.stringify(next));
      // Optioneel: UI toast later; alert is prima voor nu.
      alert(`Toegevoegd aan eigen workout: ${exercise.name}`);
    } catch {
      alert("Kon niet opslaan in je eigen workout.");
    }
  }

  const heroSrc =
    exercise?.media?.images?.[0] ??
    exercise?.media?.thumbnail ??
    undefined;

  return (
    <section className="px-4 py-6 max-w-3xl mx-auto space-y-4">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{exercise?.name || "Oefening"}</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            {(exercise?.category ?? "strength")}
            {exercise?.primaryMuscles?.length ? ` • ${exercise.primaryMuscles.join(", ")}` : ""}
            {exercise?.equipment?.length ? ` • ${exercise.equipment.join(", ")}` : ""}
          </p>
        </div>
        <Link to="/modules/workouts" className="text-sm text-orange-600 dark:text-orange-400 hover:underline">
          ← Terug
        </Link>
      </header>

      {/* CTA's */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={addToMyWorkout}
          className="inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm
                     bg-white text-zinc-900 border-zinc-300 hover:bg-zinc-50 hover:border-zinc-400
                     focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500
                     dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-700
                     dark:hover:bg-zinc-800/80 dark:hover:border-zinc-600"
          title="Voeg deze oefening toe aan je eigen workout"
        >
          Voeg toe aan eigen workout
        </button>

        {hasVideo ? (
          <button
            type="button"
            onClick={() => alert("Voorbeelden openen (TODO)")}
            className="inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm
                       bg-white text-zinc-900 border-zinc-300 hover:bg-zinc-50 hover:border-zinc-400
                       focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500
                       dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-700
                       dark:hover:bg-zinc-800/80 dark:hover:border-zinc-600"
          >
            Bekijk voorbeelden
          </button>
        ) : (
          <button
            type="button"
            disabled
            className="inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm
                       bg-zinc-100 text-zinc-400 border-zinc-200 cursor-not-allowed
                       dark:bg-zinc-800 dark:text-zinc-500 dark:border-zinc-700"
            title="Geen video beschikbaar"
          >
            Bekijk voorbeelden
          </button>
        )}
      </div>

      {/* Hero media */}
      {heroSrc ? (
        <div className="rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
          <img
            src={heroSrc}
            alt={exercise?.name ?? "Oefening"}
            className="w-full h-64 object-cover"
            loading="lazy"
          />
        </div>
      ) : null}

      {/* Instructies / beschrijving */}
      <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 bg-white/70 dark:bg-zinc-900/60">
        <h2 className="text-lg font-semibold">Instructies</h2>
        {exercise?.instructions?.length ? (
          <ol className="mt-2 list-decimal pl-5 space-y-1 text-sm text-zinc-700 dark:text-zinc-300">
            {exercise.instructions.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        ) : (
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            {exercise?.description || "Voor deze oefening zijn nog geen specifieke instructies beschikbaar."}
          </p>
        )}
      </section>

      {/* Footer */}
      <p className="text-[11px] text-zinc-500 dark:text-zinc-500">Oefening ID: {exercise?.id ?? id}</p>
    </section>
  );
}

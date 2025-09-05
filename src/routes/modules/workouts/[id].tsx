// src/routes/modules/workouts/[id].tsx
import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import ExerciseMedia from "@/components/workouts/ExerciseMedia";

/** Types die overeenkomen met de library */
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
  const [error, setError] = useState<string | null>(null);

  // Fetch enkel de chunk(s) en vind het item met dit id
  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        if (!BASE) throw new Error("VITE_WORKOUTS_BASE ontbreekt in .env");
        const manifest = await getJSON<Manifest>(`${BASE}/manifest.json`);
        // snelle benadering: alle chunks laden en zoeken (dataset ~3 chunks)
        const urls = Array.from({ length: manifest.chunks }, (_, i) => `${BASE}/chunk-${String(i).padStart(3, "0")}.json`);
        const parts = await Promise.all(urls.map((u) => getJSON<Exercise[]>(u)));
        const all = parts.flat();
        const found = all.find((x) => x.id === id);
        if (!found) throw new Error("Workout niet gevonden.");
        if (mounted) setExercise(found);
      } catch (e: any) {
        console.error(e);
        if (mounted) {
          setError(e?.message ?? "Kon de workout niet laden.");
          setExercise(null);
        }
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [id]);

  // Kies beste media voor de ExerciseMedia component
  const media = useMemo(() => {
    if (!exercise) return { mp4Url: undefined, webmUrl: undefined, gifUrl: undefined };
    const gifUrl = exercise.media?.gifs?.[0] || (exercise.media?.thumbnail?.endsWith(".gif") ? exercise.media.thumbnail : undefined);
    // In onze dataset staan video's zelden als mp4/webm; laat ze undefined tenzij aanwezig
    const mp4Url = (exercise.media?.videos ?? []).find((v) => v.endsWith(".mp4"));
    const webmUrl = (exercise.media?.videos ?? []).find((v) => v.endsWith(".webm"));
    return { mp4Url, webmUrl, gifUrl };
  }, [exercise]);

  if (error) {
    return (
      <div className="px-4 py-4 max-w-3xl mx-auto">
        <p className="text-sm text-red-500">{error}</p>
        <Link to="/modules/workouts" className="mt-3 inline-block text-orange-500">← Terug naar workouts</Link>
      </div>
    );
  }

  if (!exercise) {
    return (
      <div className="px-4 py-4 max-w-3xl mx-auto">
        <div className="animate-pulse rounded-2xl border border-neutral-800 p-4">
          <div className="h-5 w-1/2 bg-neutral-800 rounded" />
          <div className="h-4 w-1/3 bg-neutral-800 mt-3 rounded" />
          <div className="h-40 w-full bg-neutral-900 mt-4 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 max-w-3xl mx-auto">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{exercise.name}</h1>
          <p className="opacity-80 text-sm">
            {exercise.category ? `${exercise.category} • ` : ""}
            {exercise.primaryMuscles.join(", ")}
            {exercise.equipment.length ? ` • ${exercise.equipment.join(", ")}` : ""}
          </p>
        </div>
        <Link to="/modules/workouts" className="text-sm text-orange-500">← Terug</Link>
      </div>

      <div className="mt-4">
        <ExerciseMedia
          name={exercise.name}
          mp4Url={media.mp4Url}
          webmUrl={media.webmUrl}
          gifUrl={media.gifUrl}
        />
        {/* fallback: toon eerste image onder de speler als er geen gif/mp4 is */}
        {!media.gifUrl && !media.mp4Url && !media.webmUrl && exercise.media?.images?.[0] && (
          <img
            src={exercise.media.images[0]}
            alt=""
            className="mt-3 rounded-xl border border-neutral-800"
            loading="lazy"
          />
        )}
      </div>

      {exercise.description && (
        <div className="mt-6 rounded-2xl border border-neutral-800 p-4">
          <h3 className="font-semibold mb-2">Beschrijving</h3>
          <p className="opacity-90 text-sm whitespace-pre-line">{exercise.description}</p>
        </div>
      )}

      {exercise.instructions && exercise.instructions.length > 0 && (
        <div className="mt-4 rounded-2xl border border-neutral-800 p-4">
          <h3 className="font-semibold mb-2">Instructies</h3>
          <ul className="list-disc pl-5 space-y-1 text-sm opacity-90">
            {exercise.instructions.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      )}

      <button
        className="mt-6 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700"
        onClick={() => (window.location.href = "/modules/workouts/execute")}
      >
        Start workout
      </button>
    </div>
  );
}

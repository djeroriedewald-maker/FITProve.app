// src/modules/WorkoutModule.tsx
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

/** Types uit de Workout Library manifest/chunks */
type WorkoutManifest = {
  version: string;
  total: number;
  chunks: number;
  chunkSize: number;
  basePath: string; // "./v20250905"
  attribution: {
    wger: { count: number };
    exerciseDB: { count: number };
  };
};

type Media = {
  images?: string[];
  gifs?: string[];
  videos?: string[];
  thumbnail?: string;
};

type Source = {
  vendor: "wger" | "exerciseDB";
  id: string;
  url?: string;
  license: { name: string; url: string; attribution: string };
};

type NormalizedExercise = {
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
  sources: Source[];
  language: "en";
};

const BASE = (import.meta as any).env?.VITE_WORKOUTS_BASE as string | undefined;

/** Kleine helper om JSON te fetchen met error-log */
async function getJSON<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { "cache-control": "no-cache" } });
  if (!res.ok) throw new Error(`HTTP ${res.status} @ ${url}`);
  return (await res.json()) as T;
}

/** Visuele chip */
function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-md border border-zinc-300/70 dark:border-zinc-700 px-2 py-0.5 text-xs text-zinc-700 dark:text-zinc-300">
      {children}
    </span>
  );
}

export default function WorkoutModule() {
  const [exercises, setExercises] = useState<NormalizedExercise[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // URL query state
  const [params, setParams] = useSearchParams();
  const initialQ = params.get("q") ?? "";
  const initialEquip = params.get("equipment") ?? "all";
  const initialHasVideo = params.get("hasVideo") === "1";

  const [q, setQ] = useState(initialQ);
  const [equip, setEquip] = useState<string>(initialEquip);
  const [hasVideo, setHasVideo] = useState<boolean>(initialHasVideo);

  useEffect(() => {
    let mounted = true;

    async function loadAll() {
      try {
        if (!BASE) {
          throw new Error(
            "VITE_WORKOUTS_BASE ontbreekt. Zet deze in .env naar je Supabase public bucket pad."
          );
        }
        // 1) Manifest
        const manifest = await getJSON<WorkoutManifest>(`${BASE}/manifest.json`);

        // 2) Alle chunks ophalen
        const chunkUrls = Array.from({ length: manifest.chunks }, (_, i) =>
          `${BASE}/chunk-${String(i).padStart(3, "0")}.json`
        );

        const all: NormalizedExercise[] = [];
        for (const url of chunkUrls) {
          const part = await getJSON<NormalizedExercise[]>(url);
          all.push(...part);
        }

        if (mounted) setExercises(all);
      } catch (e: any) {
        console.error(e);
        if (mounted) {
          setError(e?.message || "Kon de workout library niet laden.");
          setExercises([]);
        }
      }
    }

    loadAll();
    return () => {
      mounted = false;
    };
  }, []);

  /** Houd URL-query up-to-date (q, equipment, hasVideo) */
  useEffect(() => {
    const next = new URLSearchParams(params);
    q ? next.set("q", q) : next.delete("q");
    equip && equip !== "all" ? next.set("equipment", equip) : next.delete("equipment");
    hasVideo ? next.set("hasVideo", "1") : next.delete("hasVideo");
    setParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, equip, hasVideo]);

  /** Unieke equipmentlijst voor filterdropdown */
  const equipmentOptions = useMemo(() => {
    const set = new Set<string>();
    (exercises ?? []).forEach((x) => x.equipment.forEach((e) => set.add(e)));
    return ["all", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [exercises]);

  /** Client-side filters: zoekterm + equipment + hasVideo */
  const filtered = useMemo(() => {
    const list = exercises ?? [];
    const qnorm = q.trim().toLowerCase();
    return list.filter((x) => {
      const okEquip =
        equip === "all" ? true : x.equipment.some((e) => e === equip);

      const okQ =
        qnorm.length === 0
          ? true
          : x.name.toLowerCase().includes(qnorm) ||
            (x.category ?? "").toLowerCase().includes(qnorm) ||
            x.primaryMuscles.some((m) => m.toLowerCase().includes(qnorm)) ||
            (x.secondaryMuscles ?? []).some((m) =>
              m.toLowerCase().includes(qnorm)
            );

      const okVideo = hasVideo ? (x.media?.videos?.length ?? 0) > 0 : true;

      return okEquip && okQ && okVideo;
    });
  }, [exercises, q, equip, hasVideo]);

  return (
    <div className="px-4 py-4" id="start">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2 className="text-lg font-semibold">Oefeningen</h2>

        <div className="flex gap-2 w-full sm:w-auto flex-wrap">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Zoek oefeningen..."
            className="flex-1 sm:w-64 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-1.5 text-sm"
            aria-label="Zoeken"
          />

          <select
            value={equip}
            onChange={(e) => setEquip(e.target.value)}
            className="text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent px-2 py-1.5"
            aria-label="Filter op materiaal"
          >
            {equipmentOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt === "all" ? "Alle equipment" : opt}
              </option>
            ))}
          </select>

          {/* Checkbox: Alleen met video */}
          <label
            className="inline-flex items-center gap-2 text-sm px-2 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 cursor-pointer select-none"
            title="Toon alleen oefeningen met video"
          >
            <input
              type="checkbox"
              className="accent-orange-500"
              checked={hasVideo}
              onChange={(e) => setHasVideo(e.target.checked)}
              aria-label="Alleen met video"
            />
            Alleen met video
          </label>
        </div>
      </div>

      <ul className="mt-4 space-y-3">
        {/* Skeletons */}
        {exercises === null &&
          Array.from({ length: 6 }).map((_, i) => (
            <li
              key={i}
              className="animate-pulse rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 bg-white/50 dark:bg-zinc-900/50"
            >
              <div className="h-4 w-1/3 bg-zinc-200 dark:bg-zinc-800 rounded" />
              <div className="mt-2 h-3 w-1/4 bg-zinc-200 dark:bg-zinc-800 rounded" />
              <div className="mt-3 flex gap-2">
                <div className="h-5 w-16 bg-zinc-200 dark:bg-zinc-800 rounded" />
                <div className="h-5 w-20 bg-zinc-200 dark:bg-zinc-800 rounded" />
              </div>
            </li>
          ))}

        {/* Error */}
        {exercises !== null && error && (
          <li className="text-sm text-red-600 dark:text-red-400">{error}</li>
        )}

        {/* Results */}
        {exercises !== null &&
          !error &&
          filtered.slice(0, 100).map((ex) => (
            <li
              key={ex.id}
              className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 bg-white/70 dark:bg-zinc-900/60 backdrop-blur"
            >
              <div className="flex items-center gap-3">
                {ex.media?.thumbnail ? (
                  <img
                    src={ex.media.thumbnail}
                    alt=""
                    loading="lazy"
                    className="h-14 w-14 rounded-lg object-cover border border-zinc-200 dark:border-zinc-800"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : null}

                <div className="flex-1">
                  <h3 className="font-medium">{ex.name}</h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                    {ex.primaryMuscles.join(", ")}
                    {ex.category ? ` • ${ex.category}` : ""}
                    {(ex.media?.videos?.length ?? 0) > 0 ? " • 🎥 video" : ""}
                  </p>

                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {ex.equipment.slice(0, 2).map((e) => (
                      <Chip key={e}>{e}</Chip>
                    ))}
                    {ex.secondaryMuscles?.slice(0, 2).map((m) => (
                      <Chip key={m}>{m}</Chip>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  className="text-sm px-3 py-1.5 rounded-lg border border-orange-500/30 text-orange-600 dark:text-orange-400 hover:bg-orange-500/10"
                  onClick={() => {
                    alert(`Start: ${ex.name}`);
                  }}
                >
                  Start
                </button>
              </div>
            </li>
          ))}

        {/* Geen resultaten */}
        {exercises?.length === 0 && !error && (
          <li className="text-sm text-zinc-600 dark:text-zinc-400">
            Geen oefeningen gevonden.
          </li>
        )}

        {/* Filter leverde 0 op */}
        {exercises && filtered.length === 0 && !error && (
          <li className="text-sm text-zinc-600 dark:text-zinc-400">
            Geen resultaten voor je filters.
          </li>
        )}
      </ul>

      {/* Klein voetnootje voor transparantie */}
      <p className="mt-6 text-[11px] text-zinc-500 dark:text-zinc-500">
        Dataset geladen vanaf VITE_WORKOUTS_BASE ({BASE ?? "niet ingesteld"}). We tonen een subset (max 100) voor performance; zoek/filters vernauwen de lijst.
      </p>
    </div>
  );
}

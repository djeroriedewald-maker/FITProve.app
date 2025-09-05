// src/routes/modules/workouts/index.tsx
import { useEffect, useMemo, useState } from "react";
import FilterBar from "@/components/workouts/FilterBar";
import WorkoutCard from "@/components/workouts/WorkoutCard";

/** === Types uit de Workout Library === */
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

export default function WorkoutsIndex() {
  const [tab, setTab] = useState<"library" | "my" | "badges" | "help">("library");
  const [filters, setFilters] = useState<{ q: string; level?: string; equipment?: string }>({ q: "" });

  const [items, setItems] = useState<Exercise[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load manifest + chunks from Supabase
  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        if (!BASE) throw new Error("VITE_WORKOUTS_BASE ontbreekt in .env");
        const manifest = await getJSON<Manifest>(`${BASE}/manifest.json`);
        const urls = Array.from({ length: manifest.chunks }, (_, i) => `${BASE}/chunk-${String(i).padStart(3, "0")}.json`);
        const parts = await Promise.all(urls.map((u) => getJSON<Exercise[]>(u)));
        const all = parts.flat();
        if (mounted) setItems(all);
      } catch (e: any) {
        console.error(e);
        if (mounted) {
          setError(e?.message ?? "Kon de workout library niet laden.");
          setItems([]);
        }
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  // Map dataset -> props voor jouw WorkoutCard
  type CardItem = { id: string; title: string; duration?: number; level?: string; tags?: string[]; thumbnail?: string };
  const list: CardItem[] = useMemo(() => {
    const q = filters.q?.trim().toLowerCase() ?? "";
    const lvl = filters.level && filters.level !== "all" ? filters.level : undefined;
    const eq = filters.equipment && filters.equipment !== "all" ? filters.equipment : undefined;

    return (items ?? [])
      .filter((x) => {
        const okQ =
          !q ||
          x.name.toLowerCase().includes(q) ||
          (x.category ?? "").toLowerCase().includes(q) ||
          x.primaryMuscles.some((m) => m.toLowerCase().includes(q)) ||
          (x.secondaryMuscles ?? []).some((m) => m.toLowerCase().includes(q));
        const okEquip = !eq || x.equipment.includes(eq);
        // Level bestaat niet in dataset; laat filter passeren tenzij jouw FilterBar echt 'level' doorgeeft:
        const okLevel = !lvl || lvl === "all";
        return okQ && okEquip && okLevel;
      })
      .slice(0, 100) // UI performant houden
      .map((x) => ({
        id: x.id,
        title: x.name,
        duration: undefined, // dataset heeft geen vaste duur; later uitbreiden
        level: undefined, // idem
        // Tags: equipment + 1-2 primaire spieren
        tags: Array.from(new Set([...(x.equipment ?? []), ...(x.primaryMuscles ?? []).slice(0, 2)])),
        thumbnail: x.media?.thumbnail,
      }));
  }, [items, filters]);

  return (
    <div className="px-4 py-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-3">Workouts</h1>

      <div className="mb-3 flex gap-2">
        {(["library", "my", "badges", "help"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-2 rounded-xl border ${
              tab === t ? "border-orange-600 bg-orange-600/10" : "border-neutral-700"
            }`}
          >
            {t === "library" ? "Library" : t === "my" ? "My Workouts" : t === "badges" ? "Badges" : "Help"}
          </button>
        ))}
      </div>

      {tab === "library" && (
        <>
          <FilterBar onChange={setFilters} />

          {/* Loading skeletons */}
          {items === null && (
            <div className="mt-4 grid gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse rounded-xl border border-zinc-800 p-4">
                  <div className="h-4 w-1/3 bg-zinc-800 rounded" />
                  <div className="h-3 w-1/4 bg-zinc-800 mt-2 rounded" />
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {items !== null && error && (
            <p className="mt-4 text-sm text-red-500">Fout bij laden: {error}</p>
          )}

          {/* Results */}
          {items !== null && !error && (
            <div className="mt-4 grid gap-3">
              {list.map((w) => (
                <WorkoutCard
                  key={w.id}
                  id={w.id}
                  title={w.title}
                  duration={w.duration}
                  level={w.level}
                  tags={w.tags}
                  thumbnail={w.thumbnail}
                />
              ))}
              {list.length === 0 && <p className="opacity-70">Geen resultaten. Pas je filters aan.</p>}
            </div>
          )}

          <p className="mt-6 text-[11px] opacity-60">
            Dataset geladen vanaf <code>VITE_WORKOUTS_BASE</code> ({BASE ?? "niet ingesteld"}). We tonen maximaal 100
            resultaten voor performance.
          </p>
        </>
      )}

      {tab === "my" && (
        <div className="mt-6 opacity-80">
          <p>Nog geen opgeslagen workouts. (Volgende PR: favorieten + eigen templates.)</p>
        </div>
      )}

      {tab === "badges" && (
        <div className="mt-6 opacity-80">
          <p>Badges-overzicht komt hier. (Volgende PR: badge engine + grid.)</p>
        </div>
      )}

      {tab === "help" && (
        <div className="mt-6 space-y-3">
          <h2 className="text-lg font-semibold">Help</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Start een workout en log per set gewicht/reps/tijd.</li>
            <li>Je voortgang verschijnt in Stats en telt mee voor badges.</li>
            <li>Generator: maak een persoonlijke workout op basis van jouw doelen.</li>
          </ul>
        </div>
      )}
    </div>
  );
}

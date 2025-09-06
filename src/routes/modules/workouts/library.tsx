// src/routes/modules/workouts/library.tsx
import { useEffect, useState } from "react";
import WorkoutCard from "@/components/workouts/WorkoutCard";
import { listWorkouts } from "@/lib/workouts-client";
import type { Workout } from "@/types/workouts";

type Filters = {
  q?: string;
  goal?: string;
  level?: string;
  location?: string;
  equipment?: "with" | "without" | "any";
  duration?: "15" | "30" | "45" | "60" | "90" | "any";
};

const goals = [
  { v: "", l: "Alle doelen" },
  { v: "strength", l: "Kracht" },
  { v: "hypertrophy", l: "Spieropbouw" },
  { v: "fat_loss", l: "Vetverlies" },
  { v: "conditioning", l: "Conditioning" },
  { v: "mobility", l: "Mobiliteit" },
  { v: "endurance", l: "Uithouding" },
  { v: "event", l: "Event" },
];

const levels = [
  { v: "", l: "Alle niveaus" },
  { v: "beginner", l: "Beginner" },
  { v: "intermediate", l: "Gevorderd" },
  { v: "advanced", l: "Advanced" },
];

const equipments = [
  { v: "any", l: "Alle materialen" },
  { v: "with", l: "Met materiaal" },
  { v: "without", l: "Zonder materiaal" },
];

const durations = [
  { v: "any", l: "Alle tijden" },
  { v: "15", l: "15 min" },
  { v: "30", l: "30 min" },
  { v: "45", l: "45 min" },
  { v: "60", l: "60 min" },
  { v: "90", l: "90 min" },
];

export default function WorkoutsLibrary() {
  const [filters, setFilters] = useState<Filters>({ equipment: "any", duration: "any" });
  const [items, setItems] = useState<Workout[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [err, setErr] = useState<string | undefined>();

  useEffect(() => {
    let on = true;
    setLoading(true);
    setErr(undefined);

    listWorkouts({
      q: filters.q,
      goal: filters.goal || undefined,
      level: filters.level || undefined,
      location: filters.location || undefined,
      equipment: filters.equipment !== "any" ? filters.equipment : undefined,
      duration: filters.duration !== "any" ? (filters.duration as any) : undefined,
    })
      .then((data) => on && setItems(data || []))
      .catch((e) => on && setErr(e.message))
      .finally(() => on && setLoading(false));

    return () => { on = false; };
  }, [filters]);

  return (
    <div className="px-4 py-5 max-w-3xl mx-auto">
      <header className="mb-3">
        <h1 className="text-xl font-semibold">Workout Library</h1>
      </header>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input
          className="rounded-xl px-3 py-2 bg-zinc-100 dark:bg-zinc-800 outline-none flex-1 min-w-[160px]"
          placeholder="Zoek workout…"
          value={filters.q ?? ""}
          onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
        />

        <select
          className="rounded-xl px-3 py-2 bg-zinc-100 dark:bg-zinc-800"
          value={filters.goal ?? ""}
          onChange={(e) => setFilters((f) => ({ ...f, goal: e.target.value || undefined }))}
        >
          {goals.map((g) => (
            <option key={g.v} value={g.v}>{g.l}</option>
          ))}
        </select>

        <select
          className="rounded-xl px-3 py-2 bg-zinc-100 dark:bg-zinc-800"
          value={filters.level ?? ""}
          onChange={(e) => setFilters((f) => ({ ...f, level: e.target.value || undefined }))}
        >
          {levels.map((l) => (
            <option key={l.v} value={l.v}>{l.l}</option>
          ))}
        </select>

        <select
          className="rounded-xl px-3 py-2 bg-zinc-100 dark:bg-zinc-800"
          value={filters.equipment ?? "any"}
          onChange={(e) => setFilters((f) => ({ ...f, equipment: e.target.value as any }))}
        >
          {equipments.map((e) => (
            <option key={e.v} value={e.v}>{e.l}</option>
          ))}
        </select>

        <select
          className="rounded-xl px-3 py-2 bg-zinc-100 dark:bg-zinc-800"
          value={filters.duration ?? "any"}
          onChange={(e) => setFilters((f) => ({ ...f, duration: e.target.value as any }))}
        >
          {durations.map((d) => (
            <option key={d.v} value={d.v}>{d.l}</option>
          ))}
        </select>

        <button
          className="rounded-xl px-3 py-2 bg-zinc-100 dark:bg-zinc-800"
          onClick={() => setFilters({ equipment: "any", duration: "any" })}
        >
          Reset
        </button>
      </div>

      {err && <div className="mb-3 text-red-500 text-sm">Error: {String(err)}</div>}

      {loading ? (
        <div className="grid gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
          ))}
        </div>
      ) : items.length ? (
        <div className="grid gap-3">
          {items.map((w) => (
            <WorkoutCard
              key={w.id}
              id={w.id}
              title={w.title}
              duration={w.duration_minutes}
              level={w.level}
              tags={[]}
              thumbnail={undefined}
              // ✅ Programma-detail: /modules/programs/:id
              to={`/modules/programs/${w.id}`}
            />
          ))}
        </div>
      ) : (
        <div className="text-sm text-zinc-500 dark:text-zinc-400">
          Geen workouts gevonden. Pas je filters aan of voeg workouts toe in Supabase (Table Editor → <code>workouts</code>).
        </div>
      )}
    </div>
  );
}

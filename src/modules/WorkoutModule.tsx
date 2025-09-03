import { useEffect, useState } from "react";

type Workout = {
  id: string;
  title: string;
  level: "beginner" | "intermediate" | "advanced";
  durationMin: number;
  focus: "full-body" | "upper" | "lower" | "core" | "conditioning";
};

export default function WorkoutModule() {
  const [items, setItems] = useState<Workout[] | null>(null);
  const [level, setLevel] = useState<Workout["level"] | "all">("all");

  useEffect(() => {
    let mounted = true;
    // let op: we zitten in src/modules → ../data/workouts.json
    import("../data/workouts.json")
      .then((m) => mounted && setItems(m.default as Workout[]))
      .catch((e) => {
        console.error("Failed to load workouts.json", e);
        mounted && setItems([]);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const filtered =
    items?.filter((w) => (level === "all" ? true : w.level === level)) ?? [];

  return (
    <div className="px-4 py-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Snel starten</h2>
        <select
          value={level}
          onChange={(e) => setLevel(e.target.value as any)}
          className="text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent px-2 py-1"
          aria-label="Filter op niveau"
        >
          <option value="all">Alle niveaus</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </div>

      <ul className="mt-3 space-y-2">
        {items === null &&
          Array.from({ length: 4 }).map((_, i) => (
            <li
              key={i}
              className="animate-pulse rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 bg-white/50 dark:bg-zinc-900/50"
            >
              <div className="h-4 w-1/3 bg-zinc-200 dark:bg-zinc-800 rounded" />
              <div className="mt-2 h-3 w-1/4 bg-zinc-200 dark:bg-zinc-800 rounded" />
            </li>
          ))}

        {items !== null &&
          filtered.map((w) => (
            <li
              key={w.id}
              className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 bg-white/70 dark:bg-zinc-900/60 backdrop-blur"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="font-medium">{w.title}</h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">
                    {w.level} • {w.focus} • {w.durationMin} min
                  </p>
                </div>
                <button
                  type="button"
                  className="text-sm px-3 py-1.5 rounded-lg border border-orange-500/30 text-orange-600 dark:text-orange-400 hover:bg-orange-500/10"
                >
                  Start
                </button>
              </div>
            </li>
          ))}

        {items?.length === 0 && (
          <li className="text-sm text-zinc-600 dark:text-zinc-400">
            Nog geen workouts beschikbaar.
          </li>
        )}
      </ul>
    </div>
  );
}

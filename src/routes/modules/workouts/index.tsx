import { useMemo, useState } from "react";
import FilterBar from "@/components/workouts/FilterBar";
import WorkoutCard from "@/components/workouts/WorkoutCard";

type Item = { id: string; title: string; duration?: number; level?: any; tags?: string[] };

const DUMMY: Item[] = [
  { id: "w1", title: "Full Body Beginner", duration: 30, level: "beginner", tags: ["bodyweight"] },
  { id: "w2", title: "Hyrox Prep – Engine", duration: 45, level: "intermediate", tags: ["carry", "row"] },
  { id: "w3", title: "Strength – Lower Focus", duration: 50, level: "advanced", tags: ["barbell"] },
];

export default function WorkoutsIndex() {
  const [tab, setTab] = useState<"library" | "my" | "badges" | "help">("library");
  const [filters, setFilters] = useState<{ q: string; level?: string; equipment?: string }>({ q: "" });

  const list = useMemo(() => {
    return DUMMY.filter((i) => {
      if (filters.q && !i.title.toLowerCase().includes(filters.q.toLowerCase())) return false;
      if (filters.level && i.level !== filters.level) return false;
      if (filters.equipment && !(i.tags ?? []).includes(filters.equipment)) return false;
      return true;
    });
  }, [filters]);

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
          <div className="mt-4 grid gap-3">
            {list.map((w) => (
              <WorkoutCard
                key={w.id}
                id={w.id}
                title={w.title}
                duration={w.duration}
                level={w.level}
                tags={w.tags}
              />
            ))}
            {list.length === 0 && <p className="opacity-70">Geen resultaten. Pas je filters aan.</p>}
          </div>
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

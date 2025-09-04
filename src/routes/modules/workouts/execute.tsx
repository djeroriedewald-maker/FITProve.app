import { useState } from "react";
import SetLogger, { SetEntry } from "@/components/workouts/SetLogger";

type LoggedSet = SetEntry & { id: string; exercise: string; set_index: number };

export default function ExecuteWorkout() {
  const [sets, setSets] = useState<LoggedSet[]>([]);
  const [exercise, setExercise] = useState("Bodyweight Squat");
  const [idx, setIdx] = useState(1);

  function addSet(entry: SetEntry) {
    setSets((s) => [...s, { ...entry, id: crypto.randomUUID(), exercise, set_index: idx }]);
    setIdx((n) => n + 1);
  }

  return (
    <div className="px-4 py-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold">Workout bezig…</h1>
      <p className="opacity-80">Log je sets. (Volgende PR: persist naar Supabase.)</p>

      <div className="mt-4">
        <label className="block text-sm mb-1">Oefening</label>
        <input
          value={exercise}
          onChange={(e) => setExercise(e.target.value)}
          className="w-full rounded-xl px-3 py-2 bg-neutral-900 border border-neutral-700"
        />
      </div>

      <div className="mt-3">
        <SetLogger onAdd={addSet} />
      </div>

      <div className="mt-6">
        <h2 className="font-semibold mb-2">Gelogde sets</h2>
        <ul className="space-y-2">
          {sets.map((s) => (
            <li key={s.id} className="rounded-xl border border-neutral-800 p-3">
              <div className="text-sm opacity-80">#{s.set_index} — {s.exercise}</div>
              <div className="text-sm">
                {s.weight_kg ? `${s.weight_kg}kg • ` : ""}{s.reps ? `${s.reps} reps • ` : ""}
                {s.time_sec ? `${s.time_sec}s • ` : ""}{s.rpe ? `RPE ${s.rpe}` : ""}
              </div>
            </li>
          ))}
          {sets.length === 0 && <li className="opacity-70">Nog geen sets gelogd.</li>}
        </ul>
      </div>

      <div className="mt-6 flex gap-2">
        <button className="px-4 py-2 rounded-xl border border-neutral-700">Pauze</button>
        <button className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700">Afronden</button>
      </div>
    </div>
  );
}

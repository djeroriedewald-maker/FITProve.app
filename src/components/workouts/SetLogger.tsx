import { useState } from "react";

export type SetEntry = {
  weight_kg?: number | null;
  reps?: number | null;
  time_sec?: number | null;
  rpe?: number | null;
  notes?: string | null;
};

type Props = {
  onAdd: (entry: SetEntry) => void;
};

export default function SetLogger({ onAdd }: Props) {
  const [weight, setWeight] = useState<string>("");
  const [reps, setReps] = useState<string>("");
  const [time, setTime] = useState<string>("");
  const [rpe, setRpe] = useState<string>("");

  return (
    <div className="rounded-2xl border border-neutral-800 p-3">
      <div className="grid grid-cols-4 gap-2">
        <input
          inputMode="decimal"
          placeholder="kg"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          className="rounded-xl px-3 py-2 bg-neutral-900 border border-neutral-700"
        />
        <input
          inputMode="numeric"
          placeholder="reps"
          value={reps}
          onChange={(e) => setReps(e.target.value)}
          className="rounded-xl px-3 py-2 bg-neutral-900 border border-neutral-700"
        />
        <input
          inputMode="numeric"
          placeholder="tijd (s)"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="rounded-xl px-3 py-2 bg-neutral-900 border border-neutral-700"
        />
        <input
          inputMode="decimal"
          placeholder="RPE"
          value={rpe}
          onChange={(e) => setRpe(e.target.value)}
          className="rounded-xl px-3 py-2 bg-neutral-900 border border-neutral-700"
        />
      </div>
      <div className="mt-2 flex gap-2">
        <button
          onClick={() =>
            onAdd({
              weight_kg: weight ? parseFloat(weight) : null,
              reps: reps ? parseInt(reps) : null,
              time_sec: time ? parseInt(time) : null,
              rpe: rpe ? parseFloat(rpe) : null,
            })
          }
          className="px-3 py-2 rounded-xl bg-orange-600 hover:bg-orange-700"
        >
          + Voeg set toe
        </button>
        <button
          onClick={() => {
            setWeight(""); setReps(""); setTime(""); setRpe("");
          }}
          className="px-3 py-2 rounded-xl border border-neutral-700"
        >
          Reset
        </button>
      </div>
    </div>
  );
}

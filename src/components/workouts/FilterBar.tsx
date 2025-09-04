import { useState } from "react";

type Props = {
  onChange: (v: { q: string; level?: string; equipment?: string }) => void;
};

export default function FilterBar({ onChange }: Props) {
  const [q, setQ] = useState("");
  const [level, setLevel] = useState<string>("");
  const [equipment, setEquipment] = useState<string>("");

  return (
    <div className="sticky top-0 z-10 backdrop-blur bg-black/40 p-3 rounded-2xl border border-neutral-800">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            onChange({ q: e.target.value, level, equipment });
          }}
          placeholder="Zoek workouts…"
          className="w-full rounded-xl px-3 py-2 bg-neutral-900 border border-neutral-700"
        />
        <select
          value={level}
          onChange={(e) => {
            setLevel(e.target.value);
            onChange({ q, level: e.target.value, equipment });
          }}
          className="w-full rounded-xl px-3 py-2 bg-neutral-900 border border-neutral-700"
        >
          <option value="">Alle niveaus</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
        <select
          value={equipment}
          onChange={(e) => {
            setEquipment(e.target.value);
            onChange({ q, level, equipment: e.target.value });
          }}
          className="w-full rounded-xl px-3 py-2 bg-neutral-900 border border-neutral-700"
        >
          <option value="">Alle equipment</option>
          <option value="bodyweight">Bodyweight</option>
          <option value="dumbbell">Dumbbell</option>
          <option value="kettlebell">Kettlebell</option>
          <option value="barbell">Barbell</option>
        </select>
      </div>
    </div>
  );
}

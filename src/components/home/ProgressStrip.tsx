import React from "react";

type Item = { id: string; label: string; value: string };
const ITEMS: Item[] = [
  { id: "p1", label: "This week", value: "3 workouts" },
  { id: "p2", label: "Run total", value: "22.4 km" },
  { id: "p3", label: "Avg HR", value: "142 bpm" },
];

export default function ProgressStrip() {
  return (
    <div className="grid grid-cols-3 gap-3 rounded-xl border border-zinc-200/60 bg-white/80 p-3 text-sm shadow-sm dark:border-zinc-800/60 dark:bg-zinc-900/70">
      {ITEMS.map((i) => (
        <div key={i.id} className="min-w-0">
          <p className="truncate text-zinc-500 dark:text-zinc-400">{i.label}</p>
          <p className="truncate font-semibold text-zinc-900 dark:text-zinc-50">{i.value}</p>
        </div>
      ))}
    </div>
  );
}

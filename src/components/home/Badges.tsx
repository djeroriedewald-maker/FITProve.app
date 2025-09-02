import React from "react";

type Badge = { id: string; name: string; earned: boolean };
const BADGES: Badge[] = [
  { id: "b1", name: "First Workout", earned: true },
  { id: "b2", name: "Hydration Streak", earned: false },
  { id: "b3", name: "5K Run", earned: true },
  { id: "b4", name: "Consistency", earned: false },
];

export default function Badges() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {BADGES.map((b) => (
        <div
          key={b.id}
          className={`rounded-xl border p-3 text-center shadow-sm ${
            b.earned
              ? "border-orange-300/60 bg-orange-50 dark:border-orange-500/40 dark:bg-orange-500/10"
              : "border-zinc-200/60 bg-white/80 opacity-60 dark:border-zinc-800/60 dark:bg-zinc-900/70"
          }`}
        >
          <div className={`mx-auto mb-1 h-8 w-8 rounded-full ${b.earned ? "bg-orange-500/80" : "bg-zinc-400/40"}`} />
          <p className="text-xs font-medium">{b.name}</p>
        </div>
      ))}
    </div>
  );
}

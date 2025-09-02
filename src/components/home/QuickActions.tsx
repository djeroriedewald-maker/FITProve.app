import React from "react";
import { Dumbbell, Droplet, Footprints, StretchHorizontal } from "lucide-react";

const actions = [
  { label: "Start workout", icon: <Dumbbell className="h-5 w-5" /> },
  { label: "Log water", icon: <Droplet className="h-5 w-5" /> },
  { label: "Log run", icon: <Footprints className="h-5 w-5" /> },
  { label: "Stretch", icon: <StretchHorizontal className="h-5 w-5" /> },
];

export default function QuickActions() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {actions.map((a) => (
        <button
          key={a.label}
          className="rounded-xl border border-zinc-200/60 bg-white/80 p-3 text-sm shadow-sm transition-colors hover:bg-zinc-50 dark:border-zinc-800/60 dark:bg-zinc-900/70 dark:hover:bg-zinc-900/60"
        >
          <div className="mb-1 text-orange-600 dark:text-orange-400">{a.icon}</div>
          <div className="text-left text-zinc-800 dark:text-zinc-100">{a.label}</div>
        </button>
      ))}
    </div>
  );
}

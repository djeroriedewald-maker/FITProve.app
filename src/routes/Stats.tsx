// src/routes/Stats.tsx
import React from "react";
import {
  Flame,
  Footprints,
  Timer,
  HeartPulse,
  Droplet,
  Moon,
  Dumbbell,
  Gauge,
  TrendingUp,
  Target,
} from "lucide-react";

type Kpi = {
  id: string;
  title: string;
  value: string | number;
  icon: React.ReactNode;
  group?: "today" | "week" | "month";
};

const ALL_KPIS: Kpi[] = [
  { id: "k1", title: "Calories", value: "450 kcal", icon: <Flame className="h-5 w-5" />, group: "today" },
  { id: "k2", title: "Steps", value: "12,340", icon: <Footprints className="h-5 w-5" />, group: "today" },
  { id: "k3", title: "Workout time", value: "62 min", icon: <Timer className="h-5 w-5" />, group: "today" },
  { id: "k4", title: "Heart rate (avg)", value: "142 bpm", icon: <HeartPulse className="h-5 w-5" />, group: "today" },
  { id: "k5", title: "Water", value: "2.1 L", icon: <Droplet className="h-5 w-5" />, group: "today" },
  { id: "k6", title: "Sleep", value: "7 h 20 m", icon: <Moon className="h-5 w-5" />, group: "today" },

  { id: "k7", title: "Workouts (week)", value: 5, icon: <Dumbbell className="h-5 w-5" />, group: "week" },
  { id: "k8", title: "Run distance (week)", value: "24.8 km", icon: <TrendingUp className="h-5 w-5" />, group: "week" },
  { id: "k9", title: "Avg pace (week)", value: "5:18 /km", icon: <Gauge className="h-5 w-5" />, group: "week" },
  { id: "k10", title: "Strength sessions", value: 2, icon: <Target className="h-5 w-5" />, group: "week" },

  { id: "k11", title: "Workouts (month)", value: 18, icon: <Dumbbell className="h-5 w-5" />, group: "month" },
  { id: "k12", title: "Run distance (month)", value: "102 km", icon: <TrendingUp className="h-5 w-5" />, group: "month" },
  { id: "k13", title: "Avg HR (month)", value: "139 bpm", icon: <HeartPulse className="h-5 w-5" />, group: "month" },
  { id: "k14", title: "Sleep avg (month)", value: "7 h 05 m", icon: <Moon className="h-5 w-5" />, group: "month" },
];

const FILTERS = [
  { id: "today", label: "Today" as const },
  { id: "week", label: "Week" as const },
  { id: "month", label: "Month" as const },
  { id: "all", label: "All" as const },
];

export default function Stats() {
  const [filter, setFilter] = React.useState<"today" | "week" | "month" | "all">("all");

  const items =
    filter === "all" ? ALL_KPIS : ALL_KPIS.filter((k) => (k.group ?? "today") === filter);

  return (
    <main className="mx-auto w-full max-w-screen-md px-4 py-6 sm:py-8">
      <header className="mb-4 sm:mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Stats
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Full KPI overview. Tap a filter to focus on today, this week, or this month.
        </p>
      </header>

      {/* Simple filter pills */}
      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const active = filter === f.id;
          return (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
                active
                  ? "bg-orange-600 text-white dark:bg-orange-500"
                  : "border border-zinc-300/60 bg-white/80 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700/60 dark:bg-zinc-900/70 dark:text-zinc-200 dark:hover:bg-zinc-900"
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* KPI grid – compacte stijl zoals op Home */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {items.map((k) => (
          <div
            key={k.id}
            className="rounded-xl border border-zinc-200/60 bg-white/80 p-3 shadow-sm 
                       dark:border-zinc-800/60 dark:bg-zinc-900/70"
          >
            <div className="mb-1 text-lg text-orange-600 dark:text-orange-400">{k.icon}</div>
            <div className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {k.title}
            </div>
            <div className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
              {k.value}
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}

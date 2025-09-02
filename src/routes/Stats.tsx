import React from "react";

type Stat = {
  id: string;
  label: string;
  value: string | number;
};

const STATS: Stat[] = [
  { id: "calories", label: "Calories", value: "450 kcal" },
  { id: "workout", label: "Workout time", value: "45 min" },
  { id: "heartrate", label: "Heart rate", value: "145 bpm" },
  { id: "strength", label: "Strength", value: "5x5" },
];

export default function Stats() {
  return (
    <main className="mx-auto w-full max-w-screen-md px-4 py-6 sm:py-8">
      <header className="mb-4 sm:mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Stats
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Overview of your recent training performance.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        {STATS.map((stat) => (
          <div
            key={stat.id}
            className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
          >
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {stat.label}
            </p>
            <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              {stat.value}
            </p>
          </div>
        ))}
      </section>
    </main>
  );
}

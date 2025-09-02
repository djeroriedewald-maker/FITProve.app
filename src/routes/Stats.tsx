import { Dumbbell, Flame, HeartPulse, Timer } from "lucide-react";

type Tile = {
  id: string;
  label: string;
  value: string;
  icon: any;
  note?: string;
};

const TILES: Tile[] = [
  { id: "t1", label: "Calories", value: "450 kcal", icon: Flame, note: "45%" },
  { id: "t2", label: "Workout time", value: "45 min", icon: Timer, note: "60%" },
  { id: "t3", label: "Heart rate", value: "145 bpm", icon: HeartPulse, note: "72%" },
  { id: "t4", label: "Strength", value: "5 x 5", icon: Dumbbell, note: "80%" },
];

export default function Stats() {
  return (
    <main className="mx-auto w-full max-w-screen-md px-4 py-6 sm:py-8">
      <header className="mb-4 sm:mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Stats
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Quick overview of your latest workout metrics.
        </p>
      </header>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {TILES.map((t) => (
          <div
            key={t.id}
            className="rounded-2xl border border-black/5 dark:border-white/5 bg-white dark:bg-zinc-900 p-3 sm:p-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-500 dark:text-zinc-400">{t.label}</span>
              <t.icon className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
            </div>
            <div className="mt-2 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              {t.value}
            </div>
            {t.note && (
              <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{t.note}</div>
            )}
          </div>
        ))}
      </section>
    </main>
  );
}

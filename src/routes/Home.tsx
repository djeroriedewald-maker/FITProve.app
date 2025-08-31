import React from "react";
import AppShell from "../layout/AppShell";
import KpiCard from "../components/ui/KpiCard";

export default function Home() {
  // mock data – later replace with API / context
  const kpis = [
    { title: "Calories", value: 450, unit: "kcal", progress: 45, icon: <span>🔥</span> },
    { title: "Steps", value: 10250, progress: 85, icon: <span>🥾</span> },
    { title: "Workout time", value: 45, unit: "min", progress: 60, icon: <span>⏱️</span> },
    { title: "Heart rate", value: 145, unit: "bpm", progress: 72, icon: <span>❤️</span> },
    { title: "Water", value: 1.8, unit: "L", progress: 60, icon: <span>💧</span> },
    { title: "Sleep", value: 7.2, unit: "h", progress: 90, icon: <span>🌙</span> },
    { title: "Recovery", value: 82, unit: "%", progress: 82, icon: <span>🧘</span> },
  ];

  return (
    <AppShell>
      <section className="mb-6">
        <h2 className="text-2xl font-semibold">Home</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Welcome to FITProve. Use the bottom navigation to explore the app.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {kpis.map((k) => (
          <KpiCard
            key={k.title}
            title={k.title}
            value={k.value}
            unit={k.unit}
            progress={k.progress}
            icon={k.icon}
          />
        ))}
      </section>
    </AppShell>
  );
}
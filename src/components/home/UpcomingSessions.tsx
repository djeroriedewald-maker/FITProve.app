import React from "react";

type Session = {
  id: string;
  title: string;
  when: string; // bijv. "Today 19:00"
  place?: string;
};

const MOCK: Session[] = [
  { id: "s1", title: "Bootcamp – City Park", when: "Today 19:00", place: "Almere" },
  { id: "s2", title: "Hyrox Prep – Intervals", when: "Thu 18:30", place: "VitaLife Center" },
  { id: "s3", title: "Recovery Mobility", when: "Sat 10:00" },
];

export default function UpcomingSessions() {
  return (
    <ul className="divide-y divide-zinc-200/60 rounded-xl border border-zinc-200/60 bg-white/80 shadow-sm dark:divide-zinc-800/60 dark:border-zinc-800/60 dark:bg-zinc-900/70">
      {MOCK.map((s) => (
        <li key={s.id} className="flex items-center justify-between px-4 py-3">
          <div>
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{s.title}</p>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              {s.when} {s.place ? `• ${s.place}` : ""}
            </p>
          </div>
          <button className="rounded-lg border border-zinc-300/60 px-3 py-1 text-sm hover:bg-zinc-100 dark:border-zinc-700/60 dark:hover:bg-zinc-800">
            Details
          </button>
        </li>
      ))}
    </ul>
  );
}

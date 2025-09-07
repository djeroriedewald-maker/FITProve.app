// src/routes/Home.tsx
import React from "react";
import { Link } from "react-router-dom";
import SectionHeader from "../components/home/SectionHeader";
import QuickActions from "../components/home/QuickActions";
import ProgressStrip from "../components/home/ProgressStrip";
import UpcomingSessions from "../components/home/UpcomingSessions";
import Badges from "../components/home/Badges";
import NewsTeaser from "../components/home/NewsTeaser";

export default function Home() {
  const envHero = (import.meta.env.VITE_HERO_URL as string) || "";
  const DEFAULT_REMOTE = "https://fitprove.app/images/modules/hero.webp";
  const base = (import.meta.env.BASE_URL as string) || "/";
  const LOCAL_PRIMARY = `${base}images/hero.webp`;
  const REMOTE_FALLBACK = envHero || DEFAULT_REMOTE;
  const PLACEHOLDER = `${base}images/hero.svg`;

  // KPI data (mock)
  const kpis = [
    { title: "Calories", value: 450, unit: "kcal", icon: <span>🔥</span> },
    { title: "Steps", value: 10250, icon: <span>🥾</span> },
    { title: "Workout time", value: 45, unit: "min", icon: <span>⏱️</span> },
    { title: "Heart rate", value: 145, unit: "bpm", icon: <span>❤️</span> },
    { title: "Water", value: 1.8, unit: "L", icon: <span>💧</span> },
    { title: "Sleep", value: 7.2, unit: "h", icon: <span>🌙</span> },
  ];

  // Alleen de eerste 4 tonen op Home
  const visibleKpis = kpis.slice(0, 4);

  return (
    <>
      {/* HERO IMAGE */}
      <figure className="mb-6">
        <img
          src={LOCAL_PRIMARY}
          alt="FITProve hero"
          loading="eager"
          fetchPriority="high"
          decoding="async"
          className="w-full h-auto select-none"
          sizes="100vw"
          onError={(e) => {
            const img = e.currentTarget as HTMLImageElement;
            if (img.src === REMOTE_FALLBACK || img.src.endsWith("hero.svg")) {
              img.src = PLACEHOLDER;
            } else {
              img.src = REMOTE_FALLBACK;
            }
          }}
        />
      </figure>

      {/* QUICK ACTIONS */}
      <div className="mb-6">
        <SectionHeader title="Quick actions" />
        <QuickActions />
      </div>

      {/* PROGRESS SUMMARY */}
      <div className="mb-6">
        <SectionHeader title="Progress summary" />
        <ProgressStrip />
      </div>

      {/* KPI OVERVIEW (compact, 2 cols, max 4) */}
      <div className="mb-6">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Today</h3>
          <Link
            to="/stats"
            className="inline-flex items-center gap-1 text-sm text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
          >
            See all →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {visibleKpis.map((k) => (
            <div
              key={k.title}
              className="rounded-xl border border-zinc-200/60 bg-white/80 p-3 shadow-sm 
                         dark:border-zinc-800/60 dark:bg-zinc-900/70"
            >
              <div className="mb-1 text-lg">{k.icon}</div>
              <div className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {k.title}
              </div>
              <div className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
                {k.value}{k.unit ? ` ${k.unit}` : ""}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* UPCOMING SESSIONS */}
      <div className="mb-6">
        <SectionHeader title="Upcoming sessions" actionLabel="View all" />
        <UpcomingSessions />
      </div>

      {/* BADGES */}
      <div className="mb-6">
        <SectionHeader title="Badges" actionLabel="All badges" />
        <Badges />
      </div>

      {/* NEWS TEASER */}
      <div className="mb-12">
        <SectionHeader title="News" actionLabel="See all" />
        <NewsTeaser />
      </div>
    </>
  );
}

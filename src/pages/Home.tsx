import React, { Suspense } from "react";
import { useI18n } from "../i18n";
import { useAuth } from "../store/auth";

import HeroHeader from "../components/home/HeroHeader";
import SmartCoachBanner from "../components/home/SmartCoachBanner";
import KPIGrid from "../components/home/KPIGrid";
import DailyProgress from "../components/home/DailyProgress";
import SmartSuggestions from "../components/home/SmartSuggestions";
import NextUp from "../components/home/NextUp";
import StreaksBadgesTeaser from "../components/home/StreaksBadgesTeaser";
import StreakAnalysis from "../components/home/StreakAnalysis";
import QuickActions from "../components/home/QuickActions";
import FloatingCoach from "../components/common/FloatingCoach";

export default function Home() {
  const { t } = useI18n();
  const { user } = useAuth();

  const sections = [
    SmartCoachBanner, // AI Coach banner – hoog voor activatie
    KPIGrid,
    DailyProgress,
    SmartSuggestions,
    NextUp,
    StreaksBadgesTeaser,
    StreakAnalysis,   // nieuwe streak analyse
    QuickActions      // modals als laatste
  ];

  return (
    <div className="container mx-auto px-4 py-5 space-y-4">
      <HeroHeader />

      {sections.map((Cmp, i) => (
        <Suspense key={i} fallback={<section className="card card-pad">Loading…</section>}>
          <Cmp />
        </Suspense>
      ))}

      <FloatingCoach />
    </div>
  );
}

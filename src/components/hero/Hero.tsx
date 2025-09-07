import React from "react";
import { Link } from "react-router-dom";

/**
 * Home Hero section
 * - Full-width, responsive
 * - Background via external WebP (provided URL)
 * - Contrast overlay for light/dark
 * - Accessible headings & buttons
 */
export default function Hero() {
  const envHero = (import.meta.env.VITE_HERO_URL as string) || "";
  const DEFAULT_REMOTE = "https://fitprove.app/images/modules/hero.webp";
  const base = (import.meta.env.BASE_URL as string) || "/";
  const LOCAL_FALLBACK = `${base}images/hero.webp`;
  const PLACEHOLDER = `${base}images/hero.svg`;

  return (
    <section
      aria-label="Intro"
      className="relative w-full min-h-[68vh] md:min-h-[78vh] flex items-center justify-center text-center overflow-hidden"
    >
      {/* Background image element for robust fallback */}
      <img
        src={envHero || DEFAULT_REMOTE}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover"
        onError={(e) => {
          const img = e.currentTarget as HTMLImageElement;
          if (img.src.endsWith("hero.svg")) return; // stop loop
          if (!img.src.includes("/images/hero.webp")) img.src = LOCAL_FALLBACK;
          else img.src = PLACEHOLDER;
        }}
      />

      {/* Overlay ensures legible text in light/dark */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/10 dark:from-black/70 dark:to-black/20" />

      {/* Content */}
      <div className="relative z-10 px-4 max-w-2xl text-white">
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight mb-4">
          Train slimmer. Bewijs je progress.
        </h1>
        <p
          id="hero-subtitle"
          className="text-base sm:text-lg text-white/90 mb-6"
        >
          AI-gedreven workouts, altijd bij de hand.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            aria-describedby="hero-subtitle"
            to="/coach"
            className="px-6 py-3 rounded-2xl bg-orange-500 text-white font-medium shadow hover:bg-orange-600 transition focus:outline-none focus:ring-2 focus:ring-white/60"
          >
            Start je eerste workout
          </Link>
          <Link
            to="/news"
            className="px-6 py-3 rounded-2xl border border-white/80 text-white font-medium hover:bg-white/10 transition focus:outline-none focus:ring-2 focus:ring-white/60"
          >
            Bekijk features
          </Link>
        </div>
      </div>
    </section>
  );
}

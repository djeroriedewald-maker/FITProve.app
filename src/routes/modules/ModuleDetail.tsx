// src/routes/modules/ModuleDetail.tsx
import { useParams, Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import type { AppModule } from "../../types/module";

// Nieuwe workouts-module (tabs + filter)
import WorkoutsIndex from "./workouts";

// Back-compat voor eventuele oude 'workout' (enkelvoud)
import WorkoutModule from "../../modules/WorkoutModule";

export default function ModuleDetail() {
  const { slug } = useParams<{ slug: string }>();

  // ⚡️ Short-circuit: direct de nieuwe module tonen
  if (slug === "workouts") {
    return <WorkoutsIndex />;
  }

  const [mods, setMods] = useState<AppModule[] | null>(null);

  useEffect(() => {
    let mounted = true;
    import("../../data/modules.json")
      .then((m) => {
        if (mounted) setMods(m.default as AppModule[]);
      })
      .catch((e) => {
        console.error("Failed to load modules.json", e);
        if (mounted) setMods([]);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const mod = useMemo(
    () => (mods ?? []).find((m) => m.slug === slug),
    [mods, slug]
  );

  if (mods === null) {
    return (
      <section className="px-0 pb-8">
        <div className="relative">
          <div className="h-48 md:h-64 w-full bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
        </div>
        <div className="px-4 mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="h-6 w-1/2 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
            <div className="h-4 w-2/3 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
            <div className="h-24 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
          </div>
          <div className="h-48 bg-zinc-200 dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-800 animate-pulse" />
        </div>
      </section>
    );
  }

  if (!mod) {
    return (
      <section className="px-4 py-4 md:py-6">
        <h1 className="text-xl font-bold">Module niet gevonden</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Controleer de URL of ga terug naar het overzicht.
        </p>
        <Link
          to="/modules"
          className="inline-block mt-4 text-sm rounded-lg px-3 py-2 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800"
        >
          ← Terug naar modules
        </Link>
      </section>
    );
  }

  // Helper: choose local/remote primary with fallback
  const pick = (url?: string) => {
    if (!url) return { primary: undefined as string | undefined, fallback: undefined as string | undefined };
    const name = url.split("/").pop() || url;
    const local = `/images/modules/${name}`;
    const remote = url.startsWith("http") ? url : `https://fitprove.app/images/modules/${name}`;
    const isDev = import.meta.env.DEV;
    return { primary: isDev ? local : remote, fallback: isDev ? remote : local };
  };

  return (
    <section className="px-0 pb-8">
      {/* Hero */}
      <div className="relative">
        {(() => {
          const { primary, fallback } = pick(mod.hero);
          return (
            <img
              src={primary}
              alt={`${mod.title} hero`}
              className="h-48 md:h-64 w-full object-cover"
              loading="lazy"
              decoding="async"
              draggable={false}
              onError={(e) => {
                const img = e.currentTarget as HTMLImageElement;
                if (fallback && img.src !== fallback) img.src = fallback;
                else img.src = "/images/hero.svg";
              }}
            />
          );
        })()}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
        <div className="absolute bottom-3 left-4 right-4">
          <h1 className="text-white text-2xl md:text-3xl font-bold drop-shadow">
            {mod.title}
          </h1>
          <p className="text-white/90 text-sm md:text-base drop-shadow">
            {mod.description}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 mt-4">
        <div className="mb-3">
          <Link
            to="/modules"
            className="inline-block text-sm rounded-lg px-3 py-2 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800"
          >
            ← Terug naar modules
          </Link>
        </div>

        {/* 2-koloms layout (fallback voor overige modules) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/60 backdrop-blur">
            {mod.slug === "workout" ? (
              <WorkoutModule />
            ) : (
              <div className="p-4">
                <h2 className="text-lg font-semibold">Inhoud volgt</h2>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Deze module krijgt binnenkort zijn specifieke componenten en flows.
                </p>
              </div>
            )}
          </div>

          <aside className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 bg-white/70 dark:bg-zinc-900/60 backdrop-blur">
            <h3 className="text-base font-semibold">Over deze module</h3>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              {mod.description}
            </p>
            <div className="mt-4 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
              {(() => {
                const { primary, fallback } = pick(mod.image);
                return (
                  <img
                    src={primary}
                    alt={`${mod.title} visual`}
                    className="w-full h-28 object-cover"
                    loading="lazy"
                    decoding="async"
                    draggable={false}
                    onError={(e) => {
                      const img = e.currentTarget as HTMLImageElement;
                      if (fallback && img.src !== fallback) img.src = fallback;
                      else img.src = "/images/hero.svg";
                    }}
                  />
                );
              })()}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

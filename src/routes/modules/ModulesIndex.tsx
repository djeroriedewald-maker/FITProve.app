// src/routes/modules/ModulesIndex.tsx
import { useEffect, useState } from "react";
import ModuleCard, { ModuleCardSkeleton } from "../../components/modules/ModuleCard";
import type { AppModule } from "../../types/module";

export default function ModulesIndex() {
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

  return (
    <section className="px-4 py-4 md:py-6">
      <header className="mb-4">
        <h1 className="text-xl md:text-2xl font-bold">Modules</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Kies een module om te starten.
        </p>
      </header>

      {/* Altijd 2 kolommen */}
      <ul className="grid grid-cols-2 gap-4">
        {mods === null
          ? Array.from({ length: 6 }).map((_, i) => <ModuleCardSkeleton key={i} />)
          : mods.map((mod) => <ModuleCard key={mod.slug} mod={mod} />)}
      </ul>
    </section>
  );
}

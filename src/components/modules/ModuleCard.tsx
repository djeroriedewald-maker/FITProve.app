import { Link } from "react-router-dom";
import type { AppModule } from "../../types/module";

type Props = { mod: AppModule };

export default function ModuleCard({ mod }: Props) {
  return (
    <li className="group relative">
      <Link
        to={`/modules/${mod.slug}`}
        className={[
          "block rounded-2xl overflow-hidden border border-zinc-200/70 dark:border-zinc-800/70",
          "bg-white/70 dark:bg-zinc-900/60 backdrop-blur transition",
          "hover:shadow-lg group-hover:-translate-y-0.5 focus:outline-none",
          "focus-visible:ring-2 focus-visible:ring-orange-500/70"
        ].join(" ")}
      >
        <div className="aspect-[16/9] w-full overflow-hidden">
          <img
            src={mod.image}
            alt={mod.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            loading="lazy"
          />
        </div>
        <div className="p-4">
          <h3 className="text-base font-semibold">{mod.title}</h3>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {mod.description}
          </p>
          <div className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
            Openen →
          </div>
        </div>
      </Link>
    </li>
  );
}

export function ModuleCardSkeleton() {
  return (
    <li className="rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/50 dark:bg-zinc-900/50 overflow-hidden">
      <div className="animate-pulse">
        <div className="aspect-[16/9] w-full bg-zinc-200 dark:bg-zinc-800" />
        <div className="p-4 space-y-2">
          <div className="h-4 w-1/3 rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-3 w-3/4 rounded bg-zinc-200 dark:bg-zinc-800" />
        </div>
      </div>
    </li>
  );
}

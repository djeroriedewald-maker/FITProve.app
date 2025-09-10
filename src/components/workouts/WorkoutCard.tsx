// src/components/workouts/WorkoutCard.tsx
import { Link } from "react-router-dom";
import { useState, useMemo } from "react";

type Props = {
  id: string;
  title: string;
  duration?: number;
  level?: string;
  tags?: string[];
  thumbnail?: string;
  /** Optioneel: forceer een specifieke link i.p.v. standaard /modules/workouts/:id */
  to?: string;
};

export default function WorkoutCard({
  id,
  title,
  duration,
  level,
  tags = [],
  thumbnail,
  to,
}: Props) {
  const [imgOk, setImgOk] = useState<boolean>(!!thumbnail);

  const meta = useMemo(() => {
    const parts: string[] = [];
    if (level) parts.push(level);
    if (duration) parts.push(`${duration} min`);
    return parts.join(" • ");
  }, [level, duration]);

  const href = to ?? `/modules/programs/${id}`;

  return (
    <Link
      to={href}
      aria-label={meta ? `${title} – ${meta}` : title}
      className={[
        "block rounded-2xl p-4",
        "border transition",
        "bg-white border-zinc-200 text-zinc-900",
        "dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-100",
        "hover:bg-zinc-50 hover:border-zinc-300",
        "dark:hover:bg-zinc-800/80 dark:hover:border-zinc-700",
        "focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500",
        "active:scale-[0.998]",
      ].join(" ")}
    >
      <div className="flex items-center gap-3">
        {imgOk && thumbnail ? (
          <img
            src={thumbnail}
            alt={title}
            loading="lazy"
            decoding="async"
            className="h-16 w-16 rounded-lg object-cover border border-zinc-200 dark:border-zinc-800 flex-shrink-0"
            onError={() => setImgOk(false)}
          />
        ) : (
          <div className="h-16 w-16 rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 flex items-center justify-center text-[11px] text-zinc-500 dark:text-zinc-400 flex-shrink-0">
            Geen foto
          </div>
        )}

        <div className="min-w-0 flex-1">
          <h3 className="font-semibold truncate">{title}</h3>

          {meta && (
            <p className="mt-0.5 text-xs text-zinc-600 dark:text-zinc-400">
              {meta}
            </p>
          )}

          {tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {tags.slice(0, 4).map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center rounded-full border px-2 py-0.5 text-[11px]
                             border-zinc-300 text-zinc-700
                             dark:border-zinc-700 dark:text-zinc-300"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

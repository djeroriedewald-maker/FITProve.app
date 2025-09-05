// src/components/workouts/WorkoutCard.tsx
import { Link } from "react-router-dom";

type Props = {
  id: string;
  title: string;
  duration?: number | null;
  level?: "beginner" | "intermediate" | "advanced" | string;
  tags?: string[];
  thumbnail?: string; // NEW
};

export default function WorkoutCard({ id, title, duration, level, tags, thumbnail }: Props) {
  return (
    <Link
      to={`/modules/workouts/${id}`}
      className="block rounded-2xl p-4 border border-neutral-800 hover:bg-neutral-900 transition-shadow shadow-sm"
    >
      <div className="flex items-center gap-4">
        {thumbnail && (
          <img
            src={thumbnail}
            alt=""
            className="h-16 w-16 rounded-lg object-cover border border-neutral-700 flex-shrink-0"
            loading="lazy"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold truncate">{title}</h3>
            {duration ? <span className="text-sm opacity-70">{duration} min</span> : null}
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {level && (
              <span className="text-xs px-2 py-1 rounded-full border border-neutral-700">
                {level}
              </span>
            )}
            {(tags ?? []).slice(0, 3).map((t) => (
              <span key={t} className="text-xs px-2 py-1 rounded-full border border-neutral-700">
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}

import React from "react";
import { Star, Dumbbell } from "lucide-react";

type CoachHeaderProps = {
  name: string;
  rating?: number;
  tagline?: string;
  avatarUrl?: string;
};

export default function CoachHeader({
  name,
  rating = 4.9,
  tagline = "AI coach coming soon.",
  avatarUrl,
}: CoachHeaderProps) {
  return (
    <header className="card mb-4">
      <div className="card-body flex items-center gap-4">
        <div className="size-12 shrink-0 rounded-full bg-neutral-100 ring-1 ring-neutral-200 dark:bg-neutral-800 dark:ring-neutral-700 overflow-hidden">
          {avatarUrl ? (
            // biome-ignore lint/a11y/useAltText: demo
            <img src={avatarUrl} className="size-full object-cover" />
          ) : (
            <div className="grid size-full place-items-center text-neutral-400">
              <Dumbbell className="size-6" />
            </div>
          )}
        </div>
        <div className="min-w-0">
          <div className="text-xs text-neutral-500 dark:text-neutral-400">Coach</div>
          <div className="flex items-center gap-2">
            <h1 className="truncate text-lg font-semibold">{name}</h1>
            <div className="flex items-center gap-1 text-amber-500">
              <Star className="size-4 fill-amber-500" />
              <span className="text-sm">{rating.toFixed(1)}</span>
            </div>
          </div>
          <p className="mt-0.5 text-sm text-neutral-600 dark:text-neutral-300">{tagline}</p>
        </div>
      </div>
    </header>
  );
}

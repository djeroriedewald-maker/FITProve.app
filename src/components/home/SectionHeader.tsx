import React from "react";
import { ChevronRight } from "lucide-react";

type Props = {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  to?: string; // optioneel, als je met Link wilt werken
};

export default function SectionHeader({ title, actionLabel, onAction }: Props) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h3 className="text-lg font-semibold">{title}</h3>
      {actionLabel ? (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-1 text-sm text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
        >
          {actionLabel}
          <ChevronRight className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  );
}

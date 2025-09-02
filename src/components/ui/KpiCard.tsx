import React from "react";
import ProgressCircle from "./ProgressCircle";

type Props = {
  title: string;
  value: number | string;
  unit?: string;
  progress: number;
  icon?: React.ReactNode;
};

export default function KpiCard({ title, value, unit, progress, icon }: Props) {
  return (
    <article
      className={[
        // layout
        "flex items-center justify-between gap-4",
        "rounded-2xl p-4",
        // backgrounds (no white borders in dark)
        "bg-white dark:bg-slate-900",
        // borders removed (transparent in both themes)
        "border border-transparent",
        // soft shadow both themes (no visible white edge)
        "shadow-sm shadow-black/5 dark:shadow-black/20",
      ].join(" ")}
      aria-label={title}
    >
      <div className="flex items-center gap-3">
        <div
          className={[
            "flex h-10 w-10 items-center justify-center",
            "rounded-xl",
            "bg-orange-50 dark:bg-orange-500/10",
          ].join(" ")}
          aria-hidden="true"
        >
          <span className="text-xl leading-none">{icon}</span>
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {title}
          </h3>
          <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {value} {unit}
          </p>
        </div>
      </div>

      <div className="shrink-0">
        <ProgressCircle value={progress} />
      </div>
    </article>
  );
}

import React, { ReactNode } from "react";
// GOED (relatief pad vanaf kpi/)
import ProgressCircle from "../ui/ProgressCircle";


type Props = {
  icon: ReactNode;
  title: string;
  value: string;
  /** 0..100 */
  percent?: number;
  footer?: string | ReactNode;
};

export default function KpiCard({
  icon,
  title,
  value,
  percent,
  footer,
}: Props) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-zinc-200/60 bg-white/80 p-4 shadow-sm dark:border-zinc-800/60 dark:bg-zinc-900/70">
      <div className="shrink-0">{icon}</div>

      <div className="flex-1 min-w-0">
        <div className="text-sm text-zinc-600 dark:text-zinc-400">{title}</div>
        <div className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          {value}
        </div>
        {footer ? (
          <div className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
            {footer}
          </div>
        ) : null}
      </div>

      {typeof percent === "number" ? (
        <ProgressCircle
          value={Math.max(0, Math.min(100, percent))}
          size={52}
          strokeWidth={6}
        />
      ) : null}
    </div>
  );
}

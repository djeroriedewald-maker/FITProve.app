import React from "react";
import ProgressCircle from "./ProgressCircle";

type KpiCardProps = {
  title: string;
  value: string | number;
  unit?: string;
  progress?: number; // 0-100
  icon?: React.ReactNode; // optional decorative icon
};

export default function KpiCard({
  title,
  value,
  unit,
  progress = 0,
  icon,
}: KpiCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 shadow-sm">
      <div className="shrink-0 flex h-10 w-10 items-center justify-center rounded-full bg-orange-50 dark:bg-gray-800 text-orange-600">
        {icon ?? <span className="text-lg">🏷️</span>}
      </div>

      <div className="flex-1">
        <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
        <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          {value}
          {unit ? <span className="ml-1 text-sm font-normal text-gray-500 dark:text-gray-400">{unit}</span> : null}
        </p>
      </div>

      {typeof progress === "number" ? (
        <ProgressCircle value={Math.max(0, Math.min(100, progress))} />
      ) : null}
    </div>
  );
}
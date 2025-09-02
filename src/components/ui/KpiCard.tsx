import React from "react";
import ProgressCircle from "@/components/ui/ProgressCircle";

type KpiCardProps = {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  percent?: number; // 0-100
  footer?: string;
};

export default function KpiCard({
  icon,
  title,
  value,
  percent,
  footer,
}: KpiCardProps) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-start gap-3">
        <div className="mt-1 text-gray-600 dark:text-gray-300">{icon}</div>
        <div>
          <div className="text-sm text-gray-500 dark:text-gray-400">{title}</div>
          <div className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {value}
          </div>
          {footer && (
            <div className="text-xs text-gray-500 dark:text-gray-400">{footer}</div>
          )}
        </div>
      </div>

      {typeof percent === "number" && (
        <div className="ml-4">
          <ProgressCircle value={percent} />
        </div>
      )}
    </div>
  );
}

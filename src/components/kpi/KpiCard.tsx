import { ReactNode } from "react";
import { cn } from "../../lib/cn";

type KpiCardProps = {
  title: string;
  value?: number | string | null;
  unit?: string;
  progress?: number; // 0..100
  icon?: ReactNode;
  loading?: boolean;
  subtle?: boolean; // quieter style (optional)
};

export default function KpiCard({
  title,
  value,
  unit,
  progress,
  icon,
  loading,
  subtle,
}: KpiCardProps) {
  const showProgress = typeof progress === "number" && progress >= 0;
  const safeProgress =
    typeof progress === "number"
      ? Math.max(0, Math.min(100, Math.round(progress)))
      : 0;

  return (
    <section
      className={cn(
        "relative rounded-2xl p-4 shadow-sm border",
        "bg-white/70 dark:bg-gray-800/60 backdrop-blur",
        "border-gray-200 dark:border-gray-700",
        subtle && "bg-transparent border-transparent shadow-none"
      )}
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        {icon ? (
          <div
            aria-hidden
            className="inline-flex items-center justify-center w-9 h-9 rounded-xl
                       bg-gray-100 dark:bg-gray-700"
          >
            {icon}
          </div>
        ) : null}

        <div className="flex-1 min-w-0">
          <h3 className="text-sm text-gray-500 dark:text-gray-400">{title}</h3>

          {loading ? (
            <div className="mt-2 h-6 w-28 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
          ) : (
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {value ?? "—"}
              </span>
              {unit ? (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {unit}
                </span>
              ) : null}
            </div>
          )}
        </div>

        {showProgress ? (
          <ProgressRing value={safeProgress} />
        ) : (
          <span className="sr-only">No progress indicator</span>
        )}
      </div>
    </section>
  );
}

function ProgressRing({ value }: { value: number }) {
  const radius = 18;
  const stroke = 4;
  const c = 2 * Math.PI * radius;
  const offset = c - (value / 100) * c;

  return (
    <div
      role="img"
      aria-label={`Progress ${value}%`}
      className="relative w-10 h-10"
      title={`${value}%`}
    >
      <svg width="40" height="40" className="rotate-[-90deg]">
        <circle
          cx="20"
          cy="20"
          r={radius}
          strokeWidth={stroke}
          className="text-gray-200 dark:text-gray-700"
          stroke="currentColor"
          fill="transparent"
        />
        <circle
          cx="20"
          cy="20"
          r={radius}
          strokeWidth={stroke}
          className="text-orange-500"
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
        />
      </svg>
      <span className="absolute inset-0 grid place-items-center text-xs font-medium text-gray-600 dark:text-gray-300">
        {value}%
      </span>
    </div>
  );
}

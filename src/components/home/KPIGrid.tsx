import React from 'react';
import { useI18n } from '../../i18n';

/** Kleine ring (zonder externe deps) */
function Ring({
  value,
  size = 50,
  stroke = 6,
  label,
}: {
  value: number;
  size?: number;
  stroke?: number;
  label: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c * (1 - Math.min(Math.max(value, 0), 100) / 100);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={label}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="currentColor"
        className="text-neutral-200 dark:text-neutral-800"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        className="text-fit-orange"
        stroke="currentColor"
        strokeWidth={stroke}
        strokeDasharray={c}
        strokeDashoffset={off}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        strokeLinecap="round"
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        className="text-[10px] font-semibold fill-current"
      >
        {Math.round(value)}%
      </text>
    </svg>
  );
}

type Props = {
  /** Laat (in de toekomst) data van buitenaf een laadtoestand aanduiden */
  loading?: boolean;
};

export default function KPIGrid({ loading }: Props) {
  const { t } = useI18n();
  const [isLoading, setIsLoading] = React.useState<boolean>(!!loading);

  // Simpele korte skeleton (voelt sneller aan op mobiel)
  React.useEffect(() => {
    if (loading) return;
    const id = setTimeout(() => setIsLoading(false), 280);
    return () => clearTimeout(id);
  }, [loading]);

  const items = [
    { label: t('metrics.calories'), value: 450, unit: 'kcal', percent: 45 },
    { label: t('metrics.steps'), value: 10250, unit: '', percent: 85 },
    { label: t('metrics.workoutTime'), value: 45, unit: 'min', percent: 60 },
    { label: t('metrics.heartRate'), value: 145, unit: 'bpm', percent: 72 },
  ];

  if (isLoading) {
    return (
      <section aria-busy="true" className="grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <article
            key={i}
            className="card card-pad"
            aria-hidden="true"
            role="presentation"
          >
            <div className="flex items-center justify-between">
              <div className="w-20 h-3 rounded skeleton" />
              <div className="w-[50px] h-[50px] rounded-full skeleton" />
            </div>
            <div className="mt-2 w-16 h-4 rounded skeleton" />
          </article>
        ))}
      </section>
    );
  }

  return (
    <section>
      <div className="grid grid-cols-2 gap-3">
        {items.map((k, i) => (
          <article
            key={String(k.label)}
            className="card card-pad animate-bounceIn"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                  {k.label}
                </p>
                <div className="mt-1 flex items-end gap-1">
                  <p className="text-2xl font-extrabold leading-none">
                    {Number(k.value).toLocaleString()}
                  </p>
                  {k.unit ? (
                    <span className="text-sm text-neutral-600 dark:text-neutral-300">
                      {k.unit}
                    </span>
                  ) : null}
                </div>
              </div>
              <Ring
                value={k.percent}
                size={50}
                stroke={6}
                label={`${k.label} ${k.percent}%`}
              />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

import React from 'react';
import { useI18n } from '../../i18n';

function Ring({
  percent,
  size = 120,
  stroke = 10,
}: {
  percent: number;
  size?: number;
  stroke?: number;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, percent));
  const off = c * (1 - clamped / 100);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={`${percent}%`}
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
        stroke="currentColor"
        className="text-fit-orange transition-[stroke-dashoffset] duration-700 ease-out"
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
        className="font-extrabold text-2xl fill-current"
      >
        {Math.round(clamped)}%
      </text>
    </svg>
  );
}

export default function DailyGoalRing({
  move = 72,
  workout = 56,
  water = 40,
}: {
  move?: number;
  workout?: number;
  water?: number;
}) {
  const { t } = useI18n();
  const avg = Math.round((move + workout + water) / 3);

  return (
    <section className="card card-pad flex items-center gap-4">
      <Ring percent={avg} />
      <div className="flex-1">
        <h2 className="text-lg font-bold">{t('home.goalRing.title')}</h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-300 mt-1">
          {t('home.goalRing.subtitle')}
        </p>
        <div className="grid grid-cols-3 gap-2 mt-3 text-sm">
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-2 text-center">
            <p className="font-semibold">{t('home.daily.moveShort')}</p>
            <p className="text-fit-orange font-bold">{move}%</p>
          </div>
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-2 text-center">
            <p className="font-semibold">{t('home.daily.workoutShort')}</p>
            <p className="text-fit-orange font-bold">{workout}%</p>
          </div>
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-2 text-center">
            <p className="font-semibold">{t('home.daily.waterShort')}</p>
            <p className="text-fit-orange font-bold">{water}%</p>
          </div>
        </div>
      </div>
    </section>
  );
}

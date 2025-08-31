import React from 'react';
import { useI18n } from '../i18n';

function Bar({ percent }: { percent: number }) {
  return (
    <div className="h-2 rounded-full bg-neutral-200 dark:bg-neutral-800">
      <div
        className="h-2 rounded-full bg-fit-orange"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

export default function DailyProgress() {
  const { t } = useI18n();
  const rows = [
    { label: t('home.daily.move'), percent: 72 },
    { label: t('home.daily.workout'), percent: 56 },
    { label: t('home.daily.water'), percent: 40 },
  ];

  return (
    <section className="card card-pad">
      <h2 className="text-lg font-bold">{t('home.dailyProgress')}</h2>
      <div className="mt-3 space-y-3">
        {rows.map((r) => (
          <div key={String(r.label)}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium">{r.label}</span>
              <span className="text-sm text-neutral-600 dark:text-neutral-300">
                {r.percent}%
              </span>
            </div>
            <Bar percent={r.percent} />
          </div>
        ))}
      </div>
    </section>
  );
}

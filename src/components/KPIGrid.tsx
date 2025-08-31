import React from 'react';
import { useI18n } from '../i18n';
import ProgressRing from './ProgressRing';

export default function KPIGrid() {
  const { t } = useI18n();

  const items = [
    { label: t('metrics.calories'), value: 450, unit: 'kcal', percent: 45 },
    { label: t('metrics.steps'), value: 10250, unit: '', percent: 85 },
    { label: t('metrics.workoutTime'), value: 45, unit: 'min', percent: 60 },
    { label: t('metrics.heartRate'), value: 145, unit: 'bpm', percent: 72 },
  ];

  return (
    <section>
      <div className="grid grid-cols-2 gap-3">
        {items.map((k) => (
          <article key={String(k.label)} className="card card-pad">
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
              <ProgressRing
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

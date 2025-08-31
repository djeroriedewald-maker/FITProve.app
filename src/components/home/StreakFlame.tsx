import React from 'react';
import { useI18n } from '../../i18n';

export default function StreakFlame({ streak = 7 }: { streak?: number }) {
  const { t } = useI18n();
  return (
    <section className="card card-pad flex items-center justify-between">
      <div>
        <h2 className="text-lg font-bold">{t('home.streaks.title')}</h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-300">
          {t('home.streaks.subtitle')}
        </p>
      </div>
      <div className="text-fit-orange font-extrabold text-2xl flex items-center gap-2">
        <span className="animate-pulse-flame">🔥</span> {streak}
      </div>
    </section>
  );
}

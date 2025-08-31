import React from 'react';
import { useI18n } from '../../i18n';

export default function StreaksBadgesTeaser() {
  const { t } = useI18n();
  const streak = 7;

  return (
    <section className="card card-pad">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">{t('home.streaks.title')}</h2>
        <div className="text-2xl font-extrabold text-fit-orange">
          {streak}🔥
        </div>
      </div>
      <div className="mt-3 rounded-xl border border-neutral-200 dark:border-neutral-800 p-3 flex items-center justify-between">
        <div>
          <p className="font-semibold">{t('home.badges.teaserTitle')}</p>
          <p className="text-sm text-neutral-600 dark:text-neutral-300">
            {t('home.badges.teaser')}
          </p>
        </div>
        <div
          className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-300 to-fit-orange"
          aria-hidden
        />
      </div>
    </section>
  );
}

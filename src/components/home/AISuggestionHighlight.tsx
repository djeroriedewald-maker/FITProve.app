import React from 'react';
import { useI18n } from '../../i18n';

export default function AISuggestionHighlight() {
  const { t } = useI18n();
  const hour = new Date().getHours();
  const set = hour < 12 ? ['a', 'b', 'c'] : ['d', 'e', 'f'];
  const pick = set[Math.floor(Math.random() * set.length)];

  return (
    <section className="card card-pad bg-gradient-to-br from-orange-50 to-white dark:from-neutral-900 dark:to-neutral-900/60">
      <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
        {t('home.aiTip.title')}
      </p>
      <div className="mt-2 flex items-center justify-between gap-3">
        <p className="font-semibold">{t(`home.suggestions.${pick}`)}</p>
        <a
          href="/workout"
          className="shrink-0 px-3 py-2 rounded-xl bg-black text-white text-sm hover:bg-neutral-800 focus:ring-2 focus:ring-fit-orange"
        >
          {t('actions.startWorkout')}
        </a>
      </div>
    </section>
  );
}

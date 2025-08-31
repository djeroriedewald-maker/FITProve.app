import React from 'react';
import { useI18n } from '../i18n';

export default function SmartSuggestions() {
  const { t } = useI18n();
  const hour = new Date().getHours();

  const suggestions =
    hour < 12
      ? [
          t('home.suggestions.a'),
          t('home.suggestions.b'),
          t('home.suggestions.c'),
        ]
      : [
          t('home.suggestions.d'),
          t('home.suggestions.e'),
          t('home.suggestions.f'),
        ];

  return (
    <section className="card card-pad">
      <h2 className="text-lg font-bold">{t('home.suggestions.title')}</h2>
      <ul className="mt-2 space-y-2">
        {suggestions.slice(0, 3).map((s, i) => (
          <li
            key={i}
            className="px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50"
          >
            {s}
          </li>
        ))}
      </ul>
    </section>
  );
}

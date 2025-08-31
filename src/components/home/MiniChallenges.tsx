import React from 'react';
import { useI18n } from '../../i18n';

export default function MiniChallenges() {
  const { t } = useI18n();
  const items = [
    { id: 'mc1', title: t('home.challenges.mini1') },
    { id: 'mc2', title: t('home.challenges.mini2') },
    { id: 'mc3', title: t('home.challenges.mini3') },
  ];

  return (
    <section className="card card-pad">
      <h2 className="text-lg font-bold">{t('home.challenges.title')}</h2>
      <ul className="mt-2 space-y-2">
        {items.map((it) => (
          <li
            key={it.id}
            className="flex items-center justify-between gap-3 rounded-xl border border-neutral-200 dark:border-neutral-800 p-2"
          >
            <span className="text-sm">{it.title}</span>
            <a
              href="/challenges"
              className="px-3 py-1.5 rounded-xl bg-fit-orange text-white text-sm hover:brightness-95"
            >
              {t('actions.view')}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

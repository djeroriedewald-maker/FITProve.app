import React from 'react';
import { useI18n } from '../../i18n';

export default function SmartBanner() {
  const { t } = useI18n();
  const banners = [
    { id: 'b1', text: t('home.banner.stepsLeft'), tone: 'info' },
    { id: 'b2', text: t('home.banner.newChallenge'), tone: 'cta' },
  ];
  return (
    <div className="space-y-2">
      {banners.map((b) => (
        <div
          key={b.id}
          className={
            'rounded-xl px-3 py-2 text-sm shadow-soft ' +
            (b.tone === 'cta'
              ? 'bg-black text-white'
              : 'bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800')
          }
        >
          {b.text}
        </div>
      ))}
    </div>
  );
}

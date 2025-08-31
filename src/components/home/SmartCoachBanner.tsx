import React from 'react';
import { useI18n } from '../../i18n';

/**
 * SmartCoachBanner
 * - Korte, motiverende tekst + 2 CTA's
 * - CTA 1: snelle 15-min workout
 * - CTA 2: open AI Coach (probeert evt. de zwevende coach te openen via CustomEvent)
 */
export default function SmartCoachBanner() {
  const { t } = useI18n();

  function openCoach(e: React.MouseEvent) {
    e.preventDefault();
    // Probeer de floating coach te openen (als die luistert op dit event).
    try {
      const ev = new CustomEvent('fp:open-coach');
      window.dispatchEvent(ev);
    } catch {}
    // Fallback: navigeer naar /coach
    window.location.assign('/coach');
  }

  return (
    <section className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4 bg-neutral-50/70 dark:bg-neutral-900/50 flex items-center justify-between">
      <div>
        <p className="text-sm font-semibold">{t('home.banner.title')}</p>
        <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-1">
          {t('home.banner.body')}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <a
          href="/workout?quick=15"
          className="px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
        >
          {t('home.banner.quick15')}
        </a>
        <a
          href="/coach"
          onClick={openCoach}
          className="px-3 py-2 rounded-xl bg-fit-orange text-white text-sm hover:opacity-95 animate-heroPulse"
        >
          {t('home.banner.cta')}
        </a>
      </div>
    </section>
  );
}

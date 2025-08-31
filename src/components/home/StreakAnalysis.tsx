import React from 'react';
import { useI18n } from '../../i18n';

type Day = 'hit' | 'miss' | 'skip';

type Props = {
  days?: number; // aantal dagen voor de kop
  pattern?: Day[]; // 14 items bijvoorbeeld
  current?: number; // huidige streak
  longest?: number; // langste streak
  adherencePct?: number; // 0..100
  onQuickStart?: () => void; // klik handler voor quick start
};

export default function StreakAnalysis({
  days = 14,
  pattern = [
    'hit',
    'hit',
    'hit',
    'hit',
    'miss',
    'skip',
    'hit',
    'hit',
    'hit',
    'hit',
    'hit',
    'miss',
    'hit',
    'hit',
  ],
  current = 1,
  longest = 4,
  adherencePct = 57,
  onQuickStart,
}: Props) {
  const { t } = useI18n();

  return (
    <section className="card shadow-soft">
      <header className="card-pad">
        <h3 className="section-title">
          {t('home.streaks.analysis.title', { days })}
        </h3>
        <p className="subtle">
          {t('home.streaks.analysis.lastNDays', { days })}
        </p>
      </header>

      <div className="card-pad pt-0">
        {/* Pattern rij */}
        <div className="grid grid-cols-14 gap-2 mb-4">
          {pattern.slice(0, 14).map((d, i) => {
            const base = 'h-4 rounded-md';
            const cls =
              d === 'hit'
                ? 'bg-green-500/90'
                : d === 'skip'
                ? 'bg-neutral-400 dark:bg-neutral-600'
                : 'bg-neutral-300 dark:bg-neutral-700';
            return (
              <div
                key={i}
                className={`${base} ${cls}`}
                aria-label={`${d} day`}
              />
            );
          })}
        </div>

        {/* Stats rij */}
        <div className="grid grid-cols-3 gap-3">
          <div className="card bg-transparent border-0">
            <div className="card-pad row">
              <div className="col">
                <span className="stat-label">
                  {t('home.streaks.analysis.current')}
                </span>
                <div className="text-xl font-bold text-neutral-900 dark:text-neutral-50">
                  {current}
                </div>
              </div>
              <span className="text-2xl">🔥</span>
            </div>
          </div>

          <div className="card bg-transparent border-0">
            <div className="card-pad row">
              <div className="col">
                <span className="stat-label">
                  {t('home.streaks.analysis.longest')}
                </span>
                <div className="text-xl font-bold text-neutral-900 dark:text-neutral-50">
                  {longest}
                </div>
              </div>
              <span className="text-2xl">🏆</span>
            </div>
          </div>

          <div className="card bg-transparent border-0">
            <div className="card-pad row">
              <div className="col">
                <span className="stat-label">
                  {t('home.streaks.analysis.adherence')}
                </span>
                <div className="text-xl font-bold text-neutral-900 dark:text-neutral-50">
                  {adherencePct}%
                </div>
              </div>
              <span className="text-2xl">📈</span>
            </div>
          </div>
        </div>

        {/* Quick advice + CTA */}
        <div className="mt-4 row">
          <p className="subtle">{t('home.streaks.analysis.keepItUp')}</p>
          <button type="button" className="btn btn-dark" onClick={onQuickStart}>
            {t('home.streaks.analysis.quickStart')}
          </button>
        </div>
      </div>
    </section>
  );
}

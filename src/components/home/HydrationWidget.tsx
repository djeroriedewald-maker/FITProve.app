import React from 'react';
import { useI18n } from '../../i18n';

export default function HydrationWidget() {
  const { t } = useI18n();
  const [ml, setMl] = React.useState(1200);
  const goal = 2500;
  const percent = Math.min(100, Math.round((ml / goal) * 100));

  return (
    <section className="card card-pad">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">{t('home.hydration.title')}</h2>
        <span className="text-sm text-neutral-600 dark:text-neutral-300">
          {percent}%
        </span>
      </div>

      <div className="mt-3 flex items-end gap-4">
        {/* Bottle */}
        <div className="relative w-12 h-24 rounded-md border border-neutral-300 dark:border-neutral-700 overflow-hidden">
          <div
            className="absolute bottom-0 left-0 right-0 bg-fit-orange/80 animate-[fill_400ms_ease-out]"
            style={{ height: `${percent}%` }}
            aria-hidden
          />
        </div>

        <div className="flex-1">
          <div className="h-2 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
            <div
              className="h-2 bg-fit-orange rounded-full transition-all duration-500"
              style={{ width: `${percent}%` }}
            />
          </div>
          <p className="text-sm mt-2">
            {ml} ml / {goal} ml
          </p>

          <div className="mt-3 flex gap-2">
            <button
              onClick={() => setMl((v) => Math.max(0, v - 100))}
              className="px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800"
            >
              -100 ml
            </button>
            <button
              onClick={() => setMl((v) => v + 100)}
              className="px-3 py-2 rounded-xl bg-black text-white text-sm hover:bg-neutral-800"
            >
              +100 ml
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

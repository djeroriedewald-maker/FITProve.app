import React from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../i18n'; // let op: pad vanaf /components → ../i18n

type Props = {
  open: boolean;
  onClose: () => void;
};

const MODULES: Array<{ key: string; to: string; imageUrl: string }> = [
  {
    key: 'modules.workout',
    to: '/workout',
    imageUrl: 'https://fitprove.app/images/modules/workout.webp',
  },
  {
    key: 'modules.workoutGenerator',
    to: '/generator',
    imageUrl: 'https://fitprove.app/images/modules/workout-generator.webp',
  },
  {
    key: 'modules.stretching',
    to: '/stretching',
    imageUrl: 'https://fitprove.app/images/modules/stretching.webp',
  },
  {
    key: 'modules.recovering',
    to: '/recovering',
    imageUrl: 'https://fitprove.app/images/modules/recovering.webp',
  },
  {
    key: 'modules.mindset',
    to: '/mindset',
    imageUrl: 'https://fitprove.app/images/modules/mindset.webp',
  },
  {
    key: 'modules.diet',
    to: '/diet',
    imageUrl: 'https://fitprove.app/images/modules/food.webp',
  },
  {
    key: 'modules.waterIntake',
    to: '/water',
    imageUrl: 'https://fitprove.app/images/modules/water.webp',
  },
];

export default function MenuDrawer({ open, onClose }: Props) {
  const { t } = useI18n();

  if (!open) return null;

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50">
      <button
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-label={t('common.close', 'Close')}
      />
      <div className="absolute right-0 top-0 bottom-0 w-full sm:w-[420px] bg-neutral-100 dark:bg-neutral-950 p-4 overflow-y-auto shadow-2xl">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-bold">FITProve.app</h3>
          <button
            className="rounded bg-neutral-200 px-3 py-1 dark:bg-neutral-800"
            onClick={onClose}
            aria-label={t('common.close', 'Close')}
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {MODULES.map((m) => (
            <Link
              key={m.key}
              to={m.to}
              onClick={onClose}
              className="group relative block overflow-hidden rounded-xl shadow-soft focus:outline-none focus:ring-2 focus:ring-fit-orange"
            >
              <div
                className="h-28 w-full bg-cover bg-center transition-transform duration-300 group-hover:scale-[1.02]"
                style={{ backgroundImage: `url(${m.imageUrl})` }}
                aria-hidden
              />
              <div className="pointer-events-none absolute inset-0 bg-black/20" />
              <div className="absolute inset-x-0 bottom-0 p-2">
                <span className="rounded bg-black/60 px-2 py-1 text-xs font-semibold text-white">
                  {t(m.key)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

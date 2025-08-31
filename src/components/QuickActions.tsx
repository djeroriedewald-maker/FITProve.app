import React, { useState } from 'react';
import { useI18n } from '../i18n';
import { Link } from 'react-router-dom';

function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/40"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        className="fixed z-50 bottom-5 left-1/2 -translate-x-1/2 w-[92%] sm:w-[420px] rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-soft"
      >
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <h3 className="font-semibold">{title}</h3>
          <button
            className="px-2 py-1 rounded bg-neutral-100 dark:bg-neutral-800"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </>
  );
}

export default function QuickActions() {
  const { t } = useI18n();
  const [open, setOpen] = useState<'water' | 'note' | null>(null);
  const [ml, setMl] = useState(300);
  const [note, setNote] = useState('');

  return (
    <section className="card card-pad">
      <h2 className="text-lg font-bold">{t('home.quickActions.title')}</h2>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <Link
          to="/workout"
          className="rounded-xl bg-black text-white py-2 text-center text-sm hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-fit-orange"
          aria-label={t('actions.startWorkout')}
        >
          {t('actions.startWorkout')}
        </Link>
        <button
          onClick={() => setOpen('water')}
          className="rounded-xl border border-neutral-300 dark:border-neutral-700 py-2 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-fit-orange"
        >
          {t('actions.logWater')}
        </button>
        <button
          onClick={() => setOpen('note')}
          className="rounded-xl border border-neutral-300 dark:border-neutral-700 py-2 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-fit-orange"
        >
          {t('actions.addNote')}
        </button>
      </div>

      <Modal
        open={open === 'water'}
        onClose={() => setOpen(null)}
        title={t('actions.logWater')}
      >
        <div className="space-y-3">
          <label className="block text-sm">
            {t('actions.waterAmount')}
            <input
              type="number"
              min={50}
              step={50}
              value={ml}
              onChange={(e) => setMl(parseInt(e.target.value || '0', 10))}
              className="mt-1 w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 outline-none focus:border-fit-orange"
            />
          </label>
          <button
            onClick={() => setOpen(null)}
            className="w-full rounded-xl bg-fit-orange text-white py-2"
          >
            {t('actions.save')}
          </button>
        </div>
      </Modal>

      <Modal
        open={open === 'note'}
        onClose={() => setOpen(null)}
        title={t('actions.addNote')}
      >
        <div className="space-y-3">
          <label className="block text-sm">
            {t('actions.notePlaceholder')}
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
              className="mt-1 w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 outline-none focus:border-fit-orange"
            />
          </label>
          <button
            onClick={() => setOpen(null)}
            className="w-full rounded-xl bg-fit-orange text-white py-2"
          >
            {t('actions.save')}
          </button>
        </div>
      </Modal>
    </section>
  );
}

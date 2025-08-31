import React from 'react';
import { Link } from 'react-router-dom';
import LanguageSwitcher from './LanguageSwitcher';
import MenuDrawer from './MenuDrawer';

function cx(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(' ');
}

/** Theme hook: init na mount (geen document-access tijdens render) */
function useTheme() {
  const [theme, setTheme] = React.useState<'light' | 'dark'>('light');

  React.useEffect(() => {
    const saved =
      (localStorage.getItem('theme') as 'light' | 'dark' | null) ?? null;
    const next =
      saved ??
      (document.documentElement.classList.contains('dark') ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', next === 'dark');
    setTheme(next);
  }, []);

  const toggle = React.useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      document.documentElement.classList.toggle('dark', next === 'dark');
      localStorage.setItem('theme', next);
      return next;
    });
  }, []);

  return { theme, toggle };
}

function NotificationBell({ count = 3 }: { count?: number }) {
  return (
    <button
      aria-label="Notifications"
      className="relative rounded-xl p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-fit-orange"
    >
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5 text-neutral-900 dark:text-neutral-100"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
      >
        <path d="M15 17h5l-1.4-1.4a4 4 0 0 1-1.2-2.83V10a6 6 0 0 0-12 0v2.77c0 1-.43 1.95-1.2 2.63L3 17h5" />
        <path d="M9 17a3 3 0 0 0 6 0" />
      </svg>
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-fit-orange px-[5px] text-[10px] font-bold text-white">
          {count}
        </span>
      )}
    </button>
  );
}

export default function TopNav() {
  const { theme, toggle } = useTheme();
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <header
        className={cx(
          'sticky top-0 z-40',
          'bg-white/90 dark:bg-neutral-900/90 backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:supports-[backdrop-filter]:bg-neutral-900/70',
          'border-b border-neutral-200 dark:border-neutral-800'
        )}
      >
        <div className="mx-auto flex h-12 max-w-[960px] items-center justify-between px-3">
          {/* Left: menu + logo */}
          <div className="flex items-center gap-2">
            <button
              aria-label="Open menu"
              onClick={() => setOpen(true)}
              className="rounded-xl p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-fit-orange"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5 text-neutral-900 dark:text-neutral-100"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
              >
                <path d="M3 6h18M3 12h14M3 18h10" />
              </svg>
            </button>

            <Link to="/" className="ml-1 text-sm font-extrabold tracking-tight">
              <span className="text-neutral-900 dark:text-neutral-100">
                FIT<span className="text-fit-orange">Prove</span>
                <span className="text-neutral-500 dark:text-neutral-400">
                  .app
                </span>
              </span>
            </Link>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-1.5">
            <NotificationBell />

            <LanguageSwitcher />

            <button
              onClick={toggle}
              className="rounded-xl px-2 py-1 text-xs font-medium text-neutral-900 dark:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-fit-orange"
              aria-label={
                theme === 'dark'
                  ? 'Switch to light mode'
                  : 'Switch to dark mode'
              }
            >
              {theme === 'dark' ? 'Licht' : 'Donker'}
            </button>

            <Link
              to="/profile"
              aria-label="Open profiel"
              className="ml-1 inline-flex h-8 w-8 items-center justify-center rounded-full border border-neutral-300 bg-neutral-100 text-xs font-semibold text-neutral-700 hover:bg-neutral-200 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
            >
              D
            </Link>
          </div>
        </div>
      </header>

      {/* Drawer (geen lazy, geen extra afhankelijkheden) */}
      <MenuDrawer open={open} onClose={() => setOpen(false)} />
    </>
  );
}

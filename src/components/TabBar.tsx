import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { navItems } from '../config/nav';
import { useI18n } from '../i18n';

/**
 * Mobile-first sticky bottom tabbar
 * - Items: Home, Challenges, Badges, Agenda, Feed
 * - i18n labels via nav.* keys
 * - Outline → Filled active state
 */
export default function TabBar() {
  const { t } = useI18n();
  const loc = useLocation();

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-neutral-900/95
                 border-t border-neutral-200 dark:border-neutral-800 backdrop-blur"
      role="navigation"
      aria-label="Bottom navigation"
    >
      <ul className="grid grid-cols-5">
        {navItems.map(
          ({ path, icon: Icon, iconFilled: IconFilled, labelKey }) => {
            const active = loc.pathname === path;
            const Label = t(labelKey);
            const IconCmp = active ? IconFilled ?? Icon : Icon;

            return (
              <li key={path}>
                <Link
                  to={path}
                  aria-label={Label}
                  aria-current={active ? 'page' : undefined}
                  className={
                    'relative flex flex-col items-center justify-center gap-1 py-2 text-[11px] ' +
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-fit-orange ' +
                    (active
                      ? 'text-fit-orange font-semibold'
                      : 'text-neutral-700 dark:text-neutral-300')
                  }
                >
                  {/* Active indicator */}
                  {active && (
                    <span className="absolute -top-px h-0.5 w-8 rounded-full bg-fit-orange" />
                  )}
                  <IconCmp className="w-5 h-5" />
                  <span className="leading-none">{Label}</span>
                </Link>
              </li>
            );
          }
        )}
      </ul>
    </nav>
  );
}

/* ===== Icons (outline + filled) ===== */
export function HomeIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5 10.5V20h14v-9.5" />
    </svg>
  );
}
export function HomeIconFilled({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 3 3 10.5V20a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-9.5L12 3z" />
    </svg>
  );
}

export function TrophyIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path d="M7 6V4h10v2M7 6a4 4 0 0 0 3 3.9A5 5 0 0 0 12 14v1H9m6 0h-3v-1a5 5 0 0 0 2-3.1A4 4 0 0 0 17 6" />
      <path d="M7 6H5a2 2 0 0 0 2 2M17 6h2a2 2 0 0 1-2 2" />
    </svg>
  );
}
export function TrophyIconFilled({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      aria-hidden
    >
      <path d="M17 3h-2V2H9v1H7a1 1 0 0 0-1 1v2a4 4 0 0 0 3 3.9A5 5 0 0 0 11 14v1H8a1 1 0 1 0 0 2h8a1 1 0 1 0 0-2h-3v-1a5 5 0 0 0 2-3.1A4 4 0 0 0 18 6V4a1 1 0 0 0-1-1Z" />
    </svg>
  );
}

export function BadgeIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path d="M12 2 9.5 8H3l5.2 3.8L6.5 18 12 14.6 17.5 18l-1.7-6.2L21 8h-6.5L12 2z" />
    </svg>
  );
}
export function BadgeIconFilled({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 2 9.5 8H3l5.2 3.8L6.5 18 12 14.6 17.5 18l-1.7-6.2L21 8h-6.5L12 2z" />
    </svg>
  );
}

export function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 11h18" />
    </svg>
  );
}
export function CalendarIconFilled({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      aria-hidden
    >
      <path d="M7 2h2v2h6V2h2v2h2a2 2 0 0 1 2 2v13a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6a2 2 0 0 1 2-2h2V2Zm12 8H5v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9Z" />
    </svg>
  );
}

export function FeedIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path d="M4 6h16M4 12h16M4 18h12" />
    </svg>
  );
}
export function FeedIconFilled({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      aria-hidden
    >
      <path d="M4 5h16v3H4zM4 11h16v3H4zM4 17h12v3H4z" />
    </svg>
  );
}

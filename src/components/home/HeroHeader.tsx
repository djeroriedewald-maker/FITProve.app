import React from 'react';
import { useI18n } from '../../i18n';
import { useAuth } from '../../store/auth';

export default function HeroHeader() {
  const { t, lang } = useI18n();
  const { user } = useAuth();

  const locale = lang === 'nl' ? 'nl-NL' : 'en-US';
  const pretty = new Date().toLocaleDateString(locale, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <section
      aria-label={t('home.heroAlt')}
      className="relative overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-800"
    >
      {/* BG image */}
      <img
        src="https://fitprove.app/images/modules/hero.webp"
        alt=""
        loading="lazy"
        className="w-full h-48 sm:h-56 object-cover"
      />

      {/* Gradient overlay met zachte ‘ademende’ pulse */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 via-black/25 to-transparent animate-heroPulse" />

      {/* Copy */}
      <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 text-white drop-shadow">
        <p className="text-xs opacity-90">
          {t('home.todayDate', 'Today, {{date}}').replace('{{date}}', pretty)}
        </p>
        <h1 className="mt-1 text-xl sm:text-2xl font-extrabold">
          {t('home.welcomeBack', 'Welcome back, {{name}}').replace(
            '{{name}}',
            user?.name || t('home.you', 'you')
          )}
        </h1>
      </div>
    </section>
  );
}

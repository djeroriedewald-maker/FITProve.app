import React from 'react';
import { useI18n } from '../i18n';

export default function LanguageSwitcher() {
  const { lang, setLang } = useI18n();
  const isNL = lang === 'nl';

  return (
    <div className="flex items-center gap-1">
      <button
        className={`px-2 py-1 rounded ${lang === 'en' ? 'bg-fit-orange text-white' : 'bg-neutral-200 dark:bg-neutral-800'}`}
        onClick={() => setLang('en')}
        aria-pressed={lang === 'en'}
        aria-label="Switch to English"
      >
        EN
      </button>
      <button
        className={`px-2 py-1 rounded ${isNL ? 'bg-fit-orange text-white' : 'bg-neutral-200 dark:bg-neutral-800'}`}
        onClick={() => setLang('nl')}
        aria-pressed={isNL}
        aria-label="Schakel naar Nederlands"
      >
        NL
      </button>
    </div>
  );
}

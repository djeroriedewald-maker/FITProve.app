// src/i18n/index.ts
import React from 'react';
import en from './en.json';
import nl from './nl.json';

type Dict = Record<string, string | Dict>;
type Lang = 'en' | 'nl';

const DICTS: Record<Lang, Dict> = {
  en: en as Dict,
  nl: nl as Dict,
};

// ---------- kleine helpers ----------
function get(obj: Dict, path: string): string | Dict | undefined {
  return path.split('.').reduce<any>(
    (acc, part) => (acc && typeof acc === 'object' ? (acc as any)[part] : undefined),
    obj
  );
}
function format(str: string, vars?: Record<string, string | number>) {
  if (!vars) return str;
  return str.replace(/\{\{(\w+)\}\}/g, (_, k) => String(vars[k] ?? ''));
}

// ---------- simpel, provider-loos i18n store ----------
let currentLang: Lang = (localStorage.getItem('lang') as Lang) === 'nl' ? 'nl' : 'en';
const listeners = new Set<() => void>();

function notify() {
  for (const fn of listeners) fn();
}

export function setLang(lng: Lang) {
  currentLang = lng === 'nl' ? 'nl' : 'en';
  localStorage.setItem('lang', currentLang);
  document.documentElement.setAttribute('lang', currentLang);
  notify();
}

export function t(key: string, vars?: Record<string, string | number>, fallbackLang: Lang = 'en'): string {
  const hit = get(DICTS[currentLang], key);
  if (typeof hit === 'string') return format(hit, vars);

  const fb = get(DICTS[fallbackLang], key);
  if (typeof fb === 'string') return format(fb, vars);

  // key ontbreekt → toon key (ipv crash/wit scherm)
  return key;
}

// React hook die her-rendert bij taalwijziging
export function useI18n() {
  const [lang, set] = React.useState<Lang>(currentLang);

  React.useEffect(() => {
    const sub = () => set(currentLang);
    listeners.add(sub);
    return () => listeners.delete(sub);
  }, []);

  const api = React.useMemo(
    () => ({
      lang,
      setLang,
      t: (key: string, vars?: Record<string, string | number>) => t(key, vars),
    }),
    [lang]
  );

  return api;
}

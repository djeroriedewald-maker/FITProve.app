import React from 'react';
import { useI18n } from '../i18n';

export default function Feed() {
  const { t } = useI18n();
  return (
    <div className="space-y-3">
      <div className="card card-pad">
        <h1 className="text-lg font-bold">{t('nav.feed')}</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-300 mt-1">
          Placeholder – nieuws en updates verschijnen hier.
        </p>
      </div>
    </div>
  );
}

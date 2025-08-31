import React from 'react';
import { useI18n } from '../i18n';

export default function NextUp() {
  const { t } = useI18n();
  const next = {
    time: '18:30',
    title: t('home.nextUp.sample', 'Workout – upper body'),
  };

  return (
    <section className="card card-pad">
      <h2 className="text-lg font-bold">{t('home.nextUp.title')}</h2>
      <p className="text-sm mt-2">
        <span className="font-semibold">{next.time}</span> · {next.title}
      </p>
    </section>
  );
}

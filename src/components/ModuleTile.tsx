import React from 'react';
import { useI18n } from '../i18n';

type Props = {
  labelKey: string; // b.v. 'modules.workout'
  imageUrl: string;
  to: string;
  onClick?: () => void;
};

export default function ModuleTile({ labelKey, imageUrl, to, onClick }: Props) {
  const { t } = useI18n();
  const label = t(labelKey);

  return (
    <a
      href={to}
      onClick={onClick}
      className="relative block rounded-2xl overflow-hidden group focus:outline-none focus:ring-2 focus:ring-fit-orange"
      aria-label={label}
    >
      <img
        src={imageUrl}
        alt={label}
        loading="lazy"
        className="w-full h-36 object-cover transform transition-transform duration-300 group-hover:scale-[1.03]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      <div className="absolute bottom-2 left-3 right-3">
        <span className="text-white font-semibold drop-shadow">{label}</span>
      </div>
    </a>
  );
}

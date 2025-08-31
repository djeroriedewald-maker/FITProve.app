import React from 'react';

/**
 * ModuleHero toont een brede banner met (WebP) background + overlay + titel.
 * - Vervang de img-url met jouw eigen .webp assets in /src/assets/
 * - Werkt ook zonder asset: gebruikt gradient fallback (geen errors).
 */
export default function ModuleHero({
  title,
  img = '',
  subtitle,
}: {
  title: string;
  img?: string; // vb: "/src/assets/module-workout.webp"
  subtitle?: string;
}) {
  const bg = img
    ? {
        backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,.35), rgba(0,0,0,.6)), url('${img}')`,
      }
    : {
        backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,.35), rgba(0,0,0,.6)), linear-gradient(120deg,#111,#1b1b1b)`,
      };

  return (
    <div
      className="rounded-2xl overflow-hidden h-36 md:h-44 bg-center bg-cover relative border border-neutral-200 dark:border-neutral-800"
      style={bg}
      role="img"
      aria-label={title}
    >
      <div className="absolute inset-0 flex flex-col justify-end p-4">
        <h1 className="text-2xl md:text-3xl font-extrabold text-white drop-shadow">
          {title}
        </h1>
        {subtitle && (
          <p className="text-white/90 text-sm md:text-base">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

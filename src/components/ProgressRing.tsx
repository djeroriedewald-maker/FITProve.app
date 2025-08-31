import React from 'react';

/**
 * ProgressRing
 * - Pure SVG ring with percentage text in the center.
 * - Fits FITProve colors; track adapts to dark mode via classes.
 *
 * Props:
 *  - value: 0..100
 *  - size: pixel size of the square (default 56)
 *  - stroke: ring thickness (default 6)
 *  - className: extra classes
 *  - label: optional aria-label for a11y (e.g., "Move goal 72%")
 */
export default function ProgressRing({
  value,
  size = 56,
  stroke = 6,
  className = '',
  label,
}: {
  value: number;
  size?: number;
  stroke?: number;
  className?: string;
  label?: string;
}) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = (clamped / 100) * circumference;

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label={label ?? `${clamped}%`}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="block"
        aria-hidden="true"
      >
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          className="stroke-neutral-200 dark:stroke-neutral-800"
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          className="stroke-fit-orange"
          strokeDasharray={`${dash} ${circumference - dash}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>

      {/* Centered percentage */}
      <span className="absolute text-[11px] font-bold select-none text-neutral-900 dark:text-white">
        {clamped}%
      </span>
    </div>
  );
}

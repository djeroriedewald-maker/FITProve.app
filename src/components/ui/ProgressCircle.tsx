import React from "react";

type Props = {
  /** 0..100 */
  value: number;
  /** Diameter in px */
  size?: number;
  /** Stroke in px */
  strokeWidth?: number;
  /** Eigen label; standaard wordt het percentage getoond */
  label?: string | number;
  /** Formatter voor het label, krijgt de ‘clamped’ value (0..100) */
  formatLabel?: (v: number) => string;
  /** Extra className voor de <svg> wrapper */
  className?: string;
};

export default function ProgressCircle({
  value,
  size = 48,
  strokeWidth = 6,
  label,
  formatLabel = (v) => `${Math.round(v)}%`,
  className = "",
}: Props) {
  // 0..100 forceren
  const pct = Math.max(0, Math.min(100, value));

  // geometrie
  const r = (size - strokeWidth) / 2;
  const c = 2 * Math.PI * r;
  const dashOffset = c * (1 - pct / 100);

  // label in het midden
  const centerLabel =
    label !== undefined && label !== null ? String(label) : formatLabel(pct);
  const fontSize = Math.max(10, Math.round(size * 0.32)); // schaalbaar, maar leesbaar

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={`${pct}%`}
      className={className}
    >
      {/* basisring */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        strokeWidth={strokeWidth}
        className="text-gray-200 dark:text-gray-800"
        stroke="currentColor"
      />

      {/* progressring */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        className="text-orange-500 dark:text-orange-400"
        stroke="currentColor"
        style={{
          strokeDasharray: c,
          strokeDashoffset: dashOffset,
          transform: "rotate(-90deg)",
          transformOrigin: "50% 50%",
          transition: "stroke-dashoffset .4s ease",
        }}
      />

      {/* label in het midden */}
      <text
        x="50%"
        y="50%"
        dy="0.35em"
        textAnchor="middle"
        fontSize={fontSize}
        className="fill-gray-800 dark:fill-gray-100 font-semibold"
      >
        {centerLabel}
      </text>
    </svg>
  );
}

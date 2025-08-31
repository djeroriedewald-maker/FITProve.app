import React from "react";

type ProgressCircleProps = {
  /** 0 - 100 */
  value: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
};

export default function ProgressCircle({
  value,
  size = 48,
  strokeWidth = 6,
  className = "",
}: ProgressCircleProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      aria-label={`progress ${value}%`}
      role="img"
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="currentColor"
        className="text-gray-200 dark:text-gray-700"
        strokeWidth={strokeWidth}
        fill="transparent"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="currentColor"
        className="text-orange-500"
        strokeWidth={strokeWidth}
        fill="transparent"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`}
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="central"
        textAnchor="middle"
        className="fill-gray-800 dark:fill-gray-200 text-xs font-semibold"
      >
        {value}%
      </text>
    </svg>
  );
}
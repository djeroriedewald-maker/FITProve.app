import React from "react";

export default function ProgressCircle({ value = 0 }: { value: number }) {
  const clamped = Math.max(0, Math.min(100, value));
  const radius = 22;
  const stroke = 5;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <svg width="56" height="56" viewBox="0 0 56 56">
      <circle
        cx="28"
        cy="28"
        r={radius}
        strokeWidth={stroke}
        className="fill-none stroke-gray-200 dark:stroke-gray-700"
      />
      <circle
        cx="28"
        cy="28"
        r={radius}
        strokeWidth={stroke}
        className="fill-none stroke-blue-500 transition-[stroke-dashoffset] duration-300 ease-out"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 28 28)"
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="central"
        textAnchor="middle"
        className="text-xs fill-gray-700 dark:fill-gray-200"
      >
        {clamped}%
      </text>
    </svg>
  );
}

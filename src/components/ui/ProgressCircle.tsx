import React from "react";

type ProgressCircleProps = {
  value: number; // tussen 0 en 100
  size?: number; // diameter in px
  strokeWidth?: number; // breedte van de lijn
};

export default function ProgressCircle({
  value,
  size = 60,
  strokeWidth = 6,
}: ProgressCircleProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <svg
      width={size}
      height={size}
      className="text-orange-500 dark:text-orange-400"
      aria-label={`Progress: ${value}%`}
    >
      {/* Achtergrondcirkel */}
      <circle
        stroke="currentColor"
        className="opacity-20"
        fill="transparent"
        strokeWidth={strokeWidth}
        r={radius}
        cx={size / 2}
        cy={size / 2}
      />
      {/* Voorgrondcirkel */}
      <circle
        stroke="currentColor"
        fill="transparent"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        r={radius}
        cx={size / 2}
        cy={size / 2}
        className="transition-all duration-500 ease-out"
      />
      {/* Tekst in het midden */}
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        className="text-xs font-medium fill-current text-zinc-900 dark:text-zinc-50"
      >
        {value}%
      </text>
    </svg>
  );
}

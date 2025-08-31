import React from 'react';

export default function Sparkline({
  points = [3, 5, 4, 7, 6, 8, 7, 9],
}: {
  points?: number[];
}) {
  const w = 140,
    h = 40;
  const max = Math.max(...points),
    min = Math.min(...points);
  const path = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * w;
      const y = h - ((p - min) / (max - min || 1)) * h;
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <path
        d={path}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="text-fit-orange"
      />
    </svg>
  );
}

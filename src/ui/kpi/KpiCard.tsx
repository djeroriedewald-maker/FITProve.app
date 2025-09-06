// src/ui/kpi/KpiCard.tsx
import React from 'react';

type Props = { label: string; value: number | string; sublabel?: string };

export default function KpiCard({ label, value, sublabel }: Props) {
  return (
    <div className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur p-4 shadow-sm">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="mt-1 text-3xl font-extrabold">{value}</div>
      {sublabel ? <div className="mt-1 text-xs text-muted-foreground">{sublabel}</div> : null}
    </div>
  );
}

// src/ui/ExerciseMedia.tsx
import React from 'react';

type Media = { url: string; type?: 'image' | 'gif' | 'video' };
type Props = { open: boolean; onClose: () => void; title?: string; media?: Media[] };

export default function ExerciseMedia({ open, onClose, title, media }: Props) {
  if (!open) return null;
  const m = media?.[0];
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60" onClick={onClose}>
      <div
        className="w-[92vw] max-w-md rounded-2xl bg-background p-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold">{title ?? 'Voorbeeld'}</h3>
          <button className="rounded-xl border px-2 py-1 text-sm hover:bg-accent" onClick={onClose}>
            Sluit
          </button>
        </div>
        <div className="rounded-xl border bg-muted/30 p-2">
          {!m ? (
            <div className="p-8 text-center text-sm text-muted-foreground">Geen media gevonden.</div>
          ) : m.type === 'video' ? (
            <video className="w-full rounded-lg" controls src={m.url} />
          ) : (
            <img className="w-full rounded-lg" src={m.url} alt={title ?? 'voorbeeld'} />
          )}
        </div>
      </div>
    </div>
  );
}

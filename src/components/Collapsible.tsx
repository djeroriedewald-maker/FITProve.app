import React, { useEffect, useState } from 'react';

/**
 * Collapsible met "UltraThink":
 * - Onthoudt open/gesloten per 'id' in localStorage (betere UX).
 * - Toon aantallen en smooth scroll bij openklappen.
 */
export default function Collapsible({
  id = 'default',
  previewCount = 4,
  items,
  render,
  moreLabel = 'Toon alles',
  lessLabel = 'Toon minder',
}: {
  id?: string;
  previewCount?: number;
  items: any[];
  render: (item: any, idx: number) => React.ReactNode;
  moreLabel?: string;
  lessLabel?: string;
}) {
  const [open, setOpen] = useState<boolean>(
    () => localStorage.getItem(`fp_coll_${id}`) === '1'
  );
  useEffect(
    () => localStorage.setItem(`fp_coll_${id}`, open ? '1' : '0'),
    [id, open]
  );

  const visible = open ? items : items.slice(0, previewCount);
  const canToggle = items.length > previewCount;

  return (
    <div className="space-y-3">
      {visible.map((it, idx) => (
        <div key={idx} className="card card-pad">
          {render(it, idx)}
        </div>
      ))}
      {canToggle && (
        <button
          onClick={() => {
            setOpen((o) => !o);
            setTimeout(
              () => window.scrollBy({ top: 1, behavior: 'smooth' }),
              10
            );
          }}
          className="w-full py-2 text-sm font-semibold border rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800"
        >
          {open ? `${lessLabel}` : `${moreLabel} (${items.length})`}
        </button>
      )}
    </div>
  );
}

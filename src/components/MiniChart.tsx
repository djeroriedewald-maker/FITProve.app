import React from 'react';

export default function MiniChart() {
  return (
    <div className="flex items-center gap-3">
      <div className="w-2 h-8 bg-fit-orange rounded"></div>
      <div className="w-2 h-5 bg-neutral-300 rounded"></div>
      <div className="w-2 h-10 bg-fit-orange rounded"></div>
      <div className="w-2 h-6 bg-neutral-300 rounded"></div>
      <div className="w-2 h-12 bg-fit-orange rounded"></div>
    </div>
  );
}

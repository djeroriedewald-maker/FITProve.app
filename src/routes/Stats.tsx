import React from "react";

export default function Stats() {
  return (
    <section className="py-4">
      <h1 className="text-2xl font-semibold">Stats</h1>
      <div className="mt-2 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-black/10 p-3 dark:border-white/10">
          <div className="text-xs opacity-70">Calories</div>
          <div className="text-xl font-semibold">450 kcal</div>
        </div>
        <div className="rounded-2xl border border-black/10 p-3 dark:border-white/10">
          <div className="text-xs opacity-70">Steps</div>
          <div className="text-xl font-semibold">10,250</div>
        </div>
      </div>
    </section>
  );
}

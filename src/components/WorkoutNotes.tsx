import React, { useEffect, useMemo, useState } from 'react';

type Note = {
  id: string;
  title: string;
  content: string;
  ts: number;
};

const KEY = 'fp_workout_notes';

export default function WorkoutNotes() {
  const [notes, setNotes] = useState<Note[]>(() => {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  });
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(notes));
  }, [notes]);

  const add = () => {
    if (!title.trim() && !content.trim()) return;
    setNotes((n) => [
      {
        id: crypto.randomUUID(),
        title: title.trim() || 'Workout notitie',
        content: content.trim(),
        ts: Date.now(),
      },
      ...n,
    ]);
    setTitle('');
    setContent('');
  };

  const del = (id: string) => setNotes((n) => n.filter((x) => x.id !== id));
  const share = async (note: Note) => {
    const text = `${note.title}\n\n${note.content}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: note.title, text });
      } catch {}
    } else {
      await navigator.clipboard.writeText(text);
      alert('Gekopieerd naar klembord ✅');
    }
  };

  const empty = useMemo(() => notes.length === 0, [notes.length]);

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-bold">Workout Notitie</h2>

      <div className="card card-pad space-y-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Titel (bv. Hyrox Engine – week 2)"
          className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 outline-none"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Wat heb je gedaan? Sets/reps/tijden, hoe voelde het, PR's, tips…"
          className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 outline-none min-h-[90px]"
        />
        <div className="flex items-center justify-between">
          <button
            onClick={add}
            className="px-4 py-2 rounded-xl bg-fit-orange text-white font-semibold"
          >
            Opslaan
          </button>
          {!empty && (
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              {notes.length} opgeslagen
            </span>
          )}
        </div>
      </div>

      {notes.map((n) => (
        <article key={n.id} className="card card-pad">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-semibold">{n.title}</h3>
              <p className="text-sm text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap mt-1">
                {n.content}
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
                {new Date(n.ts).toLocaleString()}
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => share(n)}
                className="px-2 py-1 rounded bg-neutral-200 dark:bg-neutral-800 text-xs"
              >
                Delen
              </button>
              <button
                onClick={() => del(n.id)}
                className="px-2 py-1 rounded bg-black text-white text-xs"
              >
                Verwijder
              </button>
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}

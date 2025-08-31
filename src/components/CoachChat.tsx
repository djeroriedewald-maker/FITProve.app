import React, { useEffect, useRef, useState } from 'react';

/**
 * Floating AI Coach
 * - Oranje FAB rechtsonder
 * - Klik → chatvenster (non-blocking)
 * - Berichten lokaal; demo prompt
 */
export default function CoachChat() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<
    { role: 'user' | 'coach'; text: string }[]
  >([{ role: 'coach', text: 'Hi! Waarmee kan ik je vandaag helpen? 💪' }]);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open)
      boxRef.current?.scrollTo({
        top: boxRef.current.scrollHeight,
        behavior: 'smooth',
      });
  }, [open, messages.length]);

  function send() {
    const v = input.trim();
    if (!v) return;
    setMessages((m) => [...m, { role: 'user', text: v }]);
    setInput('');
    // demo respons
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        {
          role: 'coach',
          text: 'Top! Ik heb dat genoteerd. Wil je een korte of lange sessie?',
        },
      ]);
    }, 500);
  }

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-20 right-5 z-40 w-14 h-14 rounded-full bg-fit-orange text-white shadow-soft
                   flex items-center justify-center text-2xl hover:scale-105 transition focus:outline-none focus:ring-2 focus:ring-white/80"
        aria-label="Open Coach"
        title="FITProve Coach"
      >
        💬
      </button>

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-24 right-5 z-40 w-[min(92vw,380px)] rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-soft overflow-hidden">
          <div className="px-3 py-2 bg-black text-white flex items-center justify-between">
            <span className="font-semibold">FITProve Coach</span>
            <button
              className="text-sm px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
            >
              ✕
            </button>
          </div>
          <div ref={boxRef} className="h-64 overflow-auto p-3 space-y-2">
            {messages.map((m, i) => (
              <p
                key={i}
                className={
                  'max-w-[85%] px-3 py-2 rounded-xl text-sm ' +
                  (m.role === 'coach'
                    ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100'
                    : 'bg-fit-orange text-white ml-auto')
                }
              >
                {m.text}
              </p>
            ))}
          </div>
          <div className="p-3 flex gap-2 border-t border-neutral-200 dark:border-neutral-800">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Typ je bericht…"
              className="flex-1 px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 outline-none focus:border-fit-orange"
              onKeyDown={(e) => e.key === 'Enter' && send()}
            />
            <button
              onClick={send}
              className="px-3 py-2 rounded-xl bg-black text-white hover:bg-neutral-800"
              title="Verstuur"
            >
              Verstuur
            </button>
          </div>
        </div>
      )}
    </>
  );
}

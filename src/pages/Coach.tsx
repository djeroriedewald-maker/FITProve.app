import React from 'react';
import { useI18n } from '../i18n';

type Msg = { id: string; role: 'user' | 'assistant'; text: string; ts: number };

/**
 * Coach pagina – full screen chat
 * - Zelfde interactie als de floating coach
 * - Kan later uitgebreid worden met coach-profielen, plannen, logs, etc.
 */
export default function Coach() {
  const { t } = useI18n();
  const [input, setInput] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [messages, setMessages] = React.useState<Msg[]>([
    {
      id: 'm0',
      role: 'assistant',
      text: t(
        'coach.page.welcome',
        'Welcome to your AI Coach. What’s your focus today?'
      ),
      ts: Date.now(),
    },
  ]);

  function send(e?: React.FormEvent) {
    if (e) e.preventDefault();
    const text = input.trim();
    if (!text || busy) return;

    const userMsg: Msg = {
      id: crypto?.randomUUID ? crypto.randomUUID() : String(Date.now()),
      role: 'user',
      text,
      ts: Date.now(),
    };
    setInput('');
    setMessages((m) => [...m, userMsg]);
    setBusy(true);

    // demo reply
    setTimeout(() => {
      const reply: Msg = {
        id: crypto?.randomUUID ? crypto.randomUUID() : String(Date.now() + 1),
        role: 'assistant',
        text:
          t('coach.suggestion.prefix', 'Based on your focus:') +
          ' ' +
          t(
            'coach.suggestion.sample',
            'try a 15-min full-body circuit (3x: squats, push-ups, mountain climbers).'
          ),
        ts: Date.now() + 1,
      };
      setMessages((m) => [...m, reply]);
      setBusy(false);
    }, 700);
  }

  return (
    <main className="container mx-auto px-4 py-5 space-y-4">
      {/* Header */}
      <section className="card card-pad flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🤖</span>
          <div>
            <h1 className="text-xl font-extrabold">
              {t('coach.page.title', 'AI Coach')}
            </h1>
            <p className="text-sm text-neutral-600 dark:text-neutral-300">
              {t(
                'coach.page.subtitle',
                'Personal guidance and smart suggestions'
              )}
            </p>
          </div>
        </div>
        <a
          href="/"
          className="px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800"
        >
          {t('coach.page.backHome', 'Back to Home')}
        </a>
      </section>

      {/* Chat */}
      <section className="card card-pad">
        <div className="h-[50vh] overflow-y-auto space-y-2">
          {messages.length === 0 && (
            <p className="text-sm text-neutral-600 dark:text-neutral-300">
              {t(
                'coach.empty',
                'No messages yet. Ask me anything about training, recovery, or nutrition.'
              )}
            </p>
          )}

          {messages.map((m) => (
            <div
              key={m.id}
              className={`max-w-[85%] px-3 py-2 rounded-2xl ${
                m.role === 'user'
                  ? 'ml-auto bg-fit-orange text-white rounded-br-sm'
                  : 'mr-auto bg-neutral-100 dark:bg-neutral-800 rounded-bl-sm'
              }`}
            >
              {m.text}
            </div>
          ))}

          {busy && (
            <div className="mr-auto px-3 py-2 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-500 text-sm">
              {t('coach.thinking', 'Thinking…')}
            </div>
          )}
        </div>

        {/* Input */}
        <form onSubmit={send} className="mt-3 flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t(
              'coach.input.placeholder',
              'Ask the coach anything…'
            )}
            className="flex-1 px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 outline-none focus:border-fit-orange"
          />
          <button
            type="submit"
            disabled={busy}
            className="px-3 py-2 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-black disabled:opacity-60"
          >
            {t('coach.send', 'Send')}
          </button>
        </form>
      </section>
    </main>
  );
}

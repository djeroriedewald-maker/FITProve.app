import React from "react";
import { useI18n } from "../../i18n";

/**
 * FloatingCoach
 * - Zwevende knop rechtsonder
 * - Luistert op custom event 'fp:open-coach' om te openen
 * - Kleine chat UI (demo) met in-/uitgaande berichten
 */
type Msg = { id: string; role: "user" | "assistant"; text: string; ts: number };

export default function FloatingCoach() {
  const { t } = useI18n();
  const [open, setOpen] = React.useState(false);
  const [input, setInput] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [messages, setMessages] = React.useState<Msg[]>([
    {
      id: "m0",
      role: "assistant",
      text: t("coach.welcome", "Hi! I’m your AI Coach — how can I help today?"),
      ts: Date.now(),
    },
  ]);

  // Event listener voor programmatic open (bijv. banner CTA)
  React.useEffect(() => {
    const onOpen = () => setOpen(true);
    // @ts-ignore
    const handler = () => onOpen();
    window.addEventListener("fp:open-coach", handler as any);
    return () => window.removeEventListener("fp:open-coach", handler as any);
  }, []);

  function sendMessage(e?: React.FormEvent) {
    if (e) e.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    const userMsg: Msg = {
      id: crypto?.randomUUID ? crypto.randomUUID() : String(Date.now()),
      role: "user",
      text,
      ts: Date.now(),
    };
    setInput("");
    setMessages((m) => [...m, userMsg]);
    setBusy(true);

    // Demo “AI” antwoord
    setTimeout(() => {
      const reply: Msg = {
        id: crypto?.randomUUID ? crypto.randomUUID() : String(Date.now() + 1),
        role: "assistant",
        text:
          t("coach.suggestion.prefix", "Based on your focus:") +
          " " +
          t(
            "coach.suggestion.sample",
            "try a 15-min full-body circuit (3x: squats, push-ups, mountain climbers). Want me to log it?"
          ),
        ts: Date.now() + 1,
      };
      setMessages((m) => [...m, reply]);
      setBusy(false);
    }, 700);
  }

  return (
    <>
      {/* Fab button */}
      {!open && (
        <button
          className="fixed z-40 bottom-5 right-5 h-12 w-12 rounded-full bg-fit-orange text-white font-bold shadow-soft hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-fit-orange"
          aria-label={t("coach.chatLabel")}
          onClick={() => setOpen(true)}
        >
          💬
        </button>
      )}

      {/* Popup */}
      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/30"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="fixed z-50 bottom-5 right-5 w-[92%] sm:w-[380px] rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-soft overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">🤖</span>
                <div>
                  <p className="font-semibold">{t("coach.title", "AI Coach")}</p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {t("coach.subtitle", "Personal guidance")}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="px-2 py-1 rounded bg-neutral-100 dark:bg-neutral-800"
                aria-label={t("close", "Close")}
              >
                ✕
              </button>
            </div>

            {/* Messages */}
            <div className="p-3 max-h-[50vh] overflow-y-auto space-y-2">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`max-w-[85%] px-3 py-2 rounded-2xl ${
                    m.role === "user"
                      ? "ml-auto bg-fit-orange text-white rounded-br-sm"
                      : "mr-auto bg-neutral-100 dark:bg-neutral-800 rounded-bl-sm"
                  }`}
                >
                  {m.text}
                </div>
              ))}
              {busy && (
                <div className="mr-auto px-3 py-2 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-500 text-sm">
                  {t("coach.thinking", "Thinking…")}
                </div>
              )}
            </div>

            {/* Input */}
            <form onSubmit={sendMessage} className="p-3 border-t border-neutral-200 dark:border-neutral-800 flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t("coach.input.placeholder", "Ask the coach anything…")}
                className="flex-1 px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 outline-none focus:border-fit-orange"
              />
              <button
                type="submit"
                disabled={busy}
                className="px-3 py-2 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-black disabled:opacity-60"
              >
                {t("coach.send", "Send")}
              </button>
            </form>
          </div>
        </>
      )}
    </>
  );
}

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '../../lib/supabaseClient';

type Props = { open: boolean; onClose: () => void };

export default function SignInDialog({ open, onClose }: Props) {
  const [tab, setTab] = useState<'google' | 'email'>('google');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Open/close side-effects (ESC, body scroll lock)
  useEffect(() => {
    if (!open) return;
    setMounted(true);

    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);

    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', onKey);
      document.documentElement.style.overflow = prev;
      setMounted(false);
    };
  }, [open, onClose]);

  if (!open) return null;

  const signInWithGoogle = async () => {
    setErr(null);
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin },
      });
      if (error) setErr(error.message);
    } catch (e: any) {
      setErr(e?.message ?? 'Unable to start Google sign-in.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmail = async () => {
    setErr(null);
    setLoading(true);
    try {
      const fn =
        mode === 'signin'
          ? supabase.auth.signInWithPassword({ email, password })
          : supabase.auth.signUp({ email, password });
      const { error } = await fn;
      if (error) setErr(error.message);
      else onClose();
    } catch (e: any) {
      setErr(e?.message ?? 'Email sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  const overlay = (
    <div
      className="fixed inset-0 z-[100] grid place-items-center bg-black/60 p-4"
      onClick={onClose}
      aria-hidden={false}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Sign in"
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl outline-none dark:bg-neutral-900
          transform transition-all duration-200 ease-out
          max-h-[min(90vh,44rem)] overflow-auto
          ${mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Sign in</h2>
          <button
            onClick={onClose}
            className="rounded-lg px-3 py-1 text-sm hover:bg-black/5 dark:hover:bg-white/10"
            aria-label="Close sign in"
          >
            Close
          </button>
        </div>

        <div className="mb-4 flex gap-2">
          <button
            className={`flex-1 rounded-xl border px-4 py-2 text-sm ${tab === 'google'
              ? 'border-black dark:border-white'
              : 'border-neutral-300 dark:border-neutral-700'}`}
            onClick={() => setTab('google')}
          >
            Google
          </button>
          <button
            className={`flex-1 rounded-xl border px-4 py-2 text-sm ${tab === 'email'
              ? 'border-black dark:border-white'
              : 'border-neutral-300 dark:border-neutral-700'}`}
            onClick={() => setTab('email')}
          >
            E-mail
          </button>
        </div>

        {tab === 'google' ? (
          <div className="space-y-3">
            <button
              onClick={signInWithGoogle}
              disabled={loading}
              className="w-full rounded-xl border border-neutral-300 px-4 py-2 text-sm hover:bg-black/5 dark:border-neutral-700 dark:hover:bg-white/10"
            >
              {loading ? 'Redirecting…' : 'Continue with Google'}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex gap-2">
              <button
                className={`flex-1 rounded-xl border px-3 py-1 text-sm ${mode === 'signin'
                  ? 'border-black dark:border-white'
                  : 'border-neutral-300 dark:border-neutral-700'}`}
                onClick={() => setMode('signin')}
              >
                Sign in
              </button>
              <button
                className={`flex-1 rounded-xl border px-3 py-1 text-sm ${mode === 'signup'
                  ? 'border-black dark:border-white'
                  : 'border-neutral-300 dark:border-neutral-700'}`}
                onClick={() => setMode('signup')}
              >
                Create account
              </button>
            </div>

            <input
              type="email"
              placeholder="you@example.com"
              className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black dark:border-neutral-700 dark:bg-neutral-900 dark:focus:ring-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black dark:border-neutral-700 dark:bg-neutral-900 dark:focus:ring-white"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              minLength={6}
            />
            <button
              onClick={handleEmail}
              disabled={loading || !email || password.length < 6}
              className="w-full rounded-xl bg-black px-4 py-2 text-sm text-white hover:opacity-90 disabled:opacity-50 dark:bg-white dark:text-black"
            >
              {mode === 'signin' ? 'Sign in' : 'Create account'}
            </button>
          </div>
        )}

        {err ? <p className="mt-3 text-sm text-red-600">{err}</p> : null}
      </div>
    </div>
  );

  // Render buiten je app layout → geen afbreken/scroll issues
  return createPortal(overlay, document.body);
}

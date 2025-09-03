import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const LoginPage: React.FC = () => {
  const { signInWithEmail, signUpWithEmail, signInWithOAuth } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const location = useLocation() as any;
  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (mode === 'login') {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password);
      }
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message ?? 'Er ging iets mis. Probeer opnieuw.');
    } finally {
      setBusy(false);
    }
  };

  const oauth = async (p: 'google' | 'apple') => {
    setError(null);
    setBusy(true);
    try {
      await signInWithOAuth(p);
      // redirect handled by provider
    } catch (err: any) {
      setError(err.message ?? 'OAuth fout. Probeer opnieuw.');
      setBusy(false);
    }
  };

  return (
    <div className="relative min-h-screen text-white">
      <img
        src="/images/loginpage.webp"
        alt="Login achtergrond"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black/70" />

      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-black/60 backdrop-blur p-6">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 w-12 h-12 rounded-2xl bg-orange-500" />
            <h1 className="text-2xl font-bold">Coach Tai</h1>
            <p className="text-white/70 mt-1">
              “Ik ben je nieuwe login-buddy. Even inchecken en we gaan knallen.”
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-4">
            <button
              className={`py-2 rounded-xl font-semibold ${mode === 'login' ? 'bg-white text-black' : 'bg-white/10 text-white hover:bg-white/20'}`}
              onClick={() => setMode('login')}
              aria-pressed={mode === 'login'}
            >
              Inloggen
            </button>
            <button
              className={`py-2 rounded-xl font-semibold ${mode === 'signup' ? 'bg-white text-black' : 'bg-white/10 text-white hover:bg-white/20'}`}
              onClick={() => setMode('signup')}
              aria-pressed={mode === 'signup'}
            >
              Account maken
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <label className="block">
              <span className="text-sm text-white/80">E-mail</span>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 outline-none focus:border-orange-500"
                placeholder="jij@example.nl"
                autoComplete="email"
              />
            </label>
            <label className="block">
              <span className="text-sm text-white/80">Wachtwoord</span>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 outline-none focus:border-orange-500"
                placeholder="●●●●●●●●"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                minLength={6}
              />
            </label>

            {error && (
              <div className="rounded-lg bg-red-500/20 border border-red-500/30 text-red-200 px-3 py-2 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full py-2 rounded-xl bg-orange-500 text-black font-semibold hover:bg-orange-400 disabled:opacity-60"
            >
              {busy ? 'Bezig…' : (mode === 'login' ? 'Log in' : 'Maak account')}
            </button>
          </form>

          <div className="my-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs text-white/60">of</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => oauth('google')}
              className="py-2 rounded-xl bg-white text-black font-semibold hover:bg-white/90"
              disabled={busy}
            >
              Google
            </button>
            <button
              onClick={() => oauth('apple')}
              className="py-2 rounded-xl bg-white text-black font-semibold hover:bg-white/90"
              disabled={busy}
            >
              Apple
            </button>
          </div>

          <p className="mt-4 text-center text-xs text-white/60">
            Door in te loggen ga je akkoord met onze&nbsp;
            <Link to="#" className="underline">voorwaarden</Link>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

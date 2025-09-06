// src/routes/LoginPage.tsx
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";

const LoginPage: React.FC = () => {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation() as any;

  // redirect: query-param ?redirect=...  -> fallback naar location.state?.from -> anders /modules
  const params = new URLSearchParams(location.search);
  const redirect = params.get("redirect") || location.state?.from?.pathname || "/modules";

  // Achtergrond uit env of lokale fallback
  const bg = (import.meta.env.VITE_LOGIN_BG as string) || "https://fitprove.app/images/modules/loginpage.webp";
  const base = import.meta.env.BASE_URL || "/";
  const localFallback = `${base}images/loginpage.webp`;

  // Als al ingelogd → door
  useEffect(() => {
    let on = true;
    supabase.auth.getUser().then(({ data }) => {
      if (on && data.user) navigate(redirect, { replace: true });
    });
    return () => {
      on = false;
    };
  }, [navigate, redirect]);

  const hasV2Password = typeof (supabase.auth as any).signInWithPassword === "function";
  const hasV2OAuth = typeof (supabase.auth as any).signInWithOAuth === "function";

  async function submitEmailPassword(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (mode === "login") {
        if (hasV2Password) {
          const { error } = await supabase.auth.signInWithPassword({ email, password });
          if (error) throw error;
        } else {
          const { error } = await (supabase.auth as any).signIn({ email, password });
          if (error) throw error;
        }
        navigate(redirect, { replace: true });
      } else {
        // signup
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        // Je kunt hier eventueel een bevestigde melding tonen.
        navigate(redirect, { replace: true });
      }
    } catch (err: any) {
      setError(err?.message ?? "Inloggen mislukt.");
    } finally {
      setBusy(false);
    }
  }

  async function oauth(provider: "google" | "apple") {
    setBusy(true);
    setError(null);
    const redirectTo = `${window.location.origin}/`;
    try {
      if (hasV2OAuth) {
        const { error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo } });
        if (error) throw error;
      } else {
        const { error } = await (supabase.auth as any).signIn({ provider }, { redirectTo });
        if (error) throw error;
      }
      // Redirect volgt via provider
    } catch (err: any) {
      setError(err?.message ?? "OAuth inloggen mislukt.");
      setBusy(false);
    }
  }

  return (
    <div className="relative min-h-screen text-white">
      {/* Achtergrond */}
      <img
        src={bg}
        alt="Coach Tai login achtergrond"
        className="absolute inset-0 w-full h-full object-cover"
        onError={(e) => {
          const img = e.currentTarget as HTMLImageElement;
          if (img.src !== localFallback) img.src = localFallback;
          else img.style.display = "none";
        }}
      />
      <div className="absolute inset-0 bg-black/70" />

      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-black/60 backdrop-blur p-6">
          {/* Kop */}
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 w-12 h-12 rounded-2xl bg-orange-500" />
            <h1 className="text-2xl font-bold">Coach Tai</h1>
            <p className="text-white/70 mt-1">“Even inchecken en we gaan knallen. Ik hou je voortgang bij.”</p>
          </div>

          {/* Tabs */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <button
              type="button"
              className={`py-2 rounded-xl font-semibold ${mode === "login" ? "bg-white text-black" : "bg-white/10 text-white hover:bg-white/20"}`}
              onClick={() => setMode("login")}
              aria-pressed={mode === "login"}
            >
              Inloggen
            </button>
            <button
              type="button"
              className={`py-2 rounded-xl font-semibold ${mode === "signup" ? "bg-white text-black" : "bg-white/10 text-white hover:bg-white/20"}`}
              onClick={() => setMode("signup")}
              aria-pressed={mode === "signup"}
            >
              Account maken
            </button>
          </div>

          {/* Form */}
          <form onSubmit={submitEmailPassword} className="space-y-3">
            <label className="block">
              <span className="text-sm text-white/80">E-mail</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 outline-none focus:border-orange-500"
                placeholder="jij@example.nl"
                autoComplete="email"
                inputMode="email"
              />
            </label>

            <label className="block">
              <span className="text-sm text-white/80">Wachtwoord</span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 outline-none focus:border-orange-500"
                placeholder="●●●●●●●●"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
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
              {busy ? "Bezig…" : mode === "login" ? "Log in" : "Maak account"}
            </button>
          </form>

          {/* Divider */}
          <div className="my-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs text-white/60">of</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          {/* OAuth */}
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => oauth("google")} className="py-2 rounded-xl bg-white text-black font-semibold hover:bg-white/90" disabled={busy}>
              Google
            </button>
            <button onClick={() => oauth("apple")} className="py-2 rounded-xl bg-white text-black font-semibold hover:bg-white/90" disabled={busy}>
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

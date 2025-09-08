import React from "react";
import { supabase } from "@/lib/supabaseClient";
import SignInDialog from "@/components/auth/SignInDialog";

type UserBadge = { id: string; badge_code: string; awarded_at: string };

const CATALOG: Record<string, { title: string; description: string }> = {
  "10in30": { title: "10 in 30", description: "Voltooi 10 workouts in 30 dagen" },
};

export default function BadgesPage() {
  const [openSignIn, setOpenSignIn] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [items, setItems] = React.useState<UserBadge[]>([]);
  const [err, setErr] = React.useState<string | null>(null);

  React.useEffect(() => {
    let on = true;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const { data: auth } = await supabase.auth.getUser();
        if (!auth?.user) {
          setItems([]);
          setLoading(false);
          return;
        }
        const { data, error } = await supabase
          .from("user_badges")
          .select("id,badge_code,awarded_at")
          .order("awarded_at", { ascending: false });
        if (error) throw error;
        if (on) setItems((data || []) as UserBadge[]);
      } catch (e: any) {
        if (on) setErr(e?.message ?? "Kon badges niet laden.");
      } finally {
        if (on) setLoading(false);
      }
    })();
    return () => { on = false; };
  }, []);

  const known = Object.keys(CATALOG);
  const earnedCodes = new Set(items.map((b) => b.badge_code));

  return (
    <div className="px-4 py-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold">Badges</h1>
      <p className="text-sm text-muted-foreground">Overzicht van behaalde prestaties.</p>

      <div className="mt-3">
        {err ? <p className="text-sm text-red-600 dark:text-red-400">{err}</p> : null}
        {loading ? (
          <div className="space-y-2">
            <div className="h-16 animate-pulse rounded-2xl bg-muted/40" />
            <div className="h-16 animate-pulse rounded-2xl bg-muted/40" />
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border bg-card p-4 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span>Geen badges gevonden. Log in of voltooi workouts om badges te verdienen.</span>
              <button className="rounded-lg border px-3 py-1" onClick={() => setOpenSignIn(true)}>Inloggen</button>
            </div>
          </div>
        ) : null}
      </div>

      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
        {known.map((code) => {
          const meta = CATALOG[code];
          const earned = earnedCodes.has(code);
          const cls = earned
            ? "border-emerald-300/60 bg-emerald-50 dark:border-emerald-500/40 dark:bg-emerald-500/10"
            : "border-zinc-200/60 bg-white/80 opacity-70 dark:border-zinc-800/60 dark:bg-zinc-900/70";
          return (
            <div key={code} className={`rounded-xl border p-3 shadow-sm ${cls}`}>
              <div className="mb-1 h-8 w-8 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 opacity-80" />
              <div className="text-sm font-semibold">{meta.title}</div>
              <div className="text-xs text-muted-foreground">{meta.description}</div>
              <div className="mt-1 text-[11px]">Status: {earned ? "Behaald" : "Nog te behalen"}</div>
            </div>
          );
        })}
      </div>

      <SignInDialog open={openSignIn} onClose={() => setOpenSignIn(false)} />
    </div>
  );
}

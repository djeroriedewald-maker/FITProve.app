// FILE: src/context/AuthProvider.tsx
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { supabase } from "../lib/supabaseClient";

type Profile = {
  id: string;
  full_name?: string | null;
  username?: string | null;
  avatar_url?: string | null;
};

type AuthContextValue = {
  user: any | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Init + auth state changes
  useEffect(() => {
    let mounted = true;

    supabase.auth
      .getUser()
      .then(({ data, error }) => {
        if (error) console.warn("auth.getUser error:", error.message);
        if (!mounted) return;
        setUser(data.user ?? null);
        setLoading(false);
      })
      .catch((e) => {
        console.error("auth.getUser failed:", e);
        if (mounted) setLoading(false);
      });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  // Profiel laden wanneer user verandert
  useEffect(() => {
    let cancelled = false;

    async function loadProfile(uid: string) {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, username, avatar_url")
        .eq("id", uid)
        .single();

      if (error) {
        console.warn("profiles load error:", error.message);
        if (!cancelled) setProfile(null);
        return;
      }
      if (!cancelled) setProfile((data as Profile) ?? null);
    }

    if (user?.id) {
      loadProfile(user.id);
    } else {
      setProfile(null);
    }

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  // >>> Belangrijk: Promise<void> return type voor signOut
  async function handleSignOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("auth.signOut error:", error.message);
    }
  }

  const value: AuthContextValue = useMemo(
    () => ({
      user,
      profile,
      loading,
      signOut: handleSignOut,
    }),
    [user, profile, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}

import React from 'react';

export type User = {
  id: string;
  name: string;
  email?: string;
};

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  signIn: (data: { name: string; email?: string }) => Promise<void>;
  signOut: () => Promise<void>;
};

const Ctx = React.createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = 'fp_user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);

  // initial load from localStorage
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setUser(JSON.parse(raw));
      }
    } catch {}
    setLoading(false);
  }, []);

  const signIn = React.useCallback(
    async ({ name, email }: { name: string; email?: string }) => {
      // demo sign-in (normally you’d call an API)
      const u: User = {
        id: crypto?.randomUUID ? crypto.randomUUID() : String(Date.now()),
        name: name.trim() || 'User',
        email: email?.trim(),
      };
      setUser(u);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    },
    []
  );

  const signOut = React.useCallback(async () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const value: AuthContextValue = React.useMemo(
    () => ({ user, loading, signIn, signOut }),
    [user, loading, signIn, signOut]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = React.useContext(Ctx);
  if (!v) throw new Error('useAuth must be used within <AuthProvider>');
  return v;
}

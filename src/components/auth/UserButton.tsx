// src/components/auth/UserButton.tsx
import { useMemo, useState } from "react";
import { useAuth } from "../../context/AuthProvider";
import SignInDialog from "./SignInDialog";
import { Link } from "react-router-dom";

function initials(name?: string | null, email?: string | null) {
  if (name && name.trim()) {
    return name
      .split(" ")
      .slice(0, 2)
      .map((s) => s[0]?.toUpperCase())
      .join("");
  }
  if (email) return email[0]?.toUpperCase();
  return "U";
}

export default function UserButton() {
  // Cast naar any zodat TS niet valt over 'profile' tot we de context types aanpassen
  const { user, profile, signOut } = useAuth() as any;
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);

  const label = useMemo(
    () =>
      profile?.full_name ||
      user?.user_metadata?.full_name ||
      user?.email ||
      "User",
    [profile?.full_name, user]
  );

  if (!user) {
    return (
      <>
        <button
          onClick={() => setOpen(true)}
          className="rounded-2xl border border-neutral-300 px-3 py-1 text-sm hover:bg-black/5 dark:border-neutral-700 dark:hover:bg-white/10"
        >
          Log in
        </button>
        <SignInDialog open={open} onClose={() => setOpen(false)} />
      </>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setMenu((v) => !v)}
        className="flex items-center gap-2 rounded-2xl border border-neutral-300 px-2 py-1 hover:bg-black/5 dark:border-neutral-700 dark:hover:bg-white/10"
        aria-label="Open profile menu"
      >
        {profile?.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt={label}
            className="h-7 w-7 rounded-full object-cover"
            referrerPolicy="no-referrer"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-200 text-xs font-semibold dark:bg-neutral-700">
            {initials(
              profile?.full_name ?? user?.user_metadata?.full_name,
              user?.email
            )}
          </div>
        )}
      </button>

      {menu && (
        <div
          className="absolute right-0 mt-2 w-48 rounded-xl border border-neutral-200 bg-white p-1 text-sm shadow-xl dark:border-neutral-700 dark:bg-neutral-900"
          onMouseLeave={() => setMenu(false)}
        >
          <div className="px-3 py-2 font-medium">{label}</div>
          <Link
            to="/profile"
            className="block rounded-lg px-3 py-2 hover:bg-black/5 dark:hover:bg-white/10"
            onClick={() => setMenu(false)}
          >
            Profile
          </Link>
          <button
            onClick={() => {
              setMenu(false);
              signOut?.();
            }}
            className="block w-full rounded-lg px-3 py-2 text-left hover:bg-black/5 dark:hover:bg-white/10"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

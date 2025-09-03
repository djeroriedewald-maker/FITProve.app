import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider"; // ⬅️ was "@/context/AuthProvider"

function getAvatarInfo(user: any) {
  const meta = user?.user_metadata || {};
  const picture: string | undefined = meta.avatar_url || meta.picture || meta.avatar || undefined;
  const email: string | undefined = user?.email;
  const name: string | undefined = meta.full_name || meta.name || email || "User";

  const initials = (name || "U")
    .split(" ")
    .map((s: string) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return { picture, name, initials };
}

const ProfileMenu: React.FC = () => {
  const { user, signOut } = useAuth() as any;
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { picture, name, initials } = getAvatarInfo(user);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, []);

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-9 h-9 rounded-full bg-white/10 border border-white/10 overflow-hidden grid place-items-center"
        aria-label="Profielmenu"
      >
        {picture ? (
          <img src={picture} alt={name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-white text-sm font-semibold">{initials}</span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 rounded-xl border border-white/10 bg-black/80 backdrop-blur shadow-lg overflow-hidden">
          <div className="px-3 py-2 text-white/70 text-sm border-b border-white/10">{name}</div>
          <nav className="py-1">
            <Link
              to="/profile"
              className="block px-3 py-2 text-sm text-white/90 hover:bg-white/10"
              onClick={() => setOpen(false)}
            >
              Profiel
            </Link>
            <Link
              to="/dashboard"
              className="block px-3 py-2 text-sm text-white/90 hover:bg-white/10"
              onClick={() => setOpen(false)}
            >
              Dashboard
            </Link>
            <button
              onClick={handleLogout}
              className="w-full text-left block px-3 py-2 text-sm text-white/90 hover:bg-white/10"
            >
              Uitloggen
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;

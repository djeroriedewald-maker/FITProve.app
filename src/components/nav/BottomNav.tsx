// src/components/nav/BottomNav.tsx
import { NavLink } from "react-router-dom";
import { Home, Dumbbell, Activity, Newspaper, Layers } from "lucide-react";

const base =
  "flex flex-col items-center justify-center gap-1 flex-1 py-2 text-xs ring-focus";
const active = "text-orange-500 dark:text-orange-400";
const inactive =
  "text-gray-500 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400";

function Item({
  to,
  label,
  icon,
}: {
  to: string;
  label: string;
  icon: JSX.Element;
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `${base} ${isActive ? active : inactive}`}
      aria-label={label}
      end={to === "/"}
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
}

export default function BottomNav() {
  return (
    <nav
      role="navigation"
      aria-label="Bottom navigation"
      className="fixed bottom-0 inset-x-0 z-50 h-16 pb-[env(safe-area-inset-bottom,0px)] border-t border-zinc-200/60 dark:border-zinc-800/60 bg-white/85 dark:bg-slate-950/75 backdrop-blur-md shadow-[0_-2px_12px_rgba(0,0,0,0.25)] supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-950/60"
    >
      <div className="mx-auto flex w-full h-full max-w-3xl items-stretch">
        <Item to="/"        label="Home"    icon={<Home className="h-5 w-5" />} />
        <Item to="/coach"   label="Coach"   icon={<Dumbbell className="h-5 w-5" />} />
        <Item to="/stats"   label="Stats"   icon={<Activity className="h-5 w-5" />} />
        <Item to="/modules" label="Modules" icon={<Layers className="h-5 w-5" />} />
        <Item to="/news"    label="News"    icon={<Newspaper className="h-5 w-5" />} />
      </div>
    </nav>
  );
}

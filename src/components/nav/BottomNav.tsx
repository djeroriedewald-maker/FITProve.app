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
      className="fixed bottom-0 inset-x-0 z-50 border-t border-zinc-200/60 dark:border-zinc-800/60 bg-white/80 dark:bg-slate-950/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-950/60"
    >
      <div className="mx-auto flex w-full max-w-3xl">
        <Item to="/"        label="Home"    icon={<Home className="h-5 w-5" />} />
        <Item to="/coach"   label="Coach"   icon={<Dumbbell className="h-5 w-5" />} />
        <Item to="/stats"   label="Stats"   icon={<Activity className="h-5 w-5" />} />
        <Item to="/modules" label="Modules" icon={<Layers className="h-5 w-5" />} />
        <Item to="/news"    label="News"    icon={<Newspaper className="h-5 w-5" />} />
      </div>
    </nav>
  );
}

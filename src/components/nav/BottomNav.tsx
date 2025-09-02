import { NavLink } from "react-router-dom";
import { Home, Dumbbell, Activity, Newspaper } from "lucide-react";

export default function BottomNav() {
  const linkBase =
    "flex flex-col items-center justify-center gap-1 w-1/4 py-2 text-xs transition-colors duration-150";
  const active = "text-blue-600 dark:text-blue-400";
  const inactive =
    "text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200";

  const wrap =
    "safe-bottom fixed bottom-0 inset-x-0 z-50 border-t backdrop-blur bg-white/90 dark:bg-neutral-900/80 border-neutral-200 dark:border-neutral-700 transition-colors duration-200";

  const Item = (to: string, label: string, icon: JSX.Element) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `${linkBase} ${isActive ? active : inactive}`
      }
    >
      <div className="transition-transform duration-150 group-hover:scale-110">
        {icon}
      </div>
      <span>{label}</span>
    </NavLink>
  );

  return (
    <nav className={wrap} role="navigation" aria-label="Bottom navigation">
      <div className="mx-auto flex max-w-screen-sm">
        {Item("/", "Home", <Home className="h-5 w-5" />)}
        {Item("/coach", "Coach", <Dumbbell className="h-5 w-5" />)}
        {Item("/stats", "Stats", <Activity className="h-5 w-5" />)}
        {Item("/news", "News", <Newspaper className="h-5 w-5" />)}
      </div>
    </nav>
  );
}

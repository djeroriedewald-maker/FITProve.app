import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Home, Dumbbell, LineChart, Newspaper } from "lucide-react";

type Item = {
  to: string;
  label: string;
  icon: React.ReactNode;
  aria: string;
};

const items: Item[] = [
  { to: "/", label: "Home", icon: <Home size={22} aria-hidden="true" />, aria: "Go to Home" },
  { to: "/coach", label: "Coach", icon: <Dumbbell size={22} aria-hidden="true" />, aria: "Open Coach" },
  { to: "/stats", label: "Stats", icon: <LineChart size={22} aria-hidden="true" />, aria: "View Stats" },
  { to: "/news", label: "News", icon: <Newspaper size={22} aria-hidden="true" />, aria: "Read News" },
];

export function BottomNav() {
  const loc = useLocation();
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-black/10 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:border-white/10 dark:bg-neutral-900/90 dark:supports-[backdrop-filter]:bg-neutral-900/70"
      role="navigation"
      aria-label="Bottom Navigation"
    >
      <ul className="mx-auto grid max-w-screen-md grid-cols-4 gap-1 px-2 pb-[calc(env(safe-area-inset-bottom)+8px)] pt-2">
        {items.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              aria-label={item.aria}
              className={({ isActive }) =>
                [
                  "group flex flex-col items-center justify-center rounded-2xl p-2 text-xs font-medium outline-none ring-0 transition",
                  "hover:bg-black/5 focus-visible:bg-black/10 dark:hover:bg-white/5 dark:focus-visible:bg-white/10",
                  isActive ? "text-orange-600 dark:text-orange-400" : "text-gray-700 dark:text-neutral-200",
                ].join(" ")
              }
              end={item.to === "/"}
            >
              <div
                className={[
                  "rounded-xl p-1",
                  loc.pathname === item.to ? "bg-orange-100 dark:bg-orange-900/30" : "",
                ].join(" ")}
              >
                {item.icon}
              </div>
              <span className="mt-1 leading-none">{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Home, Dumbbell, LineChart, Newspaper } from "lucide-react";
const items=[
  {to:"/",label:"Home",icon:Home},
  {to:"/coach",label:"Coach",icon:Dumbbell},
  {to:"/stats",label:"Stats",icon:LineChart},
  {to:"/news",label:"News",icon:Newspaper},
] as const;
export default function BottomNav(){
  const {pathname}=useLocation();
  return(
    <nav className="sticky bottom-0 inset-x-0 bg-card/90 backdrop-blur border-t border-border">
      <ul className="grid grid-cols-4">
        {items.map(it=>{
          const Icon=it.icon; const active=pathname===it.to;
          return(
            <li key={it.to}>
              <NavLink to={it.to} className="flex flex-col items-center justify-center py-3 text-xs"
                aria-current={active?"page":undefined}>
                <Icon className={`h-5 w-5 ${active?"text-brand":"text-subtle"}`} />
                <span className={`${active?"text-brand":"text-subtle"}`}>{it.label}</span>
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

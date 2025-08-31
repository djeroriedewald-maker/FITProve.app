import React,{createContext,useContext,useEffect,useMemo,useState} from "react";
type Theme = "light"|"dark";
type Ctx = { theme:Theme; toggle:()=>void; set:(t:Theme)=>void };
const ThemeCtx = createContext<Ctx|null>(null);
const STORAGE_KEY="fp_theme";
function getInitialTheme():Theme{
  if(typeof window==="undefined") return "light";
  const s=window.localStorage.getItem(STORAGE_KEY) as Theme|null;
  if(s==="light"||s==="dark") return s;
  const prefers=window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches;
  return prefers?"dark":"light";
}
export const ThemeProvider:React.FC<{children:React.ReactNode}>=({children})=>{
  const [theme,setTheme]=useState<Theme>(getInitialTheme);
  useEffect(()=>{
    const root=document.documentElement;
    theme==="dark"?root.classList.add("dark"):root.classList.remove("dark");
    window.localStorage.setItem(STORAGE_KEY,theme);
  },[theme]);
  const value=useMemo<Ctx>(()=>({
    theme,
    toggle:()=>setTheme(t=>t==="dark"?"light":"dark"),
    set:setTheme
  }),[theme]);
  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
};
export function useTheme(){
  const ctx=useContext(ThemeCtx);
  if(!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

import React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../theme/ThemeProvider";
const ThemeToggle:React.FC=()=>{
  const {theme,toggle}=useTheme();
  return(
    <button aria-label="Toggle theme" onClick={toggle}
      className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-sm bg-card hover:opacity-90 transition">
      {theme==="dark"?<Sun className="w-4 h-4" />:<Moon className="w-4 h-4" />}
      <span className="hidden sm:inline">{theme==="dark"?"Light":"Dark"}</span>
    </button>
  );
};
export default ThemeToggle;

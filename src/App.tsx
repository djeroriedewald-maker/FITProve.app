import React,{Suspense,lazy} from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import BottomNav from "./components/nav/BottomNav";
import { ThemeProvider } from "./theme/ThemeProvider";
import ThemeToggle from "./components/ui/ThemeToggle";
const Home=lazy(()=>import("./routes/Home"));
const Coach=lazy(()=>import("./routes/Coach"));
const Stats=lazy(()=>import("./routes/Stats"));
const News=lazy(()=>import("./routes/News"));
export default function App(){
  return(
    <ThemeProvider>
      <div className="min-h-dvh bg-bg text-text flex flex-col">
        <header className="sticky top-0 z-10 bg-card/70 backdrop-blur border-b border-border">
          <div className="mx-auto max-w-screen-sm px-4 py-3 flex items-center justify-between">
            <div className="font-bold">FITProve.app</div>
            <ThemeToggle/>
          </div>
        </header>
        <main className="mx-auto w-full max-w-screen-sm flex-1 px-4 py-4">
          <Suspense fallback={<div>Loading…</div>}>
            <Routes>
              <Route path="/" element={<Home/>}/>
              <Route path="/coach" element={<Coach/>}/>
              <Route path="/stats" element={<Stats/>}/>
              <Route path="/news" element={<News/>}/>
              <Route path="*" element={<Navigate to="/" replace/>}/>
            </Routes>
          </Suspense>
        </main>
        <footer className="mx-auto w-full max-w-screen-sm pb-safe">
          <BottomNav/>
        </footer>
      </div>
    </ThemeProvider>
  );
}

import React, { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { BottomNav } from "./components/nav/BottomNav";

const Home = lazy(() => import("./routes/Home"));
const Coach = lazy(() => import("./routes/Coach"));
const Stats = lazy(() => import("./routes/Stats"));
const News = lazy(() => import("./routes/News"));

export default function App() {
  return (
    <div className="min-h-dvh bg-white text-gray-900 dark:bg-neutral-900 dark:text-neutral-100">
      <div className="mx-auto max-w-screen-md px-3 pb-[calc(env(safe-area-inset-bottom)+72px)] pt-3">
        <Suspense fallback={<div className="p-4">Loading…</div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/coach" element={<Coach />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="/news" element={<News />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </Suspense>
      </div>
      <BottomNav />
    </div>
  );
}

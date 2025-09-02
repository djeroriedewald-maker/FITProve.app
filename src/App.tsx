import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AppShell from "./layout/AppShell";

const Home = lazy(() => import("./routes/Home"));
const Coach = lazy(() => import("./routes/Coach"));
const Stats = lazy(() => import("./routes/Stats"));
const News = lazy(() => import("./routes/News"));

export default function App() {
  return (
    <AppShell>
      <Suspense fallback={<div className="px-4 py-6">Loading…</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/coach" element={<Coach />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/news" element={<News />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </AppShell>
  );
}

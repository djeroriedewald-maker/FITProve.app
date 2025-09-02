import React from "react";
import { Routes, Route } from "react-router-dom";

import Home from "./routes/Home";
import Coach from "./routes/Coach";
import Stats from "./routes/Stats";
import News from "./routes/News";

import BottomNav from "./components/nav/BottomNav"; // ✅ zonder .tsx
import ThemeToggle from "./components/ui/ThemeToggle"; // ✅ zonder .tsx

function App() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
      {/* Header */}
      <header className="flex justify-between items-center p-4">
        <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">
          FITProve.app
        </h1>
        <ThemeToggle />
      </header>

      {/* Routes */}
      <main className="px-4 pb-20">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/coach" element={<Coach />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/news" element={<News />} />
        </Routes>
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}

export default App;

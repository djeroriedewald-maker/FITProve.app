// src/layout/AppShell.tsx (restored Header + BottomNav)
import React from "react";
import Header from "../components/Header";
import BottomNav from "../components/nav/BottomNav";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-svh flex flex-col bg-transparent">
      {/* Top navigation bar */}
      <Header />

      {/* Main content */}
      <main className="mx-auto w-full max-w-3xl px-4 pt-4 pb-24">{children}</main>

      {/* Bottom navigation (component handles fixed positioning) */}
      <BottomNav />
    </div>
  );
}


import React from "react";
import { Link } from "react-router-dom";
import BottomNav from "../components/nav/BottomNav";

/**
 * AppShell
 * - Geen eigen achtergrond/border/rounded -> full-bleed page bg komt uit body/#root (index.css)
 * - Header: transparant + blur, zonder borders
 * - Main: centrale contentbreedte, padding onder ivm bottom nav
 * - ThemeToggle bewust niet hier om dubbele knop te voorkomen
 */
export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-svh flex flex-col bg-transparent">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-black/5 bg-transparent">
        <div className="mx-auto w-full max-w-3xl px-4 py-3 flex items-center justify-between">
          <Link to="/" className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            FITProve.app
          </Link>
          {/* ThemeToggle staat elders, niet hier */}
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto w-full max-w-3xl px-4 pt-4 pb-24">
        {children}
      </main>

      {/* Bottom navigation (fixed) */}
      <nav aria-label="Bottom" className="fixed bottom-0 inset-x-0 z-40">
        <div className="mx-auto w-full max-w-3xl px-4">
          <BottomNav />
        </div>
      </nav>
    </div>
  );
}

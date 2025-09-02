// src/layout/AppShell.tsx
import React from "react";
import { Link } from "react-router-dom";
import BottomNav from "../components/nav/BottomNav";
import ThemeToggle from "../components/ui/ThemeToggle";
import UserButton from "../components/auth/UserButton";

/**
 * AppShell
 * - Full-bleed page bg via body/#root (index.css)
 * - Header: transparant + blur, zonder borders
 * - Main: centrale contentbreedte, extra bottom padding voor nav
 * - Header rechts: UserButton (login/profiel) links van de ThemeToggle
 */
export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-svh flex flex-col bg-transparent">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-black/5 bg-transparent">
        <div className="mx-auto w-full max-w-3xl px-4 py-3 flex items-center justify-between">
          <Link
            to="/"
            className="text-sm font-semibold text-gray-900 dark:text-gray-100"
          >
            FITProve.app
          </Link>

          {/* Rechts: eerst UserButton, dan ThemeToggle */}
          <div className="flex items-center gap-2">
            <UserButton />
            <ThemeToggle />
          </div>
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

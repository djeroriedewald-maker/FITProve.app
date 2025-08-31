import React from "react";

type AppShellProps = {
  header?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
};

/** Basic layout wrapper for pages (safe paddings, max width) */
export default function AppShell({ header, footer, children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-50">
      <header className="sticky top-0 z-10 border-b border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-950/70 backdrop-blur">
        <div className="mx-auto max-w-5xl px-4 py-3">
          {header ?? (
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-semibold">FITProve.app</h1>
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>

      <footer className="border-t border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-950/70">
        <div className="mx-auto max-w-5xl px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
          {footer ?? <span>© {new Date().getFullYear()} FITProve</span>}
        </div>
      </footer>
    </div>
  );
}
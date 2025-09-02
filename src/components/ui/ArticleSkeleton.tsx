import React from "react";

/**
 * ArticleSkeleton
 * - Minimal, elegant skeleton card voor een nieuwsitem.
 * - Werkt in dark/light mode en is mobile-first.
 */
export default function ArticleSkeleton() {
  return (
    <div
      className="rounded-2xl border border-transparent/10 bg-muted/20 p-3 sm:p-4 md:p-5 overflow-hidden"
      aria-hidden="true"
    >
      {/* Image */}
      <div className="relative w-full aspect-[16/9] overflow-hidden rounded-xl mb-4">
        <div className="h-full w-full animate-pulse bg-gradient-to-r from-black/5 via-black/10 to-black/5 dark:from-white/5 dark:via-white/10 dark:to-white/5" />
      </div>

      {/* Badge + meta */}
      <div className="mb-2 flex items-center gap-3">
        <div className="h-5 w-20 rounded-full animate-pulse bg-foreground/10" />
        <div className="h-4 w-12 rounded-full animate-pulse bg-foreground/10" />
      </div>

      {/* Title */}
      <div className="space-y-2 mb-3">
        <div className="h-5 w-3/4 rounded-md animate-pulse bg-foreground/15" />
        <div className="h-5 w-2/5 rounded-md animate-pulse bg-foreground/10" />
      </div>

      {/* Excerpt */}
      <div className="space-y-2">
        <div className="h-4 w-full rounded-md animate-pulse bg-foreground/10" />
        <div className="h-4 w-11/12 rounded-md animate-pulse bg-foreground/10" />
        <div className="h-4 w-2/3 rounded-md animate-pulse bg-foreground/10" />
      </div>
    </div>
  );
}

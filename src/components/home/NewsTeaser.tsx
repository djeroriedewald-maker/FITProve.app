import React from "react";
import { Link } from "react-router-dom";

type Article = { id: string; title: string; tag?: string; timeAgo?: string };
const ARTICLES: Article[] = [
  { id: "n1", title: "HIIT boosts VO₂ max in 4 weeks", tag: "Research", timeAgo: "2h" },
  { id: "n2", title: "Protein timing: myth or must?", tag: "Nutrition", timeAgo: "6h" },
  { id: "n3", title: "Hyrox pacing: ladder approach", tag: "Hyrox", timeAgo: "Yesterday" },
];

export default function NewsTeaser() {
  return (
    <div className="rounded-xl border border-zinc-200/60 bg-white/80 shadow-sm dark:border-zinc-800/60 dark:bg-zinc-900/70">
      <ul className="divide-y divide-zinc-200/60 dark:divide-zinc-800/60">
        {ARTICLES.map((a) => (
          <li key={a.id} className="px-4 py-3">
            <p className="line-clamp-1 text-sm font-medium text-zinc-900 dark:text-zinc-50">
              {a.title}
            </p>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              {a.tag ? `${a.tag} • ` : ""}{a.timeAgo ?? ""}
            </p>
          </li>
        ))}
      </ul>
      <div className="flex justify-end px-4 py-2">
        <Link
          to="/news"
          className="text-sm text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
        >
          See all →
        </Link>
      </div>
    </div>
  );
}

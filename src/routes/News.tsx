import React from "react";
import { NEWS_FEED } from "../data/news";
import ArticleCard from "../components/ui/ArticleCard";
import ArticleSkeleton from "../components/ui/ArticleSkeleton";

type Article = (typeof NEWS_FEED)[number];

export default function News() {
  const [loading, setLoading] = React.useState(true);
  const [items, setItems] = React.useState<Article[]>([]);

  React.useEffect(() => {
    // Fake fetch: eerst skeletons tonen, daarna mock data renderen
    const t = setTimeout(() => {
      setItems(NEWS_FEED);
      setLoading(false);
    }, 700); // 600–800ms voelt natuurlijk
    return () => clearTimeout(t);
  }, []);

  return (
    <main
      className="mx-auto w-full max-w-screen-md px-4 py-6 sm:py-8"
      aria-busy={loading}
    >
      <header className="mb-4 sm:mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          News
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Latest training, nutrition and recovery insights.
        </p>
      </header>

      <section className="grid gap-4 sm:gap-6">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <ArticleSkeleton key={i} />)
          : items.map((n) => <ArticleCard key={n.id} item={n} />)}
      </section>
    </main>
  );
}

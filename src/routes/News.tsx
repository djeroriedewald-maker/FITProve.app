import { NEWS_FEED } from "../data/news";
import ArticleCard from "../components/ui/ArticleCard";

export default function News() {
  return (
    <main className="mx-auto w-full max-w-screen-md px-4 py-6 sm:py-8">
      <header className="mb-4 sm:mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          News
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Latest training, nutrition and recovery insights.
        </p>
      </header>

      <section className="grid gap-4 sm:gap-6">
        {NEWS_FEED.map((n) => (
          <ArticleCard key={n.id} item={n} />
        ))}
      </section>
    </main>
  );
}

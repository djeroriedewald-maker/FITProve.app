import { FC } from "react";
import { NewsItem } from "../../data/news";
import { ArrowUpRight, Clock } from "lucide-react";

type Props = { item: NewsItem };

export const ArticleCard: FC<Props> = ({ item }) => {
  return (
    <article className="rounded-2xl border border-black/5 dark:border-white/5 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
      {item.image && (
        <img
          src={item.image}
          alt=""
          className="h-40 w-full object-cover"
          loading="lazy"
        />
      )}
      <div className="p-4 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="inline-flex items-center gap-2 px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300">
            {item.tag ?? "Update"}
          </span>
          <span className="inline-flex items-center gap-1 text-zinc-500 dark:text-zinc-400">
            <Clock className="h-3.5 w-3.5" /> {item.time}
          </span>
        </div>
        <h3 className="font-semibold leading-snug text-zinc-900 dark:text-zinc-50">
          {item.title}
        </h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {item.excerpt}
        </p>
        <button
          className="mt-1 inline-flex items-center gap-2 text-sm font-medium text-orange-600 hover:text-orange-700 dark:text-orange-300 dark:hover:text-orange-200"
          aria-label="Open article"
        >
          Read more <ArrowUpRight className="h-4 w-4" />
        </button>
      </div>
    </article>
  );
};
export default ArticleCard;

import { Link } from "react-router-dom";

export type ModuleCardProps = {
  to: string;
  title: string;
  description?: string;
  image?: string; // mag volledig pad zijn of alleen bestandsnaam
};

export default function ModuleCard({
  to,
  title,
  description,
  image,
}: ModuleCardProps) {
  // Local-first in dev, remote-first in prod.
  let imgUrl: string | undefined;
  let fallback: string | undefined;
  if (image) {
    const isRemote = image.startsWith("http");
    const name = image.split("/").pop() || image;
    const local = `/images/${name}`; // project stores images under /images
    const remote = isRemote ? image : `https://fitprove.app/images/modules/${name}`;
    const isDev = import.meta.env.DEV;
    imgUrl = isDev ? local : remote;
    fallback = isDev ? remote : local;
  }

  return (
    <Link
      to={to}
      className="group overflow-hidden rounded-2xl border border-border bg-card hover:bg-accent/30 transition"
    >
      {imgUrl ? (
        <div className="aspect-[16/9] w-full overflow-hidden">
          <img
            src={imgUrl}
            alt={title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            onError={(e) => {
              const img = e.currentTarget as HTMLImageElement;
              if (fallback && img.src !== fallback) img.src = fallback;
              else img.src = "/images/hero.svg";
            }}
          />
        </div>
      ) : null}

      <div className="p-4">
        <h3 className="text-base font-semibold">{title}</h3>
        {description ? (
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
            {description}
          </p>
        ) : null}
      </div>
    </Link>
  );
}

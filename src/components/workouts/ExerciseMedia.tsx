import { useEffect, useRef, useState } from "react";

type Props = {
  name: string;
  mp4Url?: string | null;
  webmUrl?: string | null;
  gifUrl?: string | null;
  posterUrl?: string | null;
  className?: string;
};

export default function ExerciseMedia({
  name,
  mp4Url,
  webmUrl,
  gifUrl,
  posterUrl,
  className,
}: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const hasVideo = Boolean(mp4Url || webmUrl);

  useEffect(() => {
    if (!videoRef.current) return;
    const el = videoRef.current;
    const obs = new IntersectionObserver(
      ([entry]) => setIsIntersecting(entry.isIntersecting),
      { threshold: 0.5 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (isIntersecting) {
      v.play().catch(() => {});
    } else {
      v.pause();
    }
  }, [isIntersecting]);

  if (hasVideo) {
    return (
      <video
        ref={videoRef}
        className={className ?? "w-full rounded-2xl shadow"}
        poster={posterUrl ?? undefined}
        muted
        loop
        playsInline
        preload="metadata"
      >
        {webmUrl && <source src={webmUrl} type="video/webm" />}
        {mp4Url && <source src={mp4Url} type="video/mp4" />}
        Je apparaat ondersteunt de video niet. Bekijk alternatieven hieronder.
      </video>
    );
  }

  if (gifUrl) {
    return (
      <img
        src={gifUrl}
        alt={`${name} demonstratie`}
        className={className ?? "w-full rounded-2xl shadow"}
        loading="lazy"
      />
    );
  }

  const q = encodeURIComponent(`${name} exercise`);
  return (
    <div className={className ?? "w-full rounded-2xl p-4 border border-neutral-800"}>
      <p className="text-sm opacity-80">
        Geen video beschikbaar voor <strong>{name}</strong>.
      </p>
      <a
        className="inline-flex mt-2 px-3 py-2 rounded-xl border hover:bg-neutral-900"
        href={`https://www.google.com/search?q=${q}&tbm=vid`}
        target="_blank"
        rel="noopener noreferrer"
      >
        Bekijk voorbeelden
      </a>
    </div>
  );
}

// scripts/build/workout-sources.ts
/**
 * Zelfstandige (type-safe) stubs voor workout-brondata.
 * Doel: typecheck/CI laten slagen zonder externe afhankelijkheden.
 */

export type Media = {
  images?: string[];
  gifs?: string[];
  videos?: string[];
  thumbnail?: string;
};

export type LicenseInfo = {
  name: string;
  url?: string;
  attribution?: string;
};

export type NormalizedExercise = {
  id: string;
  slug: string;
  name: string;
  description?: string;
  instructions?: string[];
  primaryMuscles: string[];
  secondaryMuscles?: string[];
  equipment: string[];
  category?: string;
  media: Media;
  language: "en";
  sources?: { vendor: "wger" | "exerciseDB"; id: string; url?: string; license?: LicenseInfo }[];
};

export function slugify(s: string): string {
  return (s || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function shortHash(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h.toString(36);
}

export function hasAnyMedia(m?: Media): boolean {
  if (!m) return false;
  return (
    (m.images?.length ?? 0) > 0 ||
    (m.gifs?.length ?? 0) > 0 ||
    (m.videos?.length ?? 0) > 0 ||
    !!m.thumbnail
  );
}

export function normalizeLabel(s?: string | null): string | undefined {
  const t = (s ?? "").trim();
  return t.length ? t : undefined;
}

/** Bron #1: wger – stub die een lege lijst retourneert */
export async function fetchFromWger(): Promise<NormalizedExercise[]> {
  return [];
}

/** Bron #2: exerciseDB – stub die een lege lijst retourneert */
export async function fetchFromExerciseDB(): Promise<NormalizedExercise[]> {
  return [];
}

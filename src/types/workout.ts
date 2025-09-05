// src/types/workout.ts
export type LicenseInfo = {
  name: string;
  url?: string;
  attribution?: string;
};

export type ExerciseSource =
  | { vendor: 'wger'; id: string; url?: string; license: LicenseInfo }
  | { vendor: 'exerciseDB'; id: string; url?: string; license: LicenseInfo };

export type ExerciseMedia = {
  images?: string[];
  gifs?: string[];
  videos?: string[];
  thumbnail?: string;
};

export type NormalizedExercise = {
  id: string;
  slug: string;
  name: string;
  aliases?: string[];
  description?: string;
  instructions?: string[];
  primaryMuscles: string[];
  secondaryMuscles?: string[];
  equipment: string[];
  category?: string;
  level?: string;
  language?: string;
  media: ExerciseMedia;
  sources: ExerciseSource[];
};

export type WorkoutManifest = {
  version: string;
  createdAt: string;
  total: number;
  chunkSize: number;
  chunks: number;
  basePath: string;
  attribution: {
    wger?: LicenseInfo & { count: number };
    exerciseDB?: LicenseInfo & { count: number };
  };
};

export type ExerciseFilter = {
  q?: string;
  muscles?: string[];
  equipment?: string[];
  category?: string;
};

export const DEFAULT_CHUNK_SIZE = 500;

export function slugify(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export function shortHash(input: string): string {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(36);
}

export function ensureArray<T>(v: T | T[] | undefined): T[] {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

export function hasAnyMedia(m: ExerciseMedia | undefined): boolean {
  if (!m) return false;
  return Boolean((m.images && m.images.length) || (m.gifs && m.gifs.length));
}

export function normalizeName(s: string): string {
  return s.trim().replace(/\s+/g, ' ').replace(/[’'`]/g, "'").toLowerCase();
}

export function normalizeLabel(s: string): string {
  return s.trim().toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ');
}

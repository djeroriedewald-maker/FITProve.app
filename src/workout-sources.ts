// src/workout-sources.ts
// Unified runtime loader that the UI should import.
// Workouts ↔ VITE_WORKOUTS_BASE (v20250906)
// Exercises ↔ VITE_EXERCISES_BASE (v20250905) [fallback: VITE_WORKOUTS_BASE]

type Manifest = { total: number; chunks: number; chunkSize?: number; version?: string; basePath?: string; generatedAt?: string };

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`HTTP ${res.status} @ ${url}`);
  return (await res.json()) as T;
}
const clean = (u: string) => (u || '').trim().replace(/\/manifest\.json$/i, '').replace(/\/+$/g, '');
const manifestUrl = (base: string) => `${clean(base)}/manifest.json`;
const chunkUrl = (base: string, i: number) => `${clean(base)}/chunk-${String(i).padStart(3, '0')}.json`;

export async function loadAllWorkouts<T = any>(): Promise<T[]> {
  const base = clean(import.meta.env.VITE_WORKOUTS_BASE as string);
  const m = await fetchJson<Manifest>(manifestUrl(base));
  const out: T[] = [];
  for (let i = 0; i < m.chunks; i++) out.push(...(await fetchJson<T[]>(chunkUrl(base, i))));
  return out;
}

export async function loadAllExercises<T = any>(): Promise<T[]> {
  const base = clean((import.meta.env.VITE_EXERCISES_BASE as string) || (import.meta.env.VITE_WORKOUTS_BASE as string));
  const m = await fetchJson<Manifest>(manifestUrl(base));
  const out: T[] = [];
  for (let i = 0; i < m.chunks; i++) out.push(...(await fetchJson<T[]>(chunkUrl(base, i))));
  return out;
}

export async function* streamWorkouts<T = any>(): AsyncGenerator<T[], void> {
  const base = clean(import.meta.env.VITE_WORKOUTS_BASE as string);
  const m = await fetchJson<Manifest>(manifestUrl(base));
  for (let i = 0; i < m.chunks; i++) yield await fetchJson<T[]>(chunkUrl(base, i));
}

export async function* streamExercises<T = any>(): AsyncGenerator<T[], void> {
  const base = clean((import.meta.env.VITE_EXERCISES_BASE as string) || (import.meta.env.VITE_WORKOUTS_BASE as string));
  const m = await fetchJson<Manifest>(manifestUrl(base));
  for (let i = 0; i < m.chunks; i++) yield await fetchJson<T[]>(chunkUrl(base, i));
}

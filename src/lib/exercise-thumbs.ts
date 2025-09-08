// src/lib/exercise-thumbs.ts
// Load a pool of exercise image URLs from the exercises dataset and provide a stable picker.

import { loadAllExercises } from "@/workout-sources";

export type ExerciseLike = { id: string; name?: string; media?: { images?: string[]; gifs?: string[]; thumbnail?: string } };

let pool: string[] | null = null;

export async function loadExerciseThumbnails(max = 200): Promise<string[]> {
  if (pool && pool.length) return pool;
  try {
    const all = await loadAllExercises<ExerciseLike>();
    const out: string[] = [];
    for (const ex of all) {
      const m = ex?.media || {};
      const url = m.thumbnail || (m.images && m.images[0]) || (m.gifs && m.gifs[0]);
      if (url) out.push(url);
      if (out.length >= max) break;
    }
    pool = out;
    return out;
  } catch {
    pool = [];
    return [];
  }
}

// DJB2 hash for stable selection
function djb2(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) hash = (hash * 33) ^ str.charCodeAt(i);
  return hash >>> 0;
}

export function pickThumbFor(key: string, list?: string[] | null): string | undefined {
  const arr = (list && list.length ? list : pool) || [];
  if (!arr.length) return undefined;
  const idx = djb2(key) % arr.length;
  return arr[idx];
}


// src/lib/exercise-thumbs.ts
// Load a pool of exercise image URLs from the exercises dataset and provide a stable picker.

import { loadAllExercises } from "@/workout-sources";

export type ExerciseLike = { id: string; name?: string; media?: { images?: string[]; gifs?: string[]; thumbnail?: string } };

let pool: string[] | null = null;

export async function loadExerciseThumbnails(max = 200): Promise<string[]> {
  if (pool && pool.length) {
    console.log('[exercise-thumbs] Returning cached pool:', pool.length, 'thumbnails');
    return pool;
  }

  try {
    console.log('[exercise-thumbs] Loading exercise thumbnails...');
    const all = await loadAllExercises<ExerciseLike>();
    
    if (!Array.isArray(all)) {
      console.error('[exercise-thumbs] Invalid response format:', all);
      throw new Error('Invalid exercise data format');
    }

    const out: string[] = [];
    let skipped = 0;

    for (const ex of all) {
      if (!ex || typeof ex !== 'object') continue;
      
      const m = ex.media || {};
      const url = m.thumbnail || (m.images && m.images[0]) || (m.gifs && m.gifs[0]);
      
      if (url && typeof url === 'string') {
        out.push(url);
      } else {
        skipped++;
      }

      if (out.length >= max) break;
    }

    console.log(`[exercise-thumbs] Loaded ${out.length} thumbnails (skipped ${skipped})`);
    pool = out;
    return out;
  } catch (e) {
    console.error('[exercise-thumbs] Failed to load thumbnails:', e);
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
  if (!key) {
    console.warn('[exercise-thumbs] Called pickThumbFor with empty key');
    return undefined;
  }

  const arr = (list && Array.isArray(list) && list.length ? list : pool) || [];
  
  if (!arr.length) {
    return undefined;
  }

  const idx = Math.abs(djb2(key)) % arr.length;
  const thumb = arr[idx];
  
  if (!thumb || typeof thumb !== 'string') {
    console.warn('[exercise-thumbs] Invalid thumbnail selected for key:', key);
    return undefined;
  }

  return thumb;
}


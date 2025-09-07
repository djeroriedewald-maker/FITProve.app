// scripts/deploy/import-workouts-to-db.ts
// Import generated workouts JSON (manifest + chunks) into Supabase tables:
//   workouts, workout_blocks, workout_exercises
// Maps generator format (scripts/build/config.ts) → DB schema used by src/lib/workouts-client.ts
// Usage:
//   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... tsx scripts/deploy/import-workouts-to-db.ts public/data/workouts/v20250906

import { readFile } from 'fs/promises';
import { readdir } from 'fs/promises';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

type GenWorkout = {
  id: string;
  slug: string;
  title: string;
  goal?: string;
  level?: string;
  durationMin?: number;
  location?: string;
  equipment?: string[];
  blocks: Array<{
    type: 'warmup' | 'strength' | 'metcon' | 'finisher' | 'cooldown';
    style?: string;
    timeSec?: number;
    items: Array<{
      exerciseId: string;
      sets?: number;
      reps?: number | string;
      timeSec?: number;
      tempo?: string;
      restSec?: number;
      rpe?: number;
    }>;
  }>;
};

type Manifest = { version: string; chunks: number; total: number };

async function loadManifest(base: string): Promise<Manifest> {
  const man = JSON.parse(await readFile(path.join(base, 'manifest.json'), 'utf-8')) as Manifest;
  return man;
}
async function loadChunk(base: string, i: number): Promise<GenWorkout[]> {
  const f = path.join(base, `chunk-${String(i).padStart(3, '0')}.json`);
  return JSON.parse(await readFile(f, 'utf-8')) as GenWorkout[];
}

async function main() {
  const OUT_ROOT = process.argv[2] || 'public/data/workouts/v20250906';
  const supaUrl = process.env.SUPABASE_URL;
  const supaKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supaUrl || !supaKey) throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');

  const client = createClient(supaUrl, supaKey);
  const manifest = await loadManifest(OUT_ROOT);
  console.log(`[import] Loading ${manifest.total} workouts from ${OUT_ROOT} (${manifest.chunks} chunks)`);

  // Preload exercise names for display_name mapping (optional); best-effort from local exercises index if present
  let exerciseNames = new Map<string, string>();
  try {
    const exDir = path.resolve('public/data/workouts/v20250905');
    const exMan = JSON.parse(await readFile(path.join(exDir, 'manifest.json'), 'utf-8')) as any;
    for (let i = 0; i < (exMan?.chunks || 0); i++) {
      const arr = JSON.parse(await readFile(path.join(exDir, `chunk-${String(i).padStart(3, '0')}.json`), 'utf-8')) as any[];
      for (const ex of arr) if (ex?.id && ex?.name) exerciseNames.set(String(ex.id), String(ex.name));
    }
  } catch {}

  for (let i = 0; i < manifest.chunks; i++) {
    const items = await loadChunk(OUT_ROOT, i);
    console.log(`[import] chunk ${i+1}/${manifest.chunks} (${items.length} items)`);

    for (const w of items) {
      // Upsert workout
      const workoutRow: any = {
        // id: let DB generate (uuid default)
        title: w.title,
        slug: w.slug,
        description: w.notes ?? null,
        goal: w.goal ?? null,
        level: w.level ?? null,
        location: w.location ?? null,
        duration_minutes: w.durationMin ?? null,
        equipment_required: (w.equipment || []).some((e) => e !== 'bodyweight'),
      };
      const { data: wRow, error: wErr } = await client
        .from('workouts')
        .insert(workoutRow)
        .select('id')
        .single();
      if (wErr) { console.error('[import] workout upsert failed', w.id, wErr.message); continue; }
      // For now we only seed the workouts table; block/exercises follow in the next phase
    }
  }

  console.log('[import] Done.');
}

main().catch((e) => { console.error(e); process.exit(1); });

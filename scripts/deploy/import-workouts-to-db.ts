// scripts/deploy/import-workouts-to-db.ts
// Import generated workouts JSON (manifest + chunks) into Supabase tables:
//   workouts, workout_blocks, workout_exercises
// Maps generator format (scripts/build/config.ts) → DB schema used by src/lib/workouts-client.ts
// Usage:
//   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... tsx scripts/deploy/import-workouts-to-db.ts public/data/workouts/v20250906

import { readFile } from 'fs/promises';
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

function getArgFlag(name: string): boolean {
  return process.argv.includes(`--${name}`);
}
function resolveBaseDir(arg?: string): string {
  const p = arg || 'public/data/workouts';
  // If version directory is given, return as is
  if (/\bv\d{8,}$/.test(p.replace(/[/\\]+$/g, ''))) return p;
  // Else treat as alias root and read index.json
  return p;
}

async function resolveVersionDir(baseOrVersioned: string): Promise<string> {
  const clean = baseOrVersioned.replace(/[/\\]+$/g, '');
  if (/\bv\d{8,}$/.test(clean)) return clean;
  const idx = JSON.parse(await readFile(path.join(clean, 'index.json'), 'utf-8')) as any;
  const v = (idx?.workouts_latest || idx?.latest) as string;
  if (!v) throw new Error('Kon versie niet bepalen uit index.json');
  return path.join(clean, v);
}

async function main() {
  const argPath = process.argv[2];
  const DRY_RUN = getArgFlag('dry-run') || process.env.DRY_RUN === '1';
  const baseDir = resolveBaseDir(argPath);
  const OUT_ROOT = await resolveVersionDir(baseDir);
  const supaUrl = process.env.SUPABASE_URL;
  const supaKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const client = (!DRY_RUN && supaUrl && supaKey) ? createClient(supaUrl, supaKey) : null as any;
  if (!DRY_RUN && !client) throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  const manifest = await loadManifest(OUT_ROOT);
  console.log(`[import] Loading ${manifest.total} workouts from ${OUT_ROOT} (${manifest.chunks} chunks)`);

  // Preload exercise names for display_name mapping (optional); best-effort from local exercises index if present
  type ExerciseMeta = { name?: string; thumbnail?: string | null; image?: string | null; gif?: string | null; video?: string | null };
  let exerciseByVendorId = new Map<string, ExerciseMeta>();
  try {
    const exDir = path.resolve('public/data/workouts/v20250905');
    const exMan = JSON.parse(await readFile(path.join(exDir, 'manifest.json'), 'utf-8')) as any;
    for (let i = 0; i < (exMan?.chunks || 0); i++) {
      const arr = JSON.parse(await readFile(path.join(exDir, `chunk-${String(i).padStart(3, '0')}.json`), 'utf-8')) as any[];
      for (const ex of arr) {
        const name = typeof ex?.name === 'string' ? ex.name : undefined;
        const media = ex?.media || {};
        const images: string[] = Array.isArray(media?.images) ? media.images : [];
        const videos: string[] = Array.isArray(media?.videos) ? media.videos : [];
        const gifs: string[] = Array.isArray(media?.gifs) ? media.gifs : [];
        const meta: ExerciseMeta = {
          name,
          thumbnail: media?.thumbnail || images?.[0] || null,
          image: images?.[0] || null,
          gif: gifs?.[0] || null,
          video: videos?.[0] || null,
        };
        const srcs = Array.isArray(ex?.sources) ? ex.sources : [];
        for (const s of srcs) {
          const vendorId = s?.id ? String(s.id) : undefined;
          if (vendorId) exerciseByVendorId.set(vendorId, meta);
        }
      }
    }
  } catch {}

  let totalBlocks = 0;
  let totalExercises = 0;

  for (let i = 0; i < manifest.chunks; i++) {
    const items = await loadChunk(OUT_ROOT, i);
    console.log(`[import] chunk ${i+1}/${manifest.chunks} (${items.length} items)`);

    for (const w of items) {
      // Upsert workout by slug; replace blocks/exercises for that workout
      const workoutRow: any = {
        title: w.title,
        slug: w.slug,
        description: w.notes ?? null,
        goal: w.goal ?? null,
        level: w.level ?? null,
        location: w.location ?? null,
        duration_minutes: w.durationMin ?? null,
        equipment_required: (w.equipment || []).some((e) => e !== 'bodyweight'),
      };
      let workoutId: string = '';
      if (DRY_RUN) {
        workoutId = `dry_${w.slug}`;
      } else {
        // 1) Find existing by slug
        const existing = await client
          .from('workouts')
          .select('id')
          .eq('slug', w.slug)
          .maybeSingle();
        if (existing.error && existing.error.code !== 'PGRST116') {
          console.error('[import] workout select failed', w.slug, existing.error.message);
          continue;
        }
        if (existing.data && (existing.data as any).id) {
          workoutId = (existing.data as any).id as string;
          // Update main fields
          const { error: updErr } = await client.from('workouts').update(workoutRow).eq('id', workoutId);
          if (updErr) { console.error('[import] workout update failed', w.slug, updErr.message); continue; }
          // Wipe old blocks/exercises for this workout
          const { data: blk, error: selErr } = await client
            .from('workout_blocks')
            .select('id')
            .eq('workout_id', workoutId);
          if (selErr) { console.error('[import] blocks select failed', w.slug, selErr.message); continue; }
          const blockIds: string[] = (blk || []).map((r: any) => r.id);
          if (blockIds.length) {
            const { error: delXErr } = await client.from('workout_exercises').delete().in('block_id', blockIds);
            if (delXErr) { console.error('[import] exercises delete failed', w.slug, delXErr.message); continue; }
          }
          const { error: delBErr } = await client.from('workout_blocks').delete().eq('workout_id', workoutId);
          if (delBErr) { console.error('[import] blocks delete failed', w.slug, delBErr.message); continue; }
        } else {
          // Insert new
          const { data: wRow, error: wErr } = await client
            .from('workouts')
            .insert(workoutRow)
            .select('id')
            .single();
          if (wErr) { console.error('[import] workout insert failed', w.slug, wErr.message); continue; }
          workoutId = (wRow as any).id as string;
        }
      }

      // Helper: readable titles/notes per block
      function blockTitle(t: string | undefined, style?: string): string {
        const map: Record<string, string> = { warmup: 'Warm-up', strength: 'Strength', metcon: 'Metcon', finisher: 'Finisher', cooldown: 'Cooldown' };
        const base = t && map[t] ? map[t] : (t || 'Block');
        return style ? `${base} · ${style}` : base;
      }
      function blockNote(timeSec?: number): string | null {
        if (!timeSec) return null;
        const m = Math.floor(timeSec / 60), s = timeSec % 60;
        const mm = String(m).padStart(2, '0');
        const ss = String(s).padStart(2, '0');
        return `Duur ${mm}:${ss}`;
      }

      // Insert blocks
      let bSeq = 0;
      for (const b of w.blocks) {
        bSeq += 1;
        const bRow: any = {
          workout_id: workoutId,
          sequence: bSeq,
          title: blockTitle(b.type, b.style),
          note: blockNote(b.timeSec),
        };
        totalBlocks++;
        let blockId: string = '';
        if (DRY_RUN) {
          blockId = `dry_b_${bSeq}`;
        } else {
          const { data: insB, error: bErr } = await client
            .from('workout_blocks')
            .insert(bRow)
            .select('id')
            .single();
          if (bErr) { console.error('[import] block insert failed', w.slug, bSeq, bErr.message); continue; }
          blockId = (insB as any).id as string;
        }

        // Insert exercises for this block
        let xSeq = 0;
        for (const it of b.items) {
          xSeq += 1;
          const vend = String(it.exerciseId);
          const meta = exerciseByVendorId.get(vend) || {};
          const name = meta.name || vend || 'Exercise';
          const repsNum = typeof it.reps === 'number' ? it.reps : (typeof it.reps === 'string' && /^\d+$/.test(it.reps) ? parseInt(it.reps, 10) : null);
          const xRowBase: any = {
            block_id: blockId,
            sequence: xSeq,
            display_name: name,
            exercise_ref: vend,
            target_sets: (it.sets ?? 0),
            target_reps: repsNum,
            target_time_seconds: it.timeSec ?? null,
            rest_seconds: it.restSec ?? null,
            tempo: it.tempo ?? null,
          };
          // Try with media fields (if schema supports). If it fails due to missing columns, retry without.
          const xRowWithMedia: any = {
            ...xRowBase,
            thumbnail: meta.thumbnail ?? null,
            image_url: meta.image ?? null,
            gif_url: meta.gif ?? null,
            video_url: meta.video ?? null,
          };
          totalExercises++;
          if (!DRY_RUN) {
            let xErrFinal: any = null;
            try {
              const { error: xErr1 } = await client.from('workout_exercises').insert(xRowWithMedia);
              if (xErr1) throw xErr1;
            } catch (e: any) {
              // Retry without media fields
              const { error: xErr2 } = await client.from('workout_exercises').insert(xRowBase);
              xErrFinal = xErr2;
            }
            if (xErrFinal) { console.error('[import] exercise insert failed', w.slug, bSeq, xSeq, xErrFinal.message); }
          }
        }
      }
    }
  }

  if (DRY_RUN) {
    console.log(`[import] Dry-run summary: blocks=${totalBlocks}, exercises=${totalExercises}`);
  }
  console.log('[import] Done.');
}

main().catch((e) => { console.error(e); process.exit(1); });

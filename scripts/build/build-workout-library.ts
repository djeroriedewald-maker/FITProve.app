// scripts/build/build-workout-library.ts
// Merge + validate + dedupe + chunk → /public/data/workouts/vYYYYMMDD + root aliases
import { mkdir, writeFile, stat, readFile } from 'fs/promises';
import path from 'path';
import {
    DEFAULT_CHUNK_SIZE,
    NormalizedExercise,
    WorkoutManifest,
    slugify,
    shortHash,
    hasAnyMedia,
    normalizeName,
  } from '../../src/types/workout';
  import { fetchFromWger, fetchFromExerciseDB } from './workout-sources';  

type BuildOptions = {
  outDir: string;         // absolute or relative to repo root
  version?: string;       // vYYYYMMDD; default: today
  chunkSize?: number;     // default 500
};

function todayVersion(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `v${y}${m}${dd}`;
}

function uniq<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

function normalizeForDedup(x: NormalizedExercise) {
  const name = normalizeName(x.name);
  const prim = (x.primaryMuscles || []).map((m) => m.toLowerCase()).sort().join(',');
  const equip = (x.equipment || []).map((e) => e.toLowerCase()).sort().join(',');
  return `${name}|${prim}|${equip}`;
}

function mergeExercises(list: NormalizedExercise[]): NormalizedExercise[] {
  const byKey = new Map<string, NormalizedExercise>();
  for (const ex of list) {
    const key = normalizeForDedup(ex);
    const existing = byKey.get(key);
    if (!existing) {
      byKey.set(key, ex);
      continue;
    }
    // Merge media & sources, keep better thumbnail
    existing.sources = uniq([...existing.sources, ...ex.sources]) as any;
    existing.media = {
      images: uniq([...(existing.media.images || []), ...(ex.media.images || [])]),
      gifs: uniq([...(existing.media.gifs || []), ...(ex.media.gifs || [])]),
      videos: uniq([...(existing.media.videos || []), ...(ex.media.videos || [])]),
      thumbnail: existing.media.thumbnail || ex.media.thumbnail,
    };
    // Prefer instructions if missing
    if (!existing.instructions && ex.instructions) existing.instructions = ex.instructions;
    // Prefer description if missing
    if (!existing.description && ex.description) existing.description = ex.description;
    // Ensure id/slug stable based on combined sources
    existing.id = `${existing.slug}-${shortHash(existing.sources.map((s) => `${s.vendor}:${s.id}`).join('|'))}`;
  }
  return Array.from(byKey.values());
}

async function ensureDir(p: string) {
  await mkdir(p, { recursive: true });
}

async function writeJson(p: string, obj: any) {
  await writeFile(p, JSON.stringify(obj, null, 2), 'utf8');
}

async function exists(p: string) {
  try {
    await stat(p);
    return true;
  } catch {
    return false;
  }
}

async function build(opts: BuildOptions) {
  const outRoot = path.resolve(opts.outDir); // e.g. public/data/workouts
  const version = opts.version || process.env.WORKOUTS_VERSION || todayVersion();
  const chunkSize = Number(opts.chunkSize || process.env.WORKOUTS_CHUNK_SIZE || DEFAULT_CHUNK_SIZE);

  console.log(`▶ Building Workout Library: ${version} (chunk ~${chunkSize})`);

  // 1) fetch from sources
  console.time('fetch:wger');
  const wger = await fetchFromWger(['en']);
  console.timeEnd('fetch:wger');

  console.time('fetch:exerciseDB');
  const exdb = await fetchFromExerciseDB();
  console.timeEnd('fetch:exerciseDB');

  // 2) pre-validate basic fields & keep only items with media + (description or instructions)
  const pre = [...wger, ...exdb].filter((x) => {
    const hasDesc = (x.description && x.description.length > 0) || (x.instructions && x.instructions.length > 0);
    const hasMuscle = x.primaryMuscles.length > 0 || (x.secondaryMuscles?.length ?? 0) > 0;
    const hasEquip = x.equipment.length > 0;
    return x.name && hasDesc && hasMuscle && hasEquip && hasAnyMedia(x.media);
  });

  // 3) dedupe/merge
  const merged = mergeExercises(pre);

  if (merged.length < 1000) {
    console.warn(`⚠ Warning: only ${merged.length} items after merge; expected ≥1000`);
  }

  // 4) chunk
  const chunks: NormalizedExercise[][] = [];
  for (let i = 0; i < merged.length; i += chunkSize) {
    chunks.push(merged.slice(i, i + chunkSize));
  }

  // 5) write files
  const versionPath = path.join(outRoot, version);
  await ensureDir(versionPath);

  for (let i = 0; i < chunks.length; i++) {
    const p = path.join(versionPath, `chunk-${String(i).padStart(3, '0')}.json`);
    await writeJson(p, chunks[i]);
  }

  const manifest: WorkoutManifest = {
    version,
    createdAt: new Date().toISOString(),
    total: merged.length,
    chunkSize,
    chunks: chunks.length,
    basePath: `./${version}`,
    attribution: {
      wger: { name: 'CC-BY-SA 3.0', url: 'https://wger.de/', attribution: 'wger Workout Manager', count: wger.length },
      exerciseDB: {
        name: 'Open-source dataset',
        url: 'https://github.com/yuhonas/free-exercise-db',
        attribution: 'Community contributors',
        count: exdb.length,
      },
    },
  };

  await writeJson(path.join(versionPath, 'manifest.json'), manifest);

  // Root aliases to make local fallback simple
  await writeJson(path.join(outRoot, 'index.json'), { latest: version });
  await writeJson(path.join(outRoot, 'manifest.json'), { ...manifest, basePath: `./${version}` });

  console.log(`✔ Wrote manifest + ${chunks.length} chunks to ${versionPath}`);
  console.log(`ℹ Total merged: ${merged.length} (wger: ${wger.length}, exerciseDB: ${exdb.length})`);
}

const OUT = process.argv[2] || 'public/data/workouts';
build({ outDir: OUT }).catch((err) => {
  console.error(err);
  process.exit(1);
});

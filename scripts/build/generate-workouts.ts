// scripts/build/generate-workouts.ts
// Batch generator: template-combinator + variant matrix + validator + dedupe + export.

import fs from 'fs';
import path from 'path';

import {
  Exercise,
  Workout,
  WorkoutBlock,
  WorkoutItem,
  Level,
  Goal,
  Pattern,
  Equipment,
  DURATIONS,
  LEVELS,
  GOALS,
  EQUIPMENT_PROFILES,
  RPE_BANDS,
  REST_BANDS,
  TEMPOS,
  derivePatterns,
  normalizeEquipmentTag,
} from './config';
import { signatureTokens, jaccardSim, djb2 } from './signature';
import { validateWorkout, ExerciseMap } from './validator';

// --- CLI args ---
const argv = process.argv.slice(2);
const getArg = (k: string, fallback?: string) => {
  const hit = argv.find((a) => a.startsWith(`--${k}=`));
  return hit ? hit.split('=')[1] : fallback;
};

const VERSION = (getArg('version') || new Date().toISOString().slice(0, 10).replace(/-/g, '')).replace(/^v?/, '');
const TARGET = parseInt(getArg('target') || '1500', 10);
const CHUNK_SIZE = parseInt(getArg('chunk', ) || '400', 10);
const SEED = getArg('seed') || 'fitprove';

// --- Seeded RNG (mulberry32) ---
function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rng = mulberry32(djb2(SEED));

// --- Load exercises ---
function loadExercises(): Exercise[] {
  const localPath = path.resolve('scripts/build/assets/exercises.json'); // fallback
  const envUrl = process.env.EXERCISEDB_JSON_URL || '';
  // We prefer local file to avoid network in build.
  if (fs.existsSync(localPath)) {
    const raw = JSON.parse(fs.readFileSync(localPath, 'utf-8'));
    // support {exercises:[...]} or [...]
    return Array.isArray(raw) ? raw : (raw.exercises || []);
  }
  if (!envUrl) {
    console.warn('No exercises file found and EXERCISEDB_JSON_URL not set. Please add scripts/build/assets/exercises.json');
    return [];
  }
  // Simple remote fetch using node >=18
  return []; // avoid network fetch in most envs; rely on local file/pipeline
}

// Build indexes: by equipment & pattern
type IndexedExercise = Exercise & {
  equipmentNorm: Equipment[];
  patterns: Pattern[];
};

function indexExercises(exs: Exercise[]) {
  const idx: {
    byId: ExerciseMap;
    byPattern: Record<Pattern, IndexedExercise[]>;
    byEquip: Record<Equipment, IndexedExercise[]>;
  } = {
    byId: new Map(),
    byPattern: { squat: [], hinge: [], push: [], pull: [], core: [], gait: [] },
    byEquip: {
      bodyweight: [], dumbbell: [], barbell: [], kettlebell: [], machine: [],
      cable: [], band: [], medicine_ball: [], sled: [], cardio: [], other: [],
    },
  };

  for (const ex of exs) {
    const equipmentNorm: Equipment[] = (ex.equipment || []).map(normalizeEquipmentTag);
    if (equipmentNorm.length === 0) equipmentNorm.push('bodyweight');
    const patterns = derivePatterns(ex);
    const ix: IndexedExercise = { ...ex, equipmentNorm, patterns };

    idx.byId.set(ex.id, ex);
    patterns.forEach((p) => idx.byPattern[p].push(ix));
    equipmentNorm.forEach((e) => idx.byEquip[e].push(ix));
  }
  return idx;
}

// Utility: pick N distinct by predicate
function pickN<T>(arr: T[], n: number): T[] {
  const out: T[] = [];
  const used = new Set<number>();
  let attempts = 0;
  while (out.length < n && attempts < arr.length * 3) {
    const i = Math.floor(rng() * arr.length);
    if (!used.has(i)) {
      used.add(i);
      out.push(arr[i]);
    }
    attempts++;
  }
  return out;
}

// Build items helpers
function makeStrengthItem(ex: Exercise, level: Level, goal: Goal): WorkoutItem {
  const [rpeMin, rpeMax] = RPE_BANDS[goal][level];
  const tempo = TEMPOS[goal][Math.floor(rng() * TEMPOS[goal].length)];
  const sets = level === 'beginner' ? 3 : level === 'intermediate' ? 4 : 5;
  const reps = goal === 'strength' ? (level === 'advanced' ? '4-6' : '6-8') : '8-12';
  const [restMin, restMax] = REST_BANDS[goal][level];
  const rest = Math.round(restMin + rng() * (restMax - restMin));
  const rpe = Math.round((rpeMin + rng() * (rpeMax - rpeMin)) * 10) / 10;
  return { exerciseId: ex.id, sets, reps, tempo, restSec: rest, rpe };
}

function makeTimedItem(ex: Exercise, secs: number): WorkoutItem {
  return { exerciseId: ex.id, timeSec: secs };
}

// --- Template families (functions that produce blocks) ---

type VariantCtx = {
  level: Level;
  goal: Goal;
  duration: Workout['durationMin'];
  equipProfile: Equipment[];
};

type FamilyBuilder = (pool: IndexedPools, v: VariantCtx) => WorkoutBlock[] | null;

type IndexedPools = {
  byPattern: Record<Pattern, IndexedExercise[]>;
  byEquip: Record<Equipment, IndexedExercise[]>;
  any: IndexedExercise[];
};

function poolsFromIndex(idx: ReturnType<typeof indexExercises>, profile: Equipment[]): IndexedPools {
  const any: IndexedExercise[] = [];
  Object.values(idx.byEquip).forEach((arr) => any.push(...arr));
  // Filter by allowed equipment profile
  const filt = (arr: IndexedExercise[]) => arr.filter((x) => x.equipmentNorm.some((e) => profile.includes(e)));
  const byPattern: any = {};
  (['squat', 'hinge', 'push', 'pull', 'core', 'gait'] as Pattern[]).forEach((p) => (byPattern[p] = filt(idx.byPattern[p])));
  const byEquip: any = {};
  Object.keys(idx.byEquip).forEach((k) => (byEquip[k as Equipment] = filt(idx.byEquip[k as Equipment])));
  return { byPattern, byEquip, any: filt(any) };
}

// FB Strength+Metcon
const familyFullBody: FamilyBuilder = (pool, v) => {
  const squat = pickN(pool.byPattern.squat, 1)[0];
  const hinge = pickN(pool.byPattern.hinge, 1)[0];
  const push = pickN(pool.byPattern.push, 1)[0];
  const pull = pickN(pool.byPattern.pull, 1)[0];
  const core = pickN(pool.byPattern.core, 1)[0];
  if (!squat || !hinge || !push || !pull || !core) return null;

  const warmup: WorkoutBlock = {
    type: 'warmup',
    style: 'Circuit',
    timeSec: 5 * 60,
    items: [makeTimedItem(push, 40), makeTimedItem(core, 40), makeTimedItem(hinge, 40)],
  };

  const strength: WorkoutBlock = {
    type: 'strength',
    style: 'Strength',
    items: [
      makeStrengthItem(squat, v.level, v.goal),
      makeStrengthItem(push, v.level, v.goal),
      makeStrengthItem(hinge, v.level, v.goal),
    ],
  };

  const metconTime = v.duration === 60 ? 20 * 60 : v.duration === 45 ? 14 * 60 : 10 * 60;
  const metcon: WorkoutBlock = {
    type: 'metcon',
    style: 'AMRAP',
    timeSec: metconTime,
    items: [
      { exerciseId: push.id, reps: 10 },
      { exerciseId: pull.id, reps: 12 },
      { exerciseId: core.id, reps: 14 },
    ],
  };

  const cooldown: WorkoutBlock = {
    type: 'cooldown',
    items: [makeTimedItem(core, 60)],
  };

  return [warmup, strength, metcon, cooldown];
};

// Upper/Lower split day
const familyUpperLower: FamilyBuilder = (pool, v) => {
  const lower1 = pickN(pool.byPattern.squat.concat(pool.byPattern.hinge), 2);
  const upper = pickN(pool.byPattern.push.concat(pool.byPattern.pull), 2);
  const core = pickN(pool.byPattern.core, 1)[0];
  if (lower1.length < 2 || upper.length < 2 || !core) return null;

  const strength: WorkoutBlock = {
    type: 'strength',
    style: 'Strength',
    items: [
      makeStrengthItem(lower1[0], v.level, v.goal),
      makeStrengthItem(upper[0], v.level, v.goal),
      makeStrengthItem(lower1[1], v.level, v.goal),
      makeStrengthItem(upper[1], v.level, v.goal),
    ],
  };

  const finisher: WorkoutBlock = {
    type: 'finisher',
    style: 'EMOM',
    timeSec: v.duration >= 45 ? 10 * 60 : 6 * 60,
    items: [{ exerciseId: core.id, reps: 12 }],
  };

  return [
    { type: 'warmup', style: 'Circuit', timeSec: 4 * 60, items: [makeTimedItem(lower1[0], 40), makeTimedItem(upper[0], 40)] },
    strength,
    finisher,
    { type: 'cooldown', items: [makeTimedItem(core, 60)] },
  ];
};

// PPL style (condensed)
const familyPPL: FamilyBuilder = (pool, v) => {
  const push = pickN(pool.byPattern.push, 2);
  const pull = pickN(pool.byPattern.pull, 2);
  const legs = pickN(pool.byPattern.squat.concat(pool.byPattern.hinge), 2);
  const core = pickN(pool.byPattern.core, 1)[0];
  if (push.length < 1 || pull.length < 1 || legs.length < 1 || !core) return null;

  const blocks: WorkoutBlock[] = [
    { type: 'warmup', style: 'Circuit', timeSec: 4 * 60, items: [makeTimedItem(push[0], 40), makeTimedItem(legs[0], 40)] },
    {
      type: 'strength',
      style: 'Strength',
      items: [makeStrengthItem(push[0], v.level, v.goal), makeStrengthItem(pull[0], v.level, v.goal), makeStrengthItem(legs[0], v.level, v.goal)],
    },
    {
      type: 'metcon',
      style: 'Intervals',
      timeSec: v.duration >= 45 ? 12 * 60 : 8 * 60,
      items: [{ exerciseId: core.id, timeSec: 40 }, { exerciseId: pull[1]?.id || pull[0].id, timeSec: 40 }],
    },
    { type: 'cooldown', items: [makeTimedItem(core, 60)] },
  ];
  return blocks;
};

// Bodyweight AMRAP (home/outdoor)
const familyBodyweight: FamilyBuilder = (pool, v) => {
  const bwPush = pool.byPattern.push.filter((x) => x.equipmentNorm.includes('bodyweight'));
  const bwSquat = pool.byPattern.squat.filter((x) => x.equipmentNorm.includes('bodyweight'));
  const core = pool.byPattern.core.filter((x) => x.equipmentNorm.includes('bodyweight'));
  const gait = pool.byPattern.gait;

  if (bwPush.length === 0 || bwSquat.length === 0 || core.length === 0) return null;

  const push = pickN(bwPush, 1)[0];
  const squat = pickN(bwSquat, 1)[0];
  const coreEx = pickN(core, 1)[0];
  const carry = gait.length ? pickN(gait, 1)[0] : null;

  const time = v.duration === 20 ? 8 * 60 : v.duration === 30 ? 12 * 60 : 16 * 60;

  const metcon: WorkoutBlock = {
    type: 'metcon',
    style: 'AMRAP',
    timeSec: time,
    items: [
      { exerciseId: squat.id, reps: 15 },
      { exerciseId: push.id, reps: 12 },
      { exerciseId: coreEx.id, reps: 16 },
      ...(carry ? [{ exerciseId: carry.id, timeSec: 45 } as WorkoutItem] : []),
    ],
  };

  return [
    { type: 'warmup', style: 'Circuit', timeSec: 4 * 60, items: [makeTimedItem(squat, 30), makeTimedItem(coreEx, 30)] },
    metcon,
    { type: 'cooldown', items: [makeTimedItem(coreEx, 60)] },
  ];
};

// Kettlebell Mixed (swings/press/squat)
const familyKettlebell: FamilyBuilder = (pool, v) => {
  const kb = (e: IndexedExercise) => e.equipmentNorm.includes('kettlebell');
  const swings = pool.byPattern.hinge.filter(kb);
  const press = pool.byPattern.push.filter(kb);
  const squat = pool.byPattern.squat.filter(kb);
  const core = pool.byPattern.core.filter(kb);

  if (!swings.length || !press.length || !squat.length || !core.length) return null;

  const warmup: WorkoutBlock = { type: 'warmup', style: 'Circuit', timeSec: 4 * 60, items: [makeTimedItem(squat[0], 30), makeTimedItem(core[0], 30)] };
  const strength: WorkoutBlock = { type: 'strength', style: 'Strength', items: [makeStrengthItem(press[0], v.level, v.goal), makeStrengthItem(squat[0], v.level, v.goal)] };
  const emom: WorkoutBlock = { type: 'metcon', style: 'EMOM', timeSec: v.duration >= 45 ? 12 * 60 : 8 * 60, items: [{ exerciseId: swings[0].id, reps: 15 }, { exerciseId: core[0].id, reps: 12 }] };
  const cooldown: WorkoutBlock = { type: 'cooldown', items: [makeTimedItem(core[0], 60)] };
  return [warmup, strength, emom, cooldown];
};

// Machine Circuit (gym)
const familyMachineCircuit: FamilyBuilder = (pool, v) => {
  const mach = (e: IndexedExercise) => e.equipmentNorm.includes('machine') || e.equipmentNorm.includes('cable');
  const push = pool.byPattern.push.filter(mach);
  const pull = pool.byPattern.pull.filter(mach);
  const squat = pool.byPattern.squat.filter(mach);
  const core = pool.byPattern.core.filter(mach).concat(pool.byPattern.core);

  if (!push.length || !pull.length || !squat.length || !core.length) return null;

  const circuit: WorkoutBlock = {
    type: 'metcon',
    style: 'Circuit',
    timeSec: v.duration >= 45 ? 18 * 60 : 12 * 60,
    items: [
      { exerciseId: squat[0].id, reps: 12 },
      { exerciseId: push[0].id, reps: 12 },
      { exerciseId: pull[0].id, reps: 12 },
      { exerciseId: core[0].id, reps: 15 },
    ],
  };
  return [
    { type: 'warmup', style: 'Circuit', timeSec: 4 * 60, items: [makeTimedItem(squat[0], 30), makeTimedItem(push[0], 30)] },
    circuit,
    { type: 'cooldown', items: [makeTimedItem(core[0], 60)] },
  ];
};

const FAMILIES: Array<{ name: string; builder: FamilyBuilder; allow: (equip: Equipment[]) => boolean; goals?: Goal[] }> = [
  { name: 'Full Body — Strength + Metcon', builder: familyFullBody, allow: () => true },
  { name: 'Upper/Lower Mix', builder: familyUpperLower, allow: () => true },
  { name: 'Push/Pull/Legs Mix', builder: familyPPL, allow: () => true },
  { name: 'Bodyweight AMRAP', builder: familyBodyweight, allow: (e) => e.includes('bodyweight') },
  { name: 'Kettlebell Mixed', builder: familyKettlebell, allow: (e) => e.includes('kettlebell') },
  { name: 'Machine Circuit', builder: familyMachineCircuit, allow: (e) => e.includes('machine') || e.includes('cable') },
];

// Build workout object
function makeWorkoutTitle(base: string, dur: Workout['durationMin'], equip: Equipment[], level: Level) {
  const equipLabel =
    equip.length === 1 ? (
      equip[0] === 'bodyweight' ? 'Bodyweight' :
      equip[0] === 'dumbbell' ? 'Dumbbells' :
      equip[0] === 'kettlebell' ? 'Kettlebell' :
      equip[0] === 'barbell' ? 'Barbell' :
      equip[0] === 'machine' ? 'Machines' : equip[0]
    ) : 'Mixed';
  const levelLabel = level === 'beginner' ? 'beginner' : level === 'intermediate' ? 'intermediate' : 'advanced';
  return `${base} — ${equipLabel} • ${dur} min (${levelLabel})`;
}

function toSlug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

// --- Main orchestration ---
function main() {
  console.log(`[workouts] Generating version v${VERSION} with target ${TARGET}+ items…`);
  const exList = loadExercises();
  if (exList.length === 0) {
    console.error('No exercises loaded. Aborting.');
    process.exit(1);
  }

  const idx = indexExercises(exList);
  const out: Workout[] = [];
  const sigs: string[][] = [];

  // Iterate matrix
  outer:
  for (const level of LEVELS) {
    for (const goal of GOALS) {
      for (const duration of DURATIONS) {
        for (const equipProfile of EQUIPMENT_PROFILES) {
          // Build pools filtered by equipment profile
          const pools = poolsFromIndex(idx, equipProfile);

          for (const fam of FAMILIES) {
            if (!fam.allow(equipProfile)) continue;
            const v = { level, goal, duration, equipProfile };
            const blocks = fam.builder(pools, v);
            if (!blocks) continue;

            const baseTitle = fam.name;
            const title = makeWorkoutTitle(baseTitle, duration, equipProfile, level);
            const slugBase = `${baseTitle}-${duration}-${equipProfile.join('_')}-${level}-${goal}`;
            const slug = toSlug(slugBase);
            const id = `wkt_${slug}_${djb2(slug + VERSION).toString(16)}`;

            const w: Workout = {
              id,
              slug,
              title,
              goal,
              level,
              durationMin: duration,
              location: equipProfile.includes('bodyweight') ? 'home' : 'gym',
              equipment: equipProfile,
              blocks,
              notes: 'Houd techniek strak; stop 1–2 reps in de tank.',
              media: { cover: null },
              language: 'nl',
              tags: [fam.name.split(' ')[0], ...equipProfile, goal, level],
              progression: { microcycleWeek: ((djb2(id) % 4) + 1) as 1 | 2 | 3 | 4, type: ['load', 'density', 'variation'][djb2(id) % 3] as any },
            };

            // Validate
            const res = validateWorkout(w, idx.byId);
            if (!res.ok) continue;

            // Dedupe
            const tokens = signatureTokens(w);
            let dup = false;
            for (const t of sigs) {
              if (jaccardSim(t, tokens) >= 0.85) {
                dup = true;
                break;
              }
            }
            if (dup) continue;

            out.push(w);
            sigs.push(tokens);
            if (out.length >= TARGET) break outer;
          }
        }
      }
    }
  }

  // If still below target (unlikely), add randomized variations of families
  let guard = 0;
  while (out.length < TARGET && guard < TARGET * 5) {
    guard++;
    const level = LEVELS[Math.floor(rng() * LEVELS.length)];
    const goal = GOALS[Math.floor(rng() * GOALS.length)];
    const duration = DURATIONS[Math.floor(rng() * DURATIONS.length)];
    const equipProfile = EQUIPMENT_PROFILES[Math.floor(rng() * EQUIPMENT_PROFILES.length)];
    const pools = poolsFromIndex(idx, equipProfile);
    const fam = FAMILIES[Math.floor(rng() * FAMILIES.length)];
    if (!fam.allow(equipProfile)) continue;
    const v = { level, goal, duration, equipProfile };
    const blocks = fam.builder(pools, v);
    if (!blocks) continue;

    const baseTitle = fam.name;
    const title = makeWorkoutTitle(baseTitle, duration, equipProfile, level);
    const slugBase = `${baseTitle}-${duration}-${equipProfile.join('_')}-${level}-${goal}-${Math.floor(rng()*1e6)}`;
    const slug = toSlug(slugBase);
    const id = `wkt_${slug}_${djb2(slug + VERSION).toString(16)}`;
    const w: Workout = {
      id, slug, title, goal, level, durationMin: duration,
      location: equipProfile.includes('bodyweight') ? 'home' : 'gym',
      equipment: equipProfile, blocks,
      notes: 'Houd techniek strak; stop 1–2 reps in de tank.',
      media: { cover: null }, language: 'nl',
      tags: [fam.name.split(' ')[0], ...equipProfile, goal, level],
      progression: { microcycleWeek: ((djb2(id) % 4) + 1) as 1 | 2 | 3 | 4, type: ['load', 'density', 'variation'][djb2(id) % 3] as any },
    };

    const res = validateWorkout(w, idx.byId);
    if (!res.ok) continue;

    const tokens = signatureTokens(w);
    let dup = false;
    for (const t of sigs) if (jaccardSim(t, tokens) >= 0.85) { dup = true; break; }
    if (dup) continue;

    out.push(w);
    sigs.push(tokens);
  }

  // Export
  const basePath = path.join('public', 'data', 'workouts', `v${VERSION}`);
  fs.mkdirSync(basePath, { recursive: true });

  const manifest = {
    version: `v${VERSION}`,
    total: out.length,
    chunks: Math.ceil(out.length / CHUNK_SIZE),
    chunkSize: CHUNK_SIZE,
    basePath,
    generatedAt: new Date().toISOString(),
  };
  fs.writeFileSync(path.join(basePath, 'manifest.json'), JSON.stringify(manifest, null, 2));

  for (let i = 0; i < manifest.chunks; i++) {
    const slice = out.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
    const file = path.join(basePath, `chunk-${String(i).padStart(3, '0')}.json`);
    fs.writeFileSync(file, JSON.stringify(slice, null, 2));
  }

  console.log(`[workouts] Done. Generated ${out.length} workouts → ${basePath}`);
  console.log(`[workouts] Manifest:`, manifest);
}

main();

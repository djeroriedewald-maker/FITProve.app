// scripts/build/config.ts
// Shared types, enums, caps, and helper maps for generator/validator.

export type Level = 'beginner' | 'intermediate' | 'advanced';
export type Goal = 'strength' | 'conditioning' | 'fat_loss' | 'mobility';
export type Pattern = 'squat' | 'hinge' | 'push' | 'pull' | 'core' | 'gait';
export type Equipment =
  | 'bodyweight'
  | 'dumbbell'
  | 'barbell'
  | 'kettlebell'
  | 'machine'
  | 'cable'
  | 'band'
  | 'medicine_ball'
  | 'sled'
  | 'cardio'
  | 'other';

export interface Exercise {
  id: string;            // canonical slug id (lowercase-kebab)
  name: string;
  category?: string;
  equipment?: string[];  // raw equipment tags
  primaryMuscles?: string[];
  secondaryMuscles?: string[];
  language?: string;
}

export interface WorkoutItem {
  exerciseId: string;
  sets?: number;
  reps?: number | string;
  timeSec?: number;
  tempo?: string; // e.g., "31X1"
  restSec?: number;
  rpe?: number;   // 6–9 typical
}

export interface WorkoutBlock {
  type: 'warmup' | 'strength' | 'metcon' | 'finisher' | 'cooldown';
  style?: 'Strength' | 'AMRAP' | 'EMOM' | 'ForTime' | 'Intervals' | 'Circuit';
  timeSec?: number; // for metcon/intervals/emom
  items: WorkoutItem[];
}

export interface Workout {
  id: string;
  slug: string;
  title: string;
  goal: Goal;
  level: Level;
  durationMin: 20 | 30 | 45 | 60;
  location: 'gym' | 'home' | 'outdoor';
  equipment: Equipment[];
  blocks: WorkoutBlock[];
  notes?: string;
  media?: { cover: string | null };
  language?: 'nl' | 'en';
  tags?: string[];
  progression?: { microcycleWeek?: 1 | 2 | 3 | 4; type?: 'load' | 'density' | 'variation' };
}

// --- Global Config ---

export const DURATIONS: Array<Workout['durationMin']> = [20, 30, 45, 60];
export const LEVELS: Level[] = ['beginner', 'intermediate', 'advanced'];
export const GOALS: Goal[] = ['strength', 'conditioning', 'fat_loss', 'mobility'];
export const EQUIPMENT_PROFILES: Equipment[][] = [
  ['bodyweight'],
  ['dumbbell'],
  ['kettlebell'],
  ['barbell'],
  ['machine'],
  ['dumbbell', 'kettlebell', 'bodyweight'], // mixed light
  ['barbell', 'machine', 'dumbbell'], // mixed gym
];

export const FORBIDDEN_TERMS = [
  // Keep content brand-safe (incl. user preference: avoid specific event names)
  /hyrox/i,
];

export const MIN_PATTERN_COVERAGE = 3 as const;

// Bandbreedtes per doel/level (rust/tempo/RPE caps)
export const REST_BANDS: Record<Goal, Record<Level, [number, number]>> = {
  strength: { beginner: [75, 120], intermediate: [90, 150], advanced: [90, 180] },
  conditioning: { beginner: [20, 45], intermediate: [15, 40], advanced: [10, 30] },
  fat_loss: { beginner: [20, 45], intermediate: [15, 40], advanced: [10, 30] },
  mobility: { beginner: [0, 20], intermediate: [0, 20], advanced: [0, 20] },
};

export const RPE_BANDS: Record<Goal, Record<Level, [number, number]>> = {
  strength: { beginner: [6, 8], intermediate: [7, 9], advanced: [7, 9] },
  conditioning: { beginner: [6, 7], intermediate: [6, 8], advanced: [7, 9] },
  fat_loss: { beginner: [6, 7], intermediate: [6, 8], advanced: [7, 8] },
  mobility: { beginner: [3, 6], intermediate: [3, 6], advanced: [3, 6] },
};

export const TEMPOS: Record<Goal, string[]> = {
  strength: ['31X1', '30X1', '21X1', '22X1'],
  conditioning: ['20X1', '11X1', '10X1'],
  fat_loss: ['20X1', '21X1', '11X1'],
  mobility: ['2020', '3030', '4040'],
};

// Volume caps per sessie (harde sets) per duur/level
export const VOLUME_CAPS: Record<Level, Record<Workout['durationMin'], number>> = {
  beginner: { 20: 9, 30: 12, 45: 16, 60: 20 },
  intermediate: { 20: 10, 30: 14, 45: 18, 60: 22 },
  advanced: { 20: 12, 30: 16, 45: 22, 60: 26 },
};

// Conflict rules (simple): avoid repeating same heavy pattern back-to-back in strength
export const HEAVY_PATTERNS: Pattern[] = ['squat', 'hinge'];

// --- Helpers to normalize equipment/patterns from exercises ---

export function normalizeEquipmentTag(tag?: string): Equipment {
  const t = (tag || '').toLowerCase();
  if (/(bodyweight|no equipment|none)/.test(t)) return 'bodyweight';
  if (/dumbbell|db/.test(t)) return 'dumbbell';
  if (/barbell|bb|trap bar/.test(t)) return 'barbell';
  if (/kettlebell|kb/.test(t)) return 'kettlebell';
  if (/machine|leg press|smith/.test(t)) return 'machine';
  if (/cable/.test(t)) return 'cable';
  if (/band|resistance band/.test(t)) return 'band';
  if (/medicine ball|med ball|slam ball/.test(t)) return 'medicine_ball';
  if (/sled|prowler/.test(t)) return 'sled';
  if (/run|row|bike|erg|treadmill|skierg/.test(t)) return 'cardio';
  return 'other';
}

export function derivePatternsFromMuscles(muscles: string[] = []): Set<Pattern> {
  const m = muscles.map((s) => s.toLowerCase());
  const p = new Set<Pattern>();
  if (m.some((x) => /quad|glute/.test(x))) p.add('squat');
  if (m.some((x) => /hamstring|glute|erector/.test(x))) p.add('hinge');
  if (m.some((x) => /chest|triceps|shoulder|deltoid/.test(x))) p.add('push');
  if (m.some((x) => /back|lat|bicep|rear delt|trap/.test(x))) p.add('pull');
  if (m.some((x) => /ab|core|oblique|lower abs|transverse/.test(x))) p.add('core');
  return p;
}

export function derivePatternsFromName(name: string): Set<Pattern> {
  const n = name.toLowerCase();
  const p = new Set<Pattern>();
  if (/(squat|lunge|step-up|pistol)/.test(n)) p.add('squat');
  if (/(deadlift|hinge|good morning|hip thrust|rdl|kettle.*swing)/.test(n)) p.add('hinge');
  if (/(press|push-up|dip|overhead)/.test(n)) p.add('push');
  if (/(row|pull-up|chin-up|pulldown|face pull)/.test(n)) p.add('pull');
  if (/(plank|crunch|sit-up|raise|pallof|hollow|dead bug|rotation|anti-rotation)/.test(n)) p.add('core');
  if (/(run|sprint|carry|farmer|walk|sled)/.test(n)) p.add('gait');
  return p;
}

export function derivePatterns(ex: Exercise): Pattern[] {
  const set = new Set<Pattern>();
  derivePatternsFromMuscles([...(ex.primaryMuscles || []), ...(ex.secondaryMuscles || [])]).forEach((p) => set.add(p));
  derivePatternsFromName(ex.name || '').forEach((p) => set.add(p));
  // Heuristics for gait/carry
  if ((ex.name || '').toLowerCase().includes('carry')) set.add('gait');
  return Array.from(set);
}

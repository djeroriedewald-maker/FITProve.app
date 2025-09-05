// scripts/build/workout-sources.ts
// WGER (CC-BY-SA) + ExerciseDB (open-source) fetchers, bron-agnostische normalisatie.
//
// Belangrijk voor ExerciseDB (/dist/exercises.json):
// - Bronvolgorde: EXERCISEDB_JSON_URL -> lokale snapshots -> mirrors (/dist) -> legacy root
// - primaryMuscles: gebruikt primaryMuscles[] -> target -> bodyPart (fallback)
// - images in /dist zijn vaak RELATIEF; we maken ze absolute RAW-URLs

import {
    slugify,
    shortHash,
    NormalizedExercise,
    LicenseInfo,
    normalizeLabel,
    hasAnyMedia,
  } from '../../src/types/workout';
  import { readFile } from 'fs/promises';
  import path from 'path';
  
  const WGER_BASE = 'https://wger.de/api/v2';
  const EXDB_COMMIT = process.env.EXERCISE_DB_COMMIT || 'main';
  
  // ===== New: global toggle om strikte media-filter uit te zetten =====
  const NO_IMAGE_FILTER = (process.env.NO_IMAGE_FILTER ?? '0') === '1';
  
  // 1) ENV override (pad of http)
  const EXDB_ENV = process.env.EXERCISEDB_JSON_URL ? [process.env.EXERCISEDB_JSON_URL] : [];
  
  // 2) Lokale snapshots (grote file is het best)
  const EXDB_LOCAL_CANDIDATES = [
    path.join(process.cwd(), 'scripts/build/assets/exercises.json'),
    path.join(process.cwd(), 'scripts/build/assets/exercise-db.snapshot.json'),
  ];
  
  // 3) Mirrors – eerst de moderne /dist/, dan legacy root als laatste redmiddel
  const EXDB_REMOTE_CANDIDATES = [
    `https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@${EXDB_COMMIT}/dist/exercises.json`,
    `https://rawcdn.githack.com/yuhonas/free-exercise-db/${EXDB_COMMIT}/dist/exercises.json`,
    `https://raw.githubusercontent.com/yuhonas/free-exercise-db/${EXDB_COMMIT}/dist/exercises.json`,
    // legacy root:
    `https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@${EXDB_COMMIT}/exercises.json`,
    `https://rawcdn.githack.com/yuhonas/free-exercise-db/${EXDB_COMMIT}/exercises.json`,
    `https://raw.githubusercontent.com/yuhonas/free-exercise-db/${EXDB_COMMIT}/exercises.json`,
  ];
  
  // RAW-base voor relatieve images in de repo
  const EXDB_IMAGE_BASE = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/';
  
  // ---------------- Types ----------------
  type WgerList<T> = { count: number; next: string | null; previous: string | null; results: T[] };
  type WgerLanguage = { id: number; short_name: string };
  type WgerMuscle = { id: number; name_en: string; name: string };
  type WgerEquipment = { id: number; name: string };
  type WgerCategory = { id: number; name: string };
  type WgerExercise = {
    id: number;
    name: string;
    description: string;
    language: number;
    muscles: number[];
    muscles_secondary: number[];
    equipment: number[];
    category: number | null;
  };
  type WgerExerciseImage = { id: number; exercise: number; image: string; is_main: boolean };
  
  // ExerciseDB item (samengevoegd schema voor root/dist varianten)
  type ExerciseDBItem = {
    id?: string;
    name: string;
    // moderne /dist velden (vaak aanwezig)
    primaryMuscles?: string[];
    secondaryMuscles?: string[];
    // oudere/andere velden
    target?: string;
    bodyPart?: string;
    equipment?: string;
    // media
    gifUrl?: string;
    images?: string[]; // in /dist vaak RELATIEF
    videoUrl?: string;
    // extra
    instructions?: string[];
    category?: string;
  };
  
  // ---------------- Helpers ----------------
  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
  
  async function fetchAll<T>(url: string): Promise<T[]> {
    const acc: T[] = [];
    let next: string | null = url;
    while (next) {
      const res = await fetch(next, { headers: { 'User-Agent': 'FITProve-Build/1.0' } });
      if (!res.ok) throw new Error(`Fetch failed ${res.status}: ${next}`);
      const json = (await res.json()) as WgerList<T>;
      acc.push(...json.results);
      next = json.next;
      await sleep(50);
    }
    return acc;
  }
  
  function stripHtml(html: string): string {
    return html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<li>/gi, '\n- ')
      .replace(/<\/p>/gi, '\n')
      .replace(/<[^>]*>/g, '')
      .replace(/\n{2,}/g, '\n')
      .trim();
  }
  
  function uniq<T>(arr: T[]): T[] {
    return Array.from(new Set(arr));
  }
  
  function normalizeMuscleName(name: string): string {
    const map: Record<string, string> = {
      'abdominal muscles': 'abdominals',
      'rectus abdominis': 'abdominals',
      obliques: 'obliques',
      'biceps brachii': 'biceps',
      'triceps brachii': 'triceps',
      'quadriceps femoris': 'quadriceps',
      hamstrings: 'hamstrings',
      'latissimus dorsi': 'lats',
      'gluteus maximus': 'glutes',
      gastrocnemius: 'calves',
      soleus: 'calves',
      deltoideus: 'deltoids',
      'pectoral muscles': 'chest',
      'erector spinae': 'lower back',
      trapezius: 'traps',
      'broad back muscles': 'back',
    };
    const key = normalizeLabel(name);
    return map[key] ?? key;
  }
  
  function normalizeEquipmentName(name: string | undefined | null): string {
    if (!name) return 'bodyweight';
    const key = normalizeLabel(name);
    const map: Record<string, string> = {
      'body weight': 'bodyweight',
      'body-weight': 'bodyweight',
      'body only': 'bodyweight',
      'no equipment': 'bodyweight',
      barbell: 'barbell',
      dumbbell: 'dumbbell',
      kettlebell: 'kettlebell',
      'resistance band': 'resistance band',
      'ez bar': 'ez bar',
      'medicine ball': 'medicine ball',
      cable: 'cable',
      machine: 'machine',
      'smith machine': 'smith machine',
      'trap bar': 'trap bar',
      'pull-up bar': 'pull-up bar',
      'chin up bar': 'pull-up bar',
      bench: 'bench',
      box: 'box',
      sandbag: 'sandbag',
      sled: 'sled',
      'rowing machine': 'rowing machine',
      'exercise ball': 'exercise ball',
      'bosu ball': 'bosu ball',
      treadmill: 'treadmill',
      elliptical: 'elliptical',
      'assault bike': 'air bike',
      'air bike': 'air bike',
    };
    return map[key] ?? key;
  }
  
  async function readMaybeFileOrHttp(ref: string): Promise<string> {
    if (/^https?:\/\//i.test(ref)) {
      const res = await fetch(ref, { headers: { 'User-Agent': 'FITProve-Build/1.0' } });
      if (!res.ok) throw new Error(`HTTP ${res.status} @ ${ref}`);
      return await res.text();
    }
    const p = ref.startsWith('file://') ? ref.replace('file://', '') : ref;
    return await readFile(p, 'utf8');
  }
  
  /** ExerciseDB-bron: ENV -> lokaal -> mirrors (/dist/) -> legacy root */
  async function readExerciseDbJSON(): Promise<ExerciseDBItem[]> {
    const candidates = [...EXDB_ENV, ...EXDB_LOCAL_CANDIDATES, ...EXDB_REMOTE_CANDIDATES];
    let lastErr: unknown = null;
    for (const ref of candidates) {
      try {
        const raw = await readMaybeFileOrHttp(ref);
        console.log(`[ExerciseDB] Using: ${ref}`);
        return JSON.parse(raw) as ExerciseDBItem[];
      } catch (e) {
        lastErr = e;
      }
    }
    throw lastErr ?? new Error('ExerciseDB: no sources available (env/local/remote)');
  }
  
  // --------------- WGER ---------------
  export async function fetchFromWger(languagePref: ('en' | 'nl')[] = ['en']): Promise<NormalizedExercise[]> {
    const langs = await fetchAll<WgerLanguage>(`${WGER_BASE}/language/?limit=200`);
    const desiredLangIds = languagePref
      .map((code) => langs.find((l) => l.short_name.toLowerCase() === code)?.id)
      .filter((v): v is number => typeof v === 'number');
  
    const muscles = await fetchAll<WgerMuscle>(`${WGER_BASE}/muscle/?limit=500`);
    const equipment = await fetchAll<WgerEquipment>(`${WGER_BASE}/equipment/?limit=500`);
    const categories = await fetchAll<WgerCategory>(`${WGER_BASE}/exercisecategory/?limit=200`);
    const images = await fetchAll<WgerExerciseImage>(`${WGER_BASE}/exerciseimage/?limit=5000`);
  
    const muscleById = new Map<number, string>();
    muscles.forEach((m) => muscleById.set(m.id, normalizeMuscleName(m.name_en || m.name)));
  
    const equipById = new Map<number, string>();
    equipment.forEach((e) => equipById.set(e.id, normalizeEquipmentName(e.name)));
  
    const catById = new Map<number, string>();
    categories.forEach((c) => catById.set(c.id, normalizeLabel(c.name)));
  
    const langParam = desiredLangIds.map((id) => `language=${id}`).join('&');
    const exercises = await fetchAll<WgerExercise>(`${WGER_BASE}/exercise/?limit=200&${langParam || 'language=2'}`);
  
    const imagesByExercise = new Map<number, string[]>();
    images.forEach((img) => {
      const arr = imagesByExercise.get(img.exercise) ?? [];
      arr.push(img.image);
      imagesByExercise.set(img.exercise, arr);
    });
  
    const license: LicenseInfo = {
      name: 'CC-BY-SA 3.0',
      url: 'https://wger.de/',
      attribution: 'wger Workout Manager',
    };
  
    const mapped: NormalizedExercise[] = exercises.map((ex) => {
      const name = ex.name?.trim() || `wger-${ex.id}`;
      const slug = slugify(name);
      const prim = uniq(ex.muscles.map((id) => muscleById.get(id) || '').filter(Boolean));
      const sec = uniq(ex.muscles_secondary.map((id) => muscleById.get(id) || '').filter(Boolean));
      const equip = uniq(ex.equipment.map((id) => equipById.get(id) || '').filter(Boolean));
      const desc = stripHtml(ex.description || '');
      const imgs = imagesByExercise.get(ex.id) || [];
      const id = `${slug}-${shortHash(`wger:${ex.id}`)}`;
  
      return {
        id,
        slug,
        name,
        description: desc || undefined,
        primaryMuscles: prim,
        secondaryMuscles: sec.length ? sec : undefined,
        equipment: equip.length ? equip : ['bodyweight'],
        category: ex.category ? catById.get(ex.category) : undefined,
        media: { images: imgs.length ? imgs : undefined, thumbnail: imgs[0] },
        sources: [{ vendor: 'wger', id: String(ex.id), url: `https://wger.de/exercise/${ex.id}`, license }],
        language: 'en',
      };
    });
  
    // ===== Changed: minder strikt filteren zodat WGER niet leegvalt =====
    // - standaard (NO_IMAGE_FILTER=0): eis beschrijving + (minstens één image)
    // - relaxed (NO_IMAGE_FILTER=1): accepteer beschrijving ÓF image
    return mapped.filter((m) => {
      const hasDesc = (m.description?.trim().length ?? 0) > 0;
      const hasImg = (m.media?.images?.length ?? 0) > 0;
      return NO_IMAGE_FILTER ? (hasDesc || hasImg) : (hasDesc && hasImg);
    });
  }
  
  // --------------- ExerciseDB ---------------
  export async function fetchFromExerciseDB(): Promise<NormalizedExercise[]> {
    const data = await readExerciseDbJSON();
  
    const license: LicenseInfo = {
      name: 'Open-source dataset',
      url: 'https://github.com/yuhonas/free-exercise-db',
      attribution: 'Community contributors',
    };
  
    const items: NormalizedExercise[] = data.map((it, idx) => {
      const name = (it.name || '').trim() || `exercise-db-${idx}`;
      const slug = slugify(name);
  
      // Muscles: primaryMuscles[] -> target -> bodyPart
      const musclePool: string[] = [];
      if (Array.isArray(it.primaryMuscles) && it.primaryMuscles.length) {
        musclePool.push(...it.primaryMuscles);
      }
      if (it.target) musclePool.push(it.target);
      if (it.bodyPart) musclePool.push(it.bodyPart);
  
      const normPool = uniq(musclePool.filter(Boolean).map((m) => normalizeMuscleName(m)));
      const primary = normPool.length ? [normPool[0]] : [];
      const secondary = uniq([
        ...(normPool.slice(1)),
        ...((it.secondaryMuscles || []).map((m) => normalizeMuscleName(m))),
      ]).filter((m) => m !== primary[0]);
  
      const equip = [normalizeEquipmentName(it.equipment)];
  
      // Media: maak relatieve images absoluut
      const gifs: string[] = [];
      const images: string[] = [];
      const videos: string[] = [];
  
      if (it.gifUrl) gifs.push(it.gifUrl);
      if (it.images?.length) {
        for (const rel of it.images) {
          if (!rel) continue;
          const abs = /^https?:\/\//i.test(rel) ? rel : EXDB_IMAGE_BASE + rel.replace(/^\/+/, '');
          images.push(abs);
        }
      }
      if (it.videoUrl) videos.push(it.videoUrl);
  
      const id = `${slug}-${shortHash(`exerciseDB:${it.id ?? idx}`)}`;
  
      return {
        id,
        slug,
        name,
        instructions: it.instructions && it.instructions.length ? it.instructions : undefined,
        primaryMuscles: primary,
        secondaryMuscles: secondary.length ? secondary : undefined,
        equipment: equip.length ? equip : ['bodyweight'],
        category: normalizeLabel(it.bodyPart || it.category || ''),
        media: {
          gifs: gifs.length ? gifs : undefined,
          images: images.length ? images : undefined,
          videos: videos.length ? videos : undefined,
          thumbnail: gifs[0] || images[0],
        },
        sources: [{ vendor: 'exerciseDB', id: String(it.id ?? idx), url: undefined, license }],
        language: 'en',
      };
    });
  
    // ===== Changed: media optioneel als NO_IMAGE_FILTER=1 =====
    const requireMedia = !NO_IMAGE_FILTER;
    return items
      .filter((m) => m.name && m.equipment.length > 0 && m.primaryMuscles.length > 0)
      .filter((m) => (requireMedia ? hasAnyMedia(m.media) : true));
  }
  
  export type SourceFetchResult = {
    vendor: 'wger' | 'exerciseDB';
    items: NormalizedExercise[];
  };
  
// src/workout-sources.ts
// Unified runtime loader that the UI should import.
// Workouts ↔ VITE_WORKOUTS_BASE (v20250906)
// Exercises ↔ VITE_EXERCISES_BASE (v20250905) [fallback: VITE_WORKOUTS_BASE]

type Manifest = { total: number; chunks: number; chunkSize?: number; version?: string; basePath?: string; generatedAt?: string };

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`HTTP ${res.status} @ ${url}`);
  try {
    return (await res.json()) as T;
  } catch (e: any) {
    // Extra debug in dev: log first chars of body when JSON fails
    if ((import.meta as any)?.env?.DEV) {
      try {
        const txt = await res.clone().text();
        console.error('JSON parse failed for', url, 'first bytes:', txt.slice(0, 120));
      } catch {}
    }
    throw e;
  }
}
const clean = (u: string) => (u || '').trim().replace(/\/manifest\.json$/i, '').replace(/\/+$/g, '');
function joinUrl(base: string, path: string): string {
  const b = clean(base);
  const p = path.replace(/^\/+/, '');
  if (/^https?:\/\//i.test(b)) {
    try {
      const u = new URL(b.endsWith('/') ? b : b + '/');
      return new URL(p, u).toString();
    } catch {
      return `${b}/${p}`;
    }
  }
  return `${b}/${p}`;
}
const manifestUrl = (base: string) => joinUrl(base, 'manifest.json');
const chunkUrl = (base: string, i: number) => joinUrl(base, `chunk-${String(i).padStart(3, '0')}.json`);

const FALLBACK_WORKOUTS_BASE = '/data/workouts/v20250906';
const FALLBACK_EXERCISES_BASE = '/data/workouts/v20250905';

async function resolveBase(
  basePref: string | undefined,
  fallback: string,
  kind: 'workouts' | 'exercises'
): Promise<{ manifest: Manifest; chunkBase: string }>{
  const base = clean((basePref as any) || fallback);
  const idxUrl = `${base.replace(/\/+$/g, '')}/index.json`;
  if ((import.meta as any)?.env?.DEV) {
    console.log(`[loader] resolveBase(${kind})`, { basePref, base, idxUrl });
  }

  // 1) Prefer index.json so we can differentiate datasets under same alias
  try {
    const idx: any = await fetchJson<any>(idxUrl);
    const v = (idx && (idx[`${kind}_latest`] || idx.latest)) as string | undefined;
    if (v) {
      const manifest = await fetchJson<Manifest>(`${base.replace(/\/+$/g, '')}/${v}/manifest.json`);
      let out = finalizeBase(base, manifest);
      // Verify chunk-000 exists; if not, try safe alias/<version>
      try {
        const testUrl = chunkUrl(out.chunkBase, 0);
        const res = await fetch(testUrl, { method: 'HEAD' });
        if (!res.ok) {
          const alt = clean(`${base}/${(manifest as any).version || v}`);
          out = { manifest, chunkBase: alt };
        }
      } catch {
        const alt = clean(`${base}/${(manifest as any).version || v}`);
        out = { manifest, chunkBase: alt };
      }
      if ((import.meta as any)?.env?.DEV) console.log(`[loader] manifest(${kind})`, { version: (manifest as any)?.version, chunkBase: out.chunkBase });
      return out;
    }
  } catch {}

  // 2) Fallback to manifest at alias root (single-dataset alias)
  try {
    const manifest = await fetchJson<Manifest>(manifestUrl(base));
    let out = finalizeBase(base, manifest);
    try {
      const res = await fetch(chunkUrl(out.chunkBase, 0), { method: 'HEAD' });
      if (!res.ok) out = { manifest, chunkBase: clean(`${base}/${(manifest as any).version || ''}`) };
    } catch {
      out = { manifest, chunkBase: clean(`${base}/${(manifest as any).version || ''}`) };
    }
    if ((import.meta as any)?.env?.DEV) console.log(`[loader] alias-manifest(${kind})`, { version: (manifest as any)?.version, chunkBase: out.chunkBase });
    return out;
  } catch {}

  // 3) Local fallback
  const manifest = await fetchJson<Manifest>(manifestUrl(fallback));
  const out = finalizeBase(fallback, manifest);
  if ((import.meta as any)?.env?.DEV) console.log(`[loader] fallback-manifest(${kind})`, { version: (manifest as any)?.version, chunkBase: out.chunkBase });
  return out;
}

function finalizeBase(base: string, manifest: Manifest): { manifest: Manifest; chunkBase: string } {
  let chunkBase = base;
  const bp = (manifest as any).basePath as string | undefined;
  const ver = (manifest as any).version as string | undefined;

  const isHttp = /^https?:\/\//i.test(base);

  // Remote alias: ignore build-time basePath, always use <alias>/<version>
  if (isHttp && ver) {
    const ends = new RegExp(`/${ver}$`).test(clean(base));
    return { manifest, chunkBase: ends ? clean(base) : clean(`${base}/${ver}`) };
  }

  // Local fallback nuances: some manifests embed basePath like './v20250905' even if base already ends with that version.
  if (!isHttp && ver && bp && /^(\.\/)?v\d{8,}/i.test(bp)) {
    const endsWithVer = new RegExp(`/${ver}$`).test(base);
    if (endsWithVer) {
      return { manifest, chunkBase: clean(base) };
    }
  }

  if (bp) {
    if (/^https?:\/\//i.test(bp) || bp.startsWith('/')) chunkBase = clean(bp);
    else chunkBase = clean(`${base}/${bp.replace(/^\.\/?/, '')}`);
  } else if (ver) {
    chunkBase = clean(`${base}/${ver}`);
  }
  return { manifest, chunkBase };
}

export async function getManifest(
  kind: 'workouts' | 'exercises',
  basePref?: string,
  fallback?: string
): Promise<{ manifest: Manifest; chunkBase: string }> {
  const fb = fallback || (kind === 'workouts' ? FALLBACK_WORKOUTS_BASE : FALLBACK_EXERCISES_BASE);
  return resolveBase(basePref, fb, kind);
}

export async function loadAllWorkouts<T = any>(): Promise<T[]> {
  const { manifest: m, chunkBase } = await resolveBase(
    (import.meta as any)?.env?.VITE_WORKOUTS_BASE as string | undefined,
    FALLBACK_WORKOUTS_BASE,
    'workouts'
  );
  const out: T[] = [];
  for (let i = 0; i < m.chunks; i++) out.push(...(await fetchJson<T[]>(chunkUrl(chunkBase, i))));
  return out;
}

export async function loadAllExercises<T = any>(): Promise<T[]> {
  const { manifest: m, chunkBase } = await resolveBase(
    ((import.meta as any)?.env?.VITE_EXERCISES_BASE as string) || ((import.meta as any)?.env?.VITE_WORKOUTS_BASE as string),
    FALLBACK_EXERCISES_BASE,
    'exercises'
  );
  const out: T[] = [];
  for (let i = 0; i < m.chunks; i++) out.push(...(await fetchJson<T[]>(chunkUrl(chunkBase, i))));
  return out;
}

export async function* streamWorkouts<T = any>(): AsyncGenerator<T[], void> {
  const { manifest: m, chunkBase } = await resolveBase(
    (import.meta as any)?.env?.VITE_WORKOUTS_BASE as string | undefined,
    FALLBACK_WORKOUTS_BASE,
    'workouts'
  );
  for (let i = 0; i < m.chunks; i++) {
    const url = chunkUrl(chunkBase, i);
    if ((import.meta as any)?.env?.DEV) console.log('[loader] fetch chunk', url);
    yield await fetchJson<T[]>(url);
  }
}

export async function* streamExercises<T = any>(): AsyncGenerator<T[], void> {
  const preferred = ((import.meta as any)?.env?.VITE_EXERCISES_BASE as string) || ((import.meta as any)?.env?.VITE_WORKOUTS_BASE as string);
  const { manifest: m, chunkBase } = await resolveBase(preferred, FALLBACK_EXERCISES_BASE, 'exercises');
  for (let i = 0; i < m.chunks; i++) {
    const url = chunkUrl(chunkBase, i);
    if ((import.meta as any)?.env?.DEV) console.log('[loader] fetch chunk', url);
    yield await fetchJson<T[]>(url);
  }
}

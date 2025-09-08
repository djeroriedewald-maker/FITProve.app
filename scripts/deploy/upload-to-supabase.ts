// scripts/deploy/upload-to-supabase.ts
// Upload manifest + chunks naar Supabase Storage en onderhoud alias `index.json`.
// ENV (niet committen):
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
//   WORKOUTS_BUCKET   (optioneel, default: "workouts")
// CLI args: [node, tsx, script, OUT_ROOT?, ALIAS_DIR?, VERSION?]
//   OUT_ROOT   (default: public/data/workouts)
//   ALIAS_DIR  (bijv. workouts of exercises; default: workouts)
//   VERSION    (bijv. v20250906; indien leeg wordt geprobeerd uit OUT_ROOT/index.json)

import { readdir, readFile } from 'fs/promises';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const BUCKET = process.env.WORKOUTS_BUCKET || 'workouts';
const OUT_ROOT = process.argv[2] || 'public/data/workouts';
const ALIAS_DIR = process.argv[3] || process.env.ALIAS_DIR || 'workouts';
const CLI_VERSION = process.argv[4];

async function gatherFiles(dir: string): Promise<string[]> {
  const out: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await gatherFiles(p)));
    else out.push(p);
  }
  return out;
}

async function resolveVersion(): Promise<string> {
  if (CLI_VERSION) return CLI_VERSION;
  try {
    const idx = JSON.parse(await readFile(path.join(OUT_ROOT, 'index.json'), 'utf-8'));
    // Gebruik alias-specifieke key indien aanwezig
    const key = ALIAS_DIR === 'exercises' ? 'exercises_latest' : ALIAS_DIR === 'workouts' ? 'workouts_latest' : 'latest';
    return (idx[key] || idx.latest) as string;
  } catch (e) {
    throw new Error('Kon versie niet bepalen: geef VERSION als 3e CLI-arg of voeg index.json toe.');
  }
}

async function main() {
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!url || !key) throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');

  const client = createClient(url, key);
  const version = await resolveVersion();

  const versionDir = path.join(OUT_ROOT, version);
  const files = await gatherFiles(versionDir);
  const prefix = `${ALIAS_DIR}/${version}`;
  console.log(`Uploading ${files.length} files to bucket "${BUCKET}" at path "${prefix}"`);

  for (const abs of files) {
    const fileName = path.basename(abs);
    const keyPath = `${prefix}/${fileName}`;
    const content = await readFile(abs);
    const { error } = await client.storage.from(BUCKET).upload(keyPath, content, {
      upsert: true,
      contentType: 'application/json',
      cacheControl: '3600',
    });
    if (error) {
      console.error(`Upload failed for ${fileName}:`, error.message);
      process.exitCode = 1;
    } else {
      console.log(`Uploaded ${keyPath}`);
    }
  }

  // Alias index.json bijwerken (mergen)
  try {
    let idxObj: any = {};
    const existing = await client.storage.from(BUCKET).download(`${ALIAS_DIR}/index.json`);
    if (existing.data) {
      try { idxObj = JSON.parse(await existing.data.text()); } catch {}
    }
    if (ALIAS_DIR === 'workouts') idxObj.workouts_latest = version;
    else if (ALIAS_DIR === 'exercises') idxObj.exercises_latest = version;
    else idxObj.latest = version;

    const { error: idxErr } = await client.storage
      .from(BUCKET)
      .upload(`${ALIAS_DIR}/index.json`, Buffer.from(JSON.stringify(idxObj, null, 2)), {
        upsert: true,
        contentType: 'application/json',
        cacheControl: '60',
      });
    if (idxErr) throw idxErr;
    console.log(`Updated ${ALIAS_DIR}/index.json`);
  } catch (e: any) {
    console.error('Alias update failed:', e?.message || e);
    process.exitCode = 1;
  }

  console.log('Done.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


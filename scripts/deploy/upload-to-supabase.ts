// scripts/deploy/upload-to-supabase.ts
// Upload manifest + chunks naar Supabase Storage (bucket "workouts").
// Benodigd in ENV (lokaal, NIET committen): SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
import { readdir, readFile, stat } from 'fs/promises';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const BUCKET = process.env.WORKOUTS_BUCKET || 'workouts';
const OUT_ROOT = process.argv[2] || 'public/data/workouts';
const VERSION = process.env.WORKOUTS_VERSION; // optioneel; anders uit index.json

async function findVersion(dir: string): Promise<string> {
  if (VERSION) return VERSION;
  const idx = path.join(dir, 'index.json');
  const json = JSON.parse(await readFile(idx, 'utf8'));
  return json.latest as string; // e.g. vYYYYMMDD
}

async function gatherFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir);
  const files: string[] = [];
  for (const e of entries) {
    const p = path.join(dir, e);
    const s = await stat(p);
    if (s.isFile()) files.push(p);
  }
  return files;
}

async function main() {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env');
  }

  const client = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

  const version = await findVersion(OUT_ROOT);
  const versionDir = path.join(OUT_ROOT, version);
  const files = await gatherFiles(versionDir);

  console.log(`▶ Uploading ${files.length} files to bucket "${BUCKET}" at path "workouts/${version}"`);

  for (const abs of files) {
    const fileName = path.basename(abs); // e.g. chunk-000.json or manifest.json
    const key = `workouts/${version}/${fileName}`;

    const content = await readFile(abs);
    const { data, error } = await client.storage.from(BUCKET).upload(key, content, {
      upsert: true,
      contentType: 'application/json',
      cacheControl: '3600',
    });
    if (error) {
      console.error(`✖ Upload failed for ${fileName}:`, error.message);
      process.exitCode = 1;
    } else {
      console.log(`✔ Uploaded ${key}`);
    }
  }

  console.log('Done.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

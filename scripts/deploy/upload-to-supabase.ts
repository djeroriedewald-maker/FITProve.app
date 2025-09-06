// scripts/deploy/upload-to-supabase.ts
// Upload manifest + chunks naar Supabase Storage (bucket "workouts").
// Benodigd in ENV (lokaal, NIET committen): SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
import { readdir, readFile, stat } from 'fs/promises';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const BUCKET = process.env.WORKOUTS_BUCKET || 'workouts';
const OUT_ROOT = process.argv[2] || 'public/data/workouts';
const VERSION = process.env.WORKOUTS_VERSION; // optional override

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

async function main() {
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!url || !key) {
    console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  const client = createClient(url, key);
  const version = VERSION || (await (async () => {
    const stats = await stat(path.join(OUT_ROOT, 'manifest.json'));
    void stats; // touch fs so it’s “used”
    const guess = process.env.GITHUB_SHA?.slice(0, 7) || "local";
    return guess;
  })());

  const versionDir = path.join(OUT_ROOT, version);
  const files = await gatherFiles(versionDir);

  console.log(`▶ Uploading ${files.length} files to bucket "${BUCKET}" at path "workouts/${version}"`);

  for (const abs of files) {
    const fileName = path.basename(abs); // e.g. chunk-000.json or manifest.json
    const keyPath = `workouts/${version}/${fileName}`;

    const content = await readFile(abs);
    const { error } = await client.storage.from(BUCKET).upload(keyPath, content, {
      upsert: true,
      contentType: 'application/json',
      cacheControl: '3600',
    });
    if (error) {
      console.error(`✖ Upload failed for ${fileName}:`, error.message);
      process.exitCode = 1;
    } else {
      console.log(`✔ Uploaded ${keyPath}`);
    }
  }

  console.log('Done.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

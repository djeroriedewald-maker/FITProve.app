/**
 * build-workout-library.ts
 * Orchestrator: roept de generator aan met 1500 workouts en werkt alias-index bij.
 * CLI: tsx scripts/build/build-workout-library.ts [--version=vYYYYMMDD] [--target=1500] [--chunk=400]
 */

import fs from 'fs';
import { readFileSync, writeFileSync } from 'fs';
import path from 'path';

function getArg(name: string, fallback?: string): string | undefined {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.split('=')[1] : fallback;
}

function todayVersion(): string {
  return `v${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`;
}

export async function buildWorkoutLibrary(): Promise<{ version: string; outDir: string }> {
  const version = (getArg('version') || todayVersion()).replace(/^v?/, 'v');
  const target = getArg('target') || '1500';
  const chunk = getArg('chunk') || '400';

  // Zorg dat de generator z'n CLI-args ziet
  const prevArgv = [...process.argv];
  try {
    const baseArgv = [
      prevArgv[0] || 'node',
      'scripts/build/generate-workouts.ts',
      `--version=${version.replace(/^v?/, '')}`,
      `--target=${target}`,
      `--chunk=${chunk}`,
    ];
    process.argv = baseArgv;

    // Dynamische import zodat main() in de generator 1x runt met bovenstaande argv
    await import('./generate-workouts.ts');
  } finally {
    process.argv = prevArgv;
  }

  const outDir = path.join('public', 'data', 'workouts', version);
  // Alias-index bijwerken
  const idxPath = path.join('public', 'data', 'workouts', 'index.json');
  let idx: any = {};
  try {
    if (fs.existsSync(idxPath)) idx = JSON.parse(readFileSync(idxPath, 'utf-8'));
  } catch {}
  // Behoud bestaande exercises_latest indien aanwezig
  idx.workouts_latest = version;
  if (!idx.latest) idx.latest = idx.workouts_latest; // back-compat
  writeFileSync(idxPath, JSON.stringify(idx, null, 2));

  return { version, outDir };
}

export async function main(): Promise<void> {
  const { version, outDir } = await buildWorkoutLibrary();
  // Kleine samenvatting voor CLI
  const man = JSON.parse(readFileSync(path.join(outDir, 'manifest.json'), 'utf-8'));
  // eslint-disable-next-line no-console
  console.log(`[build] workouts ${man.total} @ ${version} in ${outDir}`);
}

export default main;

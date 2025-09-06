// scripts/build/build-workout-library.ts
// Merge + validate + dedupe + chunk → /public/data/workouts/vYYYYMMDD + root aliases
import { mkdir, writeFile, stat } from 'fs/promises';
import path from 'path';
import {
    DEFAULT_CHUNK_SIZE,
    NormalizedExercise,
    WorkoutManifest,
    shortHash,
    hasAnyMedia,
    normalizeName,
  } from '../../src/types/workout';
  import { fetchFromWger, fetchFromExerciseDB } from './workout-sources';  

type BuildOptions = {
...
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
...

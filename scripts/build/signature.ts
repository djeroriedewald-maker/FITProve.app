// scripts/build/signature.ts
// Canonical signature + Jaccard similarity for dedupe.

import { Workout } from './config';

export function signatureTokens(w: Workout): string[] {
  const tokens: string[] = [];
  tokens.push(`goal:${w.goal}`, `level:${w.level}`, `dur:${w.durationMin}`);
  for (const b of w.blocks) {
    tokens.push(`b:${b.type}:${b.style || ''}:${b.timeSec || 0}`);
    for (const it of b.items) {
      tokens.push(`x:${it.exerciseId}`);
      if (it.sets) tokens.push(`s:${it.sets}`);
      if (it.reps !== undefined) tokens.push(`r:${it.reps}`);
      if (it.timeSec) tokens.push(`t:${it.timeSec}`);
    }
  }
  return tokens;
}

export function jaccardSim(a: string[], b: string[]): number {
  const A = new Set(a);
  const B = new Set(b);
  let inter = 0;
  for (const x of A) if (B.has(x)) inter++;
  const union = A.size + B.size - inter;
  return union === 0 ? 1 : inter / union;
}

// Simple DJB2 hash for ID/slug generation
export function djb2(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return hash >>> 0;
}

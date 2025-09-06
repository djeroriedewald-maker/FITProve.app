// scripts/build/validator.ts
// Validates workout structure, IDs, coverage, simple caps/conflicts, and forbidden terms.

import {
    Workout,
    Exercise,
    Pattern,
    MIN_PATTERN_COVERAGE,
    VOLUME_CAPS,
    LEVELS,
    DURATIONS,
    RPE_BANDS,
    REST_BANDS,
    FORBIDDEN_TERMS,
    HEAVY_PATTERNS,
    derivePatterns,
  } from './config';
  
  export interface ValidationIssue { code: string; message: string }
  export interface ValidationResult { ok: boolean; issues: ValidationIssue[] }
  
  export type ExerciseMap = Map<string, Exercise>;
  
  export function validateForbiddenTerms(w: Workout): ValidationIssue[] {
    const text = `${w.title} ${w.notes || ''}`.toLowerCase();
    const bad = FORBIDDEN_TERMS.find((re) => re.test(text));
    return bad ? [{ code: 'forbidden_term', message: `Found forbidden term in title/notes` }] : [];
  }
  
  export function validateIdsExist(w: Workout, exMap: ExerciseMap): ValidationIssue[] {
    const missing: string[] = [];
    for (const b of w.blocks) {
      for (const it of b.items) {
        if (!exMap.has(it.exerciseId)) missing.push(it.exerciseId);
      }
    }
    return missing.length ? [{ code: 'missing_exercise', message: `Missing exercise IDs: ${missing.slice(0, 5).join(', ')}` }] : [];
  }
  
  export function collectPatterns(w: Workout, exMap: ExerciseMap): Set<Pattern> {
    const p = new Set<Pattern>();
    for (const b of w.blocks) {
      for (const it of b.items) {
        const ex = exMap.get(it.exerciseId);
        if (!ex) continue;
        derivePatterns(ex).forEach((pp) => p.add(pp));
      }
    }
    return p;
  }
  
  export function validatePatternCoverage(w: Workout, exMap: ExerciseMap): ValidationIssue[] {
    const p = collectPatterns(w, exMap);
    if (p.size < MIN_PATTERN_COVERAGE) {
      return [{ code: 'pattern_coverage', message: `Only ${p.size} patterns covered; need ≥ ${MIN_PATTERN_COVERAGE}` }];
    }
    return [];
  }
  
  export function validateVolumeCaps(w: Workout): ValidationIssue[] {
    if (!LEVELS.includes(w.level) || !DURATIONS.includes(w.durationMin)) return [];
    const cap = VOLUME_CAPS[w.level][w.durationMin];
    let hardSets = 0;
    for (const b of w.blocks) {
      if (b.type === 'strength' || b.type === 'metcon' || b.type === 'finisher') {
        for (const it of b.items) if (typeof it.sets === 'number') hardSets += it.sets;
      }
    }
    return hardSets > cap ? [{ code: 'volume_cap', message: `Hard sets ${hardSets} > cap ${cap}` }] : [];
  }
  
  export function validateRestRpe(w: Workout): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const [rpeMin, rpeMax] = RPE_BANDS[w.goal][w.level];
    const [restMin, restMax] = REST_BANDS[w.goal][w.level];
    for (const b of w.blocks) {
      for (const it of b.items) {
        if (it.rpe !== undefined && (it.rpe < rpeMin || it.rpe > rpeMax)) {
          issues.push({ code: 'rpe_band', message: `RPE ${it.rpe} outside [${rpeMin},${rpeMax}]` });
        }
        if (it.restSec !== undefined && (it.restSec < restMin || it.restSec > restMax)) {
          issues.push({ code: 'rest_band', message: `Rest ${it.restSec}s outside [${restMin},${restMax}]` });
        }
      }
    }
    return issues;
  }
  
  export function validateConflicts(w: Workout, exMap: ExerciseMap): ValidationIssue[] {
    // Simple check: in strength block, avoid two heavy patterns (squat/hinge) back-to-back
    for (const b of w.blocks) {
      if (b.type !== 'strength') continue;
      let prevHeavy = false;
      for (const it of b.items) {
        const ex = exMap.get(it.exerciseId);
        if (!ex) continue;
        const pats = new Set(derivePatterns(ex));
        const heavy = HEAVY_PATTERNS.some((hp) => pats.has(hp));
        if (heavy && prevHeavy) {
          return [{ code: 'heavy_back_to_back', message: `Two heavy strength moves back-to-back` }];
        }
        prevHeavy = heavy;
      }
    }
    return [];
  }
  
  export function validateWorkout(w: Workout, exMap: ExerciseMap): ValidationResult {
    const issues: ValidationIssue[] = [];
    issues.push(...validateForbiddenTerms(w));
    issues.push(...validateIdsExist(w, exMap));
    issues.push(...validatePatternCoverage(w, exMap));
    issues.push(...validateVolumeCaps(w));
    issues.push(...validateRestRpe(w));
    issues.push(...validateConflicts(w, exMap));
    return { ok: issues.length === 0, issues };
  }
  
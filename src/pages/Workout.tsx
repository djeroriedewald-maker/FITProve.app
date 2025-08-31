import React, { useMemo, useState } from 'react';
import ModuleHero from '../components/ModuleHero';
import FilterBar from '../components/FilterBar';
import type { FilterState } from '../components/FilterBar';
import WorkoutNotes from '../components/WorkoutNotes';
import { Link } from 'react-router-dom';
import {
  useAppState,
} from '../store/appState';
import type {
  GoalId,
  TypeId,
  LevelId,
  DurationId,
} from '../store/appState';

type W = {
  name: string;
  timeMin: number;
  level: LevelId;
  goal: GoalId;
  type: TypeId;
  tags?: string[];
};

const workouts: W[] = [
  {
    name: 'Hyrox Prep – Engine',
    timeMin: 45,
    level: 'intermediate',
    goal: 'endurance',
    type: 'circuit',
    tags: ['hyrox', 'engine'],
  },
  {
    name: 'Legs & Lunges (Sandbag)',
    timeMin: 35,
    level: 'intermediate',
    goal: 'muscle',
    type: 'strength',
    tags: ['legs', 'sandbag'],
  },
  {
    name: 'Upper Body Strength',
    timeMin: 40,
    level: 'beginner',
    goal: 'muscle',
    type: 'strength',
    tags: ['push', 'pull'],
  },
  {
    name: 'HIIT Cardio Sprint',
    timeMin: 20,
    level: 'advanced',
    goal: 'fatloss',
    type: 'cardio',
    tags: ['hiit', 'sprint'],
  },
  {
    name: 'Mobility Flow',
    timeMin: 15,
    level: 'beginner',
    goal: 'mobility',
    type: 'yoga',
    tags: ['mobility', 'stretch'],
  },
  {
    name: 'Core Finisher',
    timeMin: 12,
    level: 'beginner',
    goal: 'muscle',
    type: 'bodyweight',
    tags: ['core'],
  },
  {
    name: 'Farmer Carry + Row',
    timeMin: 30,
    level: 'intermediate',
    goal: 'endurance',
    type: 'circuit',
    tags: ['carry', 'row'],
  },
  {
    name: 'Run Intervals 5x800m',
    timeMin: 35,
    level: 'advanced',
    goal: 'endurance',
    type: 'cardio',
    tags: ['run', 'intervals'],
  },
];

function durationBucket(min: number): DurationId {
  if (min <= 20) return 'short';
  if (min <= 40) return 'medium';
  return 'long';
}

export default function Workout() {
  const { t, labelGoal, labelType, labelLevel } = useAppState();
  const [filters, setFilters] = useState<FilterState>({
    goal: null,
    type: null,
    level: null,
    duration: null,
    query: '',
  });

  const filtered = useMemo(() => {
    const q = filters.query.trim().toLowerCase();
    return workouts.filter((w) => {
      if (filters.goal && w.goal !== filters.goal) return false;
      if (filters.type && w.type !== filters.type) return false;
      if (filters.level && w.level !== filters.level) return false;
      if (filters.duration && durationBucket(w.timeMin) !== filters.duration)
        return false;
      if (q) {
        const hay = [w.name, w.level, w.goal, w.type, ...(w.tags || [])]
          .join(' ')
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [filters]);

  return (
    <div className="space-y-6">
      <ModuleHero
        title={t('workout')}
        img="/src/assets/module-workout.webp"
        subtitle="1000+ ready-to-use workouts"
      />
      <FilterBar
        state={filters}
        setState={setFilters}
        dataCounts={filtered.length}
      />

      <div className="space-y-3">
        {filtered.slice(0, 4).map((w, i) => (
          <div
            key={i}
            className="card card-pad flex items-center justify-between gap-2"
          >
            <div>
              <p className="font-bold">{w.name}</p>
              <p className="text-xs text-neutral-600 dark:text-neutral-300">
                {w.timeMin} min • {labelLevel(w.level)} • {labelGoal(w.goal)} •{' '}
                {labelType(w.type)}
              </p>
            </div>
            <button className="px-3 py-1 rounded-lg bg-fit-orange text-white text-sm">
              {t('start')}
            </button>
          </div>
        ))}

        {filtered.length > 4 && (
          <details className="card">
            <summary className="card-pad cursor-pointer select-none text-sm">
              + {filtered.length - 4} more
            </summary>
            <div className="p-4 space-y-3">
              {filtered.slice(4).map((w, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between gap-2"
                >
                  <div>
                    <p className="font-semibold">{w.name}</p>
                    <p className="text-xs text-neutral-600 dark:text-neutral-300">
                      {w.timeMin} min • {labelLevel(w.level)} •{' '}
                      {labelGoal(w.goal)} • {labelType(w.type)}
                    </p>
                  </div>
                  <button className="px-3 py-1 rounded-lg bg-fit-orange text-white text-sm">
                    {t('start')}
                  </button>
                </div>
              ))}
            </div>
          </details>
        )}
      </div>

      <div className="card card-pad flex items-center justify-between">
        <div>
          <h3 className="font-semibold">{t('notFound_title')}</h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-300">
            {t('notFound_body')}
          </p>
        </div>
        <Link
          to="/generator"
          className="px-4 py-2 rounded-xl bg-black text-white hover:bg-neutral-800"
        >
          {t('openGenerator')}
        </Link>
      </div>

      <WorkoutNotes />
    </div>
  );
}

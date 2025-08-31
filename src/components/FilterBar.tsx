import React from 'react';
import {
  useAppState,
} from '../store/appState';
import type {
  GoalId,
  TypeId,
  LevelId,
  DurationId,
} from '../store/appState';

export type FilterState = {
  goal: GoalId | null;
  type: TypeId | null;
  level: LevelId | null;
  duration: DurationId | null;
  query: string;
};

const btnBase =
  'px-3 py-1 rounded-2xl border text-sm transition hover:bg-neutral-50 dark:hover:bg-neutral-800';
const active = 'border-fit-orange text-fit-orange font-semibold';
const inactive =
  'border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200';

function Pills<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { id: T; label: string }[];
  value: T | null;
  onChange: (val: T | null) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 w-28">
        {label}
      </span>
      <button
        className={`${btnBase} ${value === null ? active : inactive}`}
        onClick={() => onChange(null)}
      >
        {/* Alle / All vertaald via t() buitenaf */}
        {/* placeholder; wordt overschreven door ouder component */}
        All
      </button>
      {options.map((opt) => (
        <button
          key={opt.id}
          className={`${btnBase} ${value === opt.id ? active : inactive}`}
          onClick={() => onChange(value === opt.id ? null : opt.id)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export default function FilterBar({
  state,
  setState,
  dataCounts,
  showReset = true,
}: {
  state: FilterState;
  setState: (s: FilterState) => void;
  dataCounts?: number;
  showReset?: boolean;
}) {
  const { t, labelGoal, labelType, labelLevel, labelDuration } = useAppState();
  const set = (patch: Partial<FilterState>) => setState({ ...state, ...patch });
  const reset = () =>
    setState({
      goal: null,
      type: null,
      level: null,
      duration: null,
      query: '',
    });

  const goalOpts: { id: GoalId; label: string }[] = [
    { id: 'muscle', label: t('goal_muscle') },
    { id: 'fatloss', label: t('goal_fatloss') },
    { id: 'endurance', label: t('goal_endurance') },
    { id: 'mobility', label: t('goal_mobility') },
    { id: 'recovery', label: t('goal_recovery') },
  ];
  const typeOpts: { id: TypeId; label: string }[] = [
    { id: 'strength', label: t('type_strength') },
    { id: 'cardio', label: t('type_cardio') },
    { id: 'bodyweight', label: t('type_bodyweight') },
    { id: 'circuit', label: t('type_circuit') },
    { id: 'yoga', label: t('type_yoga') },
  ];
  const levelOpts: { id: LevelId; label: string }[] = [
    { id: 'beginner', label: t('level_beginner') },
    { id: 'intermediate', label: t('level_intermediate') },
    { id: 'advanced', label: t('level_advanced') },
  ];
  const durOpts: { id: DurationId; label: string }[] = [
    { id: 'short', label: t('dur_short') },
    { id: 'medium', label: t('dur_medium') },
    { id: 'long', label: t('dur_long') },
  ];

  return (
    <div className="card card-pad space-y-3">
      <div className="flex items-center gap-3">
        <input
          value={state.query}
          onChange={(e) => set({ query: e.target.value })}
          placeholder={t('search_placeholder')}
          className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 outline-none focus:border-fit-orange"
        />
        {typeof dataCounts === 'number' && (
          <span className="text-xs text-neutral-500 dark:text-neutral-400 shrink-0">
            {dataCounts} {t('results')}
          </span>
        )}
        {showReset && (
          <button
            onClick={reset}
            className="text-xs px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800"
            title={t('reset')}
          >
            {t('reset')}
          </button>
        )}
      </div>

      <div className="[&>div>button:first-child]:after:content-['']">
        <Pills
          label={t('goal_muscle').split(' ')[0]}
          options={goalOpts}
          value={state.goal}
          onChange={(v) => set({ goal: v })}
        />
        <Pills
          label={t('type_strength').split(' ')[0]}
          options={typeOpts}
          value={state.type}
          onChange={(v) => set({ type: v })}
        />
        <Pills
          label={t('level_beginner').split(' ')[0]}
          options={levelOpts}
          value={state.level}
          onChange={(v) => set({ level: v })}
        />
        <Pills
          label={t('dur_short').split(' ')[0]}
          options={durOpts}
          value={state.duration}
          onChange={(v) => set({ duration: v })}
        />
      </div>

      {/* 'Alle' label voor de eerste knop in elke Pills (kleine hack, minimal deps) */}
      <style>
        {`.card .${btnBase
          .split(' ')
          .join('.')}:first-of-type::before{content:'${t('all')}';}`}
      </style>
    </div>
  );
}

// Helpers (optionele labels in andere modules)
export const renderGoal = (id: GoalId, tGoal: (id: GoalId) => string) =>
  tGoal(id);
export const renderType = (id: TypeId, tType: (id: TypeId) => string) =>
  tType(id);
export const renderLevel = (id: LevelId, tLevel: (id: LevelId) => string) =>
  tLevel(id);
export const renderDuration = (
  id: DurationId,
  tDur: (id: DurationId) => string
) => tDur(id);

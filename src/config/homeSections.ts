// Home-sectie volgorde + type-defs
// 'focus' wordt in Home.tsx zelf gerenderd (header), niet in de lijst hieronder.

export type SectionKey =
  | 'focus'
  | 'kpi'
  | 'daily'
  | 'quick'
  | 'suggestions'
  | 'next'
  | 'streaks';

/**
 * Definitieve volgorde voor het Home dashboard.
 * Toon max 6 kaarten; 'focus' staat los in de header.
 */
export const HOME_SECTIONS: Exclude<SectionKey, 'focus'>[] = [
  'kpi',
  'daily',
  'quick',
  'suggestions',
  'next',
  'streaks',
];

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

/**
 * FITProve – App State + i18n (NL/EN)
 * - Dark mode via html.dark
 * - Language + dictionary via localStorage
 * - Notifications counter
 * - Stable IDs for goals/types/levels/durations (labels come from i18n)
 */

export type Lang = 'nl' | 'en';

/* ------------------------------- I18N DICTIONARY ------------------------------- */
const dict = {
  nl: {
    // App & nav
    app: 'FITProve',
    home: 'Home',
    workout: 'Workout',
    planner: 'Planner',
    stats: 'Stats',
    profile: 'Profiel',
    challenges: 'Uitdagingen',
    agenda: 'Agenda',
    feed: 'Nieuwsfeed',
    login: 'Inloggen',
    logout: 'Uitloggen',
    notifications: 'Notificaties',
    light: 'Licht',
    dark: 'Donker',

    // Home / hero texts
    welcome_back: 'Welkom terug',
    login_prompt: 'Login voor een persoonlijke ervaring',
    yourFocus: 'Jouw Focus',
    dailyProgress: 'Dagelijkse Progressie',
    calories: 'Calories',
    steps: 'Steps',
    workoutTime: 'Workout Time',
    heartRate: 'Heart Rate',
    today: 'Vandaag',
    goal12k: 'Doel 12k',
    lastSession: 'Laatste sessie',
    average: 'Gemiddeld',
    moveGoal: 'Dagdoel beweging',
    calorieGoal: 'Calorie doel',
    stepsGoal: 'Stappen doel',
    completed: 'voltooid',

    // Coach/chat
    coach: 'Coach',
    send: 'Verstuur',
    typeMessage: 'Typ je bericht…',

    // Workout + UI labels
    start: 'Start',
    reset: 'Reset',
    notFound_title: 'Niet gevonden wat je zoekt?',
    notFound_body: 'Maak een persoonlijke sessie met de AI Workout Generator.',
    openGenerator: 'Open Generator',

    // Footer (TabBar)
    nav_home: 'Home',
    nav_challenges: 'Uitdagingen',
    nav_agenda: 'Agenda',
    nav_feed: 'Nieuwsfeed',
    nav_profile: 'Profiel',

    // Module hero subtitles
    hero_challenges_sub: 'Korte programma’s die je scherp houden',
    hero_agenda_sub: 'Je komende sessies en events',
    hero_feed_sub: 'Updates, blogs en community nieuws',

    // Filters (IDs → labels)
    goal_muscle: 'Spieropbouw',
    goal_fatloss: 'Vetverlies',
    goal_endurance: 'Uithoudingsvermogen',
    goal_mobility: 'Mobiliteit',
    goal_recovery: 'Herstel',

    type_strength: 'Krachttraining',
    type_cardio: 'Cardio',
    type_bodyweight: 'Bodyweight',
    type_circuit: 'Circuit/CrossFit',
    type_yoga: 'Yoga/Pilates',

    level_beginner: 'Beginner',
    level_intermediate: 'Intermediate',
    level_advanced: 'Gevorderd',

    dur_short: 'Kort (10–20)',
    dur_medium: 'Midden (20–40)',
    dur_long: 'Lang (40+)',

    search_placeholder: 'Zoek workout (naam, tags)…',
    all: 'Alle',
    results: 'resultaten',

    // Language names
    lang_nl: 'Nederlands',
    lang_en: 'English',
  },

  en: {
    app: 'FITProve',
    home: 'Home',
    workout: 'Workout',
    planner: 'Planner',
    stats: 'Stats',
    profile: 'Profile',
    challenges: 'Challenges',
    agenda: 'Schedule',
    feed: 'News Feed',
    login: 'Sign in',
    logout: 'Sign out',
    notifications: 'Notifications',
    light: 'Light',
    dark: 'Dark',

    welcome_back: 'Welcome back',
    login_prompt: 'Login for a personal experience',
    yourFocus: 'Your Focus',
    dailyProgress: 'Daily Progress',
    calories: 'Calories',
    steps: 'Steps',
    workoutTime: 'Workout Time',
    heartRate: 'Heart Rate',
    today: 'Today',
    goal12k: 'Goal 12k',
    lastSession: 'Last session',
    average: 'Average',
    moveGoal: 'Move goal',
    calorieGoal: 'Calorie goal',
    stepsGoal: 'Steps goal',
    completed: 'completed',

    coach: 'Coach',
    send: 'Send',
    typeMessage: 'Type your message…',

    start: 'Start',
    reset: 'Reset',
    notFound_title: 'Didn’t find what you need?',
    notFound_body: 'Create a personal session with the AI Workout Generator.',
    openGenerator: 'Open Generator',

    nav_home: 'Home',
    nav_challenges: 'Challenges',
    nav_agenda: 'Schedule',
    nav_feed: 'News Feed',
    nav_profile: 'Profile',

    hero_challenges_sub: 'Short programs to keep you sharp',
    hero_agenda_sub: 'Your upcoming sessions and events',
    hero_feed_sub: 'Updates, blogs and community news',

    goal_muscle: 'Muscle gain',
    goal_fatloss: 'Fat loss',
    goal_endurance: 'Endurance',
    goal_mobility: 'Mobility',
    goal_recovery: 'Recovery',

    type_strength: 'Strength training',
    type_cardio: 'Cardio',
    type_bodyweight: 'Bodyweight',
    type_circuit: 'Circuit/CrossFit',
    type_yoga: 'Yoga/Pilates',

    level_beginner: 'Beginner',
    level_intermediate: 'Intermediate',
    level_advanced: 'Advanced',

    dur_short: 'Short (10–20)',
    dur_medium: 'Medium (20–40)',
    dur_long: 'Long (40+)',

    search_placeholder: 'Search workouts (name, tags)…',
    all: 'All',
    results: 'results',

    lang_nl: 'Nederlands',
    lang_en: 'English',
  },
} as const;

type Dict = (typeof dict)['nl'];

/* ------------------------------- STABLE IDS FOR FILTERS ------------------------------- */
export type GoalId =
  | 'muscle'
  | 'fatloss'
  | 'endurance'
  | 'mobility'
  | 'recovery';
export type TypeId = 'strength' | 'cardio' | 'bodyweight' | 'circuit' | 'yoga';
export type LevelId = 'beginner' | 'intermediate' | 'advanced';
export type DurationId = 'short' | 'medium' | 'long';

/* ------------------------------- APP STATE TYPE ------------------------------- */
export type AppState = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (k: keyof Dict) => string;

  theme: 'light' | 'dark';
  toggleTheme: () => void;

  notifications: number;
  setNotifications: (n: number) => void;

  // helpers to resolve ID → localized label
  labelGoal: (id: GoalId) => string;
  labelType: (id: TypeId) => string;
  labelLevel: (id: LevelId) => string;
  labelDuration: (id: DurationId) => string;
};

const Ctx = createContext<AppState | null>(null);

/* ------------------------------- LABEL KEY MAPS ------------------------------- */
const goalKey = (id: GoalId) =>
  ((
    {
      muscle: 'goal_muscle',
      fatloss: 'goal_fatloss',
      endurance: 'goal_endurance',
      mobility: 'goal_mobility',
      recovery: 'goal_recovery',
    } as const
  )[id]);

const typeKey = (id: TypeId) =>
  ((
    {
      strength: 'type_strength',
      cardio: 'type_cardio',
      bodyweight: 'type_bodyweight',
      circuit: 'type_circuit',
      yoga: 'type_yoga',
    } as const
  )[id]);

const levelKey = (id: LevelId) =>
  ((
    {
      beginner: 'level_beginner',
      intermediate: 'level_intermediate',
      advanced: 'level_advanced',
    } as const
  )[id]);

const durKey = (id: DurationId) =>
  ((
    {
      short: 'dur_short',
      medium: 'dur_medium',
      long: 'dur_long',
    } as const
  )[id]);

/* ------------------------------- PROVIDER ------------------------------- */
export const AppStateProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [lang, setLang] = useState<Lang>(
    () => (localStorage.getItem('fp_lang') as Lang) || 'nl'
  );
  const [theme, setTheme] = useState<'light' | 'dark'>(
    () => (localStorage.getItem('fp_theme') as 'light' | 'dark') || 'light'
  );
  const [notifications, setNotifications] = useState<number>(() => {
    const saved = localStorage.getItem('fp_notifs');
    return saved ? Number(saved) : 3;
  });

  // persist language
  useEffect(() => localStorage.setItem('fp_lang', lang), [lang]);

  // dark mode -> html.classList
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    localStorage.setItem('fp_theme', theme);
  }, [theme]);

  // persist notifications
  useEffect(
    () => localStorage.setItem('fp_notifs', String(notifications)),
    [notifications]
  );

  const value = useMemo<AppState>(
    () => ({
      lang,
      setLang,
      t: (k) => dict[lang][k],
      theme,
      toggleTheme: () => setTheme((p) => (p === 'light' ? 'dark' : 'light')),
      notifications,
      setNotifications,
      labelGoal: (id) => dict[lang][goalKey(id) as keyof Dict],
      labelType: (id) => dict[lang][typeKey(id) as keyof Dict],
      labelLevel: (id) => dict[lang][levelKey(id) as keyof Dict],
      labelDuration: (id) => dict[lang][durKey(id) as keyof Dict],
    }),
    [lang, theme, notifications]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

/* ------------------------------- HOOK ------------------------------- */
export const useAppState = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAppState must be used within AppStateProvider');
  return v;
};

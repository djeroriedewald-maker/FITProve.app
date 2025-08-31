import {
  HomeIcon,
  HomeIconFilled,
  TrophyIcon,
  TrophyIconFilled,
  BadgeIcon,
  BadgeIconFilled,
  CalendarIcon,
  CalendarIconFilled,
  FeedIcon,
  FeedIconFilled,
} from '../components/TabBar';

export const navItems: Array<{
  key: 'home' | 'challenges' | 'badges' | 'agenda' | 'feed';
  path: string;
  icon: (p: { className?: string }) => JSX.Element;
  iconFilled?: (p: { className?: string }) => JSX.Element;
  labelKey: string;
}> = [
  {
    key: 'home',
    path: '/',
    icon: HomeIcon,
    iconFilled: HomeIconFilled,
    labelKey: 'nav.home',
  },
  {
    key: 'challenges',
    path: '/challenges',
    icon: TrophyIcon,
    iconFilled: TrophyIconFilled,
    labelKey: 'nav.challenges',
  },
  {
    key: 'badges',
    path: '/badges',
    icon: BadgeIcon,
    iconFilled: BadgeIconFilled,
    labelKey: 'nav.badges',
  },
  {
    key: 'agenda',
    path: '/agenda',
    icon: CalendarIcon,
    iconFilled: CalendarIconFilled,
    labelKey: 'nav.agenda',
  },
  {
    key: 'feed',
    path: '/feed',
    icon: FeedIcon,
    iconFilled: FeedIconFilled,
    labelKey: 'nav.feed',
  },
];

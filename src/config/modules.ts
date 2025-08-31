export type ModuleKey =
  | 'workout'
  | 'workoutGenerator'
  | 'stretching'
  | 'recovering'
  | 'mindset'
  | 'diet'
  | 'waterIntake';

export const modules: Array<{
  key: ModuleKey;
  route: string;
  imageUrl: string;
}> = [
  {
    key: 'workout',
    route: '/workout',
    imageUrl: 'https://fitprove.app/images/modules/workout.webp',
  },
  {
    key: 'workoutGenerator',
    route: '/generator',
    imageUrl: 'https://fitprove.app/images/modules/workout-generator.webp',
  },
  {
    key: 'stretching',
    route: '/stretching',
    imageUrl: 'https://fitprove.app/images/modules/stretching.webp',
  },
  {
    key: 'recovering',
    route: '/recovering',
    imageUrl: 'https://fitprove.app/images/modules/recovering.webp',
  },
  {
    key: 'mindset',
    route: '/mindset',
    imageUrl: 'https://fitprove.app/images/modules/mindset.webp',
  },
  {
    key: 'diet',
    route: '/diet',
    imageUrl: 'https://fitprove.app/images/modules/food.webp',
  },
  {
    key: 'waterIntake',
    route: '/water',
    imageUrl: 'https://fitprove.app/images/modules/water.webp',
  },
];

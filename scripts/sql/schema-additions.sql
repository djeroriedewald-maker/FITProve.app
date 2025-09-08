-- Optional columns used by the UI (idempotent)
alter table if exists public.workout_sessions
  add column if not exists workout_title text,
  add column if not exists duration_sec int;

alter table if exists public.workout_exercises
  add column if not exists thumbnail text,
  add column if not exists image_url text,
  add column if not exists gif_url text,
  add column if not exists video_url text;

-- Badges table (idempotent)
create table if not exists public.user_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  badge_code text not null,
  awarded_at timestamptz not null default now()
);

create unique index if not exists user_badges_user_code_uniq
  on public.user_badges(user_id, badge_code);

-- Helpful index for last 30 days queries
create index if not exists ws_user_completed_30d
  on public.workout_sessions(user_id, status, completed_at);


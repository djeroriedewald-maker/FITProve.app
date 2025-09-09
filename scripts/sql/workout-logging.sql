-- Workout sessies & logging
alter table if not exists public.workout_sessions
  add column if not exists workout_title text,
  add column if not exists duration_sec int,
  add column if not exists stats jsonb;

-- Set logs
create table if not exists public.set_logs (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references workout_sessions(id),
  exercise_id uuid not null,
  exercise_name text,
  set_index int not null,
  reps int,
  weight_kg decimal,
  time_seconds int,
  distance_m decimal,
  rpe int,
  completed boolean default true,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexen voor sneller ophalen van logs
create index if not exists set_logs_session_idx on public.set_logs(session_id);
create index if not exists set_logs_exercise_idx on public.set_logs(exercise_id);

-- RLS policies voor set logs
create policy "Users can insert their own set logs"
  on public.set_logs for insert
  with check (
    session_id in (
      select id from workout_sessions
      where user_id = auth.uid()
    )
  );

create policy "Users can view their own set logs"
  on public.set_logs for select
  using (
    session_id in (
      select id from workout_sessions
      where user_id = auth.uid()
    )
  );

create policy "Users can update their own set logs"
  on public.set_logs for update
  using (
    session_id in (
      select id from workout_sessions
      where user_id = auth.uid()
    )
  );

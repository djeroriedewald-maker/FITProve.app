-- Read policies for public viewing of workouts (no auth required)
create policy if not exists "public read workouts"
  on public.workouts for select
  using (true);

create policy if not exists "public read workout_blocks"
  on public.workout_blocks for select
  using (true);

create policy if not exists "public read workout_exercises"
  on public.workout_exercises for select
  using (true);


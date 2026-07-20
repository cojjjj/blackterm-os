create extension if not exists "pgcrypto";

alter table public.observers
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

create unique index if not exists observers_user_id_unique
  on public.observers(user_id);

alter table public.observers enable row level security;
alter table public.achievements enable row level security;
alter table public.observer_achievements enable row level security;
alter table public.world_events enable row level security;

drop policy if exists "Observers can read own profile" on public.observers;
create policy "Observers can read own profile"
on public.observers for select to authenticated
using (auth.uid() = user_id);

drop policy if exists "Observers can create own profile" on public.observers;
create policy "Observers can create own profile"
on public.observers for insert to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Observers can update own profile" on public.observers;
create policy "Observers can update own profile"
on public.observers for update to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Achievements are publicly readable" on public.achievements;
create policy "Achievements are publicly readable"
on public.achievements for select to authenticated
using (true);

drop policy if exists "Observers can read own achievements" on public.observer_achievements;
create policy "Observers can read own achievements"
on public.observer_achievements for select to authenticated
using (
  exists (
    select 1 from public.observers
    where observers.id = observer_achievements.observer_id
      and observers.user_id = auth.uid()
  )
);

drop policy if exists "Observers can unlock own achievements" on public.observer_achievements;
create policy "Observers can unlock own achievements"
on public.observer_achievements for insert to authenticated
with check (
  exists (
    select 1 from public.observers
    where observers.id = observer_achievements.observer_id
      and observers.user_id = auth.uid()
  )
);

drop policy if exists "World events are publicly readable" on public.world_events;
create policy "World events are publicly readable"
on public.world_events for select to authenticated
using (true);

alter table public.observer_achievements
  drop constraint if exists observer_achievements_observer_id_achievement_id_key;

alter table public.observer_achievements
  add constraint observer_achievements_observer_id_achievement_id_key
  unique (observer_id, achievement_id);

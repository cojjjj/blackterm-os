-- BLACKTERM OS unified backend setup
-- Safe to run more than once in Supabase SQL Editor.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Core tables
-- ---------------------------------------------------------------------------
create table if not exists public.observers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  observer_id text not null,
  username text not null default 'Visitor',
  clearance text not null default 'VISITOR',
  created_at timestamptz not null default now(),
  last_seen timestamptz not null default now(),
  total_visits integer not null default 1,
  total_time_seconds integer not null default 0,
  unlocked_scene text not null default 'midnight-override'
);

alter table public.observers add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.observers add column if not exists observer_id text;
alter table public.observers add column if not exists username text default 'Visitor';
alter table public.observers add column if not exists clearance text default 'VISITOR';
alter table public.observers add column if not exists created_at timestamptz default now();
alter table public.observers add column if not exists last_seen timestamptz default now();
alter table public.observers add column if not exists total_visits integer default 1;
alter table public.observers add column if not exists total_time_seconds integer default 0;
alter table public.observers add column if not exists unlocked_scene text default 'midnight-override';

create unique index if not exists observers_user_id_unique on public.observers(user_id);
create unique index if not exists observers_observer_id_unique on public.observers(observer_id);

create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  description text not null,
  points integer not null default 0
);

create table if not exists public.observer_achievements (
  id uuid primary key default gen_random_uuid(),
  observer_id uuid not null references public.observers(id) on delete cascade,
  achievement_id uuid not null references public.achievements(id) on delete cascade,
  unlocked_at timestamptz not null default now(),
  unique(observer_id, achievement_id)
);

create table if not exists public.world_events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  severity text not null default 'LOW',
  created_at timestamptz not null default now()
);

create table if not exists public.observer_presence (
  observer_id uuid primary key references public.observers(id) on delete cascade,
  observer_code text not null,
  current_app text not null default 'desktop',
  region text not null default 'REDACTED',
  status text not null default 'ONLINE',
  last_seen timestamptz not null default now()
);

create table if not exists public.network_transmissions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  message text not null,
  severity text not null default 'LOW',
  origin text not null default 'UNKNOWN',
  progress integer not null default 0 check (progress between 0 and 100),
  created_at timestamptz not null default now()
);

create table if not exists public.missions (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  title text not null,
  summary text not null,
  objective text not null,
  difficulty text not null default 'MEDIUM',
  reward_xp integer not null default 25,
  status text not null default 'OPEN',
  origin text not null default 'BLACKTERM CORE',
  created_at timestamptz not null default now()
);

create table if not exists public.observer_missions (
  id uuid primary key default gen_random_uuid(),
  observer_id uuid not null references public.observers(id) on delete cascade,
  mission_id uuid not null references public.missions(id) on delete cascade,
  status text not null default 'ASSIGNED',
  progress integer not null default 0 check (progress between 0 and 100),
  assigned_at timestamptz not null default now(),
  completed_at timestamptz,
  unique(observer_id, mission_id)
);

-- ---------------------------------------------------------------------------
-- Seed data
-- ---------------------------------------------------------------------------
insert into public.achievements(code, name, description, points)
values
  ('FIRST_CONNECTION', 'First Connection', 'Booted BLACKTERM OS for the first time', 10),
  ('NIGHT_OPERATOR', 'Night Operator', 'Connected after midnight', 25),
  ('ARCHIVIST', 'Archivist', 'Unlocked The Archive', 50),
  ('THREAT_HUNTER', 'Threat Hunter', 'Opened Threat Map', 20),
  ('SYSTEM_ADMIN', 'System Admin', 'Opened every installed application', 100)
on conflict (code) do update set
  name = excluded.name,
  description = excluded.description,
  points = excluded.points;

insert into public.missions(code, title, summary, objective, difficulty, reward_xp, origin)
values
  ('BT-001', 'Ghost Relay', 'A dormant relay has resumed transmitting encrypted traffic through an unregistered route.', 'Inspect the relay matrix, identify the suspicious route, and document the simulated threat condition.', 'MEDIUM', 50, 'AURORA-17'),
  ('BT-002', 'Phantom Credential', 'A credential-theft simulation has triggered anomalies across the identity perimeter.', 'Open the threat and incident tools, trace the simulated access path, and advance the case.', 'HARD', 75, 'SENTINEL GRID'),
  ('BT-003', 'Malware Echo', 'Behavioral telemetry suggests a quarantined sample is attempting to recreate its process chain.', 'Use the Malware Sandbox to inspect the simulated process tree and isolate the suspicious behavior.', 'HARD', 90, 'VOID-04'),
  ('BT-004', 'Archive Fragment', 'A fragmented transmission has been recovered from a legacy BLACKTERM archive node.', 'Review the Observer Network and recover the mission record by completing the simulation.', 'EASY', 35, 'ARCHIVE NODE')
on conflict (code) do nothing;

insert into public.network_transmissions(title, message, severity, origin, progress)
select * from (values
  ('OBSERVER NETWORK LIVE', 'Persistent cloud identity and presence systems are online.', 'LOW', 'BLACKTERM CORE', 100),
  ('UNKNOWN RELAY DETECTED', 'Encrypted traffic pattern detected beyond the public relay perimeter.', 'HIGH', 'AURORA-17', 61),
  ('ARCHIVE SIGNAL RECOVERED', 'A fragmented transmission was recovered from a dormant archive node.', 'MEDIUM', 'VOID-04', 38),
  ('THREAT MATRIX UPDATED', 'Global simulation telemetry has been indexed for active observers.', 'LOW', 'SENTINEL GRID', 84)
) as seed(title, message, severity, origin, progress)
where not exists (select 1 from public.network_transmissions);

insert into public.world_events(title, description, severity)
select 'OBSERVER NETWORK ONLINE', 'BLACKTERM cloud identity and persistent telemetry systems initialized.', 'LOW'
where not exists (select 1 from public.world_events where title = 'OBSERVER NETWORK ONLINE');

-- ---------------------------------------------------------------------------
-- Security and grants
-- ---------------------------------------------------------------------------
alter table public.observers enable row level security;
alter table public.achievements enable row level security;
alter table public.observer_achievements enable row level security;
alter table public.world_events enable row level security;
alter table public.observer_presence enable row level security;
alter table public.network_transmissions enable row level security;
alter table public.missions enable row level security;
alter table public.observer_missions enable row level security;

grant usage on schema public to authenticated;
grant select, insert, update on public.observers to authenticated;
grant select on public.achievements to authenticated;
grant select, insert on public.observer_achievements to authenticated;
grant select on public.world_events to authenticated;
grant select on public.observer_presence to authenticated;
grant select on public.network_transmissions to authenticated;
grant select on public.missions to authenticated;
grant select, insert, update on public.observer_missions to authenticated;

drop policy if exists "Observers can read own profile" on public.observers;
create policy "Observers can read own profile" on public.observers for select to authenticated using (auth.uid() = user_id);
drop policy if exists "Observers can create own profile" on public.observers;
create policy "Observers can create own profile" on public.observers for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "Observers can update own profile" on public.observers;
create policy "Observers can update own profile" on public.observers for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Achievements are readable" on public.achievements;
create policy "Achievements are readable" on public.achievements for select to authenticated using (true);
drop policy if exists "Observers can read own achievements" on public.observer_achievements;
create policy "Observers can read own achievements" on public.observer_achievements for select to authenticated using (exists (select 1 from public.observers o where o.id = observer_achievements.observer_id and o.user_id = auth.uid()));
drop policy if exists "Observers can unlock own achievements" on public.observer_achievements;
create policy "Observers can unlock own achievements" on public.observer_achievements for insert to authenticated with check (exists (select 1 from public.observers o where o.id = observer_achievements.observer_id and o.user_id = auth.uid()));

drop policy if exists "World events are readable" on public.world_events;
create policy "World events are readable" on public.world_events for select to authenticated using (true);
drop policy if exists "Presence is readable" on public.observer_presence;
create policy "Presence is readable" on public.observer_presence for select to authenticated using (true);
drop policy if exists "Transmissions are readable" on public.network_transmissions;
create policy "Transmissions are readable" on public.network_transmissions for select to authenticated using (true);
drop policy if exists "Missions are readable" on public.missions;
create policy "Missions are readable" on public.missions for select to authenticated using (true);
drop policy if exists "Observers can read own missions" on public.observer_missions;
create policy "Observers can read own missions" on public.observer_missions for select to authenticated using (exists (select 1 from public.observers o where o.id = observer_missions.observer_id and o.user_id = auth.uid()));
drop policy if exists "Observers can create own missions" on public.observer_missions;
create policy "Observers can create own missions" on public.observer_missions for insert to authenticated with check (exists (select 1 from public.observers o where o.id = observer_missions.observer_id and o.user_id = auth.uid()));
drop policy if exists "Observers can update own missions" on public.observer_missions;
create policy "Observers can update own missions" on public.observer_missions for update to authenticated using (exists (select 1 from public.observers o where o.id = observer_missions.observer_id and o.user_id = auth.uid())) with check (exists (select 1 from public.observers o where o.id = observer_missions.observer_id and o.user_id = auth.uid()));

-- ---------------------------------------------------------------------------
-- Secure backend functions
-- ---------------------------------------------------------------------------
create or replace function public.bootstrap_observer(requested_observer_code text)
returns setof public.observers
language plpgsql
security definer
set search_path = public
as $$
declare
  current_observer public.observers;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;

  select * into current_observer from public.observers where user_id = auth.uid() limit 1;

  if current_observer.id is null then
    insert into public.observers(user_id, observer_id, username, clearance, total_visits, total_time_seconds, unlocked_scene, last_seen)
    values(auth.uid(), requested_observer_code, 'Visitor', 'VISITOR', 1, 0, 'midnight-override', now())
    returning * into current_observer;
  else
    update public.observers
    set last_seen = now(),
        total_visits = total_visits + case when last_seen < now() - interval '30 seconds' then 1 else 0 end
    where id = current_observer.id
    returning * into current_observer;
  end if;

  return next current_observer;
end;
$$;

create or replace function public.increment_observer_time(target_observer_id uuid, seconds_to_add integer)
returns void language plpgsql security definer set search_path = public as $$
begin
  if seconds_to_add <= 0 then return; end if;
  update public.observers
  set total_time_seconds = total_time_seconds + seconds_to_add, last_seen = now()
  where id = target_observer_id and user_id = auth.uid();
  if not found then raise exception 'Observer identity mismatch'; end if;
end;
$$;

create or replace function public.upsert_observer_presence(target_observer_id uuid, target_observer_code text, target_current_app text default 'desktop')
returns void language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.observers where id = target_observer_id and user_id = auth.uid()) then raise exception 'Observer identity mismatch'; end if;
  insert into public.observer_presence(observer_id, observer_code, current_app, region, status, last_seen)
  values(target_observer_id, target_observer_code, coalesce(nullif(target_current_app,''),'desktop'), 'REDACTED', 'ONLINE', now())
  on conflict (observer_id) do update set observer_code=excluded.observer_code, current_app=excluded.current_app, status='ONLINE', last_seen=now();
end;
$$;

create or replace function public.set_observer_offline(target_observer_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.observer_presence set status='OFFLINE', last_seen=now()
  where observer_id=target_observer_id and exists(select 1 from public.observers o where o.id=target_observer_id and o.user_id=auth.uid());
end;
$$;

create or replace function public.get_network_operations_overview()
returns table(active_observers bigint,total_observers bigint,total_visits bigint,open_transmissions bigint)
language sql security definer set search_path=public as $$
  select
    (select count(*) from public.observer_presence where status='ONLINE' and last_seen >= now()-interval '5 minutes')::bigint,
    (select count(*) from public.observers)::bigint,
    (select coalesce(sum(total_visits),0) from public.observers)::bigint,
    (select count(*) from public.network_transmissions)::bigint;
$$;

create or replace function public.get_observer_network_stats()
returns table(observer_count bigint,total_visits bigint,world_event_count bigint)
language sql security definer set search_path=public as $$
  select (select count(*) from public.observers)::bigint,
         (select coalesce(sum(total_visits),0) from public.observers)::bigint,
         (select count(*) from public.world_events)::bigint;
$$;

create or replace function public.assign_daily_mission(target_observer_id uuid)
returns uuid language plpgsql security definer set search_path=public as $$
declare existing_assignment uuid; selected_mission uuid; created_assignment uuid;
begin
  if not exists(select 1 from public.observers where id=target_observer_id and user_id=auth.uid()) then raise exception 'Observer identity mismatch'; end if;
  select id into existing_assignment from public.observer_missions where observer_id=target_observer_id and assigned_at::date=current_date order by assigned_at desc limit 1;
  if existing_assignment is not null then return existing_assignment; end if;
  select id into selected_mission from public.missions where status='OPEN' order by md5(id::text||target_observer_id::text||current_date::text) limit 1;
  if selected_mission is null then return null; end if;
  insert into public.observer_missions(observer_id,mission_id) values(target_observer_id,selected_mission) returning id into created_assignment;
  return created_assignment;
end;
$$;

create or replace function public.get_command_briefing(target_observer_id uuid)
returns table(threat_level text,active_observers bigint,transmission_count bigint,achievement_count bigint,total_points bigint,mission_status text)
language sql security definer set search_path=public as $$
  select
    case when exists(select 1 from public.network_transmissions where severity in ('CRITICAL','HIGH')) then 'ELEVATED' else 'LOW' end,
    (select count(*) from public.observer_presence where status='ONLINE' and last_seen>=now()-interval '5 minutes')::bigint,
    (select count(*) from public.network_transmissions)::bigint,
    (select count(*) from public.observer_achievements where observer_id=target_observer_id)::bigint,
    (select coalesce(sum(a.points),0) from public.observer_achievements oa join public.achievements a on a.id=oa.achievement_id where oa.observer_id=target_observer_id)::bigint,
    coalesce((select status from public.observer_missions where observer_id=target_observer_id order by assigned_at desc limit 1),'UNASSIGNED');
$$;

revoke all on function public.bootstrap_observer(text) from public;
revoke all on function public.increment_observer_time(uuid,integer) from public;
revoke all on function public.upsert_observer_presence(uuid,text,text) from public;
revoke all on function public.set_observer_offline(uuid) from public;
revoke all on function public.get_network_operations_overview() from public;
revoke all on function public.get_observer_network_stats() from public;
revoke all on function public.assign_daily_mission(uuid) from public;
revoke all on function public.get_command_briefing(uuid) from public;

grant execute on function public.bootstrap_observer(text) to authenticated;
grant execute on function public.increment_observer_time(uuid,integer) to authenticated;
grant execute on function public.upsert_observer_presence(uuid,text,text) to authenticated;
grant execute on function public.set_observer_offline(uuid) to authenticated;
grant execute on function public.get_network_operations_overview() to authenticated;
grant execute on function public.get_observer_network_stats() to authenticated;
grant execute on function public.assign_daily_mission(uuid) to authenticated;
grant execute on function public.get_command_briefing(uuid) to authenticated;

-- Realtime publication (duplicate-safe)
do $$
begin
  begin alter publication supabase_realtime add table public.observer_presence; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.network_transmissions; exception when duplicate_object then null; end;
end $$;

notify pgrst, 'reload schema';

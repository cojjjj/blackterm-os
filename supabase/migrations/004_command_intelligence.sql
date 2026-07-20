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

alter table public.missions enable row level security;
alter table public.observer_missions enable row level security;

drop policy if exists "Observers can read missions" on public.missions;
create policy "Observers can read missions"
on public.missions for select to authenticated
using (true);

drop policy if exists "Observers can read own mission assignments" on public.observer_missions;
create policy "Observers can read own mission assignments"
on public.observer_missions for select to authenticated
using (
  exists (
    select 1 from public.observers
    where observers.id = observer_missions.observer_id
      and observers.user_id = auth.uid()
  )
);

drop policy if exists "Observers can receive own mission assignments" on public.observer_missions;
create policy "Observers can receive own mission assignments"
on public.observer_missions for insert to authenticated
with check (
  exists (
    select 1 from public.observers
    where observers.id = observer_missions.observer_id
      and observers.user_id = auth.uid()
  )
);

drop policy if exists "Observers can update own mission assignments" on public.observer_missions;
create policy "Observers can update own mission assignments"
on public.observer_missions for update to authenticated
using (
  exists (
    select 1 from public.observers
    where observers.id = observer_missions.observer_id
      and observers.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.observers
    where observers.id = observer_missions.observer_id
      and observers.user_id = auth.uid()
  )
);

grant select on public.missions to authenticated;
grant select, insert, update on public.observer_missions to authenticated;

insert into public.missions
  (code, title, summary, objective, difficulty, reward_xp, origin)
values
  (
    'BT-001',
    'Ghost Relay',
    'A dormant relay has resumed transmitting encrypted traffic through an unregistered route.',
    'Inspect the relay matrix, identify the suspicious route, and document the simulated threat condition.',
    'MEDIUM',
    50,
    'AURORA-17'
  ),
  (
    'BT-002',
    'Phantom Credential',
    'A credential-theft simulation has triggered anomalies across the identity perimeter.',
    'Open the threat and incident tools, trace the simulated access path, and advance the case.',
    'HARD',
    75,
    'SENTINEL GRID'
  ),
  (
    'BT-003',
    'Malware Echo',
    'Behavioral telemetry suggests a quarantined sample is attempting to recreate its process chain.',
    'Use the Malware Sandbox to inspect the simulated process tree and isolate the suspicious behavior.',
    'HARD',
    90,
    'VOID-04'
  ),
  (
    'BT-004',
    'Archive Fragment',
    'A fragmented transmission has been recovered from a legacy BLACKTERM archive node.',
    'Review the Observer Network and recover the mission record by completing the simulation.',
    'EASY',
    35,
    'ARCHIVE NODE'
  )
on conflict (code) do nothing;

create or replace function public.assign_daily_mission(
  target_observer_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  existing_assignment uuid;
  selected_mission uuid;
  created_assignment uuid;
begin
  if not exists (
    select 1 from public.observers
    where id = target_observer_id
      and user_id = auth.uid()
  ) then
    raise exception 'Observer identity mismatch';
  end if;

  select id into existing_assignment
  from public.observer_missions
  where observer_id = target_observer_id
    and assigned_at::date = current_date
  order by assigned_at desc
  limit 1;

  if existing_assignment is not null then
    return existing_assignment;
  end if;

  select id into selected_mission
  from public.missions
  where status = 'OPEN'
  order by md5(id::text || target_observer_id::text || current_date::text)
  limit 1;

  insert into public.observer_missions(observer_id, mission_id)
  values(target_observer_id, selected_mission)
  returning id into created_assignment;

  return created_assignment;
end;
$$;

revoke all on function public.assign_daily_mission(uuid) from public;
grant execute on function public.assign_daily_mission(uuid) to authenticated;

create or replace function public.get_command_briefing(
  target_observer_id uuid
)
returns table (
  threat_level text,
  active_observers bigint,
  transmission_count bigint,
  achievement_count bigint,
  total_points bigint,
  mission_status text
)
language sql
security definer
set search_path = public
as $$
  select
    case
      when exists (
        select 1 from public.network_transmissions
        where severity in ('CRITICAL', 'HIGH')
      ) then 'ELEVATED'
      else 'LOW'
    end,
    (
      select count(*)
      from public.observer_presence
      where last_seen >= now() - interval '5 minutes'
    )::bigint,
    (select count(*) from public.network_transmissions)::bigint,
    (
      select count(*)
      from public.observer_achievements
      where observer_id = target_observer_id
    )::bigint,
    (
      select coalesce(sum(a.points), 0)
      from public.observer_achievements oa
      join public.achievements a on a.id = oa.achievement_id
      where oa.observer_id = target_observer_id
    )::bigint,
    coalesce(
      (
        select status
        from public.observer_missions
        where observer_id = target_observer_id
        order by assigned_at desc
        limit 1
      ),
      'UNASSIGNED'
    );
$$;

revoke all on function public.get_command_briefing(uuid) from public;
grant execute on function public.get_command_briefing(uuid) to authenticated;

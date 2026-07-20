-- BLACKTERM Live Backend
-- Repairs NOC permissions, creates secure heartbeat RPCs, enables realtime,
-- and ensures observer counts come from real database rows.

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

alter table public.observer_presence enable row level security;
alter table public.network_transmissions enable row level security;

grant usage on schema public to authenticated;
grant select on public.observer_presence to authenticated;
grant select on public.network_transmissions to authenticated;

drop policy if exists "Authenticated observers can view live presence"
  on public.observer_presence;

create policy "Authenticated observers can view live presence"
on public.observer_presence
for select
to authenticated
using (true);

drop policy if exists "Authenticated observers can view transmissions"
  on public.network_transmissions;

create policy "Authenticated observers can view transmissions"
on public.network_transmissions
for select
to authenticated
using (true);

create or replace function public.upsert_observer_presence(
  target_observer_id uuid,
  target_observer_code text,
  target_current_app text default 'desktop'
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1
    from public.observers
    where id = target_observer_id
      and user_id = auth.uid()
  ) then
    raise exception 'Observer identity mismatch';
  end if;

  insert into public.observer_presence (
    observer_id,
    observer_code,
    current_app,
    region,
    status,
    last_seen
  )
  values (
    target_observer_id,
    target_observer_code,
    coalesce(nullif(target_current_app, ''), 'desktop'),
    'REDACTED',
    'ONLINE',
    now()
  )
  on conflict (observer_id)
  do update set
    observer_code = excluded.observer_code,
    current_app = excluded.current_app,
    status = 'ONLINE',
    last_seen = now();
end;
$$;

revoke all on function public.upsert_observer_presence(uuid, text, text)
  from public;

grant execute on function public.upsert_observer_presence(uuid, text, text)
  to authenticated;

create or replace function public.set_observer_offline(
  target_observer_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.observer_presence
  set
    status = 'OFFLINE',
    last_seen = now()
  where observer_id = target_observer_id
    and exists (
      select 1
      from public.observers
      where observers.id = target_observer_id
        and observers.user_id = auth.uid()
    );
end;
$$;

revoke all on function public.set_observer_offline(uuid) from public;
grant execute on function public.set_observer_offline(uuid) to authenticated;

create or replace function public.get_network_operations_overview()
returns table (
  active_observers bigint,
  total_observers bigint,
  total_visits bigint,
  open_transmissions bigint
)
language sql
security definer
set search_path = public
as $$
  select
    (
      select count(*)
      from public.observer_presence
      where status = 'ONLINE'
        and last_seen >= now() - interval '5 minutes'
    )::bigint,
    (select count(*) from public.observers)::bigint,
    (select coalesce(sum(total_visits), 0) from public.observers)::bigint,
    (select count(*) from public.network_transmissions)::bigint;
$$;

revoke all on function public.get_network_operations_overview() from public;
grant execute on function public.get_network_operations_overview()
  to authenticated;

insert into public.network_transmissions
  (title, message, severity, origin, progress)
select *
from (
  values
    (
      'OBSERVER NETWORK LIVE',
      'Persistent cloud identity and presence heartbeat systems are online.',
      'LOW',
      'BLACKTERM CORE',
      100
    ),
    (
      'UNKNOWN RELAY DETECTED',
      'Encrypted traffic pattern detected beyond the public relay perimeter.',
      'HIGH',
      'AURORA-17',
      61
    ),
    (
      'ARCHIVE SIGNAL RECOVERED',
      'A fragmented transmission was recovered from a dormant archive node.',
      'MEDIUM',
      'VOID-04',
      38
    )
) as seed(title, message, severity, origin, progress)
where not exists (
  select 1 from public.network_transmissions
);

do $$
begin
  begin
    alter publication supabase_realtime
      add table public.observer_presence;
  exception
    when duplicate_object then null;
  end;

  begin
    alter publication supabase_realtime
      add table public.network_transmissions;
  exception
    when duplicate_object then null;
  end;
end
$$;

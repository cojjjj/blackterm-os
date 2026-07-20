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

drop policy if exists "Observers can read network presence" on public.observer_presence;
create policy "Observers can read network presence"
on public.observer_presence for select to authenticated
using (true);

drop policy if exists "Observers can create own presence" on public.observer_presence;
create policy "Observers can create own presence"
on public.observer_presence for insert to authenticated
with check (
  exists (
    select 1 from public.observers
    where observers.id = observer_presence.observer_id
      and observers.user_id = auth.uid()
  )
);

drop policy if exists "Observers can update own presence" on public.observer_presence;
create policy "Observers can update own presence"
on public.observer_presence for update to authenticated
using (
  exists (
    select 1 from public.observers
    where observers.id = observer_presence.observer_id
      and observers.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.observers
    where observers.id = observer_presence.observer_id
      and observers.user_id = auth.uid()
  )
);

drop policy if exists "Observers can read transmissions" on public.network_transmissions;
create policy "Observers can read transmissions"
on public.network_transmissions for select to authenticated
using (true);

grant select, insert, update on public.observer_presence to authenticated;
grant select on public.network_transmissions to authenticated;

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
      where last_seen >= now() - interval '5 minutes'
    )::bigint,
    (select count(*) from public.observers)::bigint,
    (select coalesce(sum(total_visits), 0) from public.observers)::bigint,
    (select count(*) from public.network_transmissions)::bigint;
$$;

revoke all on function public.get_network_operations_overview() from public;
grant execute on function public.get_network_operations_overview() to authenticated;

insert into public.network_transmissions
  (title, message, severity, origin, progress)
select * from (
  values
    (
      'UNKNOWN RELAY DETECTED',
      'Encrypted traffic pattern detected beyond the public relay perimeter.',
      'HIGH',
      'AURORA-17',
      61
    ),
    (
      'OBSERVER NETWORK SYNCHRONIZED',
      'Cloud identity, presence, and achievement systems report nominal status.',
      'LOW',
      'BLACKTERM CORE',
      100
    ),
    (
      'ARCHIVE SIGNAL RECOVERED',
      'A fragmented transmission was recovered from a dormant archive node.',
      'MEDIUM',
      'VOID-04',
      38
    ),
    (
      'THREAT MATRIX UPDATED',
      'Global simulation telemetry has been indexed for active observers.',
      'LOW',
      'SENTINEL GRID',
      84
    )
) as seed(title, message, severity, origin, progress)
where not exists (
  select 1 from public.network_transmissions
);

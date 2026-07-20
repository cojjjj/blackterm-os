create or replace function public.get_observer_network_stats()
returns table (
  observer_count bigint,
  total_visits bigint,
  world_event_count bigint
)
language sql
security definer
set search_path = public
as $$
  select
    (select count(*) from public.observers)::bigint as observer_count,
    (select coalesce(sum(total_visits), 0) from public.observers)::bigint as total_visits,
    (select count(*) from public.world_events)::bigint as world_event_count;
$$;

revoke all on function public.get_observer_network_stats() from public;
grant execute on function public.get_observer_network_stats() to authenticated;

insert into public.world_events (title, description, severity)
select
  'OBSERVER NETWORK ONLINE',
  'BLACKTERM cloud identity and persistent telemetry systems initialized.',
  'LOW'
where not exists (
  select 1
  from public.world_events
  where title = 'OBSERVER NETWORK ONLINE'
);

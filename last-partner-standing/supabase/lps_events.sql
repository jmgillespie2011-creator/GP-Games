-- Game counts for Last Partner Standing: anonymous events sent by the game on the website (track() in src/h3-board.js).
-- A row says a game started, was resumed, finished a year, carried on into the next, ended, or was taken over.
-- No names and no device ids: a run is known only by the random id the game makes when it starts (runId), so a
-- game's events can be counted together. The Privacy explainer on the title screen says what is sent.
-- Anyone can add an event. Nobody can read, change or delete them through the API: read them in the Supabase
-- SQL editor, or through the Supabase connector (the Partners' Ledger dashboard).

create table if not exists public.lps_events (
  id         bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  run        text not null check (run ~ '^[0-9a-z]{4,24}$'),
  kind       text not null check (kind in ('start', 'resume', 'year', 'continue', 'over', 'exit', 'takeover')),
  practice   text not null check (practice in ('suburb', 'town', 'city')),
  week       text check (week is null or week ~ '^[0-9]{4}-W[0-9]{2}$'),
  yr         smallint not null check (yr between 1 and 60),
  month      smallint check (month between 0 and 11),
  months     smallint check (months between 0 and 720),
  detail     text check (char_length(detail) <= 48),
  score      smallint check (score between 0 and 800),
  build      text check (build ~ '^[0-9a-f]{7}$')
);

create index if not exists lps_events_created_idx on public.lps_events (created_at);
create index if not exists lps_events_run_idx on public.lps_events (run);

alter table public.lps_events enable row level security;

drop policy if exists "Anyone can add an event" on public.lps_events;
create policy "Anyone can add an event" on public.lps_events for insert to anon, authenticated with check (true);

grant insert on public.lps_events to anon, authenticated;
revoke select, update, delete, truncate on public.lps_events from anon, authenticated;

-- The server sets the time. Then a brake on floods: at most 120 events a minute across everyone.
create or replace function public.lps_events_guard() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  new.created_at := now();
  if (select count(*) from public.lps_events where created_at > now() - interval '1 minute') >= 120 then
    raise exception 'Too many events at once.';
  end if;
  return new;
end $$;

drop trigger if exists lps_events_guard on public.lps_events;
create trigger lps_events_guard before insert on public.lps_events
  for each row execute function public.lps_events_guard();

revoke execute on function public.lps_events_guard() from public, anon, authenticated;

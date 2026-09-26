-- Leaderboard for Last Partner Standing.
-- Anyone can read the board and add a score. Nobody can change or delete a score through the API.
-- Scores are worked out in the browser, so they can be faked: the checks below only keep the values sensible.

create table if not exists public.lps_scores (
  id         bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  name       text not null check (char_length(name) between 1 and 24 and name ~ '^[A-Za-z0-9 .''-]+$'),
  practice   text not null check (practice in ('suburb', 'town', 'city')),
  title      text not null check (char_length(title) between 1 and 48),
  score      integer not null check (score between 0 and 800),
  share_k    integer check (share_k between -300 and 500),
  qof        integer check (qof between 0 and 100),
  cqc        text check (cqc in ('o', 'g', 'ri', 'i')),
  exit       text check (exit in ('sold', 'merged', 'salaried', 'emigrated', 'handback')),
  version    text check (char_length(version) <= 12)
);

create index if not exists lps_scores_score_idx on public.lps_scores (score desc, created_at);
create index if not exists lps_scores_practice_score_idx on public.lps_scores (practice, score desc, created_at);
create index if not exists lps_scores_created_idx on public.lps_scores (created_at);

alter table public.lps_scores enable row level security;

drop policy if exists "Anyone can read the board" on public.lps_scores;
create policy "Anyone can read the board" on public.lps_scores for select to anon, authenticated using (true);

drop policy if exists "Anyone can post a score" on public.lps_scores;
create policy "Anyone can post a score" on public.lps_scores for insert to anon, authenticated with check (true);

grant select, insert on public.lps_scores to anon, authenticated;
revoke update, delete, truncate on public.lps_scores from anon, authenticated;

-- The server sets the time, so nobody can backdate a score. Then a simple brake on floods:
-- at most 30 new scores a minute across everyone.
create or replace function public.lps_scores_rate_limit() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  new.created_at := now();
  if (select count(*) from public.lps_scores where created_at > now() - interval '1 minute') >= 30 then
    raise exception 'Too many scores at once. Try again in a minute.';
  end if;
  return new;
end $$;

drop trigger if exists lps_scores_rate_limit on public.lps_scores;
create trigger lps_scores_rate_limit before insert on public.lps_scores
  for each row execute function public.lps_scores_rate_limit();

revoke execute on function public.lps_scores_rate_limit() from public, anon, authenticated;

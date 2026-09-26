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

-- Weekly challenge: the ISO week the score was played in (for example 2026-W39), or null for a normal game.
alter table public.lps_scores add column if not exists week text check (week is null or week ~ '^[0-9]{4}-W[0-9]{2}$');
create index if not exists lps_scores_week_score_idx on public.lps_scores (week, score desc, created_at);

-- A light word filter for names on the public board, matching nameOk() in src/h3-board.js.
-- Look-alike digits are swapped back to letters. The first list is matched anywhere once spaces and
-- punctuation are removed; the second only as whole words (so Dickens, Hancock and Cassidy are fine).
create or replace function public.lps_name_ok(n text) returns boolean
language sql immutable set search_path = '' as $$
  select not (
    regexp_replace(translate(lower(n), '013457', 'oieast'), '[^a-z]', '', 'g')
      ~ '(fuck|cunt|nigg|whore|bitch|bastard|twat|bollock|hitler|paedo|retard|spastic|tranny|wanker)'
    or translate(lower(n), '013457', 'oieast')
      ~ '(^|[^a-z])(dick|cock|arse|ass|tits|rape|fag|faggot|paki|spaz|chink|coon|dyke|gook|wog|jizz|cum|nonce|prick|knob|shit|shite|shitty|wank|piss|pissed|pedo|porn|nazi|kike|slut)s?([^a-z]|$)'
  )
$$;

create or replace function public.lps_scores_rate_limit() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  new.created_at := now();
  if not public.lps_name_ok(new.name) then
    raise exception 'That name can''t go on the board.';
  end if;
  if (select count(*) from public.lps_scores where created_at > now() - interval '1 minute') >= 30 then
    raise exception 'Too many scores at once. Try again in a minute.';
  end if;
  return new;
end $$;

-- To take a name off the board by hand (in the Supabase SQL editor): delete from public.lps_scores where id = <id>;

-- Endless mode: months served in the run so far when the score was posted (12 after year one).
alter table public.lps_scores add column if not exists months smallint check (months is null or months between 1 and 600);
create index if not exists lps_scores_months_idx on public.lps_scores (months desc nulls last, score desc, created_at);

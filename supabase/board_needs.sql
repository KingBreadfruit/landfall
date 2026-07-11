-- Shared board table: makes requests/needs sync across devices.
-- Run this once in the Supabase dashboard → SQL Editor → New query → Run.
-- Safe to re-run (uses IF NOT EXISTS / drop-and-create policies).

create table if not exists public.board_needs (
  id             text primary key,
  kind           text not null check (kind in ('shelter', 'person', 'repair')),
  community      text not null,
  parish         text not null,
  area           text,
  lat            double precision not null,
  lng            double precision not null,
  urgency        text not null default 'normal',
  people_affected integer not null default 0,
  items          jsonb not null default '[]'::jsonb,
  damage_type    text,
  photo_url      text,
  status         text not null default 'open',
  created_by     uuid,
  created_at     timestamptz not null default now()
);

alter table public.board_needs enable row level security;

-- Anyone can read the board; any signed-in user can post / update.
drop policy if exists "board read" on public.board_needs;
create policy "board read" on public.board_needs
  for select using (true);

drop policy if exists "board insert" on public.board_needs;
create policy "board insert" on public.board_needs
  for insert to authenticated with check (true);

drop policy if exists "board update" on public.board_needs;
create policy "board update" on public.board_needs
  for update to authenticated using (true) with check (true);

-- Live updates (so a new request appears on other devices instantly).
-- If this errors with "already member of publication", ignore it.
alter publication supabase_realtime add table public.board_needs;

-- Include the row id on delete events (harmless if never deleted).
alter table public.board_needs replica identity full;

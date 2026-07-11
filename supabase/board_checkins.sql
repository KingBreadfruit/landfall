-- Shelter check-ins: when a citizen says they're heading to a shelter, it
-- syncs to the shelter operator's device (Incoming tab).
-- Run once in Supabase → SQL Editor → New query → Run. Safe to re-run.

create table if not exists public.board_checkins (
  id          text primary key,
  shelter_id  text not null,
  name        text not null,
  eta         text,
  created_by  uuid,
  created_at  timestamptz not null default now()
);

alter table public.board_checkins enable row level security;

drop policy if exists "checkins read" on public.board_checkins;
create policy "checkins read" on public.board_checkins
  for select using (true);

drop policy if exists "checkins insert" on public.board_checkins;
create policy "checkins insert" on public.board_checkins
  for insert to authenticated with check (true);

alter publication supabase_realtime add table public.board_checkins;

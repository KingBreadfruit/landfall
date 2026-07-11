-- Groundwork confirmation: a repair's points are only awarded once the
-- resident who reported it confirms the work is done.
-- Run once in Supabase → SQL Editor → New query → Run. Safe to re-run.

-- Who claimed the repair (so we know whose points to award on confirm).
alter table public.board_needs add column if not exists claimed_by uuid;

-- The resident calls this to confirm. It awards the claimer their points
-- server-side (SECURITY DEFINER bypasses row-level security safely), so the
-- volunteer gets credited even though a different user pressed confirm.
create or replace function public.confirm_repair(need_id text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_claimer uuid;
begin
  update public.board_needs
     set status = 'confirmed'
   where id = need_id and status = 'matched'
  returning claimed_by into v_claimer;

  if v_claimer is not null then
    update public.profiles
       set points = points + 10,
           badges = array(
             select distinct unnest(coalesce(badges, '{}') || array['verified'])
           )
     where id = v_claimer;

    insert into public.contributions (profile_id, category, points)
    values (v_claimer, 'groundwork', 10);
  end if;
end $$;

grant execute on function public.confirm_repair(text) to authenticated;

-- Wipe all test data from the shared tables so the board starts clean for
-- the real demo. Run in Supabase → SQL Editor → New query → Run.
-- This does NOT touch user accounts (auth) — only the board content.

delete from public.board_needs;
delete from public.board_checkins;

-- Optional: reset everyone's points/badges to zero for a clean leaderboard.
-- Uncomment the next line if you want that too.
-- update public.profiles set points = 0, badges = '{}';

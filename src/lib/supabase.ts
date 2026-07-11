import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/** False when env vars are missing — lets the UI show a clear message
 * instead of crashing on a bad client. */
export const hasSupabase = Boolean(url && anon)

// A single shared client. Session persists in localStorage and
// auto-refreshes so a reload keeps you signed in.
export const supabase = createClient(url ?? '', anon ?? '', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
})

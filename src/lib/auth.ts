import { create } from 'zustand'
import type { Session } from '@supabase/supabase-js'
import { hasSupabase, supabase } from './supabase'
import type { BadgeKind } from './types'
import type { Profile } from './db'

type Role = Profile['role']

type AuthState = {
  session: Session | null
  profile: Profile | null
  /** True once the initial session check has completed. */
  ready: boolean
  /** Escape hatch: proceed without a backend session (guest). */
  guestMode: boolean
  init: () => void
  signUp: (
    email: string,
    password: string,
    name: string,
    role: Role,
  ) => Promise<{ error?: string }>
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  continueAsGuest: () => void
  /** Mock/guest mode: bump points locally (persisted to localStorage). */
  applyLocalPoints: (points: number, newBadges: BadgeKind[]) => void
}

let initialised = false

// Auth calls must never hang the UI. If the backend is slow/unreachable we
// surface an error (and offer guest mode) instead of an endless spinner.
const TIMEOUT = Symbol('timeout')
const TIMEOUT_MSG =
  "The server is slow to respond. Check your connection, or tap 'Continue as guest' below."

function raceTimeout<T>(p: PromiseLike<T>, ms = 12000): Promise<T | typeof TIMEOUT> {
  return Promise.race([
    Promise.resolve(p),
    new Promise<typeof TIMEOUT>((r) => setTimeout(() => r(TIMEOUT), ms)),
  ])
}

// --- Mock mode -------------------------------------------------------------
// When Supabase env vars are absent (local dev without keys, or the network
// is gone), the app runs as a guest with points kept in localStorage. Keeps
// the demo alive even if the venue wifi kills the backend.
const LS_POINTS = 'landfall_guest_points'
const LS_BADGES = 'landfall_guest_badges'

function guestProfile(): Profile {
  let points = 0
  let badges: string[] = []
  try {
    points = Number(localStorage.getItem(LS_POINTS) ?? '0') || 0
    badges = JSON.parse(localStorage.getItem(LS_BADGES) ?? '[]')
  } catch {
    /* ignore */
  }
  return {
    id: 'guest',
    name: 'You',
    role: 'volunteer',
    points,
    badges,
    created_at: new Date().toISOString(),
  }
}

async function loadProfile(userId: string): Promise<Profile | null> {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()
  return (data as Profile) ?? null
}

export const useAuth = create<AuthState>((set, get) => ({
  session: null,
  profile: null,
  ready: false,
  guestMode: false,

  init: () => {
    if (initialised) return
    initialised = true

    if (!hasSupabase) {
      // No backend configured → guest mode, straight into the app.
      set({ profile: guestProfile(), guestMode: true, ready: true })
      return
    }

    // Safety: never get stuck on the loading screen if getSession hangs.
    setTimeout(() => {
      if (!get().ready) set({ ready: true })
    }, 8000)

    supabase.auth.getSession().then(async ({ data }) => {
      const session = data.session
      const profile = session ? await loadProfile(session.user.id) : null
      set({ session, profile, ready: true })
    })

    supabase.auth.onAuthStateChange(async (_event, session) => {
      const profile = session ? await loadProfile(session.user.id) : null
      set({ session, profile })
    })
  },

  signUp: async (email, password, name, role) => {
    const res = await raceTimeout(
      supabase.auth.signUp({ email, password, options: { data: { name, role } } }),
    )
    if (res === TIMEOUT) return { error: TIMEOUT_MSG }
    const { data, error } = res
    if (error) return { error: error.message }
    if (!data.session) {
      return { error: 'That email may already be registered — try logging in.' }
    }
    // Enter the app as soon as the session exists; load the profile in the
    // background so a slow profile query can't block sign-in.
    set({ session: data.session })
    void loadProfile(data.session.user.id).then((p) => p && set({ profile: p }))
    return {}
  },

  signIn: async (email, password) => {
    const res = await raceTimeout(
      supabase.auth.signInWithPassword({ email, password }),
    )
    if (res === TIMEOUT) return { error: TIMEOUT_MSG }
    const { data, error } = res
    if (error) return { error: error.message }
    if (data.session) {
      set({ session: data.session })
      void loadProfile(data.session.user.id).then((p) => p && set({ profile: p }))
    }
    return {}
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ session: null, profile: null, guestMode: false })
  },

  continueAsGuest: () =>
    set({ guestMode: true, profile: guestProfile(), ready: true }),

  refreshProfile: async () => {
    const { session } = get()
    if (!session) return
    const profile = await loadProfile(session.user.id)
    set({ profile })
  },

  applyLocalPoints: (points, newBadges) => {
    const cur = get().profile ?? guestProfile()
    const badges = Array.from(new Set([...cur.badges, ...newBadges]))
    const next = { ...cur, points: cur.points + points, badges }
    try {
      localStorage.setItem(LS_POINTS, String(next.points))
      localStorage.setItem(LS_BADGES, JSON.stringify(badges))
    } catch {
      /* ignore */
    }
    set({ profile: next })
  },
}))

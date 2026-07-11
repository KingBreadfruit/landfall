import { create } from 'zustand'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './supabase'
import type { Profile } from './db'

type Role = Profile['role']

type AuthState = {
  session: Session | null
  profile: Profile | null
  /** True once the initial session check has completed. */
  ready: boolean
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
}

let initialised = false

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

  init: () => {
    if (initialised) return
    initialised = true

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
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, role } },
    })
    if (error) return { error: error.message }
    if (data.session) {
      const profile = await loadProfile(data.session.user.id)
      set({ session: data.session, profile })
    }
    return {}
  },

  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) return { error: error.message }
    const profile = data.session
      ? await loadProfile(data.session.user.id)
      : null
    set({ session: data.session, profile })
    return {}
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ session: null, profile: null })
  },

  refreshProfile: async () => {
    const { session } = get()
    if (!session) return
    const profile = await loadProfile(session.user.id)
    set({ profile })
  },
}))

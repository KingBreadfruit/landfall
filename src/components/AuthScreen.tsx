import { useState } from 'react'
import { LifeBuoy } from 'lucide-react'
import type { Profile } from '@/lib/db'
import { useAuth } from '@/lib/auth'
import { hasSupabase } from '@/lib/supabase'
import { APP_NAME, TAGLINE } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

type Role = Profile['role']

const ROLES: { id: Role; label: string }[] = [
  { id: 'volunteer', label: 'Volunteer' },
  { id: 'citizen', label: 'Citizen' },
  { id: 'shelter', label: 'Shelter staff' },
]

/**
 * Minimal auth: email + password. Email confirmation is disabled on the
 * backend, so signing up drops you straight into the app. The role you
 * pick seeds your profile; the bottom nav can still switch views for the
 * demo.
 */
export function AuthScreen() {
  const signUp = useAuth((s) => s.signUp)
  const signIn = useAuth((s) => s.signIn)
  const continueAsGuest = useAuth((s) => s.continueAsGuest)

  const [mode, setMode] = useState<'signup' | 'login'>('signup')
  const [name, setName] = useState('')
  const [role, setRole] = useState<Role>('volunteer')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async () => {
    setBusy(true)
    setError(null)
    const res =
      mode === 'signup'
        ? await signUp(email.trim(), password, name.trim() || 'Friend', role)
        : await signIn(email.trim(), password)
    if (res.error) setError(res.error)
    setBusy(false)
  }

  return (
    <div className="mx-auto flex h-full w-full max-w-sm flex-col justify-center gap-5 p-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <LifeBuoy className="text-urgency-critical size-10" />
        <h1 className="text-2xl font-bold tracking-tight">{APP_NAME}</h1>
        <p className="text-muted-foreground text-sm">{TAGLINE}</p>
      </div>

      {!hasSupabase && (
        <p className="text-urgency-critical rounded-lg border p-3 text-center text-sm">
          Backend not configured. Set VITE_SUPABASE_URL and
          VITE_SUPABASE_ANON_KEY.
        </p>
      )}

      <div className="bg-secondary flex rounded-lg p-0.5">
        {(['signup', 'login'] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={cn(
              'flex-1 cursor-pointer rounded-md py-1.5 text-sm font-medium capitalize transition-colors',
              mode === m
                ? 'bg-background shadow-sm'
                : 'text-muted-foreground',
            )}
          >
            {m === 'signup' ? 'Sign up' : 'Log in'}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {mode === 'signup' && (
          <>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="au-name">Name</Label>
              <Input
                id="au-name"
                value={name}
                maxLength={80}
                placeholder="e.g. Marcus"
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>I am a…</Label>
              <div className="grid grid-cols-3 gap-1.5">
                {ROLES.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRole(r.id)}
                    className={cn(
                      'cursor-pointer rounded-lg border px-2 py-2 text-xs font-medium transition-colors',
                      role === r.id
                        ? 'border-primary bg-primary/5'
                        : 'text-muted-foreground',
                    )}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="au-email">Email</Label>
          <Input
            id="au-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="au-pass">Password</Label>
          <Input
            id="au-pass"
            type="password"
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && <p className="text-urgency-critical text-sm">{error}</p>}

        <Button
          size="lg"
          disabled={busy || !email || password.length < 6}
          onClick={submit}
        >
          {busy
            ? 'Just a sec…'
            : mode === 'signup'
              ? 'Create account'
              : 'Log in'}
        </Button>
        <p className="text-muted-foreground text-center text-xs">
          No email confirmation — you're straight in.
        </p>

        <button
          type="button"
          onClick={continueAsGuest}
          className="text-muted-foreground hover:text-foreground mt-1 cursor-pointer text-center text-xs underline"
        >
          Having trouble? Continue as guest
        </button>
      </div>
    </div>
  )
}

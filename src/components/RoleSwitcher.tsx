import { useEffect } from 'react'
import { Boxes, HandHeart, Map as MapIcon, Warehouse } from 'lucide-react'
import type { Role } from '@/lib/types'
import { ADMIN_EMAIL } from '@/lib/constants'
import { useAuth } from '@/lib/auth'
import { useStore } from '@/lib/store'
import { cn } from '@/lib/utils'

const ROLES: { id: Role; label: string; icon: typeof Boxes }[] = [
  { id: 'volunteer', label: 'Supplies', icon: Boxes },
  { id: 'map', label: 'Map', icon: MapIcon },
  { id: 'shelter', label: 'Shelter', icon: Warehouse },
  { id: 'requester', label: 'Need help', icon: HandHeart },
]

/**
 * Which tabs a user can see is scoped to who they are. The operator account
 * (ADMIN_EMAIL) gets everything, including the shelter roster. A volunteer
 * sees supplies + map; a citizen sees the help form + map. The shelter
 * (TRN) view is never shown to a self-selected role.
 */
function allowedTabs(email: string | null, role: string | null): Role[] {
  if (email && email.toLowerCase() === ADMIN_EMAIL)
    return ['volunteer', 'map', 'shelter', 'requester']
  if (role === 'volunteer') return ['volunteer', 'map']
  if (role === 'citizen') return ['requester', 'map']
  if (role === 'shelter') return ['shelter', 'map']
  // Guest / unknown: usable, but never the shelter roster.
  return ['volunteer', 'map', 'requester']
}

/**
 * Bottom tab bar — scoped to the signed-in role. The active tab glows amber
 * with a top rule.
 */
export function RoleSwitcher() {
  const role = useStore((s) => s.role)
  const setRole = useStore((s) => s.setRole)
  const email = useAuth((s) => s.session?.user.email ?? null)
  const profileRole = useAuth((s) => s.profile?.role ?? null)

  const allowed = allowedTabs(email, profileRole)
  const tabs = ROLES.filter((t) => allowed.includes(t.id))

  // Land on a tab this user is allowed to see (e.g. a citizen defaults to
  // "Need help", not the volunteer board).
  useEffect(() => {
    if (!allowed.includes(role)) setRole(allowed[0])
  }, [allowed, role, setRole])

  return (
    <nav
      className="z-20 grid border-t border-border pb-[max(8px,env(safe-area-inset-bottom))]"
      style={{
        background: '#0b1017',
        gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))`,
      }}
    >
      {tabs.map(({ id, label, icon: Icon }) => {
        const active = role === id
        return (
          <button
            key={id}
            type="button"
            onClick={() => setRole(id)}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'relative flex min-h-[58px] cursor-pointer flex-col items-center justify-center gap-[5px] px-1 py-2.5 transition-colors',
              active ? 'text-primary' : 'text-muted-foreground',
            )}
            style={active ? { boxShadow: 'inset 0 2px 0 #ffb020' } : undefined}
          >
            <Icon className="size-[21px]" strokeWidth={1.7} />
            <span className="mono-label text-[9.5px] font-bold tracking-[0.06em]">
              {label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}

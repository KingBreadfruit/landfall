import { Boxes, HandHeart, Warehouse } from 'lucide-react'
import type { Role } from '@/lib/types'
import { useStore } from '@/lib/store'
import { cn } from '@/lib/utils'

const ROLES: { id: Role; label: string; icon: typeof Boxes }[] = [
  { id: 'volunteer', label: 'Supplies Needed', icon: Boxes },
  { id: 'shelter', label: 'Shelter', icon: Warehouse },
  { id: 'requester', label: 'Need help', icon: HandHeart },
]

/**
 * Bottom tab bar for switching perspective: volunteer / shelter / person
 * in need. One presenter can flip between all three views live with a
 * thumb — that's the point.
 */
export function RoleSwitcher() {
  const role = useStore((s) => s.role)
  const setRole = useStore((s) => s.setRole)

  return (
    <nav className="z-20 grid grid-cols-3 border-t bg-background pb-[env(safe-area-inset-bottom)]">
      {ROLES.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => setRole(id)}
          aria-current={role === id ? 'page' : undefined}
          className={cn(
            'flex min-h-14 cursor-pointer flex-col items-center justify-center gap-0.5 px-1 py-1.5 text-xs transition-colors',
            role === id
              ? 'text-urgency-critical font-semibold'
              : 'text-muted-foreground',
          )}
        >
          <Icon className="size-5 shrink-0" />
          <span className="text-center leading-tight">{label}</span>
        </button>
      ))}
    </nav>
  )
}

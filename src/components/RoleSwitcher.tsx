import { Boxes, HandHeart, Map as MapIcon, Warehouse } from 'lucide-react'
import type { Role } from '@/lib/types'
import { useStore } from '@/lib/store'
import { cn } from '@/lib/utils'

const ROLES: { id: Role; label: string; icon: typeof Boxes }[] = [
  { id: 'volunteer', label: 'Supplies', icon: Boxes },
  { id: 'map', label: 'Map', icon: MapIcon },
  { id: 'shelter', label: 'Shelter', icon: Warehouse },
  { id: 'requester', label: 'Need help', icon: HandHeart },
]

/**
 * Bottom tab bar — the console's role selector. One thumb flips the whole
 * perspective; the active tab glows amber with a top rule.
 */
export function RoleSwitcher() {
  const role = useStore((s) => s.role)
  const setRole = useStore((s) => s.setRole)

  return (
    <nav
      className="z-20 grid grid-cols-4 border-t border-border pb-[max(8px,env(safe-area-inset-bottom))]"
      style={{ background: '#0b1017' }}
    >
      {ROLES.map(({ id, label, icon: Icon }) => {
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

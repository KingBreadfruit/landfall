import { useMemo, useState } from 'react'
import { List, Map as MapIcon, Trophy } from 'lucide-react'
import type { Need } from '@/lib/types'
import { byUrgency } from '@/lib/needs'
import { useStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import { Leaderboard } from './Leaderboard'
import { MapView } from './MapView'
import { NeedCard } from './NeedCard'

/**
 * The volunteer / helper home screen: "Supplies Needed".
 *
 * Needs are listed and SEPARATED into Shelters and People in need (with a
 * filter to focus on one). The map is secondary — a List⇄Map toggle, not
 * the whole page — so the helper scans needs first and drops to the map
 * only when they want geography. The map stays mounted across the toggle
 * (hidden, not unmounted) so Leaflet keeps its state and tile cache.
 */

type FilterId = 'all' | 'shelter' | 'person' | 'repair'
type ViewMode = 'list' | 'map'

const FILTERS: { id: FilterId; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'shelter', label: 'Shelters' },
  { id: 'person', label: 'People' },
  { id: 'repair', label: 'Repairs' },
]

function Group({ label, needs }: { label: string; needs: Need[] }) {
  if (needs.length === 0) return null
  return (
    <section className="mb-5">
      <div className="mb-2 flex items-center gap-2">
        <h2 className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
          {label}
        </h2>
        <span className="text-muted-foreground text-xs tabular-nums">
          {needs.length}
        </span>
      </div>
      <div className="flex flex-col gap-2">
        {needs.map((need) => (
          <NeedCard key={need.id} need={need} />
        ))}
      </div>
    </section>
  )
}

export function SuppliesNeeded() {
  const needs = useStore((s) => s.needs)
  const youPoints = useStore((s) => s.you.points)
  const [filter, setFilter] = useState<FilterId>('all')
  const [view, setView] = useState<ViewMode>('list')
  const [boardOpen, setBoardOpen] = useState(false)

  const { shelters, people, repairs, criticalCount } = useMemo(() => {
    const sorted = [...needs].sort(byUrgency)
    return {
      shelters: sorted.filter((n) => n.kind === 'shelter'),
      people: sorted.filter((n) => n.kind === 'person'),
      repairs: sorted.filter((n) => n.kind === 'repair'),
      criticalCount: sorted.filter((n) => n.urgency === 'critical').length,
    }
  }, [needs])

  return (
    <div className="bg-background flex h-full flex-col">
      {/* sub-header: title + view toggle */}
      <div className="border-b px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h1 className="text-lg font-bold tracking-tight">
              Supplies Needed
            </h1>
            <p className="text-muted-foreground text-xs">
              {needs.length} open · {criticalCount} critical
            </p>
          </div>

          <button
            type="button"
            onClick={() => setBoardOpen(true)}
            className="border-urgency-high/40 bg-urgency-high/10 text-urgency-high flex shrink-0 cursor-pointer items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold"
            title="Top contributors"
          >
            <Trophy className="size-3.5" />
            {youPoints} pts
          </button>
        </div>

        <div className="mt-3 flex items-center gap-2">
          {/* filter chips (list view), scrollable on narrow screens */}
          {view === 'list' ? (
            <div className="flex flex-1 gap-1.5 overflow-x-auto">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilter(f.id)}
                  aria-pressed={filter === f.id}
                  className={cn(
                    'shrink-0 cursor-pointer rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                    filter === f.id
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'text-muted-foreground',
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex-1" />
          )}

          {/* view toggle */}
          <div className="flex shrink-0 rounded-lg border p-0.5">
            {(['list', 'map'] as ViewMode[]).map((mode) => {
              const Icon = mode === 'list' ? List : MapIcon
              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setView(mode)}
                  aria-pressed={view === mode}
                  className={cn(
                    'flex cursor-pointer items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-colors',
                    view === mode
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground',
                  )}
                >
                  <Icon className="size-3.5" />
                  {mode}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* content: list and map both live here; map stays mounted */}
      <div className="relative flex-1 overflow-hidden">
        <div
          className={cn(
            'h-full overflow-y-auto p-4',
            view !== 'list' && 'hidden',
          )}
        >
          {(filter === 'all' || filter === 'shelter') && (
            <Group label="Shelters" needs={shelters} />
          )}
          {(filter === 'all' || filter === 'person') && (
            <Group label="People in need" needs={people} />
          )}
          {(filter === 'all' || filter === 'repair') && (
            <Group label="Roads & repairs" needs={repairs} />
          )}
        </div>

        <div className={cn('absolute inset-0', view !== 'map' && 'hidden')}>
          <MapView active={view === 'map'} />
        </div>
      </div>

      <Leaderboard open={boardOpen} onOpenChange={setBoardOpen} />
    </div>
  )
}

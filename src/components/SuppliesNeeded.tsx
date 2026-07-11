import { useMemo, useState } from 'react'
import { ClipboardList, Trophy } from 'lucide-react'
import type { Need } from '@/lib/types'
import { byUrgency } from '@/lib/needs'
import { useAuth } from '@/lib/auth'
import { useStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import { Leaderboard } from './Leaderboard'
import { NeedCard } from './NeedCard'

/**
 * The volunteer / helper home screen: "Supplies Needed" — a list of open
 * needs SEPARATED into Shelters, People in need, and Repairs, with a filter
 * to focus on one. Geography lives in the dedicated Map tab, so there's no
 * in-list map toggle (that kept the two maps inconsistent).
 */

type FilterId = 'all' | 'shelter' | 'person' | 'repair'

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
  const runCount = useStore((s) => s.runs.length)
  const openMyRuns = useStore((s) => s.openMyRuns)
  const youPoints = useAuth((s) => s.profile?.points ?? 0)
  const [filter, setFilter] = useState<FilterId>('all')
  const [boardOpen, setBoardOpen] = useState(false)

  const { shelters, people, repairs, openCount, criticalCount } =
    useMemo(() => {
      const sorted = [...needs].sort(byUrgency)
      // A shelter only appears on the board when it has an active request —
      // never its raw inventory.
      const shelters = sorted.filter(
        (n) => n.kind === 'shelter' && n.items.length > 0,
      )
      const people = sorted.filter((n) => n.kind === 'person')
      const repairs = sorted.filter((n) => n.kind === 'repair')
      return {
        shelters,
        people,
        repairs,
        openCount: shelters.length + people.length + repairs.length,
        criticalCount: [...shelters, ...people, ...repairs].filter(
          (n) => n.urgency === 'critical',
        ).length,
      }
    }, [needs])

  return (
    <div className="bg-background flex h-full flex-col">
      <div className="border-b px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h1 className="text-lg font-bold tracking-tight">
              Supplies Needed
            </h1>
            <p className="text-muted-foreground text-xs">
              {openCount} open · {criticalCount} critical
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              onClick={openMyRuns}
              className="flex cursor-pointer items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium"
              title="My runs"
            >
              <ClipboardList className="size-3.5" />
              Runs{runCount > 0 ? ` · ${runCount}` : ''}
            </button>
            <button
              type="button"
              onClick={() => setBoardOpen(true)}
              className="border-urgency-high/40 bg-urgency-high/10 text-urgency-high flex cursor-pointer items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold"
              title="Top contributors"
            >
              <Trophy className="size-3.5" />
              {youPoints} pts
            </button>
          </div>
        </div>

        <div className="mt-3 flex gap-1.5 overflow-x-auto">
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
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {openCount === 0 && (
          <p className="text-muted-foreground pt-16 text-center text-sm">
            No open needs yet.
          </p>
        )}
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

      <Leaderboard open={boardOpen} onOpenChange={setBoardOpen} />
    </div>
  )
}

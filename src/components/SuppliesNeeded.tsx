import { useMemo, useState } from 'react'
import { ClipboardList } from 'lucide-react'
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

function Group({
  label,
  color,
  needs,
}: {
  label: string
  color: string
  needs: Need[]
}) {
  if (needs.length === 0) return null
  return (
    <section className="mb-[22px]">
      <div className="mb-[11px] flex items-center gap-[9px] pl-0.5">
        <span className="block h-0.5 w-[14px]" style={{ background: color }} />
        <span className="mono-label text-[10.5px] font-bold tracking-[0.2em] text-muted-foreground">
          {label}
        </span>
        <span className="mono-label bg-secondary rounded-full px-[7px] py-px text-[10px] tracking-normal normal-case text-muted-foreground">
          {needs.length}
        </span>
        <span className="bg-border h-px flex-1" />
      </div>
      <div className="flex flex-col gap-[9px]">
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
      <div className="border-b px-[18px] pt-1.5 pb-3">
        <div className="flex items-start justify-between gap-2.5">
          <div className="flex flex-col gap-[3px]">
            <h1 className="text-[23px] font-bold leading-none tracking-[-0.03em]">
              Supplies needed
            </h1>
            <span className="mono-label text-[10px] tracking-[0.14em] text-muted-foreground">
              {openCount} open&nbsp;&nbsp;·&nbsp;&nbsp;
              <span className="text-urgency-critical">
                {criticalCount} critical
              </span>
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              onClick={openMyRuns}
              className="border-border text-muted-foreground flex h-8 cursor-pointer items-center gap-1 rounded-[10px] border px-2.5 text-xs font-medium"
              title="My runs"
            >
              <ClipboardList className="size-3.5" />
              Runs{runCount > 0 ? ` · ${runCount}` : ''}
            </button>
            <button
              type="button"
              onClick={() => setBoardOpen(true)}
              className="bg-primary text-primary-foreground flex h-8 cursor-pointer items-center gap-1.5 rounded-[10px] px-3 text-xs font-bold"
              style={{ boxShadow: '0 4px 14px -6px rgba(255,176,32,.7)' }}
              title="Top contributors"
            >
              <span className="block size-[9px] rotate-45 bg-current" />
              {youPoints} pts
            </button>
          </div>
        </div>

        <div className="mt-[14px] flex gap-1.5 overflow-x-auto">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              aria-pressed={filter === f.id}
              className={cn(
                'shrink-0 cursor-pointer rounded-full border px-[14px] py-[7px] text-xs transition-colors',
                filter === f.id
                  ? 'border-primary bg-primary text-primary-foreground font-bold'
                  : 'border-border text-muted-foreground font-semibold',
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
          <Group label="Shelters" color="#12b5c9" needs={shelters} />
        )}
        {(filter === 'all' || filter === 'person') && (
          <Group label="People in need" color="#ffb020" needs={people} />
        )}
        {(filter === 'all' || filter === 'repair') && (
          <Group label="Roads & repairs" color="#f5920b" needs={repairs} />
        )}
      </div>

      <Leaderboard open={boardOpen} onOpenChange={setBoardOpen} />
    </div>
  )
}

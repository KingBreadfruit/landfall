import { ChevronRight, MapPin, UserRound, Users, Warehouse } from 'lucide-react'
import type { Need } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { URGENCY_LABELS } from '@/lib/constants'
import { locationLabel, overallProgress, peopleLabel } from '@/lib/needs'
import { useStore } from '@/lib/store'

/**
 * A scannable list row for one need on the volunteer's Supplies Needed
 * screen. Tapping it opens the detail sheet ("I can supply").
 */
export function NeedCard({ need }: { need: Need }) {
  const selectNeed = useStore((s) => s.selectNeed)
  const KindIcon = need.kind === 'shelter' ? Warehouse : UserRound
  const pct = overallProgress(need)
  const items = need.items.map((i) => i.name).join(' · ')

  return (
    <button
      type="button"
      onClick={() => selectNeed(need.id)}
      className="flex w-full items-center gap-3 rounded-xl border bg-card p-3 text-left shadow-sm transition-colors hover:bg-accent"
    >
      <div className="bg-secondary flex size-10 shrink-0 items-center justify-center rounded-lg">
        <KindIcon className="size-5" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <Badge variant={need.urgency} className="shrink-0">
            {URGENCY_LABELS[need.urgency]}
          </Badge>
          <span className="truncate text-sm font-semibold">
            {need.community}
          </span>
        </div>

        <div className="text-muted-foreground mt-1 flex items-center gap-3 text-xs">
          <span className="flex min-w-0 items-center gap-1">
            <MapPin className="size-3 shrink-0" />
            <span className="truncate">{locationLabel(need)}</span>
          </span>
          <span className="flex shrink-0 items-center gap-1">
            <Users className="size-3" />
            {peopleLabel(need)}
          </span>
        </div>

        <div className="mt-2 flex items-center gap-2">
          <Progress value={pct} className="h-1.5" />
          <span className="text-muted-foreground shrink-0 text-xs font-medium tabular-nums">
            {pct}%
          </span>
        </div>

        <p className="text-muted-foreground mt-1 truncate text-xs">{items}</p>
      </div>

      <ChevronRight className="text-muted-foreground size-4 shrink-0" />
    </button>
  )
}

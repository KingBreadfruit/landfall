import { ChevronRight, MapPin, UserRound, Warehouse, Wrench } from 'lucide-react'
import type { Need } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { URGENCY_COLORS, URGENCY_LABELS } from '@/lib/constants'
import { locationLabel, overallProgress } from '@/lib/needs'
import { useStore } from '@/lib/store'

/**
 * A need on the board — urgency-coded left rule, mono meta, progress rail.
 */
export function NeedCard({ need }: { need: Need }) {
  const selectNeed = useStore((s) => s.selectNeed)
  const color = URGENCY_COLORS[need.urgency]

  if (need.kind === 'repair') {
    return (
      <button
        type="button"
        onClick={() => selectNeed(need.id)}
        className="flex w-full items-center gap-[13px] rounded-[15px] border border-border bg-card p-[13px] text-left shadow-sm transition-colors hover:border-border/80"
        style={{ borderLeft: `3px solid ${color}` }}
      >
        {need.photoUrl ? (
          <span
            className="size-[52px] shrink-0 rounded-[11px] bg-cover bg-center"
            style={{ backgroundImage: `url('${need.photoUrl}')` }}
          />
        ) : (
          <span className="bg-accent flex size-[46px] shrink-0 items-center justify-center rounded-xl text-muted-foreground">
            <Wrench className="size-5" />
          </span>
        )}
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <Badge variant={need.urgency}>{URGENCY_LABELS[need.urgency]}</Badge>
            <span className="truncate text-[15px] font-semibold">
              {need.damageType}
            </span>
          </span>
          <span className="mono-label mt-1 flex items-center gap-1 text-[10px] tracking-[0.02em] normal-case text-muted-foreground">
            <MapPin className="size-3 shrink-0" />
            <span className="truncate">{locationLabel(need)}</span>
          </span>
          <span className="mono-label mt-1 block text-[10.5px] tracking-normal normal-case text-muted-foreground/70">
            Hands needed · clear / repair
          </span>
        </span>
        <ChevronRight className="size-4 shrink-0 text-muted-foreground/50" />
      </button>
    )
  }

  const KindIcon = need.kind === 'shelter' ? Warehouse : UserRound
  const pct = overallProgress(need)
  const items = need.items.map((i) => i.name).join('  ·  ')
  const metaRight =
    need.kind === 'shelter'
      ? `${need.peopleAffected} ppl`
      : `HH ${need.peopleAffected}`

  return (
    <button
      type="button"
      onClick={() => selectNeed(need.id)}
      className="flex w-full items-center gap-[13px] rounded-[15px] border border-border bg-card p-[13px] text-left shadow-sm transition-colors hover:border-border/80"
      style={{ borderLeft: `3px solid ${color}` }}
    >
      <span className="bg-accent flex size-[46px] shrink-0 items-center justify-center rounded-xl text-muted-foreground">
        <KindIcon className="size-5" strokeWidth={1.7} />
      </span>

      <span className="flex min-w-0 flex-1 flex-col gap-[5px]">
        <span className="flex items-center gap-2">
          <Badge variant={need.urgency} className="shrink-0">
            {URGENCY_LABELS[need.urgency]}
          </Badge>
          <span className="truncate text-[15px] font-semibold">
            {need.community}
          </span>
        </span>

        <span className="mono-label flex items-center justify-between gap-3 text-[11px] tracking-normal normal-case text-muted-foreground">
          <span className="flex min-w-0 items-center gap-1">
            <MapPin className="size-3 shrink-0" />
            <span className="truncate">{locationLabel(need)}</span>
          </span>
          <span className="shrink-0">{metaRight}</span>
        </span>

        <span className="flex items-center gap-[9px]">
          <span className="bg-accent block h-1.5 flex-1 overflow-hidden rounded-full">
            <span
              className="block h-full rounded-full"
              style={{ width: `${pct}%`, background: color }}
            />
          </span>
          <span className="mono-label shrink-0 text-[10px] tracking-normal normal-case text-muted-foreground">
            {pct}%
          </span>
        </span>

        <span className="mono-label block truncate text-[10.5px] tracking-normal normal-case text-muted-foreground/60">
          {items}
        </span>
      </span>

      <ChevronRight className="size-4 shrink-0 text-muted-foreground/50" />
    </button>
  )
}

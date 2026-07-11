import { ChevronRight, TriangleAlert, Users, Warehouse } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { locationLabel } from '@/lib/needs'
import { useStore } from '@/lib/store'

/**
 * Shelter role home: the shelters this official oversees. Each row shows
 * live occupancy and flags any incoming guests (amber if someone is
 * overdue). Tap through to the shelter's people + supplies.
 */
export function ShelterList() {
  const shelters = useStore((s) => s.shelters)
  const needs = useStore((s) => s.needs)
  const selectShelter = useStore((s) => s.selectShelter)

  const totalSheltering = needs
    .filter((n) => n.kind === 'shelter')
    .reduce((sum, n) => sum + n.peopleAffected, 0)

  return (
    <div className="flex h-full flex-col">
      <div className="border-b px-4 py-3">
        <h1 className="text-lg font-bold tracking-tight">Shelters</h1>
        <p className="text-muted-foreground text-xs">
          {shelters.length} active · {totalSheltering.toLocaleString()} sheltering
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex flex-col gap-2">
          {shelters.map((shelter) => {
            const need = needs.find((n) => n.id === shelter.needId)
            if (!need) return null
            const sheltering = need.peopleAffected
            const pct = Math.round((sheltering / shelter.capacity) * 100)
            const overdue = shelter.incoming.some((g) => g.status === 'overdue')
            const incoming = shelter.incoming.filter(
              (g) => g.status !== 'arrived',
            ).length

            return (
              <button
                key={shelter.needId}
                type="button"
                onClick={() => selectShelter(shelter.needId)}
                className="flex w-full items-center gap-3 rounded-xl border bg-card p-3 text-left shadow-sm transition-colors hover:bg-accent"
              >
                <div className="bg-secondary flex size-10 shrink-0 items-center justify-center rounded-lg">
                  <Warehouse className="size-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-semibold">
                      {need.community}
                    </span>
                    {incoming > 0 && (
                      <Badge
                        variant={overdue ? 'high' : 'secondary'}
                        className="shrink-0 gap-1"
                      >
                        {overdue && <TriangleAlert className="size-3" />}
                        {incoming} incoming
                      </Badge>
                    )}
                  </div>

                  <p className="text-muted-foreground mt-0.5 truncate text-xs">
                    {locationLabel(need)}
                  </p>

                  <div className="mt-2 flex items-center gap-2">
                    <Progress value={pct} className="h-1.5" />
                    <span className="text-muted-foreground flex shrink-0 items-center gap-1 text-xs font-medium tabular-nums">
                      <Users className="size-3" />
                      {sheltering}/{shelter.capacity}
                    </span>
                  </div>
                </div>

                <ChevronRight className="text-muted-foreground size-4 shrink-0" />
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

import {
  MapPin,
  Navigation,
  UserRound,
  Users,
  Warehouse,
  Wrench,
} from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { URGENCY_LABELS, directionsUrl } from '@/lib/constants'
import { KIND_LABEL, locationLabel, peopleLabel } from '@/lib/needs'
import { useStore } from '@/lib/store'

/**
 * Bottom sheet shown when a need is tapped. Shelters/people show items +
 * progress and "I can supply". Repairs show the damage photo and "I can
 * help" (Groundwork).
 */
export function NeedDetailSheet() {
  const selectedNeedId = useStore((s) => s.selectedNeedId)
  const screen = useStore((s) => s.screen)
  const need = useStore((s) => s.needs.find((n) => n.id === s.selectedNeedId))
  const selectNeed = useStore((s) => s.selectNeed)
  const startClaim = useStore((s) => s.startClaim)
  const takeUpGroundwork = useStore((s) => s.takeUpGroundwork)

  const isRepair = need?.kind === 'repair'
  // Directions only for shelters (drop points) and repair sites — never a
  // citizen's location.
  const showDirections =
    need != null && (need.kind === 'shelter' || need.kind === 'repair')
  const canSupply = need != null && !isRepair && need.items.length > 0

  return (
    <Sheet
      open={selectedNeedId !== null && screen === 'map'}
      onOpenChange={(open) => {
        if (!open) selectNeed(null)
      }}
    >
      <SheetContent side="bottom" className="mx-auto max-w-lg pb-6">
        {need && (
          <>
            <SheetHeader>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={need.urgency}>
                  {URGENCY_LABELS[need.urgency]}
                </Badge>
                <span className="text-muted-foreground flex items-center gap-1 text-xs">
                  {need.kind === 'shelter' ? (
                    <Warehouse className="size-3" />
                  ) : isRepair ? (
                    <Wrench className="size-3" />
                  ) : (
                    <UserRound className="size-3" />
                  )}
                  {KIND_LABEL[need.kind]}
                </span>
                <span className="text-muted-foreground flex items-center gap-1 text-xs">
                  <MapPin className="size-3" />
                  {locationLabel(need)}
                </span>
              </div>
              <SheetTitle className="text-xl">
                {isRepair ? need.damageType : need.community}
              </SheetTitle>
              <SheetDescription className="flex items-center gap-1.5">
                {isRepair ? (
                  'Volunteers with tools or a vehicle can take this on.'
                ) : (
                  <>
                    <Users className="size-4" />
                    {peopleLabel(need)}
                  </>
                )}
              </SheetDescription>
            </SheetHeader>

            {isRepair ? (
              <div className="px-4">
                {need.photoUrl && (
                  <img
                    src={need.photoUrl}
                    alt="Reported damage"
                    className="aspect-video w-full rounded-lg object-cover"
                  />
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-4 px-4">
                {need.items.map((item) => {
                  const pct = Math.round(
                    (item.qtyPledged / item.qtyNeeded) * 100,
                  )
                  return (
                    <div key={item.name} className="flex flex-col gap-1.5">
                      <div className="flex items-baseline justify-between text-sm">
                        <span className="font-medium">{item.name}</span>
                        <span className="text-muted-foreground">
                          {item.qtyPledged} / {item.qtyNeeded} {item.unit}
                        </span>
                      </div>
                      <Progress value={pct} />
                    </div>
                  )
                })}
              </div>
            )}

            <div className="flex flex-col gap-2 px-4 pt-2">
              {showDirections && (
                <Button asChild variant="outline" className="w-full">
                  <a
                    href={directionsUrl(need.lat, need.lng)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Navigation /> Directions
                  </a>
                </Button>
              )}
              {isRepair ? (
                <Button
                  size="lg"
                  className="w-full"
                  onClick={() => takeUpGroundwork(need.id)}
                >
                  I can help
                </Button>
              ) : canSupply ? (
                <Button
                  size="lg"
                  className="w-full"
                  onClick={() => startClaim(need.id)}
                >
                  Claim this run
                </Button>
              ) : null}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

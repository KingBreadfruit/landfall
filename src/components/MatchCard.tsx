import { ArrowLeft, CheckCircle2, Circle, Route, Truck } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { DEMO_DELIVERY } from '@/lib/seed'
import { useStore } from '@/lib/store'
import { cn } from '@/lib/utils'

/**
 * The "AI-style" match card: driver, vehicle, distance, route match %,
 * and the status timeline.
 *
 * MORNING TODO: this is the money screen — animate the card sliding in,
 * count the route-match % up, script Marcus moving along DEMO_ROUTE on
 * the map behind, then advance to DeliveryConfirm.
 */
export function MatchCard() {
  const setScreen = useStore((s) => s.setScreen)
  const startTransfer = useStore((s) => s.startTransfer)
  const delivery = useStore((s) => s.activeDelivery) ?? DEMO_DELIVERY
  const driver = useStore((s) =>
    s.drivers.find((d) => d.id === delivery.driverId),
  )

  return (
    <div className="mx-auto flex h-full w-full max-w-lg flex-col gap-4 overflow-y-auto p-4">
      <Button
        variant="ghost"
        className="w-fit"
        onClick={() => setScreen('map')}
      >
        <ArrowLeft /> Back
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Match found</CardTitle>
            <Badge variant="secondary" className="gap-1">
              <Route className="size-3" />
              {delivery.routeMatchPct}% route match
            </Badge>
          </div>
          <CardDescription>
            Nearest carrier already heading that way
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-secondary flex size-12 items-center justify-center rounded-full">
              <Truck className="size-6" />
            </div>
            <div>
              <p className="font-semibold">{driver?.name ?? 'Marcus'}</p>
              <p className="text-muted-foreground text-sm">
                {driver?.vehicle ?? 'Pickup truck'} • 3 km away • en route
              </p>
            </div>
          </div>

          <Separator />

          <ol className="flex flex-col gap-3">
            {delivery.timeline.map((step) => (
              <li key={step.label} className="flex items-center gap-3">
                {step.done ? (
                  <CheckCircle2 className="size-5 text-emerald-500" />
                ) : (
                  <Circle className="text-muted-foreground size-5" />
                )}
                <span
                  className={cn(
                    'text-sm',
                    step.done ? 'font-medium' : 'text-muted-foreground',
                  )}
                >
                  {step.label}
                </span>
                <span className="text-muted-foreground ml-auto text-xs tabular-nums">
                  {step.time}
                </span>
              </li>
            ))}
          </ol>

          {/* Advances the arc: plays the hand-over animation, then scores
              the supply drop and reveals the delivery + points. */}
          <Button size="lg" onClick={startTransfer}>
            Confirm hand-over
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

import { BadgeCheck, RotateCcw } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { DEMO_DELIVERY } from '@/lib/seed'
import { useStore } from '@/lib/store'

/**
 * The trust beat: delivery photo + "Delivered • Verified".
 *
 * MORNING TODO: swap assets/delivery-proof.jpg for a real photo and add
 * the reveal animation (photo scales in, verified badge stamps on).
 */
export function DeliveryConfirm() {
  const delivery = useStore((s) => s.activeDelivery) ?? DEMO_DELIVERY
  const need = useStore((s) => s.needs.find((n) => n.id === delivery.needId))
  const resetDemo = useStore((s) => s.resetDemo)

  return (
    <div className="mx-auto flex h-full w-full max-w-lg flex-col gap-4 overflow-y-auto p-4">
      <Card className="overflow-hidden pt-0">
        <img
          src={delivery.photoUrl}
          alt="Delivery proof"
          className="aspect-video w-full object-cover"
        />
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              {need?.community ?? 'Portmore HS Shelter'}
            </CardTitle>
            <Badge className="gap-1 bg-emerald-600 text-white">
              <BadgeCheck className="size-3.5" />
              Delivered • Verified
            </Badge>
          </div>
          <CardDescription>
            Photo confirmation from the drop-off — proof it landed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" className="w-full" onClick={resetDemo}>
            <RotateCcw /> Back to the map
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

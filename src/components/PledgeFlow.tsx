import { useState } from 'react'
import { ArrowLeft, HandHeart, Minus, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useStore } from '@/lib/store'

/**
 * Pledge screen: pick quantities per item, confirm.
 * Confirming records the pledge, moves the need's progress bars, and
 * hands off to the match screen.
 *
 * MORNING TODO: motion polish — slide-in, progress fill animation on
 * confirm, then auto-advance to the match card.
 */
export function PledgeFlow() {
  const need = useStore((s) => s.needs.find((n) => n.id === s.selectedNeedId))
  const setScreen = useStore((s) => s.setScreen)
  const confirmPledge = useStore((s) => s.confirmPledge)

  const [donorName, setDonorName] = useState('')
  const [quantities, setQuantities] = useState<Record<string, number>>({})

  if (!need) {
    return (
      <div className="flex h-full items-center justify-center">
        <Button variant="outline" onClick={() => setScreen('map')}>
          <ArrowLeft /> Back to map
        </Button>
      </div>
    )
  }

  const bump = (name: string, delta: number, max: number) =>
    setQuantities((q) => ({
      ...q,
      [name]: Math.max(0, Math.min(max, (q[name] ?? 0) + delta)),
    }))

  const total = Object.values(quantities).reduce((a, b) => a + b, 0)

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
          <CardTitle className="flex items-center gap-2 text-lg">
            <HandHeart className="text-urgency-critical size-5" />
            Pledge supplies
          </CardTitle>
          <CardDescription>{need.community}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          {need.items.map((item) => {
            const remaining = item.qtyNeeded - item.qtyPledged
            return (
              <div
                key={item.name}
                className="flex items-center justify-between gap-3"
              >
                <div>
                  <p className="text-sm font-medium">{item.name}</p>
                  <p className="text-muted-foreground text-xs">
                    {remaining} {item.unit} still needed
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => bump(item.name, -5, remaining)}
                  >
                    <Minus />
                  </Button>
                  <span className="w-10 text-center text-sm font-semibold tabular-nums">
                    {quantities[item.name] ?? 0}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => bump(item.name, 5, remaining)}
                  >
                    <Plus />
                  </Button>
                </div>
              </div>
            )
          })}

          <div className="flex flex-col gap-2">
            <Label htmlFor="donor-name">Your name or organisation</Label>
            <Input
              id="donor-name"
              placeholder="e.g. Hi-Lo Supermarket"
              maxLength={80}
              value={donorName}
              onChange={(e) => setDonorName(e.target.value)}
            />
          </div>

          <Button
            size="lg"
            disabled={total === 0}
            onClick={() => confirmPledge(donorName, quantities)}
          >
            Confirm pledge
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

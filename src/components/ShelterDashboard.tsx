import { HandHeart, Megaphone, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { HERO_NEED_ID, URGENCY_LABELS } from '@/lib/constants'
import { useStore } from '@/lib/store'

/**
 * The shelter's perspective: their posted need, live pledge progress,
 * and who's pledged so far. Seeded to the hero shelter (Portmore HS) —
 * in the demo this is "your" shelter.
 */
export function ShelterDashboard() {
  const need = useStore((s) => s.needs.find((n) => n.id === HERO_NEED_ID))
  // NB: filter OUTSIDE the selector — a selector returning a fresh array
  // every snapshot sends Zustand v5 into an infinite re-render loop.
  const allPledges = useStore((s) => s.pledges)
  const pledges = allPledges.filter((p) => p.needId === HERO_NEED_ID)
  const setScreen = useStore((s) => s.setScreen)

  if (!need) return null

  return (
    <div className="mx-auto flex h-full w-full max-w-lg flex-col gap-4 overflow-y-auto p-4">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Badge variant={need.urgency}>
              {URGENCY_LABELS[need.urgency]}
            </Badge>
            <span className="text-muted-foreground text-xs">
              {need.parish}
            </span>
          </div>
          <CardTitle className="text-xl">{need.community}</CardTitle>
          <CardDescription className="flex items-center gap-1.5">
            <Users className="size-4" />
            {need.peopleAffected} people sheltering
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {need.items.map((item) => {
            const pct = Math.round((item.qtyPledged / item.qtyNeeded) * 100)
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

          <Separator />

          <div className="flex flex-col gap-3">
            <p className="text-sm font-medium">Incoming pledges</p>
            {pledges.length === 0 && (
              <p className="text-muted-foreground text-sm">
                No pledges yet — the network has been notified.
              </p>
            )}
            {pledges.map((pledge) => (
              <div key={pledge.id} className="flex items-start gap-3">
                <div className="bg-secondary flex size-9 shrink-0 items-center justify-center rounded-full">
                  <HandHeart className="size-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">{pledge.donorName}</p>
                  <p className="text-muted-foreground text-xs">
                    {pledge.items
                      .map((i) => `${i.qtyPledged} ${i.unit} ${i.name}`)
                      .join(' • ')}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <Button size="lg" onClick={() => setScreen('post-need')}>
            <Megaphone /> Post a new need
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

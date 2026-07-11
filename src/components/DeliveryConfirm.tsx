import { motion } from 'motion/react'
import { Award, BadgeCheck, RotateCcw, Sparkles, Trophy } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { BADGE_LABEL, CATEGORY_LABEL } from '@/lib/relief'
import { useStore } from '@/lib/store'

/**
 * The reward beat, shown after a contribution completes.
 *
 * Supply drops get the trust photo ("Delivered • Verified"); groundwork
 * gets a "taken up" confirmation. Both then reveal the points earned and
 * any newly-unlocked badges.
 */
export function DeliveryConfirm() {
  const reward = useStore((s) => s.lastReward)
  const delivery = useStore((s) => s.activeDelivery)
  const resetDemo = useStore((s) => s.resetDemo)

  const isSupply = reward?.category !== 'groundwork'

  return (
    <div className="mx-auto flex h-full w-full max-w-lg flex-col gap-4 overflow-y-auto p-4">
      <Card className="overflow-hidden pt-0">
        {isSupply && delivery?.photoUrl ? (
          <img
            src={delivery.photoUrl}
            alt="Delivery proof"
            className="aspect-video w-full object-cover"
          />
        ) : (
          <div className="bg-secondary flex aspect-video w-full items-center justify-center">
            <BadgeCheck className="size-16 text-emerald-500" />
          </div>
        )}
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-lg">
              {reward?.place ?? 'Portmore HS Shelter'}
            </CardTitle>
            <Badge className="shrink-0 gap-1 bg-emerald-600 text-white">
              <BadgeCheck className="size-3.5" />
              {isSupply ? 'Delivered • Verified' : 'Taken up'}
            </Badge>
          </div>
          <CardDescription>
            {isSupply
              ? 'Photo confirmation from the drop-off — proof it landed.'
              : 'A volunteer is on it — the report is off the board.'}
          </CardDescription>
        </CardHeader>
      </Card>

      {reward && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-2 text-center">
              <div className="flex items-center gap-2">
                <Sparkles className="text-urgency-high size-5" />
                <span className="text-2xl font-bold tabular-nums">
                  +{reward.points}
                </span>
                <span className="text-muted-foreground text-sm">points</span>
              </div>
              <p className="text-muted-foreground text-xs">
                {CATEGORY_LABEL[reward.category]} · you're now at{' '}
                <span className="text-foreground font-semibold">
                  {reward.totalPoints} pts
                </span>
              </p>

              {reward.newBadges.length > 0 && (
                <div className="mt-1 flex w-full flex-col gap-2">
                  {reward.newBadges.map((b) => (
                    <motion.div
                      key={b}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.35, type: 'spring', stiffness: 260 }}
                      className="border-urgency-high/40 bg-urgency-high/10 flex items-center justify-center gap-2 rounded-lg border py-2"
                    >
                      {b === 'top' ? (
                        <Trophy className="text-urgency-high size-4" />
                      ) : (
                        <Award className="text-urgency-high size-4" />
                      )}
                      <span className="text-sm font-semibold">
                        {BADGE_LABEL[b]} unlocked!
                      </span>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      <Button variant="outline" className="w-full" onClick={resetDemo}>
        <RotateCcw /> Back to Supplies Needed
      </Button>
    </div>
  )
}

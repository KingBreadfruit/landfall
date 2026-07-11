import { Award, Trophy } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { useStore } from '@/lib/store'
import { cn } from '@/lib/utils'

/**
 * Community recognition: top contributors, ranked by points. "You" is
 * highlighted so the climb after a contribution is visible.
 */
export function Leaderboard({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const you = useStore((s) => s.you)
  const leaderboard = useStore((s) => s.leaderboard)

  const ranked = [...leaderboard, you].sort((a, b) => b.points - a.points)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="mx-auto max-w-lg pb-6">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Trophy className="text-urgency-high size-5" />
            Top contributors
          </SheetTitle>
          <SheetDescription>
            Who showed up for the island this storm.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-1.5 px-4">
          {ranked.map((c, i) => {
            const isYou = c.id === you.id
            return (
              <div
                key={c.id}
                className={cn(
                  'flex items-center gap-3 rounded-lg border p-2.5',
                  isYou
                    ? 'border-primary bg-primary/5'
                    : 'border-transparent',
                )}
              >
                <span className="text-muted-foreground w-5 shrink-0 text-center text-sm font-semibold tabular-nums">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-sm font-medium">
                      {c.name}
                    </span>
                    {c.badges.includes('top') && (
                      <Trophy className="text-urgency-high size-3.5 shrink-0" />
                    )}
                    {c.badges.includes('verified') && (
                      <Award className="text-urgency-normal size-3.5 shrink-0" />
                    )}
                  </div>
                  <p className="text-muted-foreground text-xs">
                    {c.contributions}{' '}
                    {c.contributions === 1 ? 'contribution' : 'contributions'}
                  </p>
                </div>
                <Badge variant={isYou ? 'default' : 'secondary'} className="shrink-0 tabular-nums">
                  {c.points} pts
                </Badge>
              </div>
            )
          })}
        </div>
      </SheetContent>
    </Sheet>
  )
}

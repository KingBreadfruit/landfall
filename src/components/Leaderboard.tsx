import { Award, LogOut, Trophy } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import type { BadgeKind } from '@/lib/types'
import { useAuth } from '@/lib/auth'
import { useStore } from '@/lib/store'
import { cn } from '@/lib/utils'

/**
 * Community recognition: top contributors, ranked by points. "You" (your
 * real, persisted profile) is highlighted so the climb after a
 * contribution is visible. Other contributors are demo dressing.
 */
export function Leaderboard({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const profile = useAuth((s) => s.profile)
  const signOut = useAuth((s) => s.signOut)
  const others = useStore((s) => s.leaderboard)

  const you = {
    id: profile?.id ?? 'you',
    name: 'You',
    points: profile?.points ?? 0,
    contributions: 0,
    badges: (profile?.badges ?? []) as BadgeKind[],
  }
  const ranked = [...others, you].sort((a, b) => b.points - a.points)

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
                    {isYou
                      ? "That's you"
                      : `${c.contributions} ${c.contributions === 1 ? 'contribution' : 'contributions'}`}
                  </p>
                </div>
                <Badge variant={isYou ? 'default' : 'secondary'} className="shrink-0 tabular-nums">
                  {c.points} pts
                </Badge>
              </div>
            )
          })}
        </div>

        <div className="mt-2 flex items-center justify-between px-4">
          <span className="text-muted-foreground truncate text-xs">
            Signed in as {profile?.name ?? 'you'}
          </span>
          <button
            type="button"
            onClick={() => signOut()}
            className="text-muted-foreground flex shrink-0 cursor-pointer items-center gap-1 text-xs font-medium"
          >
            <LogOut className="size-3.5" /> Sign out
          </button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

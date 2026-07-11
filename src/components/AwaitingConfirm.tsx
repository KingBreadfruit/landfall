import { Clock, Hammer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useStore } from '@/lib/store'

/**
 * Volunteer waiting screen after taking up a repair. Points are held until
 * the resident who reported it confirms the work is done — this makes the
 * recognition trustworthy (you can't score points for work nobody verifies).
 */
export function AwaitingConfirm() {
  const setScreen = useStore((s) => s.setScreen)
  const place = useStore((s) => s.pendingPlace)

  return (
    <div className="mx-auto flex h-full w-full max-w-lg flex-col items-center justify-center gap-4 p-6 text-center">
      <div className="bg-urgency-high/10 text-urgency-high flex size-16 items-center justify-center rounded-2xl">
        <Hammer className="size-8" />
      </div>
      <h1 className="text-xl font-bold">Marked as done</h1>
      <p className="text-muted-foreground max-w-xs text-sm">
        {place ? `“${place}” — ` : ''}we've let the resident know. Your{' '}
        <span className="text-foreground font-semibold">10 points</span> are
        released the moment they confirm the work is done.
      </p>
      <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
        <Clock className="size-3.5" /> Waiting on resident confirmation
      </div>
      <Button variant="outline" onClick={() => setScreen('map')}>
        Back to the board
      </Button>
    </div>
  )
}

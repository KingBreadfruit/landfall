import { LifeBuoy, WifiOff } from 'lucide-react'
import { APP_NAME } from '@/lib/constants'
import { useStore } from '@/lib/store'
import { cn } from '@/lib/utils'

/**
 * App header: logo + the offline badge.
 *
 * The badge is a pitch beat — click the logo mark to toggle it during the
 * demo ("Offline — 3 pending • will sync when signal returns"). The app
 * itself genuinely works offline via the PWA service worker; the badge is
 * the visual reinforcement.
 */
export function Header() {
  const offlineMode = useStore((s) => s.offlineMode)
  const toggleOfflineMode = useStore((s) => s.toggleOfflineMode)

  return (
    <header className="relative z-20 flex h-14 items-center justify-between border-b bg-background/95 px-4 backdrop-blur">
      <button
        type="button"
        onClick={toggleOfflineMode}
        className="flex cursor-pointer items-center gap-2 border-none bg-transparent p-0"
        title="Toggle offline badge (demo)"
      >
        <LifeBuoy className="size-6 text-urgency-critical" />
        <span className="text-lg font-bold tracking-tight">{APP_NAME}</span>
      </button>

      <div
        className={cn(
          'flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium transition-opacity',
          offlineMode
            ? 'border-urgency-high/40 bg-urgency-high/10 text-urgency-high opacity-100'
            : 'pointer-events-none opacity-0',
        )}
      >
        <WifiOff className="size-3.5" />
        <span>Offline — 3 pending • will sync when signal returns</span>
      </div>
    </header>
  )
}

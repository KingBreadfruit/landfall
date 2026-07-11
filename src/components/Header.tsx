import { useEffect } from 'react'
import { APP_NAME } from '@/lib/constants'
import { useStore } from '@/lib/store'
import { cn } from '@/lib/utils'

/**
 * Storm-dispatch header: radar mark + wordmark, and a live online/offline
 * status pill (auto from the browser; tap to toggle for the pitch).
 */
export function Header() {
  const offline = useStore((s) => s.offlineMode)
  const toggleOfflineMode = useStore((s) => s.toggleOfflineMode)
  const setOfflineMode = useStore((s) => s.setOfflineMode)

  useEffect(() => {
    const goOffline = () => setOfflineMode(true)
    const goOnline = () => setOfflineMode(false)
    window.addEventListener('offline', goOffline)
    window.addEventListener('online', goOnline)
    if (!navigator.onLine) setOfflineMode(true)
    return () => {
      window.removeEventListener('offline', goOffline)
      window.removeEventListener('online', goOnline)
    }
  }, [setOfflineMode])

  return (
    <header className="relative z-20 flex items-center justify-between gap-2 border-b border-border/60 bg-background/80 px-[18px] pt-[env(safe-area-inset-top)] pb-3 backdrop-blur">
      <div className="flex items-center gap-[11px]">
        <div
          className="flex size-[38px] items-center justify-center rounded-xl"
          style={{ background: '#161d26', boxShadow: 'inset 0 0 0 1px rgba(255,176,32,.28)' }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9.2" stroke="#ffb020" strokeWidth="1.4" opacity=".45" />
            <circle cx="12" cy="12" r="5" stroke="#ffb020" strokeWidth="1.4" opacity=".8" />
            <circle cx="12" cy="12" r="1.9" fill="#ffb020" />
          </svg>
        </div>
        <div className="flex flex-col gap-px">
          <span className="text-lg font-bold leading-none tracking-tight">
            {APP_NAME}
          </span>
          <span className="mono-label text-[8.5px] font-bold text-muted-foreground">
            Dispatch · JM
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={toggleOfflineMode}
        className={cn(
          'mono-label flex h-[30px] shrink-0 items-center gap-1.5 rounded-[9px] border px-[11px] text-[9px] font-bold',
          offline
            ? 'border-urgency-high/45 bg-urgency-high/10 text-urgency-high'
            : 'border-success/40 bg-success/10 text-success',
        )}
        title="Toggle offline (demo)"
      >
        <span
          className="block size-1.5 rounded-full bg-current"
          style={{ animation: 'lf-blink 1.6s infinite' }}
        />
        {offline ? 'Offline · 3 pending' : 'Online'}
      </button>
    </header>
  )
}

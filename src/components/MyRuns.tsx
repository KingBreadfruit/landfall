import { ArrowLeft, ChevronRight, PackageCheck } from 'lucide-react'
import type { RunStatus } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { useStore } from '@/lib/store'

const STATUS_META: Record<
  RunStatus,
  { label: string; variant: 'default' | 'secondary' | 'high' }
> = {
  to_photograph: { label: 'Photo needed', variant: 'high' },
  pending: { label: 'Verifying', variant: 'secondary' },
  verified: { label: 'Ready to drop', variant: 'default' },
  delivered: { label: 'Delivered', variant: 'secondary' },
}

/** The volunteer's claimed runs — tap one to photograph, verify, and drop. */
export function MyRuns() {
  const runs = useStore((s) => s.runs)
  const openRun = useStore((s) => s.openRun)
  const setScreen = useStore((s) => s.setScreen)

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="border-b px-4 py-3">
        <button
          type="button"
          onClick={() => setScreen('map')}
          className="text-muted-foreground -ml-1 mb-1 flex cursor-pointer items-center gap-1 text-sm"
        >
          <ArrowLeft className="size-4" /> Supplies
        </button>
        <h1 className="text-lg font-bold tracking-tight">My runs</h1>
        <p className="text-muted-foreground text-xs">{runs.length} claimed</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {runs.length === 0 ? (
          <div className="text-muted-foreground flex flex-col items-center gap-2 pt-16 text-center text-sm">
            <PackageCheck className="size-8" />
            No runs yet. Claim one from Supplies Needed.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {runs.map((run) => {
              const meta = STATUS_META[run.status]
              return (
                <button
                  key={run.id}
                  type="button"
                  onClick={() => openRun(run.id)}
                  className="flex w-full items-center gap-3 rounded-xl border bg-card p-3 text-left shadow-sm transition-colors hover:bg-accent"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-semibold">
                        {run.requesterName}
                      </span>
                      <Badge variant={meta.variant} className="shrink-0">
                        {meta.label}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mt-0.5 truncate text-xs">
                      {run.items.map((i) => i.name).join(' · ')} · to{' '}
                      {run.shelterName}
                    </p>
                  </div>
                  <ChevronRight className="text-muted-foreground size-4 shrink-0" />
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

import { useState } from 'react'
import {
  Camera,
  CheckCircle2,
  ChevronRight,
  RotateCcw,
  ShoppingBasket,
  Warehouse,
  WifiOff,
} from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { locationLabel } from '@/lib/needs'
import { useStore } from '@/lib/store'
import { RequestSupplies } from './RequestSupplies'
import { ReportDamage } from './ReportDamage'

type View = 'home' | 'supplies' | 'damage' | 'sent-supplies' | 'sent-damage'

/**
 * The citizen's perspective — the calmest tab in the app. Someone whose
 * home just got wrecked, no light, no internet: two big buttons, nothing
 * to read. Request supplies, or report damage. Nearby shelters stay
 * cached on the phone in case the signal is gone.
 */
export function RequestHelp() {
  const [view, setView] = useState<View>('home')

  if (view === 'supplies')
    return (
      <RequestSupplies
        onBack={() => setView('home')}
        onSent={() => setView('sent-supplies')}
      />
    )

  if (view === 'damage')
    return (
      <ReportDamage
        onBack={() => setView('home')}
        onSent={() => setView('sent-damage')}
      />
    )

  if (view === 'sent-supplies' || view === 'sent-damage') {
    const supplies = view === 'sent-supplies'
    return (
      <div className="mx-auto flex h-full w-full max-w-lg flex-col items-center justify-center gap-4 p-6 text-center">
        <CheckCircle2 className="size-14 text-emerald-500" />
        <h1 className="text-xl font-bold">
          {supplies ? 'Request sent' : 'Damage reported'}
        </h1>
        <p className="text-muted-foreground text-sm">
          {supplies
            ? "It's on the board now — volunteers nearby can pick up your run. If you lose signal, it stays saved on this phone and sends the moment signal returns."
            : "Volunteers have been alerted. Anyone nearby with the right hands or a vehicle can take it up — you don't have to wait on a crew."}
        </p>
        <Button variant="outline" onClick={() => setView('home')}>
          <RotateCcw /> Done
        </Button>
      </div>
    )
  }

  return <RequestHome onPick={setView} />
}

function RequestHome({ onPick }: { onPick: (v: View) => void }) {
  const [sheltersOpen, setSheltersOpen] = useState(false)

  return (
    <div className="mx-auto flex h-full w-full max-w-lg flex-col gap-4 overflow-y-auto p-4">
      <div className="pt-2">
        <h1 className="text-2xl font-bold tracking-tight">Need help?</h1>
        <p className="text-muted-foreground text-sm">
          Tap one. We'll do the rest.
        </p>
      </div>

      {/* offline reassurance — shelters are cached on this phone */}
      <button
        type="button"
        onClick={() => setSheltersOpen(true)}
        className="border-urgency-high/40 bg-urgency-high/10 flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left"
      >
        <WifiOff className="text-urgency-high size-4 shrink-0" />
        <span className="flex-1 text-xs font-medium">
          No signal? Nearby shelters are saved on this phone — tap to see them
        </span>
        <ChevronRight className="text-muted-foreground size-4 shrink-0" />
      </button>

      <button
        type="button"
        onClick={() => onPick('supplies')}
        className="flex items-center gap-4 rounded-2xl border bg-card p-5 text-left shadow-sm transition-colors hover:bg-accent"
      >
        <div className="bg-urgency-critical/10 text-urgency-critical flex size-14 shrink-0 items-center justify-center rounded-xl">
          <ShoppingBasket className="size-7" />
        </div>
        <div className="flex-1">
          <p className="text-lg font-semibold">Request supplies</p>
          <p className="text-muted-foreground text-sm">
            Water, food, tarps, baby supplies…
          </p>
        </div>
        <ChevronRight className="text-muted-foreground size-5" />
      </button>

      <button
        type="button"
        onClick={() => onPick('damage')}
        className="flex items-center gap-4 rounded-2xl border bg-card p-5 text-left shadow-sm transition-colors hover:bg-accent"
      >
        <div className="bg-urgency-normal/10 text-urgency-normal flex size-14 shrink-0 items-center justify-center rounded-xl">
          <Camera className="size-7" />
        </div>
        <div className="flex-1">
          <p className="text-lg font-semibold">Report damage</p>
          <p className="text-muted-foreground text-sm">
            Blocked road, torn roof, fallen tree…
          </p>
        </div>
        <ChevronRight className="text-muted-foreground size-5" />
      </button>

      <NearbySheltersSheet open={sheltersOpen} onOpenChange={setSheltersOpen} />
    </div>
  )
}

function NearbySheltersSheet({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const shelters = useStore((s) => s.shelters)
  const needs = useStore((s) => s.needs)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="mx-auto max-w-lg pb-6">
        <SheetHeader>
          <SheetTitle>Nearby shelters</SheetTitle>
          <SheetDescription>
            Saved on this phone — visible even with no signal.
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-2 px-4">
          {shelters.map((shelter) => {
            const need = needs.find((n) => n.id === shelter.needId)
            if (!need) return null
            const spaces = shelter.capacity - need.peopleAffected
            return (
              <div
                key={shelter.needId}
                className="flex items-center gap-3 rounded-xl border bg-card p-3"
              >
                <div className="bg-secondary flex size-9 shrink-0 items-center justify-center rounded-lg">
                  <Warehouse className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {need.community}
                  </p>
                  <p className="text-muted-foreground truncate text-xs">
                    {locationLabel(need)}
                  </p>
                </div>
                <span
                  className={cnSpaces(spaces)}
                >
                  {spaces > 0 ? `${spaces} spaces` : 'Full'}
                </span>
              </div>
            )
          })}
        </div>
      </SheetContent>
    </Sheet>
  )
}

function cnSpaces(spaces: number): string {
  return spaces > 0
    ? 'shrink-0 text-xs font-medium text-emerald-600'
    : 'shrink-0 text-xs font-medium text-urgency-high'
}

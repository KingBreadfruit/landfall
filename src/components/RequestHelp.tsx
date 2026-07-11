import { useMemo, useState } from 'react'
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  ChevronRight,
  QrCode,
  RotateCcw,
  ShoppingBasket,
  Warehouse,
  WifiOff,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DROPOFF_SHELTER, HERO_NEED_ID } from '@/lib/constants'
import { MockQR } from './MockQR'
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

type View =
  | 'home'
  | 'supplies'
  | 'damage'
  | 'sent-supplies'
  | 'sent-damage'
  | 'collect'
  | 'checkin'
  | 'sent-checkin'

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

  if (view === 'collect')
    return <CollectDrop onBack={() => setView('home')} />

  if (view === 'checkin')
    return (
      <ShelterCheckIn
        onBack={() => setView('home')}
        onSent={() => setView('sent-checkin')}
      />
    )

  if (view === 'sent-checkin')
    return (
      <div className="mx-auto flex h-full w-full max-w-lg flex-col items-center justify-center gap-4 p-6 text-center">
        <CheckCircle2 className="size-14 text-emerald-500" />
        <h1 className="text-xl font-bold">You're on the list</h1>
        <p className="text-muted-foreground text-sm">
          {DROPOFF_SHELTER.name} has been told you're on the way. Show up and
          staff will check you in.
        </p>
        <Button variant="outline" onClick={() => setView('home')}>
          <RotateCcw /> Done
        </Button>
      </div>
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

      <button
        type="button"
        onClick={() => onPick('checkin')}
        className="flex items-center gap-4 rounded-2xl border bg-card p-5 text-left shadow-sm transition-colors hover:bg-accent"
      >
        <div className="bg-urgency-high/10 text-urgency-high flex size-14 shrink-0 items-center justify-center rounded-xl">
          <Warehouse className="size-7" />
        </div>
        <div className="flex-1">
          <p className="text-lg font-semibold">I'm going to a shelter</p>
          <p className="text-muted-foreground text-sm">
            Let staff know you're on the way
          </p>
        </div>
        <ChevronRight className="text-muted-foreground size-5" />
      </button>

      <button
        type="button"
        onClick={() => onPick('collect')}
        className="flex items-center gap-4 rounded-2xl border bg-card p-5 text-left shadow-sm transition-colors hover:bg-accent"
      >
        <div className="bg-primary/10 text-primary flex size-14 shrink-0 items-center justify-center rounded-xl">
          <QrCode className="size-7" />
        </div>
        <div className="flex-1">
          <p className="text-lg font-semibold">Collect a supply drop</p>
          <p className="text-muted-foreground text-sm">
            Show your code at the shelter
          </p>
        </div>
        <ChevronRight className="text-muted-foreground size-5" />
      </button>

      <NearbySheltersSheet open={sheltersOpen} onOpenChange={setSheltersOpen} />
    </div>
  )
}

/** Citizen's collection QR — mock, mirrors the volunteer drop-off code. */
function CollectDrop({ onBack }: { onBack: () => void }) {
  const token = useMemo(
    () => Math.random().toString(36).slice(2, 8).toUpperCase(),
    [],
  )
  return (
    <div className="flex h-full flex-col">
      <div className="border-b px-4 py-3">
        <button
          type="button"
          onClick={onBack}
          className="text-muted-foreground -ml-1 mb-1 flex cursor-pointer items-center gap-1 text-sm"
        >
          <ArrowLeft className="size-4" /> Back
        </button>
        <h1 className="flex items-center gap-2 text-lg font-bold tracking-tight">
          <QrCode className="text-primary size-5" /> Collect your drop
        </h1>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-5 p-6 text-center">
        <div className="rounded-2xl border bg-white p-4">
          <MockQR token={token} />
        </div>
        <div>
          <p className="text-sm font-semibold">Code {token}</p>
          <p className="text-muted-foreground mt-1 max-w-xs text-sm">
            Show this to staff at {DROPOFF_SHELTER.name}. They scan to confirm
            it's you, then hand over your supplies.
          </p>
        </div>
      </div>
    </div>
  )
}

/** Citizen declares they're heading to the shelter → shelter Incoming. */
function ShelterCheckIn({
  onBack,
  onSent,
}: {
  onBack: () => void
  onSent: () => void
}) {
  const declareIncoming = useStore((s) => s.declareIncoming)
  const [name, setName] = useState('')
  return (
    <div className="flex h-full flex-col">
      <div className="border-b px-4 py-3">
        <button
          type="button"
          onClick={onBack}
          className="text-muted-foreground -ml-1 mb-1 flex cursor-pointer items-center gap-1 text-sm"
        >
          <ArrowLeft className="size-4" /> Back
        </button>
        <h1 className="flex items-center gap-2 text-lg font-bold tracking-tight">
          <Warehouse className="text-urgency-high size-5" /> Going to a shelter
        </h1>
        <p className="text-muted-foreground text-xs">
          {DROPOFF_SHELTER.name} · {DROPOFF_SHELTER.address}
        </p>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="ci-name">Your name</Label>
          <Input
            id="ci-name"
            maxLength={80}
            placeholder="e.g. Marlene B."
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
      </div>
      <div className="border-t p-4">
        <Button
          size="lg"
          className="w-full"
          disabled={!name.trim()}
          onClick={() => {
            declareIncoming(HERO_NEED_ID, name)
            onSent()
          }}
        >
          I'm on my way
        </Button>
      </div>
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

import { useMemo, useState } from 'react'
import { ArrowLeft, Minus, Plus, ShoppingBasket } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RELIEF_CATALOG, itemCap, totalCap, unitLabel } from '@/lib/relief'
import type { Coords } from '@/lib/geo'
import { useStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import { LocationCapture } from './LocationCapture'

/**
 * Supply request "shopping list" of relief items — used by citizens
 * (capped by household size so no one hoards → posts a person-need) and by
 * shelters (bulk, no cap → populates the shelter's own request).
 */
export function RequestSupplies({
  mode = 'citizen',
  onBack,
  onSent,
}: {
  mode?: 'citizen' | 'shelter'
  onBack: () => void
  onSent: () => void
}) {
  const isShelter = mode === 'shelter'
  const submitSupplyRequest = useStore((s) => s.submitSupplyRequest)
  const submitShelterRequest = useStore((s) => s.submitShelterRequest)
  const [name, setName] = useState('')
  const [area, setArea] = useState('Gregory Park, Portmore')
  const [household, setHousehold] = useState(4)
  const [coords, setCoords] = useState<Coords | null>(null)
  const [qtys, setQtys] = useState<Record<string, number>>({})

  const caps = useMemo(
    () =>
      Object.fromEntries(
        RELIEF_CATALOG.map((it) => [
          it.name,
          isShelter ? 999 : itemCap(it, household),
        ]),
      ),
    [household, isShelter],
  )

  const total = RELIEF_CATALOG.reduce(
    (sum, it) => sum + Math.min(qtys[it.name] ?? 0, caps[it.name]),
    0,
  )

  // Citizens have a total budget so no one requests one of everything.
  const maxTotal = isShelter ? Infinity : totalCap(household)
  const atBudget = total >= maxTotal

  const bump = (name: string, delta: number, cap: number) =>
    setQtys((q) => ({
      ...q,
      [name]: Math.max(0, Math.min(cap, (q[name] ?? 0) + delta)),
    }))

  const send = () => {
    const selections = Object.fromEntries(
      RELIEF_CATALOG.map((it) => [
        it.name,
        { qty: Math.min(qtys[it.name] ?? 0, caps[it.name]), unit: it.unit },
      ]),
    )
    if (isShelter) submitShelterRequest(selections)
    else
      submitSupplyRequest({
        name,
        area,
        household,
        selections,
        lat: coords?.lat,
        lng: coords?.lng,
      })
    onSent()
  }

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
          <ShoppingBasket className="text-urgency-critical size-5" />
          {isShelter ? 'Request goods' : 'Request supplies'}
        </h1>
        <p className="text-muted-foreground text-xs">
          {isShelter
            ? 'What the shelter needs — this posts a request to volunteers.'
            : 'Pick what your household needs. Limits keep it fair for everyone.'}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {!isShelter && (
          <div className="mb-4 flex flex-col gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="req-name">Your name</Label>
              <Input
                id="req-name"
                maxLength={80}
                placeholder="e.g. Marlene B."
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="req-area">Where are you?</Label>
              <Input
                id="req-area"
                maxLength={120}
                value={area}
                onChange={(e) => setArea(e.target.value)}
              />
            </div>
            <LocationCapture value={coords} onChange={setCoords} />
            <div className="flex items-center justify-between">
              <Label>People in your household</Label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setHousehold((h) => Math.max(1, h - 1))}
                >
                  <Minus />
                </Button>
                <span className="w-8 text-center text-sm font-semibold tabular-nums">
                  {household}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setHousehold((h) => Math.min(20, h + 1))}
                >
                  <Plus />
                </Button>
              </div>
            </div>
            <p
              className={cn(
                'text-xs',
                atBudget ? 'text-urgency-high font-medium' : 'text-muted-foreground',
              )}
            >
              {total} of {maxTotal} items chosen
              {atBudget ? ' · limit reached' : ''}
            </p>
          </div>
        )}

        <div className="flex flex-col gap-2">
          {RELIEF_CATALOG.map((item) => {
            const cap = caps[item.name]
            const qty = Math.min(qtys[item.name] ?? 0, cap)
            return (
              <div
                key={item.name}
                className="flex items-center justify-between gap-3 rounded-xl border bg-card p-3 shadow-sm"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{item.name}</p>
                  <p className="text-muted-foreground text-xs">
                    {isShelter
                      ? item.unit
                      : `up to ${cap} ${unitLabel(cap, item.unit)}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    disabled={qty === 0}
                    onClick={() => bump(item.name, -1, cap)}
                  >
                    <Minus />
                  </Button>
                  <span className="w-6 text-center text-sm font-semibold tabular-nums">
                    {qty}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    disabled={qty >= cap || atBudget}
                    onClick={() => bump(item.name, 1, cap)}
                  >
                    <Plus />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="border-t p-4">
        <Button size="lg" className="w-full" disabled={total === 0} onClick={send}>
          Send request{total > 0 ? ` · ${total} items` : ''}
        </Button>
      </div>
    </div>
  )
}

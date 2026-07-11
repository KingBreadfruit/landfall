import { useMemo, useState } from 'react'
import { ArrowLeft, Minus, Plus, ShoppingBasket } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RELIEF_CATALOG, itemCap } from '@/lib/relief'
import { useStore } from '@/lib/store'

/**
 * Citizen supply request: a scrollable "shopping list" of relief items.
 * Per-item quantity is capped by household size so no one hoards. Sending
 * posts a person-need onto the Supplies Needed board.
 */
export function RequestSupplies({
  onBack,
  onSent,
}: {
  onBack: () => void
  onSent: () => void
}) {
  const submitSupplyRequest = useStore((s) => s.submitSupplyRequest)
  const [name, setName] = useState('')
  const [area, setArea] = useState('Gregory Park, Portmore')
  const [household, setHousehold] = useState(4)
  const [qtys, setQtys] = useState<Record<string, number>>({})

  const caps = useMemo(
    () =>
      Object.fromEntries(
        RELIEF_CATALOG.map((it) => [it.name, itemCap(it, household)]),
      ),
    [household],
  )

  const total = RELIEF_CATALOG.reduce(
    (sum, it) => sum + Math.min(qtys[it.name] ?? 0, caps[it.name]),
    0,
  )

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
    submitSupplyRequest({ name, area, household, selections })
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
          Request supplies
        </h1>
        <p className="text-muted-foreground text-xs">
          Pick what your household needs. Limits keep it fair for everyone.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
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
        </div>

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
                    up to {cap} {item.unit}
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
                    disabled={qty >= cap}
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

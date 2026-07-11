import { useState } from 'react'
import {
  ArrowLeft,
  BadgeCheck,
  HandHeart,
  IdCard,
  Megaphone,
  Navigation,
  Phone,
  QrCode,
  TriangleAlert,
  UserPlus,
  Users,
} from 'lucide-react'
import type { IncomingGuest } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { directionsUrl, URGENCY_LABELS } from '@/lib/constants'
import { locationLabel } from '@/lib/needs'
import { useStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import { LogPersonSheet } from './LogPersonSheet'

type Tab = 'occupants' | 'incoming' | 'supplies'

/**
 * A single shelter, from the government-official perspective: exactly who
 * is inside (roster with TRN + DOB), who's on the way (with the amber
 * no-show alert), and the shelter's supply needs + pledges.
 */
export function ShelterDetail() {
  const shelterId = useStore((s) => s.selectedShelterId)
  const shelter = useStore((s) =>
    s.shelters.find((sh) => sh.needId === s.selectedShelterId),
  )
  const need = useStore((s) => s.needs.find((n) => n.id === s.selectedShelterId))
  const allPledges = useStore((s) => s.pledges)
  const selectShelter = useStore((s) => s.selectShelter)
  const setScreen = useStore((s) => s.setScreen)

  const [tab, setTab] = useState<Tab>('occupants')
  const [logOpen, setLogOpen] = useState(false)

  if (!shelter || !need || !shelterId) return null

  const pledges = allPledges.filter((p) => p.needId === shelterId)
  const sheltering = need.peopleAffected
  const pct = Math.round((sheltering / shelter.capacity) * 100)
  const incomingCount = shelter.incoming.filter(
    (g) => g.status !== 'arrived',
  ).length

  const TABS: { id: Tab; label: string; count?: number }[] = [
    { id: 'occupants', label: 'Occupants', count: shelter.occupants.length },
    { id: 'incoming', label: 'Incoming', count: incomingCount },
    { id: 'supplies', label: 'Supplies' },
  ]

  return (
    <div className="flex h-full flex-col">
      {/* header */}
      <div className="border-b px-4 py-3">
        <button
          type="button"
          onClick={() => selectShelter(null)}
          className="text-muted-foreground -ml-1 mb-1 flex cursor-pointer items-center gap-1 text-sm"
        >
          <ArrowLeft className="size-4" /> Shelters
        </button>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h1 className="text-lg font-bold tracking-tight">
              {need.community}
            </h1>
            <p className="text-muted-foreground text-xs">
              {locationLabel(need)}
            </p>
          </div>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="shrink-0"
          >
            <a
              href={directionsUrl(need.lat, need.lng)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Navigation /> Directions
            </a>
          </Button>
        </div>

        <div className="mt-2 flex items-center gap-2">
          <Progress value={pct} className="h-1.5" />
          <span className="text-muted-foreground flex shrink-0 items-center gap-1 text-xs font-medium tabular-nums">
            <Users className="size-3" />
            {sheltering}/{shelter.capacity}
          </span>
        </div>

        {/* tabs */}
        <div className="mt-3 flex gap-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              aria-pressed={tab === t.id}
              className={cn(
                'flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors',
                tab === t.id
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'text-muted-foreground',
              )}
            >
              {t.label}
              {t.count !== undefined && t.count > 0 && (
                <span
                  className={cn(
                    'rounded-full px-1.5 text-[10px] tabular-nums',
                    tab === t.id
                      ? 'bg-primary-foreground/20'
                      : 'bg-secondary',
                  )}
                >
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* content */}
      <div className="flex-1 overflow-y-auto p-4">
        {tab === 'occupants' && (
          <div className="flex flex-col gap-3">
            <Button onClick={() => setLogOpen(true)}>
              <UserPlus /> Log a resident
            </Button>
            <p className="text-muted-foreground text-xs">
              {shelter.occupants.length} logged via Landfall
            </p>
            <div className="flex flex-col gap-2">
              {shelter.occupants.map((occ) => (
                <div
                  key={occ.id}
                  className="flex items-center gap-3 rounded-xl border bg-card p-3 shadow-sm"
                >
                  <div className="bg-secondary flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
                    {occ.name
                      .split(' ')
                      .map((p) => p[0])
                      .slice(0, 2)
                      .join('')}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{occ.name}</p>
                    <p className="text-muted-foreground flex flex-wrap gap-x-3 text-xs">
                      <span className="flex items-center gap-1">
                        <IdCard className="size-3" /> TRN {occ.trn}
                      </span>
                      <span>DOB {occ.dob}</span>
                    </p>
                  </div>
                  <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
                    {occ.checkedInAt}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'incoming' && (
          <div className="flex flex-col gap-2">
            {incomingCount === 0 && (
              <p className="text-muted-foreground text-sm">
                No one currently on the way.
              </p>
            )}
            {shelter.incoming
              .filter((g) => g.status !== 'arrived')
              .map((guest) => (
                <IncomingCard
                  key={guest.id}
                  guest={guest}
                  onCheckIn={() =>
                    useStore.getState().checkInGuest(shelterId, guest.id)
                  }
                />
              ))}
          </div>
        )}

        {tab === 'supplies' && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Badge variant={need.urgency}>
                {URGENCY_LABELS[need.urgency]}
              </Badge>
              <span className="text-muted-foreground text-xs">
                Supply request
              </span>
            </div>
            {need.items.map((item) => {
              const p = Math.round((item.qtyPledged / item.qtyNeeded) * 100)
              return (
                <div key={item.name} className="flex flex-col gap-1.5">
                  <div className="flex items-baseline justify-between text-sm">
                    <span className="font-medium">{item.name}</span>
                    <span className="text-muted-foreground">
                      {item.qtyPledged} / {item.qtyNeeded} {item.unit}
                    </span>
                  </div>
                  <Progress value={p} />
                </div>
              )
            })}

            <Separator />

            <div className="flex flex-col gap-3">
              <p className="text-sm font-medium">Incoming pledges</p>
              {pledges.length === 0 && (
                <p className="text-muted-foreground text-sm">
                  No pledges yet — the network has been notified.
                </p>
              )}
              {pledges.map((pledge) => (
                <div key={pledge.id} className="flex items-start gap-3">
                  <div className="bg-secondary flex size-9 shrink-0 items-center justify-center rounded-full">
                    <HandHeart className="size-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{pledge.donorName}</p>
                    <p className="text-muted-foreground text-xs">
                      {pledge.items
                        .map((i) => `${i.qtyPledged} ${i.unit} ${i.name}`)
                        .join(' • ')}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <Button variant="outline" onClick={() => setScreen('post-need')}>
              <Megaphone /> Post a new need
            </Button>
          </div>
        )}
      </div>

      <LogPersonSheet
        shelterId={shelterId}
        open={logOpen}
        onOpenChange={setLogOpen}
      />
    </div>
  )
}

function IncomingCard({
  guest,
  onCheckIn,
}: {
  guest: IncomingGuest
  onCheckIn: () => void
}) {
  const overdue = guest.status === 'overdue'
  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-xl border bg-card p-3 shadow-sm',
        overdue && 'landfall-amber-flash',
      )}
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{guest.name}</p>
          <p className="text-muted-foreground text-xs">
            TRN {guest.trn} · DOB {guest.dob}
          </p>
        </div>
        {overdue ? (
          <Badge variant="high" className="shrink-0 gap-1">
            <TriangleAlert className="size-3" /> Overdue
          </Badge>
        ) : (
          <Badge variant="secondary" className="shrink-0">
            ETA {guest.eta}
          </Badge>
        )}
      </div>

      {overdue ? (
        <div className="flex flex-col gap-2">
          <p className="text-urgency-high text-xs font-medium">
            Expected {guest.eta} — not arrived. Last seen: {guest.lastSeen}
          </p>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm" className="flex-1">
              <a href={`tel:${guest.phone.replace(/[^0-9+]/g, '')}`}>
                <Phone /> {guest.phone}
              </a>
            </Button>
            <Button size="sm" className="flex-1" onClick={onCheckIn}>
              <BadgeCheck /> Mark arrived
            </Button>
          </div>
        </div>
      ) : (
        <Button size="sm" onClick={onCheckIn}>
          <QrCode /> Scan &amp; check in
        </Button>
      )}
    </div>
  )
}

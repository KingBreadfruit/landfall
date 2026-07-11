import { useRef } from 'react'
import {
  ArrowLeft,
  BadgeCheck,
  Camera,
  MapPin,
  Navigation,
  ShieldCheck,
  Truck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { directionsUrl } from '@/lib/constants'
import { useStore } from '@/lib/store'
import { MockQR } from './MockQR'

/**
 * One claimed run, driven by its status:
 *   photograph the items → admin verifies → QR + drop-off shown → deliver.
 */
export function RunDetail() {
  const run = useStore((s) => s.runs.find((r) => r.id === s.activeRunId))
  const uploadRunPhoto = useStore((s) => s.uploadRunPhoto)
  const verifyActiveRun = useStore((s) => s.verifyActiveRun)
  const completeActiveRun = useStore((s) => s.completeActiveRun)
  const backToRuns = useStore((s) => s.backToRuns)
  const fileRef = useRef<HTMLInputElement>(null)

  if (!run) return null

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) uploadRunPhoto(URL.createObjectURL(file))
  }

  return (
    <div className="mx-auto flex h-full w-full max-w-lg flex-col gap-4 overflow-y-auto p-4">
      <button
        type="button"
        onClick={backToRuns}
        className="text-muted-foreground -ml-1 flex w-fit cursor-pointer items-center gap-1 text-sm"
      >
        <ArrowLeft className="size-4" /> My runs
      </button>

      <div>
        <h1 className="text-xl font-bold tracking-tight">
          {run.requesterName}
        </h1>
        <p className="text-muted-foreground text-sm">{run.area}</p>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-1.5">
          {run.items.map((it) => (
            <div key={it.name} className="flex justify-between text-sm">
              <span className="font-medium">{it.name}</span>
              <span className="text-muted-foreground">
                {it.qty} {it.unit}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Step 1 — photograph the items */}
      {run.status === 'to_photograph' && (
        <>
          <p className="text-muted-foreground text-sm">
            Photograph <b>all</b> the items to claim this run. No verified
            photo, no claim.
          </p>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={onPick}
          />
          <Button size="lg" onClick={() => fileRef.current?.click()}>
            <Camera /> Photo the items
          </Button>
        </>
      )}

      {/* Step 2 — awaiting admin verification */}
      {run.status === 'pending' && (
        <>
          {run.itemsPhoto && (
            <img
              src={run.itemsPhoto}
              alt="Your proof"
              className="aspect-video w-full rounded-xl border object-cover"
            />
          )}
          <Card>
            <CardContent className="text-muted-foreground flex items-center gap-2 text-sm">
              <ShieldCheck className="text-urgency-high size-4 shrink-0" />
              Proof submitted — awaiting admin verification.
            </CardContent>
          </Card>
          <Button size="lg" onClick={verifyActiveRun}>
            <BadgeCheck /> Verify proof (admin)
          </Button>
        </>
      )}

      {/* Step 3 — verified: QR + drop-off */}
      {run.status === 'verified' && (
        <>
          <Card>
            <CardContent className="flex flex-col items-center gap-3">
              <div className="flex items-center gap-2">
                <BadgeCheck className="size-5 text-emerald-500" />
                <span className="font-semibold">Verified — show at drop-off</span>
              </div>
              <MockQR token={run.qrToken} />
              <p className="text-muted-foreground text-xs">
                Code {run.qrToken} · staff scan to confirm
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex flex-col gap-2">
              <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                Drop off at
              </p>
              <p className="font-semibold">{run.shelterName}</p>
              <p className="text-muted-foreground flex items-center gap-1.5 text-sm">
                <MapPin className="size-4 shrink-0" />
                {run.shelterAddress}
              </p>
              <Button asChild variant="outline" className="mt-1">
                <a
                  href={directionsUrl(run.shelterLat, run.shelterLng)}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Navigation /> Directions
                </a>
              </Button>
            </CardContent>
          </Card>

          <Button size="lg" onClick={completeActiveRun}>
            <Truck /> Mark delivered
          </Button>
        </>
      )}

      {run.status === 'delivered' && (
        <Card>
          <CardContent className="flex items-center gap-2 text-sm">
            <BadgeCheck className="size-5 text-emerald-500" />
            Delivered — ticket closed.
          </CardContent>
        </Card>
      )}
    </div>
  )
}

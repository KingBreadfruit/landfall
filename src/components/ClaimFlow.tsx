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

/**
 * The volunteer's claim-with-proof flow (accountability layer):
 *   photograph the items  →  admin verifies  →  drop-off shelter revealed
 * No verified photo = the ticket is never truly claimed.
 */
export function ClaimFlow() {
  const claim = useStore((s) => s.claim)
  const need = useStore((s) => s.needs.find((n) => n.id === s.claim?.needId))
  const submitClaimPhoto = useStore((s) => s.submitClaimPhoto)
  const verifyClaim = useStore((s) => s.verifyClaim)
  const finishClaimDelivery = useStore((s) => s.finishClaimDelivery)
  const cancelClaim = useStore((s) => s.cancelClaim)
  const fileRef = useRef<HTMLInputElement>(null)

  if (!claim) return null

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) submitClaimPhoto(URL.createObjectURL(file))
  }

  return (
    <div className="mx-auto flex h-full w-full max-w-lg flex-col gap-4 overflow-y-auto p-4">
      <button
        type="button"
        onClick={cancelClaim}
        className="text-muted-foreground -ml-1 flex w-fit cursor-pointer items-center gap-1 text-sm"
      >
        <ArrowLeft className="size-4" /> Back
      </button>

      {/* Step 1 — photograph the items to claim */}
      {claim.status === 'photographing' && (
        <>
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              Claim this run
            </h1>
            <p className="text-muted-foreground text-sm">
              Photograph <b>all</b> the items to claim it. No verified photo,
              no claim — the ticket stays open for someone else.
            </p>
          </div>

          {need && (
            <Card>
              <CardContent className="flex flex-col gap-1.5">
                {need.items.map((it) => (
                  <div
                    key={it.name}
                    className="flex justify-between text-sm"
                  >
                    <span className="font-medium">{it.name}</span>
                    <span className="text-muted-foreground">
                      {it.qtyNeeded} {it.unit}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

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
      {claim.status === 'pending' && (
        <>
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              Awaiting verification
            </h1>
            <p className="text-muted-foreground text-sm">
              Your proof is with an admin. The ticket isn't truly yours until
              it's verified.
            </p>
          </div>
          {claim.itemsPhoto && (
            <img
              src={claim.itemsPhoto}
              alt="Your proof"
              className="aspect-video w-full rounded-xl border object-cover"
            />
          )}
          <Card>
            <CardContent className="text-muted-foreground flex items-center gap-2 text-sm">
              <ShieldCheck className="text-urgency-high size-4 shrink-0" />
              Claimed by {claim.volunteerName} · pending admin check
            </CardContent>
          </Card>
          {/* Demo stand-in for the admin console */}
          <Button size="lg" onClick={verifyClaim}>
            <BadgeCheck /> Verify proof (admin)
          </Button>
        </>
      )}

      {/* Step 3 — verified, reveal the drop-off shelter */}
      {claim.status === 'verified' && (
        <>
          <div className="flex items-center gap-2">
            <BadgeCheck className="size-6 text-emerald-500" />
            <h1 className="text-xl font-bold tracking-tight">
              Verified — you're on
            </h1>
          </div>
          <Card>
            <CardContent className="flex flex-col gap-2">
              <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                Drop off at
              </p>
              <p className="font-semibold">{claim.shelterName}</p>
              <p className="text-muted-foreground flex items-center gap-1.5 text-sm">
                <MapPin className="size-4 shrink-0" />
                {claim.shelterAddress}
              </p>
              <Button asChild variant="outline" className="mt-1">
                <a
                  href={directionsUrl(claim.shelterLat, claim.shelterLng)}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Navigation /> Directions
                </a>
              </Button>
            </CardContent>
          </Card>
          <Button size="lg" onClick={finishClaimDelivery}>
            <Truck /> Mark delivered
          </Button>
        </>
      )}
    </div>
  )
}

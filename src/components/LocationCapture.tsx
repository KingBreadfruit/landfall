import { useState } from 'react'
import { CheckCircle2, LoaderCircle, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getPosition, type Coords } from '@/lib/geo'

/**
 * Location consent + capture. Explains WHY the location is needed before
 * asking for it, then grabs the device's real GPS fix. If the user declines
 * or it fails, the caller falls back to the typed area — a request is never
 * blocked on this.
 */
export function LocationCapture({
  value,
  onChange,
}: {
  value: Coords | null
  onChange: (c: Coords | null) => void
}) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')

  const capture = async () => {
    setStatus('loading')
    const c = await getPosition()
    if (c) {
      onChange(c)
      setStatus('idle')
    } else {
      onChange(null)
      setStatus('error')
    }
  }

  return (
    <div className="flex flex-col gap-2 rounded-xl border bg-card p-3">
      <div className="flex items-start gap-2">
        <MapPin className="text-primary mt-0.5 size-4 shrink-0" />
        <p className="text-muted-foreground text-xs leading-relaxed">
          <span className="text-foreground font-semibold">
            Why we need your location:
          </span>{' '}
          it routes help to the exact spot and shows the responder where to
          go. It's saved only with this request and shared just with the
          volunteer who fulfils it — never posted publicly or sold.
        </p>
      </div>

      {value ? (
        <div className="text-success flex items-center gap-1.5 text-xs font-medium">
          <CheckCircle2 className="size-3.5" />
          Location captured
          {value.accuracy ? ` · accurate to ~${Math.round(value.accuracy)}m` : ''}
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={capture}
          disabled={status === 'loading'}
        >
          {status === 'loading' ? (
            <>
              <LoaderCircle className="animate-spin" /> Getting your location…
            </>
          ) : (
            <>
              <MapPin /> Use my current location
            </>
          )}
        </Button>
      )}

      {status === 'error' && (
        <p className="text-urgency-high text-xs">
          Couldn't get GPS — check location permission. Your request will use
          the area you typed instead.
        </p>
      )}
    </div>
  )
}

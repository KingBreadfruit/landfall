import { useState } from 'react'
import { ArrowLeft, Camera, Camera as CameraIcon, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DAMAGE_TYPES } from '@/lib/relief'
import type { Coords } from '@/lib/geo'
import { useStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import mockProof from '@/assets/delivery-proof.jpg'
import { LocationCapture } from './LocationCapture'

/**
 * Citizen damage report: pick what happened, snap a photo, post it to the
 * volunteer board so skilled helpers can take it up (Groundwork) — no
 * waiting on a government crew.
 */
export function ReportDamage({
  onBack,
  onSent,
}: {
  onBack: () => void
  onSent: () => void
}) {
  const reportDamage = useStore((s) => s.reportDamage)
  const [typeId, setTypeId] = useState<string | null>(null)
  const [area, setArea] = useState('Gregory Park, Portmore')
  const [photo, setPhoto] = useState<string | undefined>()
  const [coords, setCoords] = useState<Coords | null>(null)

  const send = () => {
    const type = DAMAGE_TYPES.find((t) => t.id === typeId)
    reportDamage({
      damageType: type?.label ?? 'Storm damage',
      area,
      photoUrl: photo,
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
          <CameraIcon className="text-urgency-critical size-5" />
          Report damage
        </h1>
        <p className="text-muted-foreground text-xs">
          Show what happened. Volunteers nearby can come and help.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <Label className="mb-2 block">What happened?</Label>
        <div className="grid grid-cols-2 gap-2">
          {DAMAGE_TYPES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTypeId(t.id)}
              aria-pressed={typeId === t.id}
              className={cn(
                'flex items-center gap-2 rounded-xl border p-3 text-left text-sm font-medium transition-colors',
                typeId === t.id
                  ? 'border-primary bg-primary/5'
                  : 'hover:bg-accent',
              )}
            >
              <span className="text-xl">{t.emoji}</span>
              {t.label}
            </button>
          ))}
        </div>

        <Label className="mt-5 mb-2 block">Photo</Label>
        {photo ? (
          <div className="relative w-full overflow-hidden rounded-xl border">
            <img
              src={photo}
              alt="Damage"
              className="aspect-video w-full object-cover"
            />
            <span className="absolute right-2 bottom-2 flex items-center gap-1 rounded-full bg-emerald-600 px-2 py-0.5 text-xs font-medium text-white">
              <CheckCircle2 className="size-3" /> Uploaded
            </span>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setPhoto(mockProof)}
            className="text-muted-foreground hover:bg-accent flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed"
          >
            <Camera className="size-8" />
            <span className="text-sm">Take a photo (demo)</span>
          </button>
        )}

        <div className="mt-5 flex flex-col gap-2">
          <Label htmlFor="dmg-area">Where is it?</Label>
          <Input
            id="dmg-area"
            maxLength={120}
            value={area}
            onChange={(e) => setArea(e.target.value)}
          />
        </div>

        <div className="mt-4">
          <LocationCapture value={coords} onChange={setCoords} />
        </div>
      </div>

      <div className="border-t p-4">
        <Button
          size="lg"
          className="w-full"
          disabled={typeId === null}
          onClick={send}
        >
          Post to volunteers
        </Button>
      </div>
    </div>
  )
}

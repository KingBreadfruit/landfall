import { useState } from 'react'
import { CheckCircle2, LifeBuoy, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

/**
 * The person-in-need perspective: a dead-simple "request help" form —
 * big fields, one button, works with one thumb in a stairwell.
 * Static rough-in: submit flips to a confirmation state.
 *
 * MORNING TODO (optional, only if the arc is done): drop the request on
 * the map as a new pin.
 */
export function RequestHelp() {
  const [submitted, setSubmitted] = useState(false)

  if (submitted) {
    return (
      <div className="mx-auto flex h-full w-full max-w-lg flex-col items-center justify-center gap-4 p-4">
        <Card className="w-full">
          <CardContent className="flex flex-col items-center gap-3 text-center">
            <CheckCircle2 className="size-12 text-emerald-500" />
            <CardTitle className="text-lg">Request received</CardTitle>
            <CardDescription>
              Your request is on the board. If you lose signal, it stays
              saved on this phone and sends the moment signal returns.
            </CardDescription>
            <Button
              variant="outline"
              className="mt-2"
              onClick={() => setSubmitted(false)}
            >
              <RotateCcw /> New request
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto flex h-full w-full max-w-lg flex-col gap-4 overflow-y-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <LifeBuoy className="text-urgency-critical size-5" />
            Request help
          </CardTitle>
          <CardDescription>
            Tell us where you are and what you need. Keep it short.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="req-name">Your name</Label>
            <Input id="req-name" maxLength={80} placeholder="e.g. Marlene B." />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="req-location">Where are you?</Label>
            <Input
              id="req-location"
              maxLength={120}
              placeholder="e.g. Gregory Park, Portmore"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="req-items">What do you need?</Label>
            <Input
              id="req-items"
              maxLength={120}
              placeholder="e.g. water, baby formula"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="req-people">How many people?</Label>
            <Input
              id="req-people"
              type="number"
              inputMode="numeric"
              min={1}
              max={100000}
              placeholder="4"
            />
          </div>
          <Button size="lg" onClick={() => setSubmitted(true)}>
            Send request
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

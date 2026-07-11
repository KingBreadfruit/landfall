import { ArrowLeft, Megaphone } from 'lucide-react'
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
import { useStore } from '@/lib/store'

/**
 * Simple "post a need" form so the app isn't consume-only.
 * Static rough-in tonight — submitting just returns to the map.
 *
 * MORNING TODO (optional, only if the arc is done): make submit drop a
 * new pin on the map.
 */
export function PostNeedForm() {
  const setScreen = useStore((s) => s.setScreen)

  return (
    <div className="mx-auto flex h-full w-full max-w-lg flex-col gap-4 overflow-y-auto p-4">
      <Button
        variant="ghost"
        className="w-fit"
        onClick={() => setScreen('map')}
      >
        <ArrowLeft /> Back
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Megaphone className="text-urgency-high size-5" />
            Post a need
          </CardTitle>
          <CardDescription>
            Tell the network what your community or shelter needs.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="community">Community or shelter</Label>
            <Input
              id="community"
              maxLength={80}
              placeholder="e.g. Portmore HS Shelter"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="parish">Parish</Label>
            <Input id="parish" maxLength={40} placeholder="e.g. St. Catherine" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="items">What is needed?</Label>
            <Input
              id="items"
              maxLength={120}
              placeholder="e.g. 200 cases water, 50 tarps"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="people">People affected</Label>
            <Input
              id="people"
              type="number"
              inputMode="numeric"
              min={1}
              max={100000}
              placeholder="340"
            />
          </div>
          <Button size="lg" onClick={() => setScreen('map')}>
            Post need
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

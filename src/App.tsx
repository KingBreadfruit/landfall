import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/Header'
import { MapView } from '@/components/MapView'
import { NeedDetailSheet } from '@/components/NeedDetailSheet'
import { PledgeFlow } from '@/components/PledgeFlow'
import { MatchCard } from '@/components/MatchCard'
import { DeliveryConfirm } from '@/components/DeliveryConfirm'
import { PostNeedForm } from '@/components/PostNeedForm'
import { useStore } from '@/lib/store'

/**
 * Shell + "router": the current screen lives in the Zustand store.
 * The map stays mounted underneath the flow screens so Leaflet never
 * re-initialises mid-demo (and the driver animation can play behind).
 */
export default function App() {
  const screen = useStore((s) => s.screen)
  const setScreen = useStore((s) => s.setScreen)

  return (
    <div className="flex h-full flex-col">
      <Header />

      <main className="relative flex-1 overflow-hidden">
        <div className="absolute inset-0">
          <MapView />
        </div>

        {screen === 'map' && (
          <Button
            size="lg"
            className="absolute right-4 bottom-6 z-10 shadow-lg"
            onClick={() => setScreen('post-need')}
          >
            <Plus /> Post a need
          </Button>
        )}

        {screen !== 'map' && (
          <div className="bg-background/95 absolute inset-0 z-10 backdrop-blur-sm">
            {screen === 'pledge' && <PledgeFlow />}
            {screen === 'match' && <MatchCard />}
            {screen === 'delivery' && <DeliveryConfirm />}
            {screen === 'post-need' && <PostNeedForm />}
          </div>
        )}
      </main>

      <NeedDetailSheet />
    </div>
  )
}

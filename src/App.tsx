import { Header } from '@/components/Header'
import { MapView } from '@/components/MapView'
import { NeedDetailSheet } from '@/components/NeedDetailSheet'
import { PledgeFlow } from '@/components/PledgeFlow'
import { MatchCard } from '@/components/MatchCard'
import { DeliveryConfirm } from '@/components/DeliveryConfirm'
import { PostNeedForm } from '@/components/PostNeedForm'
import { RequestHelp } from '@/components/RequestHelp'
import { RoleSwitcher } from '@/components/RoleSwitcher'
import { ShelterDashboard } from '@/components/ShelterDashboard'
import { useStore } from '@/lib/store'
import { cn } from '@/lib/utils'

/**
 * Shell + "router": current role (bottom nav) and screen live in the
 * Zustand store. The map stays mounted underneath everything — hidden,
 * not unmounted, when another role is active — so Leaflet never
 * re-initialises mid-demo (and the driver animation can play behind).
 */
export default function App() {
  const role = useStore((s) => s.role)
  const screen = useStore((s) => s.screen)

  return (
    <div className="flex h-full flex-col">
      <Header />

      <main className="relative flex-1 overflow-hidden">
        <div
          className={cn(
            'absolute inset-0',
            role !== 'volunteer' && 'invisible',
          )}
        >
          <MapView />
        </div>

        {/* Volunteer flow screens overlay the map */}
        {role === 'volunteer' && screen !== 'map' && (
          <div className="bg-background/95 absolute inset-0 z-10 backdrop-blur-sm">
            {screen === 'pledge' && <PledgeFlow />}
            {screen === 'match' && <MatchCard />}
            {screen === 'delivery' && <DeliveryConfirm />}
          </div>
        )}

        {role === 'shelter' && (
          <div className="bg-background absolute inset-0 z-10">
            {screen === 'post-need' ? <PostNeedForm /> : <ShelterDashboard />}
          </div>
        )}

        {role === 'requester' && (
          <div className="bg-background absolute inset-0 z-10">
            <RequestHelp />
          </div>
        )}
      </main>

      <RoleSwitcher />
      {role === 'volunteer' && <NeedDetailSheet />}
    </div>
  )
}

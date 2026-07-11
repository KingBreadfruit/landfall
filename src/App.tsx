import { Header } from '@/components/Header'
import { SuppliesNeeded } from '@/components/SuppliesNeeded'
import { NeedDetailSheet } from '@/components/NeedDetailSheet'
import { PledgeFlow } from '@/components/PledgeFlow'
import { MatchCard } from '@/components/MatchCard'
import { TransferAnimation } from '@/components/TransferAnimation'
import { DeliveryConfirm } from '@/components/DeliveryConfirm'
import { PostNeedForm } from '@/components/PostNeedForm'
import { RequestHelp } from '@/components/RequestHelp'
import { RoleSwitcher } from '@/components/RoleSwitcher'
import { ShelterList } from '@/components/ShelterList'
import { ShelterDetail } from '@/components/ShelterDetail'
import { useStore } from '@/lib/store'

/**
 * Shell + "router": current role (bottom nav) and screen live in the
 * Zustand store. Each role owns its own column; the volunteer arc
 * (supplies list → pledge → match → delivery) swaps screens in place.
 */
export default function App() {
  const role = useStore((s) => s.role)
  const screen = useStore((s) => s.screen)
  const selectedShelterId = useStore((s) => s.selectedShelterId)

  return (
    <div className="flex h-full flex-col">
      <Header />

      <main className="relative flex-1 overflow-hidden">
        {role === 'volunteer' && (
          <div className="bg-background absolute inset-0">
            {screen === 'map' && <SuppliesNeeded />}
            {screen === 'pledge' && <PledgeFlow />}
            {screen === 'match' && <MatchCard />}
            {screen === 'transfer' && <TransferAnimation />}
            {screen === 'delivery' && <DeliveryConfirm />}
          </div>
        )}

        {role === 'shelter' && (
          <div className="bg-background absolute inset-0">
            {screen === 'post-need' ? (
              <PostNeedForm />
            ) : selectedShelterId ? (
              <ShelterDetail />
            ) : (
              <ShelterList />
            )}
          </div>
        )}

        {role === 'requester' && (
          <div className="bg-background absolute inset-0">
            <RequestHelp />
          </div>
        )}
      </main>

      <RoleSwitcher />
      {role === 'volunteer' && <NeedDetailSheet />}
    </div>
  )
}

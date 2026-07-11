import { useEffect } from 'react'
import { Header } from '@/components/Header'
import { AuthScreen } from '@/components/AuthScreen'
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
import { useAuth } from '@/lib/auth'
import { useStore } from '@/lib/store'

/**
 * Shell + "router": current role (bottom nav) and screen live in the
 * Zustand store. Gated behind Supabase auth — no session, no app.
 */
export default function App() {
  const initAuth = useAuth((s) => s.init)
  const ready = useAuth((s) => s.ready)
  const session = useAuth((s) => s.session)

  const role = useStore((s) => s.role)
  const screen = useStore((s) => s.screen)
  const selectedShelterId = useStore((s) => s.selectedShelterId)

  useEffect(() => {
    initAuth()
  }, [initAuth])

  if (!ready) {
    return (
      <div className="text-muted-foreground flex h-full items-center justify-center text-sm">
        Loading…
      </div>
    )
  }

  if (!session) return <AuthScreen />

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

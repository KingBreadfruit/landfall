import { useEffect } from 'react'
import { Header } from '@/components/Header'
import { AuthScreen } from '@/components/AuthScreen'
import { SuppliesNeeded } from '@/components/SuppliesNeeded'
import { NeedDetailSheet } from '@/components/NeedDetailSheet'
import { MyRuns } from '@/components/MyRuns'
import { RunDetail } from '@/components/RunDetail'
import { TransferAnimation } from '@/components/TransferAnimation'
import { DeliveryConfirm } from '@/components/DeliveryConfirm'
import { PostNeedForm } from '@/components/PostNeedForm'
import { RequestHelp } from '@/components/RequestHelp'
import { RoleSwitcher } from '@/components/RoleSwitcher'
import { ShelterList } from '@/components/ShelterList'
import { ShelterDetail } from '@/components/ShelterDetail'
import { MapTab } from '@/components/MapTab'
import { useAuth } from '@/lib/auth'
import { hasSupabase } from '@/lib/supabase'
import { useStore } from '@/lib/store'

/**
 * Shell + "router": current role (bottom nav) and screen live in the
 * Zustand store. Gated behind Supabase auth — no session, no app.
 */
export default function App() {
  const initAuth = useAuth((s) => s.init)
  const ready = useAuth((s) => s.ready)
  const session = useAuth((s) => s.session)
  const guestMode = useAuth((s) => s.guestMode)

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

  // With a backend configured, require a session (unless the user chose to
  // continue as guest). Without a backend, fall straight through.
  if (hasSupabase && !session && !guestMode) return <AuthScreen />

  return (
    <div className="flex h-full flex-col">
      <Header />

      <main className="relative flex-1 overflow-hidden">
        {role === 'volunteer' && (
          <div className="bg-background absolute inset-0">
            {screen === 'map' && <SuppliesNeeded />}
            {screen === 'runs' && <MyRuns />}
            {screen === 'run' && <RunDetail />}
            {screen === 'transfer' && <TransferAnimation />}
            {screen === 'delivery' && <DeliveryConfirm />}
          </div>
        )}

        {role === 'map' && (
          <div className="absolute inset-0">
            <MapTab />
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
      {(role === 'volunteer' || role === 'map') && <NeedDetailSheet />}
    </div>
  )
}

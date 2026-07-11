import { create } from 'zustand'
import type { Delivery, Driver, Need, Pledge, Role, Screen } from './types'
import { DEMO_DELIVERY, SEED_DRIVERS, SEED_NEEDS, SEED_PLEDGES } from './seed'

// ---------------------------------------------------------------------------
// Demo flow state. This drives the whole app — no router, no backend.
//
// The 60-second arc:
//   map → tap pin (need sheet) → pledge → match → delivery confirmed
//
// MORNING TODO: wire the arc transitions end-to-end (confirmPledge should
// kick off the match, the match card should script the driver animation
// along DEMO_ROUTE, then reveal the delivery confirmation).
// ---------------------------------------------------------------------------

type LandfallState = {
  screen: Screen
  role: Role
  needs: Need[]
  drivers: Driver[]
  pledges: Pledge[]
  selectedNeedId: string | null
  activeDelivery: Delivery | null
  /** Pitch toggle: shows the "Offline — pending sync" header badge. */
  offlineMode: boolean

  // Actions
  setScreen: (screen: Screen) => void
  setRole: (role: Role) => void
  selectNeed: (needId: string | null) => void
  startPledge: () => void
  confirmPledge: (donorName: string, quantities: Record<string, number>) => void
  startDemoDelivery: () => void
  completeDemoDelivery: () => void
  resetDemo: () => void
  toggleOfflineMode: () => void
}

export const useStore = create<LandfallState>((set, get) => ({
  screen: 'map',
  role: 'volunteer',
  needs: SEED_NEEDS,
  drivers: SEED_DRIVERS,
  pledges: SEED_PLEDGES,
  selectedNeedId: null,
  activeDelivery: null,
  offlineMode: false,

  setScreen: (screen) => set({ screen }),

  // Switching perspective always lands on that role's home screen.
  setRole: (role) =>
    set({ role, screen: 'map', selectedNeedId: null }),

  selectNeed: (needId) => set({ selectedNeedId: needId }),

  startPledge: () => set({ screen: 'pledge' }),

  // Records a pledge against the selected need and moves its progress bars.
  confirmPledge: (donorName, quantities) => {
    const { selectedNeedId, needs, pledges } = get()
    if (!selectedNeedId) return

    const need = needs.find((n) => n.id === selectedNeedId)
    if (!need) return

    const pledgedItems = need.items
      .filter((item) => (quantities[item.name] ?? 0) > 0)
      .map((item) => ({ ...item, qtyPledged: quantities[item.name] }))

    const updatedNeeds = needs.map((n) =>
      n.id !== selectedNeedId
        ? n
        : {
            ...n,
            items: n.items.map((item) => ({
              ...item,
              qtyPledged: Math.min(
                item.qtyNeeded,
                item.qtyPledged + (quantities[item.name] ?? 0),
              ),
            })),
          },
    )

    set({
      needs: updatedNeeds,
      pledges: [
        ...pledges,
        {
          id: `pledge-${Date.now()}`,
          needId: selectedNeedId,
          donorName,
          items: pledgedItems,
        },
      ],
      screen: 'match',
    })
  },

  // Kicks off the scripted match → the demo delivery on the hero need.
  startDemoDelivery: () => {
    set({
      activeDelivery: { ...DEMO_DELIVERY, status: 'enroute' },
      screen: 'match',
    })
  },

  completeDemoDelivery: () => {
    const delivery = get().activeDelivery ?? DEMO_DELIVERY
    set({
      activeDelivery: {
        ...delivery,
        status: 'delivered',
        timeline: delivery.timeline.map((step) => ({ ...step, done: true })),
      },
      screen: 'delivery',
    })
  },

  resetDemo: () =>
    set({
      screen: 'map',
      needs: SEED_NEEDS,
      drivers: SEED_DRIVERS,
      pledges: SEED_PLEDGES,
      selectedNeedId: null,
      activeDelivery: null,
    }),

  toggleOfflineMode: () => set((s) => ({ offlineMode: !s.offlineMode })),
}))

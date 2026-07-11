import { create } from 'zustand'
import type {
  Delivery,
  Driver,
  Need,
  Pledge,
  Role,
  Screen,
  Shelter,
} from './types'
import {
  DEMO_DELIVERY,
  SEED_DRIVERS,
  SEED_NEEDS,
  SEED_PLEDGES,
  SEED_SHELTERS,
} from './seed'
import { clampQty, cleanText } from './sanitize'

function nowLabel(): string {
  return new Date().toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })
}

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
  shelters: Shelter[]
  selectedNeedId: string | null
  /** Shelter role: which shelter's detail is open (its needId), or null. */
  selectedShelterId: string | null
  activeDelivery: Delivery | null
  /** Pitch toggle: shows the "Offline — pending sync" header badge. */
  offlineMode: boolean

  // Actions
  setScreen: (screen: Screen) => void
  setRole: (role: Role) => void
  selectNeed: (needId: string | null) => void
  selectShelter: (shelterId: string | null) => void
  logOccupant: (
    shelterId: string,
    person: { name: string; trn: string; dob: string },
  ) => void
  checkInGuest: (shelterId: string, guestId: string) => void
  startPledge: () => void
  confirmPledge: (donorName: string, quantities: Record<string, number>) => void
  startDemoDelivery: () => void
  completeDemoDelivery: () => void
  resetDemo: () => void
  toggleOfflineMode: () => void
  setOfflineMode: (offline: boolean) => void
}

export const useStore = create<LandfallState>((set, get) => ({
  screen: 'map',
  role: 'volunteer',
  needs: SEED_NEEDS,
  drivers: SEED_DRIVERS,
  pledges: SEED_PLEDGES,
  shelters: SEED_SHELTERS,
  selectedNeedId: null,
  selectedShelterId: null,
  activeDelivery: null,
  offlineMode: false,

  setScreen: (screen) => set({ screen }),

  // Switching perspective always lands on that role's home screen.
  setRole: (role) =>
    set({ role, screen: 'map', selectedNeedId: null, selectedShelterId: null }),

  selectNeed: (needId) => set({ selectedNeedId: needId }),

  selectShelter: (shelterId) => set({ selectedShelterId: shelterId }),

  // Tablet check-in: log a person into a shelter's roster. Inputs are
  // sanitized here so blank/garbage entries can't crash the roster.
  logOccupant: (shelterId, person) => {
    const name = cleanText(person.name)
    if (!name) return
    set((s) => ({
      shelters: s.shelters.map((sh) =>
        sh.needId !== shelterId
          ? sh
          : {
              ...sh,
              occupants: [
                {
                  id: `occ-${Date.now()}`,
                  name,
                  trn: cleanText(person.trn) || '—',
                  dob: cleanText(person.dob) || '—',
                  checkedInAt: nowLabel(),
                },
                ...sh.occupants,
              ],
            },
      ),
    }))
  },

  // Scan & check in an incoming guest: move them from Incoming to the
  // occupant roster (with their arrival time).
  checkInGuest: (shelterId, guestId) => {
    set((s) => ({
      shelters: s.shelters.map((sh) => {
        if (sh.needId !== shelterId) return sh
        const guest = sh.incoming.find((g) => g.id === guestId)
        if (!guest) return sh
        return {
          ...sh,
          incoming: sh.incoming.filter((g) => g.id !== guestId),
          occupants: [
            {
              id: `occ-${guest.id}`,
              name: guest.name,
              trn: guest.trn,
              dob: guest.dob,
              checkedInAt: nowLabel(),
            },
            ...sh.occupants,
          ],
        }
      }),
    }))
  },

  startPledge: () => set({ screen: 'pledge' }),

  // Records a pledge against the selected need and moves its progress bars.
  // All inputs are sanitized here — garbage quantities clamp to safe ints,
  // blank/whitespace donor names fall back — so nothing upstream can crash it.
  confirmPledge: (donorName, quantities) => {
    const { selectedNeedId, needs, pledges } = get()
    if (!selectedNeedId) return

    const need = needs.find((n) => n.id === selectedNeedId)
    if (!need) return

    const qtyFor = (name: string) => clampQty(quantities[name])

    const pledgedItems = need.items
      .filter((item) => qtyFor(item.name) > 0)
      .map((item) => ({ ...item, qtyPledged: qtyFor(item.name) }))

    const updatedNeeds = needs.map((n) =>
      n.id !== selectedNeedId
        ? n
        : {
            ...n,
            items: n.items.map((item) => ({
              ...item,
              qtyPledged: Math.min(
                item.qtyNeeded,
                item.qtyPledged + qtyFor(item.name),
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
          donorName: cleanText(donorName) || 'Anonymous donor',
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
      shelters: SEED_SHELTERS,
      selectedNeedId: null,
      selectedShelterId: null,
      activeDelivery: null,
    }),

  toggleOfflineMode: () => set((s) => ({ offlineMode: !s.offlineMode })),

  setOfflineMode: (offline) => set({ offlineMode: offline }),
}))

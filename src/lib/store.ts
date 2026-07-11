import { create } from 'zustand'
import type {
  BadgeKind,
  Category,
  Claim,
  Contributor,
  Delivery,
  Driver,
  Need,
  Pledge,
  Reward,
  Role,
  Screen,
  Shelter,
} from './types'
import { DROPOFF_SHELTER } from './constants'
import {
  DEMO_DELIVERY,
  SEED_DRIVERS,
  SEED_LEADERBOARD,
  SEED_NEEDS,
  SEED_PLEDGES,
  SEED_SHELTERS,
  SEED_YOU,
} from './seed'
import { GROUNDWORK_POINTS, supplyPoints, TOP_THRESHOLD } from './relief'
import { clampQty, cleanText } from './sanitize'
import { useAuth } from './auth'
import { hasSupabase, supabase } from './supabase'

/**
 * Compute the reward for a contribution against the signed-in user's
 * PERSISTED profile (points + badges live in Supabase). Verified is
 * earned on the first contribution, Top at 20 points.
 */
function rewardFor(
  category: Category,
  itemsMoved: number,
  place: string,
): Reward {
  const profile = useAuth.getState().profile
  const basePoints = profile?.points ?? 0
  const baseBadges = (profile?.badges ?? []) as BadgeKind[]
  const points =
    category === 'supply' ? supplyPoints(itemsMoved) : GROUNDWORK_POINTS
  const totalPoints = basePoints + points
  const newBadges: BadgeKind[] = []
  if (!baseBadges.includes('verified')) newBadges.push('verified')
  if (totalPoints >= TOP_THRESHOLD && !baseBadges.includes('top'))
    newBadges.push('top')
  return { category, points, itemsMoved, totalPoints, newBadges, place }
}

/** Persist a contribution to Supabase, then refresh the profile so the
 * header + leaderboard reflect the new total. */
async function persistContribution(
  category: Category,
  points: number,
  newBadges: BadgeKind[],
) {
  const auth = useAuth.getState()
  const profile = auth.profile
  if (!profile) return
  // Mock mode: keep points in localStorage instead of Supabase.
  if (!hasSupabase) {
    auth.applyLocalPoints(points, newBadges)
    return
  }
  const badges = Array.from(new Set([...profile.badges, ...newBadges]))
  await supabase
    .from('profiles')
    .update({ points: profile.points + points, badges })
    .eq('id', profile.id)
  await supabase
    .from('contributions')
    .insert({ profile_id: profile.id, category, points })
  await auth.refreshProfile()
}

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
  /** The volunteer's in-progress claim (proof + verification trail). */
  claim: Claim | null
  activeDelivery: Delivery | null
  /** Pitch toggle: shows the "Offline — pending sync" header badge. */
  offlineMode: boolean

  // Recognition
  you: Contributor
  leaderboard: Contributor[]
  /** Items in flight for the transfer animation / supply scoring. */
  pendingItemsMoved: number
  /** Where the pending contribution is going, for the reward copy. */
  pendingPlace: string
  /** The most recent completed contribution, shown on the reward beat. */
  lastReward: Reward | null

  // Actions
  setScreen: (screen: Screen) => void
  setRole: (role: Role) => void
  selectNeed: (needId: string | null) => void
  selectShelter: (shelterId: string | null) => void
  startClaim: (needId: string) => void
  submitClaimPhoto: (photoUrl: string) => void
  verifyClaim: () => void
  cancelClaim: () => void
  finishClaimDelivery: () => void
  logOccupant: (
    shelterId: string,
    person: { name: string; trn: string; dob: string },
  ) => void
  checkInGuest: (shelterId: string, guestId: string) => void
  startPledge: () => void
  confirmPledge: (donorName: string, quantities: Record<string, number>) => void
  startTransfer: () => void
  finishSupplyDelivery: () => void
  takeUpGroundwork: (needId: string) => void
  submitSupplyRequest: (payload: {
    name: string
    area: string
    household: number
    selections: Record<string, { qty: number; unit: string }>
  }) => void
  reportDamage: (payload: {
    damageType: string
    area: string
    photoUrl?: string
  }) => void
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
  claim: null,
  activeDelivery: null,
  offlineMode: false,

  you: SEED_YOU,
  leaderboard: SEED_LEADERBOARD,
  pendingItemsMoved: 0,
  pendingPlace: '',
  lastReward: null,

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

  // --- Volunteer claim + accountability ---------------------------------
  // Claim a run. The volunteer must photograph the items (submitClaimPhoto)
  // and an admin must verify (verifyClaim) before the drop-off shelter is
  // revealed — until then the ticket is NOT truly claimed.
  startClaim: (needId) => {
    const need = get().needs.find((n) => n.id === needId)
    if (!need) return
    const itemCount = need.items.reduce((sum, i) => sum + i.qtyNeeded, 0)
    set({
      selectedNeedId: null,
      claim: {
        needId,
        volunteerName: useAuth.getState().profile?.name ?? 'You',
        itemsPhoto: null,
        status: 'photographing',
        itemCount,
        shelterName: DROPOFF_SHELTER.name,
        shelterAddress: DROPOFF_SHELTER.address,
        shelterLat: DROPOFF_SHELTER.lat,
        shelterLng: DROPOFF_SHELTER.lng,
      },
      screen: 'claim',
    })
  },

  submitClaimPhoto: (photoUrl) =>
    set((s) =>
      s.claim
        ? { claim: { ...s.claim, itemsPhoto: photoUrl, status: 'pending' } }
        : {},
    ),

  verifyClaim: () =>
    set((s) =>
      s.claim ? { claim: { ...s.claim, status: 'verified' } } : {},
    ),

  cancelClaim: () => set({ claim: null, screen: 'map' }),

  // Verified → dropped off: close the ticket (remove from board), carry the
  // proof photo into the reveal, and score the supply drop.
  finishClaimDelivery: () => {
    const { claim, needs, activeDelivery } = get()
    if (!claim) return
    set({
      needs: needs.filter((n) => n.id !== claim.needId),
      pendingItemsMoved: claim.itemCount,
      pendingPlace: claim.shelterName,
      activeDelivery: {
        ...(activeDelivery ?? DEMO_DELIVERY),
        photoUrl: claim.itemsPhoto ?? DEMO_DELIVERY.photoUrl,
        status: 'enroute',
      },
      claim: null,
      screen: 'transfer',
    })
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

    const itemsMoved = pledgedItems.reduce((sum, i) => sum + i.qtyPledged, 0)

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
      pendingItemsMoved: itemsMoved,
      pendingPlace: need.community,
      screen: 'match',
    })
  },

  // Match → play the transfer animation (fills to the pledged item count).
  startTransfer: () =>
    set((s) => ({
      activeDelivery: {
        ...(s.activeDelivery ?? DEMO_DELIVERY),
        status: 'enroute',
      },
      screen: 'transfer',
    })),

  // Transfer finished → land the delivery and score the supply drop.
  finishSupplyDelivery: () => {
    const { pendingItemsMoved, pendingPlace, activeDelivery } = get()
    const reward = rewardFor(
      'supply',
      pendingItemsMoved,
      pendingPlace || 'the community',
    )
    const delivery = activeDelivery ?? DEMO_DELIVERY
    set({
      lastReward: reward,
      activeDelivery: {
        ...delivery,
        status: 'delivered',
        timeline: delivery.timeline.map((step) => ({ ...step, done: true })),
      },
      screen: 'delivery',
    })
    void persistContribution('supply', reward.points, reward.newBadges)
  },

  // A volunteer takes up a repair (Groundwork, flat 10 pts). Removes the
  // repair from the board and shows the reward beat.
  takeUpGroundwork: (needId) => {
    const { needs } = get()
    const repair = needs.find((n) => n.id === needId)
    const place = repair?.damageType ?? 'the site'
    const reward = rewardFor('groundwork', 0, place)
    set({
      lastReward: reward,
      needs: needs.filter((n) => n.id !== needId),
      selectedNeedId: null,
      screen: 'delivery',
    })
    void persistContribution('groundwork', reward.points, reward.newBadges)
  },

  // Citizen posts a supply request → a new person-need on the board.
  submitSupplyRequest: ({ name, area, household, selections }) => {
    const items = Object.entries(selections)
      .filter(([, v]) => v.qty > 0)
      .map(([itemName, v]) => ({
        name: itemName,
        unit: v.unit,
        qtyNeeded: clampQty(v.qty),
        qtyPledged: 0,
      }))
    if (items.length === 0) return
    const cleanName = cleanText(name) || 'A resident'
    const need: Need = {
      id: `need-req-${Date.now()}`,
      community: cleanName,
      kind: 'person',
      lat: 17.9615,
      lng: -76.8735,
      parish: 'St. Catherine',
      area: cleanText(area) || 'Portmore',
      items,
      urgency: 'high',
      peopleAffected: clampQty(household) || 1,
      status: 'open',
    }
    set((s) => ({ needs: [need, ...s.needs] }))
  },

  // Citizen reports damage → a new repair on the board (Groundwork).
  reportDamage: ({ damageType, area, photoUrl }) => {
    const need: Need = {
      id: `need-dmg-${Date.now()}`,
      community: 'Reported by a resident',
      kind: 'repair',
      lat: 17.9605,
      lng: -76.876,
      parish: 'St. Catherine',
      area: cleanText(area) || 'Portmore',
      items: [],
      urgency: 'high',
      peopleAffected: 0,
      status: 'open',
      damageType: cleanText(damageType) || 'Storm damage',
      photoUrl,
    }
    set((s) => ({ needs: [need, ...s.needs] }))
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
      claim: null,
      activeDelivery: null,
      you: SEED_YOU,
      leaderboard: SEED_LEADERBOARD,
      pendingItemsMoved: 0,
      pendingPlace: '',
      lastReward: null,
    }),

  toggleOfflineMode: () => set((s) => ({ offlineMode: !s.offlineMode })),

  setOfflineMode: (offline) => set({ offlineMode: offline }),
}))

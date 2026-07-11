import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  BadgeKind,
  Category,
  Contributor,
  Delivery,
  Driver,
  Need,
  Pledge,
  Reward,
  Role,
  Run,
  Screen,
  Shelter,
} from './types'
import { DROPOFF_SHELTER, HERO_NEED_ID } from './constants'
import {
  DEMO_DELIVERY,
  SEED_DRIVERS,
  SEED_LEADERBOARD,
  SEED_NEEDS,
  SEED_PLEDGES,
  SEED_RUNS,
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
  // Guest / no-backend: keep points in localStorage instead of Supabase.
  if (!hasSupabase || auth.guestMode) {
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
  /** Runs the volunteer has claimed (accountability trail per run). */
  runs: Run[]
  /** The run whose detail is open, or null for the My-runs list. */
  activeRunId: string | null
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
  openMyRuns: () => void
  openRun: (runId: string) => void
  backToRuns: () => void
  uploadRunPhoto: (photoUrl: string) => void
  verifyActiveRun: () => void
  completeActiveRun: () => void
  logOccupant: (
    shelterId: string,
    person: { name: string; trn: string; dob: string },
  ) => void
  checkInGuest: (shelterId: string, guestId: string) => void
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
  submitShelterRequest: (
    selections: Record<string, { qty: number; unit: string }>,
  ) => void
  resetDemo: () => void
  toggleOfflineMode: () => void
  setOfflineMode: (offline: boolean) => void
}

export const useStore = create<LandfallState>()(
  persist(
    (set, get) => ({
  screen: 'map',
  role: 'volunteer',
  needs: SEED_NEEDS,
  drivers: SEED_DRIVERS,
  pledges: SEED_PLEDGES,
  shelters: SEED_SHELTERS,
  selectedNeedId: null,
  selectedShelterId: null,
  runs: SEED_RUNS,
  activeRunId: null,
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

  // --- Volunteer runs (claim → proof → verify → QR → deliver) ----------
  // Claiming moves the need off the open board and creates a run the
  // volunteer must photograph; an admin verifies the proof before the QR
  // and drop-off shelter are revealed.
  startClaim: (needId) => {
    const { needs, runs } = get()
    const need = needs.find((n) => n.id === needId)
    if (!need) return
    const items = need.items.map((i) => ({
      name: i.name,
      unit: i.unit,
      qty: i.qtyNeeded,
    }))
    const run: Run = {
      id: `run-${Date.now()}`,
      needId,
      requesterName: need.community,
      area: need.area ? `${need.area}, ${need.parish}` : need.parish,
      items,
      itemCount: items.reduce((s, i) => s + i.qty, 0),
      status: 'to_photograph',
      itemsPhoto: null,
      qrToken: Math.random().toString(36).slice(2, 8).toUpperCase(),
      shelterName: DROPOFF_SHELTER.name,
      shelterAddress: DROPOFF_SHELTER.address,
      shelterLat: DROPOFF_SHELTER.lat,
      shelterLng: DROPOFF_SHELTER.lng,
    }
    set({
      // A shelter's VENUE stays on the board/map after its request is
      // claimed — only clear the open request. Person/repair needs leave
      // the board entirely.
      needs:
        need.kind === 'shelter'
          ? needs.map((n) =>
              n.id === needId ? { ...n, items: [], urgency: 'normal' } : n,
            )
          : needs.filter((n) => n.id !== needId),
      runs: [run, ...runs],
      activeRunId: run.id,
      selectedNeedId: null,
      screen: 'run',
    })
  },

  openMyRuns: () => set({ screen: 'runs', activeRunId: null }),
  openRun: (runId) => set({ screen: 'run', activeRunId: runId }),
  backToRuns: () => set({ screen: 'runs', activeRunId: null }),

  uploadRunPhoto: (photoUrl) =>
    set((s) => ({
      runs: s.runs.map((r) =>
        r.id === s.activeRunId
          ? { ...r, itemsPhoto: photoUrl, status: 'pending' }
          : r,
      ),
    })),

  verifyActiveRun: () =>
    set((s) => ({
      runs: s.runs.map((r) =>
        r.id === s.activeRunId ? { ...r, status: 'verified' } : r,
      ),
    })),

  // Delivered: mark the run done, carry the proof photo into the reveal,
  // and score the supply drop (points persist).
  completeActiveRun: () => {
    const { runs, activeRunId, activeDelivery } = get()
    const run = runs.find((r) => r.id === activeRunId)
    if (!run) return
    set({
      runs: runs.map((r) =>
        r.id === activeRunId ? { ...r, status: 'delivered' } : r,
      ),
      pendingItemsMoved: run.itemCount,
      pendingPlace: run.shelterName,
      activeDelivery: {
        ...(activeDelivery ?? DEMO_DELIVERY),
        photoUrl: run.itemsPhoto ?? DEMO_DELIVERY.photoUrl,
        status: 'enroute',
      },
      screen: 'transfer',
    })
  },

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

  // Shelter requests goods — same catalog as a citizen, but it populates
  // the shelter's own request (distinct source: kind 'shelter'), which then
  // shows on the volunteer board.
  submitShelterRequest: (selections) => {
    const items = Object.entries(selections)
      .filter(([, v]) => v.qty > 0)
      .map(([itemName, v]) => ({
        name: itemName,
        unit: v.unit,
        qtyNeeded: clampQty(v.qty),
        qtyPledged: 0,
      }))
    if (items.length === 0) return
    set((s) => ({
      needs: s.needs.map((n) =>
        n.id === HERO_NEED_ID ? { ...n, items, urgency: 'high' } : n,
      ),
    }))
  },

  resetDemo: () =>
    set({
      screen: 'map',
      selectedNeedId: null,
      selectedShelterId: null,
      activeRunId: null,
      activeDelivery: null,
      pendingItemsMoved: 0,
      pendingPlace: '',
      lastReward: null,
    }),

  toggleOfflineMode: () => set((s) => ({ offlineMode: !s.offlineMode })),

  setOfflineMode: (offline) => set({ offlineMode: offline }),
    }),
    {
      // Keep user-added data across refreshes (same device). Points live in
      // the profile (Supabase / localStorage); UI/nav state is not persisted.
      name: 'landfall-store',
      // Bumped to 2 to ship the seeded demo data — old empty/broken state
      // saved in a browser is discarded so the fresh seed loads.
      version: 2,
      partialize: (s) => ({
        needs: s.needs,
        runs: s.runs,
        shelters: s.shelters,
        pledges: s.pledges,
      }),
      // Reconcile persisted state with the current build. The Portmore
      // drop-off hub (need + shelter) must ALWAYS be present — an earlier
      // build removed it from `needs` when its request was claimed, which
      // left stale browsers with an empty map and a shelter row that
      // wouldn't render. Re-inject it if it's missing.
      merge: (persisted, current) => {
        const p = (persisted as Partial<LandfallState>) ?? {}
        const needs = p.needs ?? current.needs
        const needsWithHub = needs.some((n) => n.id === HERO_NEED_ID)
          ? needs
          : [...SEED_NEEDS, ...needs]
        const shelters = p.shelters ?? current.shelters
        const sheltersWithHub = shelters.some(
          (sh) => sh.needId === HERO_NEED_ID,
        )
          ? shelters
          : [...SEED_SHELTERS, ...shelters]
        return {
          ...current,
          ...p,
          needs: needsWithHub,
          shelters: sheltersWithHub,
        }
      },
    },
  ),
)

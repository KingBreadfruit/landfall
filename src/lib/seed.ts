import type {
  Contributor,
  Delivery,
  Driver,
  Need,
  Pledge,
  Run,
  Shelter,
} from './types'
import { HERO_NEED_ID } from './constants'
import deliveryProof from '@/assets/delivery-proof.jpg'

// ---------------------------------------------------------------------------
// Clean slate — a truly empty board. No fake needs, requests, runs, or
// contributors: everything comes in live from real sign-ups via the shared
// board. The only thing kept is the single shelter VENUE (Portmore HS) with
// an empty inventory/roster — it's the operator's shelter and the drop-off
// point for runs, so it must exist even before any request is posted.
// ---------------------------------------------------------------------------

export const SEED_NEEDS: Need[] = [
  {
    id: HERO_NEED_ID,
    community: 'Portmore HS Shelter',
    kind: 'shelter',
    lat: 17.9546,
    lng: -76.8827,
    parish: 'St. Catherine',
    area: 'Braeton, Portmore',
    urgency: 'normal',
    peopleAffected: 0,
    status: 'open',
    items: [], // no active request until staff post one
  },
]

// Occupancy layer for the one shelter — empty; staff add residents and
// incoming guests through the app.
export const SEED_SHELTERS: Shelter[] = [
  {
    needId: HERO_NEED_ID,
    capacity: 500,
    occupants: [],
    incoming: [],
  },
]

export const SEED_DRIVERS: Driver[] = []

export const SEED_PLEDGES: Pledge[] = []

export const SEED_RUNS: Run[] = []

// ---------------------------------------------------------------------------
// Recognition: everyone starts at zero; no fabricated leaderboard.
// ---------------------------------------------------------------------------

export const YOU_ID = 'contrib-you'

export const SEED_YOU: Contributor = {
  id: YOU_ID,
  name: 'You',
  points: 0,
  contributions: 0,
  badges: [],
}

export const SEED_LEADERBOARD: Contributor[] = []

// ---------------------------------------------------------------------------
// A neutral fallback delivery record (proof-photo placeholder only). Not
// shown as data — used as a safe default if a run has no photo yet.
// ---------------------------------------------------------------------------

export const DEMO_DELIVERY: Delivery = {
  id: 'delivery-fallback',
  needId: HERO_NEED_ID,
  driverId: '',
  status: 'matched',
  routeMatchPct: 0,
  photoUrl: deliveryProof,
  timeline: [],
}

export const DEMO_ROUTE: [number, number][] = []

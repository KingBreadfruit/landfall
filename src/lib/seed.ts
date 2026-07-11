import type {
  Contributor,
  Delivery,
  Driver,
  Need,
  Pledge,
  Run,
  Shelter,
} from './types'
import { DROPOFF_SHELTER, HERO_NEED_ID } from './constants'
import deliveryProof from '@/assets/delivery-proof.jpg'

// ---------------------------------------------------------------------------
// Demo data — two of each thing so every screen has something to show:
// two shelters (each with a live request, a roster, and incoming guests),
// two people-in-need requests, two damage reports, two pledges, two claimed
// runs, and a small leaderboard. All fictional, all Portmore / St. Catherine.
// ---------------------------------------------------------------------------

const SECOND_SHELTER_ID = 'need-greater-portmore-cc'

export const SEED_NEEDS: Need[] = [
  // --- Shelters (2) --------------------------------------------------------
  {
    id: HERO_NEED_ID,
    community: 'Portmore HS Shelter',
    kind: 'shelter',
    lat: 17.9546,
    lng: -76.8827,
    parish: 'St. Catherine',
    area: 'Braeton, Portmore',
    urgency: 'high',
    peopleAffected: 340,
    status: 'open',
    items: [
      { name: 'Drinking water', unit: 'cases', qtyNeeded: 200, qtyPledged: 80 },
      { name: 'Tarpaulins', unit: 'units', qtyNeeded: 50, qtyPledged: 12 },
    ],
  },
  {
    id: SECOND_SHELTER_ID,
    community: 'Greater Portmore Community Centre',
    kind: 'shelter',
    lat: 17.942,
    lng: -76.888,
    parish: 'St. Catherine',
    area: 'Greater Portmore',
    urgency: 'critical',
    peopleAffected: 180,
    status: 'open',
    items: [
      { name: 'Baby formula', unit: 'tins', qtyNeeded: 60, qtyPledged: 15 },
      { name: 'Blankets', unit: 'units', qtyNeeded: 120, qtyPledged: 40 },
    ],
  },

  // --- People in need (2) --------------------------------------------------
  {
    id: 'need-person-gregory',
    community: 'Andrea M.',
    kind: 'person',
    lat: 17.97,
    lng: -76.89,
    parish: 'St. Catherine',
    area: 'Gregory Park',
    urgency: 'high',
    peopleAffected: 4,
    status: 'open',
    items: [
      { name: 'Drinking water', unit: 'cases', qtyNeeded: 3, qtyPledged: 0 },
      { name: 'Canned food', unit: 'cases', qtyNeeded: 2, qtyPledged: 0 },
    ],
  },
  {
    id: 'need-person-waterford',
    community: 'Devon C.',
    kind: 'person',
    lat: 17.964,
    lng: -76.876,
    parish: 'St. Catherine',
    area: 'Waterford',
    urgency: 'normal',
    peopleAffected: 2,
    status: 'open',
    items: [
      { name: 'Baby formula', unit: 'tins', qtyNeeded: 4, qtyPledged: 0 },
      { name: 'Hygiene kits', unit: 'kits', qtyNeeded: 2, qtyPledged: 0 },
    ],
  },

  // --- Repairs / groundwork (2) -------------------------------------------
  {
    id: 'need-repair-braeton',
    community: 'Reported by a resident',
    kind: 'repair',
    lat: 17.949,
    lng: -76.86,
    parish: 'St. Catherine',
    area: 'Braeton Main Road',
    urgency: 'high',
    peopleAffected: 0,
    status: 'open',
    damageType: 'Fallen tree blocking road',
    photoUrl: deliveryProof,
    items: [],
  },
  {
    id: 'need-repair-edgewater',
    community: 'Reported by a resident',
    kind: 'repair',
    lat: 17.935,
    lng: -76.85,
    parish: 'St. Catherine',
    area: 'Edgewater',
    urgency: 'normal',
    peopleAffected: 0,
    status: 'open',
    damageType: 'Torn roof — needs tarping',
    photoUrl: deliveryProof,
    items: [],
  },
]

// Occupancy layer for the two shelters — each with a roster and incoming
// guests (one overdue, to show the amber no-show alert).
export const SEED_SHELTERS: Shelter[] = [
  {
    needId: HERO_NEED_ID,
    capacity: 500,
    occupants: [
      {
        id: 'occ-portmore-1',
        name: 'Marva Bennett',
        trn: '124-583-991',
        dob: '14 Aug 1972',
        checkedInAt: '8:05 AM',
      },
      {
        id: 'occ-portmore-2',
        name: 'Kemar Reid',
        trn: '338-201-476',
        dob: '02 Feb 1990',
        checkedInAt: '9:41 AM',
      },
    ],
    incoming: [
      {
        id: 'inc-portmore-1',
        name: 'Sandra Powell',
        trn: '410-772-118',
        dob: '19 Nov 1965',
        phone: '876-555-0148',
        eta: '11:30 AM',
        status: 'enroute',
      },
      {
        id: 'inc-portmore-2',
        name: 'Junior Clarke',
        trn: '256-903-844',
        dob: '30 Jun 1988',
        phone: '876-555-0192',
        eta: '10:15 AM',
        status: 'overdue',
        lastSeen: 'Gregory Park roundabout',
      },
    ],
  },
  {
    needId: SECOND_SHELTER_ID,
    capacity: 250,
    occupants: [
      {
        id: 'occ-gpcc-1',
        name: 'Donna Service',
        trn: '509-114-620',
        dob: '25 Mar 1979',
        checkedInAt: '7:48 AM',
      },
      {
        id: 'occ-gpcc-2',
        name: 'Omar Grant',
        trn: '187-640-335',
        dob: '11 Sep 1995',
        checkedInAt: '10:22 AM',
      },
    ],
    incoming: [
      {
        id: 'inc-gpcc-1',
        name: 'Paulette Simms',
        trn: '622-458-107',
        dob: '08 Jan 1958',
        phone: '876-555-0177',
        eta: '12:00 PM',
        status: 'enroute',
      },
      {
        id: 'inc-gpcc-2',
        name: 'Rohan Palmer',
        trn: '741-309-266',
        dob: '17 May 2001',
        phone: '876-555-0163',
        eta: '9:45 AM',
        status: 'overdue',
        lastSeen: 'Naggo Head main road',
      },
    ],
  },
]

export const SEED_DRIVERS: Driver[] = [
  {
    id: 'driver-marcus',
    name: 'Marcus',
    vehicle: 'Pickup truck',
    capacity: '~40 cases',
    lat: 18.0107,
    lng: -76.7936,
    status: 'available',
  },
  {
    id: 'driver-simone',
    name: 'Simone',
    vehicle: 'Cargo van',
    capacity: '~80 cases',
    lat: 17.9889,
    lng: -76.8567,
    status: 'available',
  },
]

// Two pledges already flowing to the shelters (shown under Supplies).
export const SEED_PLEDGES: Pledge[] = [
  {
    id: 'pledge-1',
    needId: HERO_NEED_ID,
    donorName: 'Hi-Lo Portmore',
    items: [
      { name: 'Drinking water', unit: 'cases', qtyNeeded: 0, qtyPledged: 80 },
    ],
  },
  {
    id: 'pledge-2',
    needId: SECOND_SHELTER_ID,
    donorName: 'New Testament Church',
    items: [
      { name: 'Blankets', unit: 'units', qtyNeeded: 0, qtyPledged: 40 },
    ],
  },
]

// Two runs the volunteer has already claimed, at different stages of the
// accountability trail — so "My runs" isn't empty.
export const SEED_RUNS: Run[] = [
  {
    id: 'run-seed-1',
    needId: 'need-person-gregory',
    requesterName: 'Andrea M.',
    area: 'Gregory Park, St. Catherine',
    items: [
      { name: 'Drinking water', unit: 'cases', qty: 3 },
      { name: 'Canned food', unit: 'cases', qty: 2 },
    ],
    itemCount: 5,
    status: 'to_photograph',
    itemsPhoto: null,
    qrToken: 'K7QF2M',
    shelterName: DROPOFF_SHELTER.name,
    shelterAddress: DROPOFF_SHELTER.address,
    shelterLat: DROPOFF_SHELTER.lat,
    shelterLng: DROPOFF_SHELTER.lng,
  },
  {
    id: 'run-seed-2',
    needId: 'need-person-waterford',
    requesterName: 'Devon C.',
    area: 'Waterford, St. Catherine',
    items: [
      { name: 'Baby formula', unit: 'tins', qty: 4 },
      { name: 'Hygiene kits', unit: 'kits', qty: 2 },
    ],
    itemCount: 6,
    status: 'verified',
    itemsPhoto: deliveryProof,
    qrToken: 'B3XR9T',
    shelterName: DROPOFF_SHELTER.name,
    shelterAddress: DROPOFF_SHELTER.address,
    shelterLat: DROPOFF_SHELTER.lat,
    shelterLng: DROPOFF_SHELTER.lng,
  },
]

// ---------------------------------------------------------------------------
// Recognition: the current user starts at zero; a small leaderboard sits
// above them so the "climb" reads on screen.
// ---------------------------------------------------------------------------

export const YOU_ID = 'contrib-you'

export const SEED_YOU: Contributor = {
  id: YOU_ID,
  name: 'You',
  points: 0,
  contributions: 0,
  badges: [],
}

export const SEED_LEADERBOARD: Contributor[] = [
  {
    id: 'contrib-marcus',
    name: 'Marcus B.',
    points: 45,
    contributions: 6,
    badges: ['verified', 'top'],
  },
  {
    id: 'contrib-simone',
    name: 'Simone G.',
    points: 20,
    contributions: 3,
    badges: ['verified', 'top'],
  },
]

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

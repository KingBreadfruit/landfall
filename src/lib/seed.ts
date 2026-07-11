import type {
  Contributor,
  Delivery,
  Driver,
  Need,
  Pledge,
  Shelter,
} from './types'
import { HERO_DRIVER_ID, HERO_NEED_ID } from './constants'
import deliveryProof from '@/assets/delivery-proof.jpg'

// ---------------------------------------------------------------------------
// Seeded needs across Jamaica, mixed urgency. Two kinds so the volunteer's
// "Supplies Needed" screen can separate them: official SHELTERS and
// individual PEOPLE in need who requested help directly.
//
// The hero need (Portmore HS, CRITICAL shelter) is the one the 60-second
// demo arc runs on. Everything else is set dressing so the island looks
// alive.
// ---------------------------------------------------------------------------

export const SEED_NEEDS: Need[] = [
  // --- Shelters -----------------------------------------------------------
  {
    id: HERO_NEED_ID,
    community: 'Portmore HS Shelter',
    kind: 'shelter',
    lat: 17.9546,
    lng: -76.8827,
    parish: 'St. Catherine',
    area: 'Portmore',
    urgency: 'critical',
    peopleAffected: 340,
    status: 'open',
    items: [
      { name: 'Water', unit: 'cases', qtyNeeded: 200, qtyPledged: 40 },
      { name: 'Tarpaulins', unit: 'tarps', qtyNeeded: 50, qtyPledged: 0 },
    ],
  },
  {
    id: 'need-spanish-town',
    community: 'Spanish Town Baptist Shelter',
    kind: 'shelter',
    lat: 17.9961,
    lng: -76.9515,
    parish: 'St. Catherine',
    area: 'Spanish Town',
    urgency: 'high',
    peopleAffected: 220,
    status: 'open',
    items: [
      { name: 'Baby supplies', unit: 'kits', qtyNeeded: 40, qtyPledged: 5 },
      { name: 'Blankets', unit: 'blankets', qtyNeeded: 100, qtyPledged: 30 },
    ],
  },
  {
    id: 'need-old-harbour',
    community: 'Old Harbour Primary Shelter',
    kind: 'shelter',
    lat: 17.9411,
    lng: -77.109,
    parish: 'St. Catherine',
    area: 'Old Harbour',
    urgency: 'normal',
    peopleAffected: 95,
    status: 'open',
    items: [
      { name: 'Water', unit: 'cases', qtyNeeded: 50, qtyPledged: 20 },
      { name: 'Canned food', unit: 'boxes', qtyNeeded: 30, qtyPledged: 12 },
    ],
  },
  {
    id: 'need-portland',
    community: 'Port Antonio Seventh-Day Shelter',
    kind: 'shelter',
    lat: 18.1745,
    lng: -76.4498,
    parish: 'Portland',
    area: 'Port Antonio',
    urgency: 'normal',
    peopleAffected: 130,
    status: 'open',
    items: [
      { name: 'Canned food', unit: 'boxes', qtyNeeded: 45, qtyPledged: 18 },
      { name: 'Blankets', unit: 'blankets', qtyNeeded: 60, qtyPledged: 22 },
    ],
  },
  // --- People in need -----------------------------------------------------
  {
    id: 'need-gregory-park',
    community: 'Marlene B.',
    kind: 'person',
    lat: 17.9622,
    lng: -76.871,
    parish: 'St. Catherine',
    area: 'Gregory Park, Portmore',
    urgency: 'critical',
    peopleAffected: 5,
    status: 'open',
    items: [
      { name: 'Water', unit: 'cases', qtyNeeded: 6, qtyPledged: 0 },
      { name: 'Baby supplies', unit: 'kits', qtyNeeded: 3, qtyPledged: 0 },
    ],
  },
  {
    id: 'need-kingston-trench',
    community: 'Devon Grant',
    kind: 'person',
    lat: 17.9905,
    lng: -76.7967,
    parish: 'Kingston',
    area: 'Trench Town',
    urgency: 'high',
    peopleAffected: 6,
    status: 'open',
    items: [
      { name: 'Canned food', unit: 'boxes', qtyNeeded: 8, qtyPledged: 2 },
      { name: 'Water', unit: 'cases', qtyNeeded: 6, qtyPledged: 1 },
    ],
  },
  {
    id: 'need-st-elizabeth',
    community: 'The Palmer household',
    kind: 'person',
    lat: 18.0263,
    lng: -77.8487,
    parish: 'St. Elizabeth',
    area: 'Black River',
    urgency: 'critical',
    peopleAffected: 8,
    status: 'open',
    items: [
      { name: 'Water', unit: 'cases', qtyNeeded: 10, qtyPledged: 1 },
      { name: 'Tarpaulins', unit: 'tarps', qtyNeeded: 4, qtyPledged: 0 },
      { name: 'Baby supplies', unit: 'kits', qtyNeeded: 2, qtyPledged: 0 },
    ],
  },
  // --- Repairs / Groundwork (damage reports from citizens) ---------------
  // NOTE: placeholder photo — swap for real damage photos before the demo.
  {
    id: 'need-repair-tree',
    community: 'Reported by a resident',
    kind: 'repair',
    lat: 17.9601,
    lng: -76.8752,
    parish: 'St. Catherine',
    area: 'Braeton, Portmore',
    urgency: 'high',
    peopleAffected: 0,
    status: 'open',
    items: [],
    damageType: 'Tree blown down',
    photoUrl: deliveryProof,
  },
  {
    id: 'need-repair-roof',
    community: 'Reported by a resident',
    kind: 'repair',
    lat: 17.9948,
    lng: -76.9498,
    parish: 'St. Catherine',
    area: 'Spanish Town',
    urgency: 'critical',
    peopleAffected: 0,
    status: 'open',
    items: [],
    damageType: 'Roof damage',
    photoUrl: deliveryProof,
  },
]

// ---------------------------------------------------------------------------
// Recognition: the current user + a seeded leaderboard. YOU starts at zero
// so the demo shows the first-contribution "Verified" unlock live; pledge
// ~15 items on the hero need and you cross 20 → "Top Contributor" too.
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
  { id: 'c-digicel', name: 'Digicel Foundation', points: 340, contributions: 24, badges: ['verified', 'top'] },
  { id: 'c-hilo', name: 'Hi-Lo Cross Roads', points: 280, contributions: 19, badges: ['verified', 'top'] },
  { id: 'c-marcus', name: 'Marcus Reid', points: 165, contributions: 12, badges: ['verified', 'top'] },
  { id: 'c-openbible', name: 'Open Bible Church', points: 130, contributions: 9, badges: ['verified', 'top'] },
  { id: 'c-alicia', name: 'Alicia Grant', points: 45, contributions: 4, badges: ['verified', 'top'] },
]

// ---------------------------------------------------------------------------
// Shelter occupancy layer (government-official view). Keyed by needId so a
// shelter's supplies and its people are the same record. Rosters are a
// realistic SAMPLE of logged residents, not the full headcount — a big
// shelter has hundreds sheltering but only who's been logged via the app
// appears here. All names/TRNs are fabricated for the demo.
// ---------------------------------------------------------------------------

export const SEED_SHELTERS: Shelter[] = [
  {
    needId: HERO_NEED_ID, // Portmore HS Shelter
    capacity: 400,
    occupants: [
      { id: 'occ-1', name: 'Andre Campbell', trn: '118-204-337', dob: '12 Mar 1984', checkedInAt: '9:15 AM' },
      { id: 'occ-2', name: 'Shanice Reid', trn: '127-880-410', dob: '02 Nov 1996', checkedInAt: '9:22 AM' },
      { id: 'occ-3', name: 'Everton Blake', trn: '104-559-231', dob: '25 Jun 1971', checkedInAt: '9:40 AM' },
      { id: 'occ-4', name: 'Kimoy Bennett', trn: '133-201-908', dob: '19 Jan 2001', checkedInAt: '10:05 AM' },
      { id: 'occ-5', name: 'Trevor Ellis', trn: '119-773-556', dob: '30 Sep 1965', checkedInAt: '10:18 AM' },
      { id: 'occ-6', name: 'Petagaye Simms', trn: '141-006-822', dob: '14 Jul 1990', checkedInAt: '10:47 AM' },
    ],
    incoming: [
      {
        id: 'inc-1',
        name: 'Marlene Brown',
        trn: '122-447-901',
        dob: '09 May 1988',
        phone: '876-555-0142',
        eta: '11:30 AM',
        status: 'enroute',
      },
      {
        id: 'inc-2',
        name: 'Junior Thompson',
        trn: '130-559-100',
        dob: '21 Feb 1979',
        phone: '876-555-0177',
        eta: '11:00 AM',
        status: 'overdue',
        lastSeen: 'Gregory Park, Portmore · requested 10:31 AM',
      },
    ],
  },
  {
    needId: 'need-spanish-town',
    capacity: 300,
    occupants: [
      { id: 'occ-7', name: 'Dwayne Foster', trn: '112-330-449', dob: '03 Aug 1982', checkedInAt: '8:50 AM' },
      { id: 'occ-8', name: 'Annmarie Clarke', trn: '128-901-233', dob: '17 Dec 1993', checkedInAt: '9:05 AM' },
      { id: 'occ-9', name: 'Leroy Grant', trn: '106-774-018', dob: '28 Apr 1968', checkedInAt: '9:31 AM' },
      { id: 'occ-10', name: 'Tamara Wright', trn: '139-220-671', dob: '11 Oct 1999', checkedInAt: '10:12 AM' },
    ],
    incoming: [
      {
        id: 'inc-3',
        name: 'Carlton Powell',
        trn: '124-118-903',
        dob: '06 Jan 1975',
        phone: '876-555-0119',
        eta: '11:45 AM',
        status: 'enroute',
      },
    ],
  },
  {
    needId: 'need-old-harbour',
    capacity: 120,
    occupants: [
      { id: 'occ-11', name: 'Michael Service', trn: '115-662-204', dob: '19 May 1987', checkedInAt: '9:12 AM' },
      { id: 'occ-12', name: 'Denise Palmer', trn: '131-045-778', dob: '23 Feb 1991', checkedInAt: '9:48 AM' },
      { id: 'occ-13', name: 'Barrington Case', trn: '109-337-560', dob: '07 Nov 1962', checkedInAt: '10:20 AM' },
    ],
    incoming: [],
  },
  {
    needId: 'need-portland',
    capacity: 160,
    occupants: [
      { id: 'occ-14', name: 'Sophia Malcolm', trn: '126-559-032', dob: '15 Sep 1994', checkedInAt: '8:40 AM' },
      { id: 'occ-15', name: 'Owen Sinclair', trn: '117-880-441', dob: '02 Mar 1970', checkedInAt: '9:27 AM' },
      { id: 'occ-16', name: 'Rochelle Dawes', trn: '134-201-119', dob: '30 Jun 1998', checkedInAt: '10:03 AM' },
    ],
    incoming: [],
  },
]

// ---------------------------------------------------------------------------
// Seeded drivers — Marcus is the hero driver, positioned in Half Way Tree
// for a clean scripted route down to the Portmore hero need.
// ---------------------------------------------------------------------------

export const SEED_DRIVERS: Driver[] = [
  {
    id: HERO_DRIVER_ID,
    name: 'Marcus',
    vehicle: 'Pickup truck',
    capacity: '60 cases',
    lat: 18.0107,
    lng: -76.7991,
    status: 'available',
  },
  {
    id: 'driver-keisha',
    name: 'Keisha',
    vehicle: 'Cargo van',
    capacity: '120 boxes',
    lat: 18.0043,
    lng: -76.9602,
    status: 'available',
  },
  {
    id: 'driver-delroy',
    name: 'Delroy',
    vehicle: 'Box truck',
    capacity: '2 tonnes',
    lat: 17.9647,
    lng: -77.2405,
    status: 'available',
  },
  {
    id: 'driver-alicia',
    name: 'Alicia',
    vehicle: 'SUV',
    capacity: '25 cases',
    lat: 18.4023,
    lng: -77.1031,
    status: 'available',
  },
]

// ---------------------------------------------------------------------------
// Pre-set pledges so the board isn't empty on load.
// ---------------------------------------------------------------------------

export const SEED_PLEDGES: Pledge[] = [
  {
    id: 'pledge-1',
    needId: 'need-old-harbour',
    donorName: 'Hi-Lo Supermarket, Cross Roads',
    items: [
      { name: 'Water', unit: 'cases', qtyNeeded: 0, qtyPledged: 20 },
      { name: 'Canned food', unit: 'boxes', qtyNeeded: 0, qtyPledged: 12 },
    ],
  },
  {
    id: 'pledge-2',
    needId: HERO_NEED_ID,
    donorName: 'Open Bible Church, Waterford',
    items: [{ name: 'Water', unit: 'cases', qtyNeeded: 0, qtyPledged: 40 }],
  },
]

// ---------------------------------------------------------------------------
// The scripted delivery for the demo arc: Marcus takes the Portmore run.
// The morning build animates this along DEMO_ROUTE and steps the timeline.
// ---------------------------------------------------------------------------

export const DEMO_DELIVERY: Delivery = {
  id: 'delivery-demo',
  needId: HERO_NEED_ID,
  driverId: HERO_DRIVER_ID,
  status: 'matched',
  routeMatchPct: 87,
  photoUrl: deliveryProof,
  timeline: [
    { label: 'Matched to run', time: '10:42 AM', done: true },
    { label: 'Supplies picked up', time: '10:58 AM', done: true },
    { label: 'En route to Portmore', time: '11:07 AM', done: false },
    { label: 'Delivered & verified', time: '', done: false },
  ],
}

// Scripted route Marcus drives on the map (Half Way Tree → Portmore),
// rough waypoints along the causeway. Morning task: animate a marker
// along these points with motion.
export const DEMO_ROUTE: [number, number][] = [
  [18.0107, -76.7991], // Half Way Tree
  [17.9986, -76.8039], // Cross Roads
  [17.9771, -76.8168], // Downtown west
  [17.9663, -76.8494], // Causeway east
  [17.9585, -76.8703], // Causeway west
  [17.9546, -76.8827], // Portmore HS Shelter
]

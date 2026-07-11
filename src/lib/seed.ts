import type { Delivery, Driver, Need, Pledge } from './types'
import { HERO_DRIVER_ID, HERO_NEED_ID } from './constants'
import deliveryProof from '@/assets/delivery-proof.jpg'

// ---------------------------------------------------------------------------
// Seeded needs — six communities across Jamaica, mixed urgency.
// The hero need (Portmore, CRITICAL) is the one the 60-second demo arc
// runs on. Everything else is set dressing so the island looks alive.
// ---------------------------------------------------------------------------

export const SEED_NEEDS: Need[] = [
  {
    id: HERO_NEED_ID,
    community: 'Portmore HS Shelter',
    kind: 'shelter',
    lat: 17.9546,
    lng: -76.8827,
    parish: 'St. Catherine',
    urgency: 'critical',
    peopleAffected: 340,
    status: 'open',
    items: [
      { name: 'Water', unit: 'cases', qtyNeeded: 200, qtyPledged: 40 },
      { name: 'Tarpaulins', unit: 'tarps', qtyNeeded: 50, qtyPledged: 0 },
    ],
  },
  {
    id: 'need-kingston-trench',
    community: 'Trench Town Community Centre',
    kind: 'community',
    lat: 17.9905,
    lng: -76.7967,
    parish: 'Kingston',
    urgency: 'high',
    peopleAffected: 180,
    status: 'open',
    items: [
      { name: 'Canned food', unit: 'boxes', qtyNeeded: 80, qtyPledged: 25 },
      { name: 'Water', unit: 'cases', qtyNeeded: 60, qtyPledged: 10 },
    ],
  },
  {
    id: 'need-spanish-town',
    community: 'Spanish Town Baptist Shelter',
    kind: 'shelter',
    lat: 17.9961,
    lng: -76.9515,
    parish: 'St. Catherine',
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
    urgency: 'normal',
    peopleAffected: 95,
    status: 'open',
    items: [
      { name: 'Water', unit: 'cases', qtyNeeded: 50, qtyPledged: 20 },
      { name: 'Canned food', unit: 'boxes', qtyNeeded: 30, qtyPledged: 12 },
    ],
  },
  {
    id: 'need-st-elizabeth',
    community: 'Black River Community',
    kind: 'community',
    lat: 18.0263,
    lng: -77.8487,
    parish: 'St. Elizabeth',
    urgency: 'critical',
    peopleAffected: 410,
    status: 'open',
    items: [
      { name: 'Generators', unit: 'units', qtyNeeded: 6, qtyPledged: 1 },
      { name: 'Water', unit: 'cases', qtyNeeded: 150, qtyPledged: 15 },
      { name: 'Tarpaulins', unit: 'tarps', qtyNeeded: 80, qtyPledged: 10 },
    ],
  },
  {
    id: 'need-portland',
    community: 'Port Antonio Seventh-Day Shelter',
    kind: 'shelter',
    lat: 18.1745,
    lng: -76.4498,
    parish: 'Portland',
    urgency: 'normal',
    peopleAffected: 130,
    status: 'open',
    items: [
      { name: 'Canned food', unit: 'boxes', qtyNeeded: 45, qtyPledged: 18 },
      { name: 'Blankets', unit: 'blankets', qtyNeeded: 60, qtyPledged: 22 },
    ],
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
    needId: 'need-kingston-trench',
    donorName: 'Hi-Lo Supermarket, Cross Roads',
    items: [
      { name: 'Canned food', unit: 'boxes', qtyNeeded: 0, qtyPledged: 25 },
      { name: 'Water', unit: 'cases', qtyNeeded: 0, qtyPledged: 10 },
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

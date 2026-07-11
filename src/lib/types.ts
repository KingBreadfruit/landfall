export type Urgency = 'critical' | 'high' | 'normal'

export type Item = {
  name: string
  unit: string
  qtyNeeded: number
  qtyPledged: number
}

export type Need = {
  id: string
  /** Shelter name, or the requester's name for a person in need. */
  community: string
  /** Who posted it: an official shelter, or a person affected. */
  kind: 'shelter' | 'person'
  lat: number
  lng: number
  parish: string
  /** Optional finer location (street / district), shown before parish. */
  area?: string
  items: Item[]
  urgency: Urgency
  /** Shelter: people sheltering. Person: household size. */
  peopleAffected: number
  status: 'open' | 'matched' | 'fulfilled'
}

/** A person logged as staying at a shelter (government-official view). */
export type Occupant = {
  id: string
  name: string
  /** Tax Registration Number — 9 digits, shown as 123-456-789. */
  trn: string
  /** Date of birth, display string. */
  dob: string
  /** When they were checked in, display time. */
  checkedInAt: string
}

/**
 * Someone who requested to stay and is on their way. If they don't arrive
 * by `eta`, the shelter flips them to 'overdue' (amber) — phone shows so
 * staff can call, and `lastSeen` (where they were when they requested) is
 * revealed after a wait.
 */
export type IncomingGuest = {
  id: string
  name: string
  trn: string
  dob: string
  phone: string
  /** Expected arrival, display time. */
  eta: string
  status: 'enroute' | 'overdue' | 'arrived'
  /** Last known location (from the request), revealed when overdue. */
  lastSeen?: string
}

/**
 * Occupancy layer over a shelter-kind Need. Keyed by needId so supplies
 * (items/pledges) and people (occupants/incoming) share one shelter.
 */
export type Shelter = {
  needId: string
  capacity: number
  occupants: Occupant[]
  incoming: IncomingGuest[]
}

export type Driver = {
  id: string
  name: string
  vehicle: string
  capacity: string
  lat: number
  lng: number
  status: 'available' | 'enroute' | 'delivered'
}

export type Pledge = {
  id: string
  needId: string
  donorName: string
  items: Item[]
}

export type TimelineStep = {
  label: string
  time: string
  done: boolean
}

export type Delivery = {
  id: string
  needId: string
  driverId: string
  status: 'matched' | 'enroute' | 'delivered'
  routeMatchPct: number
  photoUrl: string
  timeline: TimelineStep[]
}

/** App screens — Zustand-driven, no router needed for a demo. */
export type Screen = 'map' | 'pledge' | 'match' | 'delivery' | 'post-need'

/**
 * The three perspectives in the network, switchable from the bottom nav:
 * volunteer (see needs, pledge, run supplies), shelter (post + track
 * needs), requester (a person asking for help).
 */
export type Role = 'volunteer' | 'shelter' | 'requester'

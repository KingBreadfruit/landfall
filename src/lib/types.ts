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

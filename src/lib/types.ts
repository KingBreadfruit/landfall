export type Urgency = 'critical' | 'high' | 'normal'

export type Item = {
  name: string
  unit: string
  qtyNeeded: number
  qtyPledged: number
}

export type Need = {
  id: string
  community: string
  kind: 'shelter' | 'community'
  lat: number
  lng: number
  parish: string
  items: Item[]
  urgency: Urgency
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

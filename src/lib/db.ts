// Row shapes for the Supabase tables (see CLAUDE.md v2 spec). These mirror
// the columns exactly so queries stay honest.

export type Urgency = 'critical' | 'high' | 'normal'
export type RequestSource = 'citizen' | 'shelter'

export type RequestStatus =
  | 'open'
  | 'claimed'
  | 'picked_up'
  | 'at_shelter'
  | 'verified'
  | 'closed'
  | 'cancelled'

export type Profile = {
  id: string
  name: string
  role: 'volunteer' | 'shelter' | 'citizen'
  points: number
  badges: string[]
  created_at: string
}

export type ShelterRow = {
  id: string
  name: string
  parish: string
  area: string | null
  lat: number | null
  lng: number | null
  capacity: number
  created_at: string
}

export type InventoryRow = {
  id: string
  shelter_id: string
  item_name: string
  unit: string
  qty: number
}

export type RequestRow = {
  id: string
  source: RequestSource
  requester_id: string | null
  requester_name: string | null
  destination_shelter_id: string | null
  urgency: Urgency
  status: RequestStatus
  created_at: string
}

export type RequestItemRow = {
  id: string
  request_id: string
  item_name: string
  unit: string
  qty_requested: number
  qty_fulfilled: number
}

export type RepairRow = {
  id: string
  reporter_id: string | null
  damage_type: string
  photo_url: string | null
  parish: string | null
  area: string | null
  urgency: Urgency
  status: 'open' | 'claimed' | 'done'
  claimed_by: string | null
  created_at: string
}

export type TicketRow = {
  id: string
  request_id: string
  volunteer_id: string | null
  qr_token: string
  status: 'claimed' | 'picked_up' | 'at_shelter' | 'verified' | 'closed'
  proof_photo_url: string | null
  picked_up_at: string | null
  delivered_at: string | null
  verified_at: string | null
}

export type IncomingGuestRow = {
  id: string
  shelter_id: string
  name: string
  trn: string | null
  dob: string | null
  phone: string | null
  eta: string | null
  status: 'enroute' | 'overdue' | 'arrived' | 'holding'
  last_seen: string | null
  created_at: string
}

export type OccupantRow = {
  id: string
  shelter_id: string
  name: string
  trn: string | null
  dob: string | null
  checked_in_at: string | null
  status: 'sheltering' | 'holding' | 'transferred'
}

/** A request joined with its line items — what the board renders. */
export type RequestWithItems = RequestRow & { items: RequestItemRow[] }

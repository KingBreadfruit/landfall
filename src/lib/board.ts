import type { Need } from './types'
import { hasSupabase, supabase } from './supabase'

/**
 * Shared board sync. Citizen/shelter requests and damage reports are
 * written to a single `board_needs` table so every device sees them —
 * this is what lets one phone submit and another phone's board update.
 *
 * Everything here is best-effort and defensive: if the backend is missing,
 * slow, or errors, the calls no-op and the app keeps running on its local
 * board. Nothing in here is allowed to throw into the UI.
 */

type BoardRow = {
  id: string
  kind: Need['kind']
  community: string
  parish: string
  area: string | null
  lat: number
  lng: number
  urgency: Need['urgency']
  people_affected: number
  items: Need['items']
  damage_type: string | null
  photo_url: string | null
  status: Need['status']
}

function rowToNeed(row: BoardRow): Need {
  return {
    id: row.id,
    community: row.community,
    kind: row.kind,
    lat: row.lat,
    lng: row.lng,
    parish: row.parish,
    area: row.area ?? undefined,
    items: Array.isArray(row.items) ? row.items : [],
    urgency: row.urgency,
    peopleAffected: row.people_affected ?? 0,
    status: row.status ?? 'open',
    damageType: row.damage_type ?? undefined,
    photoUrl: row.photo_url ?? undefined,
  }
}

function needToRow(need: Need, createdBy: string | null): Record<string, unknown> {
  return {
    id: need.id,
    kind: need.kind,
    community: need.community,
    parish: need.parish,
    area: need.area ?? null,
    lat: need.lat,
    lng: need.lng,
    urgency: need.urgency,
    people_affected: need.peopleAffected,
    items: need.items,
    damage_type: need.damageType ?? null,
    photo_url: need.photoUrl ?? null,
    status: need.status,
    ...(createdBy ? { created_by: createdBy } : {}),
  }
}

/** Fetch all open needs posted by anyone. Returns [] on any failure. */
export async function fetchOpenNeeds(): Promise<Need[]> {
  if (!hasSupabase) return []
  try {
    const { data, error } = await supabase
      .from('board_needs')
      .select('*')
      .eq('status', 'open')
      .order('created_at', { ascending: false })
    if (error || !data) return []
    return (data as BoardRow[]).map(rowToNeed)
  } catch {
    return []
  }
}

// These publish functions return true on success, false on failure (e.g.
// offline). The caller queues failures in an outbox and retries on reconnect.

/** Publish a need to the shared board (insert or update by id). */
export async function upsertRemoteNeed(
  need: Need,
  createdBy: string | null,
): Promise<boolean> {
  if (!hasSupabase) return false
  try {
    const { error } = await supabase
      .from('board_needs')
      .upsert(needToRow(need, createdBy))
    return !error
  } catch {
    return false
  }
}

/** Mark a need off the open board everywhere (e.g. once it's claimed). */
export async function markRemoteNeed(
  id: string,
  status: Need['status'],
): Promise<boolean> {
  if (!hasSupabase) return false
  try {
    const { error } = await supabase
      .from('board_needs')
      .update({ status })
      .eq('id', id)
    return !error
  } catch {
    return false
  }
}

/** A volunteer claims a repair: mark it matched and record who claimed it,
 * so points can be awarded to them once the resident confirms. */
export async function claimRepair(
  id: string,
  claimedBy: string | null,
): Promise<boolean> {
  if (!hasSupabase) return false
  try {
    const { error } = await supabase
      .from('board_needs')
      .update({ status: 'matched', claimed_by: claimedBy })
      .eq('id', id)
    return !error
  } catch {
    return false
  }
}

/** The repairs THIS resident reported that are done and awaiting their
 * confirmation before points are released. */
export async function fetchMyPendingRepairs(userId: string): Promise<Need[]> {
  if (!hasSupabase) return []
  try {
    const { data, error } = await supabase
      .from('board_needs')
      .select('*')
      .eq('created_by', userId)
      .eq('kind', 'repair')
      .eq('status', 'matched')
    if (error || !data) return []
    return (data as BoardRow[]).map(rowToNeed)
  } catch {
    return []
  }
}

/** Resident confirms a repair is done → awards the claimer's points
 * server-side (via the confirm_repair function). */
export async function confirmRepairRemote(id: string): Promise<boolean> {
  if (!hasSupabase) return false
  try {
    const { error } = await supabase.rpc('confirm_repair', { need_id: id })
    return !error
  } catch {
    return false
  }
}

/** Of the given repair ids, which are now confirmed (for reload reconcile). */
export async function fetchConfirmedIds(ids: string[]): Promise<string[]> {
  if (!hasSupabase || ids.length === 0) return []
  try {
    const { data, error } = await supabase
      .from('board_needs')
      .select('id,status')
      .in('id', ids)
      .eq('status', 'confirmed')
    if (error || !data) return []
    return (data as { id: string }[]).map((r) => r.id)
  } catch {
    return []
  }
}

// --- Shelter check-ins (citizen declares they're heading to a shelter) -----

export type CheckIn = { id: string; shelterId: string; name: string; eta: string }

type CheckInRow = {
  id: string
  shelter_id: string
  name: string
  eta: string | null
}

function rowToCheckin(r: CheckInRow): CheckIn {
  return { id: r.id, shelterId: r.shelter_id, name: r.name, eta: r.eta ?? '' }
}

/** All check-ins currently posted. Returns [] on any failure. */
export async function fetchCheckins(): Promise<CheckIn[]> {
  if (!hasSupabase) return []
  try {
    const { data, error } = await supabase
      .from('board_checkins')
      .select('*')
      .order('created_at', { ascending: false })
    if (error || !data) return []
    return (data as CheckInRow[]).map(rowToCheckin)
  } catch {
    return []
  }
}

/** Publish a shelter check-in so the shelter's device sees it. */
export async function insertCheckin(
  ci: CheckIn,
  createdBy: string | null,
): Promise<boolean> {
  if (!hasSupabase) return false
  try {
    const { error } = await supabase.from('board_checkins').upsert({
      id: ci.id,
      shelter_id: ci.shelterId,
      name: ci.name,
      eta: ci.eta,
      ...(createdBy ? { created_by: createdBy } : {}),
    })
    return !error
  } catch {
    return false
  }
}

let subscribed = false

/**
 * Subscribe to live board changes. `onUpsert` fires for an open need that
 * appeared or changed; `onRemove` fires when a need leaves the open board
 * (claimed or deleted). Safe to call more than once — only the first wins.
 */
export function subscribeToBoard(
  onUpsert: (need: Need) => void,
  onRemove: (id: string) => void,
  onCheckin: (ci: CheckIn) => void,
  onConfirmed: (id: string) => void,
  onStatus?: (live: boolean) => void,
): void {
  if (!hasSupabase || subscribed) return
  subscribed = true
  try {
    supabase
      .channel('board_live')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'board_needs' },
        (payload) => {
          const row = (payload.new ?? payload.old) as BoardRow | null
          if (!row) return
          if (payload.eventType === 'DELETE') {
            onRemove(row.id)
            return
          }
          const next = payload.new as BoardRow
          if (next.status === 'open') onUpsert(rowToNeed(next))
          else onRemove(next.id)
          if (next.status === 'confirmed') onConfirmed(next.id)
        },
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'board_checkins' },
        (payload) => onCheckin(rowToCheckin(payload.new as CheckInRow)),
      )
      .subscribe((status) => {
        onStatus?.(status === 'SUBSCRIBED')
      })
  } catch {
    subscribed = false
  }
}

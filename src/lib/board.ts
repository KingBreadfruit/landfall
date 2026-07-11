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

/** Publish a need to the shared board (insert or update by id). */
export async function upsertRemoteNeed(
  need: Need,
  createdBy: string | null,
): Promise<void> {
  if (!hasSupabase) return
  try {
    await supabase.from('board_needs').upsert(needToRow(need, createdBy))
  } catch {
    /* best-effort — local board still has it */
  }
}

/** Mark a need off the open board everywhere (e.g. once it's claimed). */
export async function markRemoteNeed(
  id: string,
  status: Need['status'],
): Promise<void> {
  if (!hasSupabase) return
  try {
    await supabase.from('board_needs').update({ status }).eq('id', id)
  } catch {
    /* best-effort */
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
  onStatus?: (live: boolean) => void,
): void {
  if (!hasSupabase || subscribed) return
  subscribed = true
  try {
    supabase
      .channel('board_needs')
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
        },
      )
      .subscribe((status) => {
        onStatus?.(status === 'SUBSCRIBED')
      })
  } catch {
    subscribed = false
  }
}

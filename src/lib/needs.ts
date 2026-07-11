import type { Need } from './types'

/** Sort key: critical needs first, normal last. */
export const URGENCY_RANK: Record<Need['urgency'], number> = {
  critical: 0,
  high: 1,
  normal: 2,
}

export function byUrgency(a: Need, b: Need): number {
  return URGENCY_RANK[a.urgency] - URGENCY_RANK[b.urgency]
}

/** Aggregate supplied % across all of a need's items (capped at 100). */
export function overallProgress(need: Need): number {
  const needed = need.items.reduce((sum, i) => sum + i.qtyNeeded, 0)
  const pledged = need.items.reduce(
    (sum, i) => sum + Math.min(i.qtyPledged, i.qtyNeeded),
    0,
  )
  return needed === 0 ? 0 : Math.round((pledged / needed) * 100)
}

/** People-count phrasing differs by requester kind. */
export function peopleLabel(need: Need): string {
  return need.kind === 'shelter'
    ? `${need.peopleAffected} sheltering`
    : `Household of ${need.peopleAffected}`
}

/** "Area, Parish" when an area is set, otherwise just the parish. */
export function locationLabel(need: Need): string {
  return need.area ? `${need.area}, ${need.parish}` : need.parish
}

export const KIND_LABEL: Record<Need['kind'], string> = {
  shelter: 'Shelter',
  person: 'Person in need',
}

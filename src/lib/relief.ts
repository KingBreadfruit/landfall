import type { BadgeKind, Category } from './types'

// ---------------------------------------------------------------------------
// Relief catalog + contribution scoring.
// ---------------------------------------------------------------------------

/**
 * Generic disaster-relief items a household can request (modelled on
 * ODPEM / Red Cross emergency supply lists). `perPerson` scales the cap
 * by household size so no one household can hoard.
 */
export type ReliefItem = {
  name: string
  unit: string
  perPerson: number
}

export const RELIEF_CATALOG: ReliefItem[] = [
  { name: 'Drinking water', unit: 'cases', perPerson: 1 },
  { name: 'Canned food', unit: 'boxes', perPerson: 1 },
  { name: 'Baby formula & diapers', unit: 'kits', perPerson: 0.5 },
  { name: 'First-aid kit', unit: 'kits', perPerson: 0.3 },
  { name: 'Tarpaulin', unit: 'tarps', perPerson: 0.4 },
  { name: 'Blankets', unit: 'blankets', perPerson: 1 },
  { name: 'Hygiene kit', unit: 'kits', perPerson: 1 },
  { name: 'Flashlight & batteries', unit: 'sets', perPerson: 0.5 },
  { name: 'Sanitary pads', unit: 'packs', perPerson: 0.5 },
  { name: 'Bleach & cleaning', unit: 'sets', perPerson: 0.3 },
  { name: 'Mosquito repellent', unit: 'bottles', perPerson: 0.5 },
  { name: 'Water purification tabs', unit: 'packs', perPerson: 0.4 },
]

const HARD_CAP = 12

/** Max quantity of one item a household of `size` may request. */
export function itemCap(item: ReliefItem, household: number): number {
  return Math.min(HARD_CAP, Math.max(1, Math.round(item.perPerson * household)))
}

/**
 * Total units a household may request across all items — stops anyone
 * grabbing one of everything. Scales with household size.
 */
export function totalCap(household: number): number {
  return Math.max(3, household * 3)
}

const SINGULAR: Record<string, string> = {
  cases: 'case',
  boxes: 'box',
  kits: 'kit',
  tarps: 'tarp',
  blankets: 'blanket',
  sets: 'set',
  packs: 'pack',
  bottles: 'bottle',
}

/** Grammatically correct unit for a quantity ("1 case", "2 cases"). */
export function unitLabel(qty: number, unit: string): string {
  return qty === 1 ? (SINGULAR[unit] ?? unit) : unit
}

// ---------------------------------------------------------------------------
// Damage reports (Repairs / Groundwork).
// ---------------------------------------------------------------------------

export type DamageType = {
  id: string
  label: string
  emoji: string
}

export const DAMAGE_TYPES: DamageType[] = [
  { id: 'tree', label: 'Tree blown down', emoji: '🌴' },
  { id: 'road', label: 'Road blocked', emoji: '🚧' },
  { id: 'roof', label: 'Roof damage', emoji: '🏚️' },
  { id: 'power', label: 'Power line down', emoji: '⚡' },
  { id: 'flood', label: 'Flooding', emoji: '🌊' },
  { id: 'other', label: 'Other damage', emoji: '⚠️' },
]

// ---------------------------------------------------------------------------
// Points & badges.
//
// Two categories:
//   • Groundwork  — clearing roads, roofs, physical recovery work: 10 pts.
//   • Supply drop — bringing items: 5 + one point per item, so effort
//                   scales with how much you move (10 items = 15 pts) but
//                   never runaway.
// Badges: first ever contribution -> Verified; 20+ points -> Top.
// ---------------------------------------------------------------------------

export const GROUNDWORK_POINTS = 10
export const TOP_THRESHOLD = 20

export const CATEGORY_LABEL: Record<Category, string> = {
  supply: 'Supply drop',
  groundwork: 'Groundwork',
}

export const BADGE_LABEL: Record<BadgeKind, string> = {
  verified: 'Verified Contributor',
  top: 'Top Contributor',
}

export function supplyPoints(itemsMoved: number): number {
  return itemsMoved > 0 ? 5 + itemsMoved : 0
}

// Input hardening for the chaos test: every user-supplied value passes
// through here before touching state. No throws — garbage in, safe
// defaults out.

export const MAX_QTY = 100_000
export const MAX_TEXT_LEN = 120

/**
 * Coerce anything to a safe integer quantity in [0, max].
 * NaN, Infinity, negatives, and non-numeric strings all become 0.
 */
export function clampQty(value: unknown, max: number = MAX_QTY): number {
  const n = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(n)) return 0
  return Math.min(Math.max(Math.floor(n), 0), max)
}

/**
 * Trim, collapse internal whitespace, and cap length. Whitespace-only
 * input becomes '' (callers substitute their own fallback).
 */
export function cleanText(value: string, maxLen: number = MAX_TEXT_LEN): string {
  return value.replace(/\s+/g, ' ').trim().slice(0, maxLen)
}

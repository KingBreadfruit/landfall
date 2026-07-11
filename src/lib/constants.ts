// The app name is a placeholder — rename the product in one pass by
// changing APP_NAME (plus index.html title and the PWA manifest name
// in vite.config.ts).
export const APP_NAME = 'Landfall'

export const TAGLINE = 'The emergency logistics layer for the island.'

// Map configuration — Jamaica
export const MAP_CENTER: [number, number] = [18.05, -77.3]
export const MAP_ZOOM = 9

// Bounding box used for offline tile pre-caching and map bounds.
export const JAMAICA_BOUNDS: [[number, number], [number, number]] = [
  [17.5, -78.6], // southwest
  [18.7, -75.9], // northeast
]

export const TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
export const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'

// Urgency colors (kept in sync with the CSS variables in index.css).
export const URGENCY_COLORS = {
  critical: '#dc2626', // red
  high: '#f59e0b', // amber
  normal: '#3b82f6', // blue
} as const

export const URGENCY_LABELS = {
  critical: 'CRITICAL',
  high: 'HIGH',
  normal: 'NORMAL',
} as const

// The demo arc runs on these two — the hero need and the hero driver.
export const HERO_NEED_ID = 'need-portmore-hs'
export const HERO_DRIVER_ID = 'driver-marcus'

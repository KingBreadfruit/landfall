import { useEffect } from 'react'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import {
  JAMAICA_BOUNDS,
  MAP_CENTER,
  MAP_ZOOM,
  TILE_ATTRIBUTION,
  TILE_URL,
} from '@/lib/constants'
import { useStore } from '@/lib/store'
import { NeedPin } from './NeedPin'

/**
 * Leaflet computes its size on init. When the map lives in a container
 * that starts hidden (the List⇄Map toggle), it initialises at 0×0 and
 * tiles render in the wrong place. Recompute size whenever it becomes
 * visible again.
 */
function ResizeOnShow({ active }: { active: boolean }) {
  const map = useMap()
  useEffect(() => {
    if (!active) return
    const id = window.setTimeout(() => map.invalidateSize(), 60)
    return () => window.clearTimeout(id)
  }, [active, map])
  return null
}

/**
 * Map of Jamaica with urgency-colored need pins. Secondary to the list on
 * the volunteer screen — shown via the Map toggle.
 *
 * MORNING TODO: add the scripted driver marker animating along DEMO_ROUTE
 * (seed.ts) during the match/delivery beats.
 */
export function MapView({ active = true }: { active?: boolean }) {
  const needs = useStore((s) => s.needs)

  return (
    <MapContainer
      center={MAP_CENTER}
      zoom={MAP_ZOOM}
      maxBounds={JAMAICA_BOUNDS}
      maxBoundsViscosity={0.8}
      minZoom={8}
      className="h-full w-full"
    >
      {/* errorTileUrl: failed tiles render as a transparent pixel so the
          container's sea-tone background shows through — never broken
          image squares. */}
      <TileLayer
        url={TILE_URL}
        attribution={TILE_ATTRIBUTION}
        errorTileUrl="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
      />
      <ResizeOnShow active={active} />
      {needs.map((need) => (
        <NeedPin key={need.id} need={need} />
      ))}
    </MapContainer>
  )
}

import { MapContainer, TileLayer } from 'react-leaflet'
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
 * The home screen: map of Jamaica with urgency-colored need pins.
 *
 * MORNING TODO: add the scripted driver marker animating along DEMO_ROUTE
 * (seed.ts) during the match/delivery beats.
 */
export function MapView() {
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
      {needs.map((need) => (
        <NeedPin key={need.id} need={need} />
      ))}
    </MapContainer>
  )
}

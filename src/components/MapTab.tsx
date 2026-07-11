import { useMemo } from 'react'
import L from 'leaflet'
import { MapContainer, Marker, TileLayer } from 'react-leaflet'
import {
  JAMAICA_BOUNDS,
  MAP_CENTER,
  MAP_ZOOM,
  TILE_ATTRIBUTION,
  TILE_URL,
} from '@/lib/constants'
import { useStore } from '@/lib/store'

function emojiIcon(emoji: string, bg: string) {
  return L.divIcon({
    className: 'landfall-pin',
    html: `<span style="display:flex;width:30px;height:30px;align-items:center;justify-content:center;border-radius:9999px;background:${bg};border:3px solid white;box-shadow:0 1px 4px rgba(0,0,0,.4);font-size:15px">${emoji}</span>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  })
}

/**
 * The Map tab: shelters as house drop-points, repairs as tool markers.
 * Tapping a pin opens the same detail sheet as the board (with a
 * Directions button).
 */
export function MapTab() {
  const needs = useStore((s) => s.needs)
  const selectNeed = useStore((s) => s.selectNeed)

  const shelters = needs.filter((n) => n.kind === 'shelter')
  const repairs = needs.filter((n) => n.kind === 'repair')
  const houseIcon = useMemo(() => emojiIcon('🏠', '#1d4ed8'), [])
  const toolIcon = useMemo(() => emojiIcon('🔧', '#b45309'), [])

  return (
    <MapContainer
      center={MAP_CENTER}
      zoom={MAP_ZOOM}
      maxBounds={JAMAICA_BOUNDS}
      maxBoundsViscosity={0.8}
      minZoom={8}
      className="h-full w-full"
    >
      <TileLayer
        url={TILE_URL}
        attribution={TILE_ATTRIBUTION}
        errorTileUrl="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
      />
      {shelters.map((s) => (
        <Marker
          key={s.id}
          position={[s.lat, s.lng]}
          icon={houseIcon}
          eventHandlers={{ click: () => selectNeed(s.id) }}
        />
      ))}
      {repairs.map((r) => (
        <Marker
          key={r.id}
          position={[r.lat, r.lng]}
          icon={toolIcon}
          eventHandlers={{ click: () => selectNeed(r.id) }}
        />
      ))}
    </MapContainer>
  )
}

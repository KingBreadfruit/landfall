import { useMemo } from 'react'
import L from 'leaflet'
import { Marker } from 'react-leaflet'
import type { Need } from '@/lib/types'
import { URGENCY_COLORS } from '@/lib/constants'
import { useStore } from '@/lib/store'

/**
 * A single urgency-colored need pin on the map. Critical pins pulse.
 * Tapping a pin opens the need detail sheet.
 */
export function NeedPin({ need }: { need: Need }) {
  const selectNeed = useStore((s) => s.selectNeed)

  const icon = useMemo(() => {
    // SECURITY: this html string is injected raw by Leaflet. Keep it
    // built from constants only — never interpolate user input here.
    const color = URGENCY_COLORS[need.urgency]
    const pulse =
      need.urgency === 'critical'
        ? `<span style="position:absolute;inset:-6px;border-radius:9999px;background:${color};opacity:.3;animation:landfall-pulse 1.6s ease-out infinite"></span>`
        : ''
    return L.divIcon({
      className: 'landfall-pin',
      html: `
        <span style="position:relative;display:block;width:22px;height:22px">
          ${pulse}
          <span style="position:absolute;inset:0;border-radius:9999px;background:${color};border:3px solid white;box-shadow:0 1px 4px rgba(0,0,0,.4)"></span>
        </span>`,
      iconSize: [22, 22],
      iconAnchor: [11, 11],
    })
  }, [need.urgency])

  return (
    <Marker
      position={[need.lat, need.lng]}
      icon={icon}
      eventHandlers={{ click: () => selectNeed(need.id) }}
    />
  )
}

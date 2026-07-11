import { useStore } from '@/lib/store'
import { RequestSupplies } from './RequestSupplies'

/**
 * Shelter "request goods" — reuses the citizen shopping-list in shelter
 * mode. Submitting populates the shelter's own request, which then shows
 * on the volunteer board (distinct source: kind 'shelter').
 */
export function PostNeedForm() {
  const setScreen = useStore((s) => s.setScreen)
  return (
    <RequestSupplies
      mode="shelter"
      onBack={() => setScreen('map')}
      onSent={() => setScreen('map')}
    />
  )
}

import { useEffect } from 'react'
import { motion } from 'motion/react'
import { useStore } from '@/lib/store'

// Not tied to real time — a generic beat that feels satisfying for the
// giver. The bar fills to the item count while a runner ferries the goods
// across a few times, then points are awarded.
const DURATION = 3600 // ms
const CROSSINGS = 4

/**
 * The "handing over" beat: a loading bar fills to the number of items
 * pledged while a runner carries the box to the waiting recipient. On
 * completion, the supply drop is scored.
 */
export function TransferAnimation() {
  const itemsMoved = useStore((s) => s.pendingItemsMoved)
  const place = useStore((s) => s.pendingPlace)
  const finish = useStore((s) => s.finishSupplyDelivery)

  useEffect(() => {
    const id = window.setTimeout(finish, DURATION)
    return () => window.clearTimeout(id)
  }, [finish])

  return (
    <div className="bg-background flex h-full flex-col items-center justify-center gap-10 p-6">
      <div className="w-full max-w-sm">
        <div className="mb-2 flex items-baseline justify-between text-sm">
          <span className="font-medium">Handing over supplies…</span>
          <span className="text-muted-foreground tabular-nums">
            {itemsMoved} {itemsMoved === 1 ? 'item' : 'items'}
          </span>
        </div>
        <div className="bg-secondary h-3 w-full overflow-hidden rounded-full">
          <motion.div
            className="bg-primary h-full rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: DURATION / 1000, ease: 'easeInOut' }}
          />
        </div>
        {place && (
          <p className="text-muted-foreground mt-2 text-center text-xs">
            to {place}
          </p>
        )}
      </div>

      <div className="relative h-24 w-full max-w-md overflow-hidden">
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 text-4xl"
          initial={{ x: '-15%' }}
          animate={{ x: '78%' }}
          transition={{
            duration: DURATION / 1000 / CROSSINGS,
            ease: 'linear',
            repeat: CROSSINGS - 1,
          }}
        >
          🏃📦
        </motion.div>
        <div className="absolute top-1/2 right-1 -translate-y-1/2 text-4xl">
          🧍
        </div>
      </div>
    </div>
  )
}

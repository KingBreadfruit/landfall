/**
 * A mocked QR code — a deterministic black/white grid derived from the
 * token, with three finder squares so it reads as a real QR at a glance.
 * Not scannable; it's demo dressing for the drop-off verification beat.
 */
export function MockQR({ token, size = 176 }: { token: string; size?: number }) {
  const N = 13
  const codes = [...token].map((c) => c.charCodeAt(0))
  const filled = (i: number) => {
    const r = Math.floor(i / N)
    const c = i % N
    // leave the three finder corners to the overlays below
    const inCorner =
      (r < 4 && c < 4) || (r < 4 && c >= N - 4) || (r >= N - 4 && c < 4)
    if (inCorner) return false
    const v = codes[(r * 7 + c * 13) % codes.length] + r * 31 + c * 17
    return v % 2 === 0
  }

  return (
    <div
      className="relative rounded-lg bg-white p-3"
      style={{ width: size, height: size }}
    >
      <div
        className="grid h-full w-full"
        style={{
          gridTemplateColumns: `repeat(${N}, 1fr)`,
          gridTemplateRows: `repeat(${N}, 1fr)`,
        }}
      >
        {Array.from({ length: N * N }).map((_, i) => (
          <div
            key={i}
            style={{ background: filled(i) ? '#0f172a' : 'transparent' }}
          />
        ))}
      </div>
      {/* three finder patterns */}
      {(
        [
          { top: 12, left: 12 },
          { top: 12, right: 12 },
          { bottom: 12, left: 12 },
        ] as const
      ).map((pos, i) => (
        <div
          key={i}
          className="absolute flex items-center justify-center border-[5px] border-[#0f172a] bg-white"
          style={{ width: size * 0.24, height: size * 0.24, ...pos }}
        >
          <div
            className="bg-[#0f172a]"
            style={{ width: '46%', height: '46%' }}
          />
        </div>
      ))}
    </div>
  )
}

export type Coords = { lat: number; lng: number; accuracy?: number }

/**
 * Ask the browser for the device's real location. Resolves to null if the
 * user denies permission, geolocation is unavailable, or it times out — the
 * caller falls back to the typed area so a request is never blocked.
 */
export function getPosition(timeoutMs = 10000): Promise<Coords | null> {
  return new Promise((resolve) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      resolve(null)
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: timeoutMs, maximumAge: 30000 },
    )
  })
}

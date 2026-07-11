# Landfall

**The emergency logistics layer for the island.**

Built for the Ackee Circle Hackathon — theme: *Island Logistics with a
twist.*

When a hurricane hits Jamaica, relief is chaos. Water piles up at one
shelter while the next community goes without. Nobody knows who needs
what, where, or how to get it there. Existing relief tools do the
*seeing* — reports, photos, status. The bottleneck isn't information or
donations. It's **logistics** — moving the supplies.

Landfall is the dispatch layer:

**a need is posted → a donor pledges supplies → anyone with a truck and
spare capacity gets matched to the run → a delivery photo confirms it
landed.**

Taxis, vans, churches, supermarkets, and volunteers become one emergency
logistics network. Dormant most of the year — it wakes when a storm comes.

## Running it

```bash
npm install
npm run dev      # dev server
npm run build    # production build (generates the PWA service worker)
npm run preview  # serve the production build — use this to demo offline
```

No backend, no API keys, no env vars. The map uses free OpenStreetMap
tiles. Built offline-first: after first load, the app (and the map tiles
you've viewed) keep working with no signal — it's a PWA with a service
worker and a cached Jamaica tile set.

## Stack

Vite + React + TypeScript • Tailwind CSS v4 + shadcn/ui • Leaflet +
OpenStreetMap • Zustand • motion • vite-plugin-pwa.

---

## The pitch

**Hook:** "Who in here ever live through a storm and watch di help reach
everywhere except where it was actually needed?"

**Problem:** After a hurricane, relief is chaos — supplies pile up in one
place while the next community has nothing. The bottleneck isn't
donations. It's logistics. Moving it.

**Reframe:** Every existing tool shows you the need. Seeing a need nuh
move a single case of water. Landfall moves it.

**Demo (the arc):** need on the map → pledge → matched to a truck already
heading that way → delivered, with photo proof.

**The network:** taxis, vans, churches, supermarkets, volunteers — one
emergency logistics layer that sleeps 360 days a year and wakes when the
storm comes.

**Offline:** "Built offline-first, because in a hurricane the towers are
the first thing to go. This keeps running with no signal."

**Close:** "This isn't a disaster app. It's the emergency logistics layer
for the island. Every team today built for a normal day — we built for
the day nothing else works. And it's hurricane season right now."

### Objection handling (back pocket)

- *"Does this exist / I saw something like it"* → "The reporting side has
  been tried — see the need, photos, status. What nobody's built is the
  part that MOVES it. That's what today's about, logistics. I took a
  problem I know deeply and built the half that's missing."
- *Recognition/incentives* → "To keep help flowing past day one,
  contributors get recognition — communities see who showed up for them."
  (Roadmap, not built.)

### Roadmap (pitch only, deliberately not built)

Mesh networking fallback • push-to-talk dispatch • SMS/Bluetooth
broadcast for zero-data users • Met Service storm-feed integration •
contributor recognition for communities.

# Landfall — Build Plan

Hackathon: **Ackee Circle Hackathon** — theme "Island Logistics with a twist."
One-day build. Judges are non-technical and money-holding: they reward a
problem everyone recognizes, a clever twist, and a polished working demo —
NOT technical depth.

"Landfall" is a placeholder name — it lives in `APP_NAME`
(`src/lib/constants.ts`), `index.html`, and the PWA manifest
(`vite.config.ts`). Rename in one find-replace pass.

## The concept

After a hurricane, relief is chaos — supplies pile up at one shelter while
the next community goes without. The bottleneck isn't information or
donations, it's **logistics** — moving the supplies. Landfall is the
dispatch layer: a need is posted → a donor pledges supplies → anyone with a
truck/van and spare capacity gets matched to the run → a delivery photo
confirms it landed. Taxis, vans, churches, supermarkets, and volunteers
become one emergency logistics network. Dormant most of the year, wakes
when a storm comes.

Pitch line: *"Every team today built an app for a normal day. We built the
one for the day nothing else works."*

## THE ONE THING THAT WINS: the 60-second demo arc

Everything exists to make this single flow flawless and beautiful:

1. **Supplies Needed (home)** — the volunteer/helper view: a list of open
   needs, separated into **Shelters** and **People in need** (filter: All
   / Shelters / People), each with urgency, location, people count, and a
   supply-progress bar. A **List⇄Map toggle** drops to the Jamaica map
   (urgency-colored pins) when geography is wanted — the map is secondary,
   not the whole page.
2. **Need detail** — tap a need: "Portmore HS Shelter — 200 cases water,
   50 tarps needed • 340 people • CRITICAL".
3. **Pledge** — "I can supply" → pick quantity → confirm → progress bar
   moves.
4. **Match** — AI-style match card: "Marcus • pickup truck • 3 km away •
   87% route match • en route" + status timeline.
5. **Delivery confirmed** — delivery photo + "Delivered • Verified"
   (the trust beat).

One clean arc. **No feature creep.**

## Real vs mocked

- **Real:** UI, screens, interactions, map, animations, client-side
  offline (PWA service worker + cached OSM tiles — genuinely keeps working
  when the network drops).
- **Mocked/seeded/scripted:** all data (`src/lib/seed.ts`), the "matching"
  (scripted to Marcus), the driver moving on the map (animation along
  `DEMO_ROUTE`), the delivery photo (bundled image). No backend, no auth,
  no API keys — nothing that can break on venue wifi.
- **Do NOT build (roadmap/pitch only):** mesh networking, push-to-talk,
  real SMS/Bluetooth, government/met feeds, recognition/leaderboard.

## Stack

Vite + React 18 + TypeScript • Tailwind CSS v4 + shadcn/ui •
react-leaflet 4 / Leaflet + OSM tiles (no API key) • Zustand •
motion (framer-motion) • lucide-react • vite-plugin-pwa (Workbox).

Note: the shadcn CLI registry was unreachable from the setup environment,
so the primitives in `src/components/ui/` are hand-vendored (same code
style). `components.json` is configured, so `npx shadcn@latest add <x>`
should work on normal wifi.

## Structure

```
src/
  App.tsx                  shell + screen switching (Zustand, no router)
  lib/
    constants.ts           APP_NAME, map config, urgency colors, hero IDs
    types.ts               Need (kind: shelter|person), Item, Driver, …
    store.ts               demo flow state + actions
    needs.ts               need helpers: progress %, sort, labels
    relief.ts              request catalog, damage types, points/badges
    sanitize.ts            input clamping/trimming (chaos-test hardening)
    seed.ts                needs (shelters/people/repairs), drivers, pledges,
                           shelters, leaderboard, DEMO_DELIVERY, DEMO_ROUTE
  components/
    ui/                    shadcn primitives
    Header.tsx             logo + offline badge (auto + click to toggle)
    SuppliesNeeded.tsx     volunteer home: Shelters/People/Repairs + Map toggle
    NeedCard.tsx           one need as a scannable list row (repair variant)
    MapView.tsx            Leaflet map + pins (WORKS), secondary via toggle
    NeedPin.tsx            urgency-colored divIcon markers, critical pulses
    NeedDetailSheet.tsx    "I can supply" / repair "I can help" (WORKS)
    PledgeFlow.tsx         quantity picker + confirm (WORKS, moves bars)
    MatchCard.tsx          match card + timeline → Confirm hand-over
    TransferAnimation.tsx  runner+box hand-over, bar fills to item count
    DeliveryConfirm.tsx    delivery/taken-up + points + badge reveal
    Leaderboard.tsx        top-contributors sheet (You highlighted)
    PostNeedForm.tsx       static rough-in
    RoleSwitcher.tsx       bottom tab bar: Supplies Needed / Shelter / Need help
    ShelterList.tsx        shelter role home: shelters + occupancy
    ShelterDetail.tsx      one shelter: Occupants / Incoming / Supplies tabs
    LogPersonSheet.tsx     tablet intake form (adds a resident live)
    RequestHelp.tsx        citizen hub: Request supplies / Report damage
    RequestSupplies.tsx    relief shopping-list, capped by household size
    ReportDamage.tsx       damage type + photo → posts a repair (Groundwork)
  assets/delivery-proof.jpg  generated placeholder — SWAP for real photo
```

Hero need: `need-portmore-hs` (Portmore, CRITICAL). Hero driver:
`driver-marcus` (Half Way Tree). Both exported as constants.

## Mobile / roles

Mobile-first responsive PWA — installs to the home screen on both
Android (Chrome: Install app) and iOS (Safari: Share → Add to Home
Screen; icons + meta tags are set up). Safe-area insets handled;
pull-to-refresh and double-tap zoom disabled so nothing derails the
demo.

The bottom nav switches perspective instantly — one presenter, one
device, three views:

- **Supply runs** (volunteer/donor): the map + the whole demo arc.
- **Shelter** (government-official view): list of shelters with live
  occupancy → tap one for three tabs. **Occupants** = the roster (full
  name, TRN, DOB, check-in time) + a tablet "Log a resident" form that
  adds people live. **Incoming** = guests who requested to stay, with
  ETA and a "Scan & check in"; a seeded overdue guest flashes amber with
  phone + last-known location (the no-show alert). **Supplies** = the
  need's progress + incoming pledges. Pledges made in the volunteer view
  appear under Supplies — great two-beat demo: pledge as volunteer, flip
  to Shelter, "and this is what the shelter sees." QR scanning, real
  geolocation, and the no-show timer are mocked/seeded for demo safety.
- **Need help** (person in need): calm hub with two big actions.
  **Request supplies** = a relief shopping-list (quantities capped by
  household size to stop hoarding) → posts a person-need onto the board.
  **Report damage** = pick a type (tree/road/roof/…) + photo → posts a
  **repair** onto the board so volunteers help without waiting on a crew.
  An offline banner shows nearby shelters cached on the phone.

**Recognition:** two contribution categories — **Groundwork** (repairs,
10 pts) and **Supply drops** (`5 + items`). Badges: **Verified** (first
contribution), **Top** (20 pts). A supply drop plays the
`TransferAnimation` (runner + box, bar fills to item count) then reveals
points + any badge unlocked; the leaderboard (trophy chip on Supplies
Needed) shows the climb. Points are hidden on the browse cards on
purpose. DEMO TIP: pledge ~15 items on the hero need to cross 20 and
unlock **both** badges at once.

The demo arc runs in the Supplies Needed tab; role switches always
land on that role's home screen.

## Morning build order (in the room)

1. **Wire the arc end-to-end:** confirmPledge → match card auto-appears →
   scripted "matching…" beat → timeline steps advance on timers →
   delivery confirm reveal. (Store actions `startDemoDelivery` /
   `completeDemoDelivery` exist; replace the "Mark delivered (dev)"
   button with the scripted sequence.)
2. **Driver animation:** animate a truck marker along `DEMO_ROUTE` on the
   map behind/before the match card (motion + Leaflet marker setLatLng).
3. **Motion polish:** sliding sheets, progress-fill animations,
   route-match % count-up, delivery photo reveal.
4. **Swap `src/assets/delivery-proof.jpg`** for a real photo.
5. Offline beat: load app, kill wifi, reload — it still runs (service
   worker). Toggle the header badge (click the logo) during the pitch.
   Note: tile cache only holds tiles you've already panned over, so pan
   the demo area once while online first. Test via `npm run build &&
   npm run preview` (SW is enabled in production build).
6. Rehearse the 60-second arc. Buffer time to make it shine.

## Commands

- `npm run dev` — dev server
- `npm run build` — typecheck + production build (PWA SW generated here)
- `npm run preview` — serve the production build (use this to test offline)

## Guardrails

- ONE arc, polished. Anything not on the arc is fake and that's fine.
- No backend, no keys, no external services.
- Judges: recognizable problem + twist + polish. Cut scope toward the arc.

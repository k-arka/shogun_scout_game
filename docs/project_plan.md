# Project Plan v2: Shogun's Scout

> Covers the visual redesign sprint (v2) on top of the working v1 skeleton. Backend is stable; all phases below are **frontend-only unless noted**.

---

## Phase 1 — Static Assets (Prerequisite, ~2h)

> Must complete before any UI work begins — pages depend on these images at runtime.

| Task | Detail | Owner |
|:---|:---|:---|
| Generate 4× theme background images | `/public/theme-backgrounds/*.jpg` — blurred ukiyo-e cityscapes (Nature Mist bamboo, Lantern Dusk Tokyo, Cyber Smoke Shibuya, Castle Shadows Edo) | UI Designer → Coder |
| Generate 20× theme preview thumbnails | `/public/theme-previews/{map_id}/{theme}.png` — 5 maps × 4 themes, showing city-in-theme | UI Designer → Coder |
| Generate parchment texture | `/public/textures/parchment.png` — aged paper for ScrollBanner | UI Designer → Coder |

**Acceptance criteria:** All image paths resolving with no 404s before Phase 2 begins.

---

## Phase 2 — New Shared Components (~3h)

> These two components are depended on by Pages (Phase 3) and FogGrid (Phase 4).

### 2.1 `ScrollBanner.tsx`
- [ ] `type` prop: `"victory" | "safe" | "mission" | "info"`
- [ ] Framer Motion `scaleX: 0 → 1`, `opacity: 0 → 1`, `ease-out`, 0.4s
- [ ] Parchment texture background with aged-gold border
- [ ] Wax seal `<div>`: red (victory) / gold (safe, mission)
- [ ] `children` prop support for embedding buttons
- [ ] Typescript exported interface: `ScrollBannerProps`

### 2.2 `FightAnimation.tsx`
- [ ] Props: `onComplete: () => void`
- [ ] CSS `@keyframes clash` — samurai `🥷` slides from left, ninja from right, meet centre
- [ ] Framer Motion spark `variants` — 6 radial sparks `opacity: 1→0, scale: 1→2` in 300ms
- [ ] Red radial burst overlay at peak (50% keyframe)
- [ ] Auto-unmounts via `useEffect` after 900ms, calling `onComplete`

---

## Phase 3 — Page Redesigns (~4h)

### 3.1 `app/page.tsx` — Splash Screen

- [ ] Replace all existing content (keep only the route shell)
- [ ] Layer 0: `<body class="theme-lantern-dusk">` hardcoded for splash
- [ ] Layer 1: Castle silhouette SVG (inline, `opacity: 0.12`, bottom-center)
- [ ] Layer 2: CSS cherry blossom petal animation (`@keyframes fall`, 6 petals)
- [ ] Layer 3: Two vertical chōchin lanterns (left/right rails, CSS glow swing animation)
- [ ] Layer 4: Crossed katana SVG art, `opacity: 0.15`, flanking hero block
- [ ] Hero block:
  - Vertical `SHOGUN'S SCOUT` title — `writing-mode: vertical-rl`, `Kaisei Decol`, gold
  - Horizontal tagline in `Noto Serif JP`
  - `<ScrollBanner type="mission">` wrapping briefing text
  - `<Link href="/war-room"><button className="bushido-btn">Proceed to War Room</button></Link>`
- [ ] Mission steps: 3-column icon grid (Choose City / Navigate Fog / Unmask 5 Spies)

### 3.2 `app/war-room/page.tsx` — 2-Step Wizard

- [ ] `const [step, setStep] = useState<1|2>(1)` — local state
- [ ] `useQueryState("map")` and `useQueryState("theme")` via nuqs
- [ ] Step 1: Territory selection
  - [ ] Mt. Fuji faint SVG background at `opacity: 0.06`
  - [ ] Vertical banner `CHOOSE YOUR TERRITORY` (gold, `writing-mode: vertical-rl`)
  - [ ] Hanging chōchin lanterns decoration (top rail, pure CSS)
  - [ ] 5 map cards with `MAPS` const array (id, label, subtitle)
  - [ ] Selected card: `border-[var(--accent)] bg-[var(--accent)]/10 scale-[1.02]` + transition
  - [ ] CTA: disabled if no map selected; on click → `setMap(id); setStep(2)`
- [ ] Step 2: Appearance selection
  - [ ] Vertical banner `CHOOSE APPEARANCE`
  - [ ] `hoveredTheme` local state — on card hover, `ThemeWrapper` preview updates live
  - [ ] 4 large preview cards — `<img src="/theme-previews/{selectedMap}/{themeId}.png">`
  - [ ] Selected theme: same border highlight
  - [ ] `← Back` link: `setStep(1)` (preserves map selection)
  - [ ] CTA: `router.push('/play?map=...&theme=...')`

---

## Phase 4 — `FogGrid.tsx` Visual Upgrades (~3h)

- [ ] **HUD**: Change `Intel: X/20` → `Spots Visited: X/20`
- [ ] **HUD**: Make controls bar more explicit — `↑↓←→ Move | ENTER: Scout Report | I: Interrogate`
- [ ] **Background**: Add blurred ukiyo-e `<div>` behind grid (reads `theme` prop → correct image)
- [ ] **Player icon**: Replace dot ring with `🥷` emoji, `text-3xl`, pulsing orange aura CSS animation
- [ ] **Proximity blur reveal**:
  - All 20 spots always rendered (remove `if (!visible && state === "hidden") return null`)
  - Use Framer Motion `animate={{ filter, opacity, scale }}` driven by `near` / `visible` booleans
  - Far (> 18 units): `filter: blur(7px) opacity: 0.12` — ghost outlines through mist
  - Mid (3–18 units): `filter: blur(7px) opacity: 0.35` — discernible but foggy
  - Near (≤ 3 units): `filter: blur(0px) opacity: 1` + gold glow
- [ ] **Interrogation flow**:
  - Remove: plain red/green flash overlay
  - Add: `<FightAnimation onComplete={() => setInterrogationResult(isSpy ? "spy" : "safe")} />` on spy found
  - Add: `<ScrollBanner>` result banner after animation completes (spy) or immediately (safe)
  - Spy banner: `"WELL DONE, SCOUT — SPY ELIMINATED! 👺"` — `type="victory"`
  - Safe banner: `"A great place to visit. Thankfully, no spies lurk here, Scout."` — `type="safe"`
  - Banners auto-dismiss after 3s via `setTimeout`
- [ ] **Scout report modal**: Apply `<ScrollBanner type="info">` styling to the spot detail modal
- [ ] **Victory screen**: Wrap in `<ScrollBanner type="victory">` with enlarged wax seal

---

## Phase 5 — Backend: Seed All 5 Maps (~1h)

- [ ] Update `data/seed.py` to support `--map` flag and default to seeding all 5
- [ ] Verify all 5 maps ingest correctly: `python data/seed.py`
- [ ] Confirm `GET /api/maps` returns all 5
- [ ] Confirm `GET /api/maps/kyoto/spots` etc. return 20 spots each with correct `icon` field

---

## Phase 6 — Integration & Smoke Test (~1h)

- [ ] Start FastAPI: port 8000
- [ ] Start Next.js dev: port 3000
- [ ] Full user flow: Splash → Step 1 (select Kyoto) → Step 2 (select Cyber Smoke) → Play
- [ ] Verify live theme preview on hover in Step 2
- [ ] Verify fog proximity: move player near shrine → blur disappears
- [ ] Verify interrogation: fight animation plays, then scroll banner unfurls
- [ ] Verify safe spot: no animation, peaceful scroll banner appears
- [ ] Verify victory: 5 spies found → scroll banner victory screen
- [ ] Run `tests/unit_test.md` suite

---

## Dependency Graph

```
Phase 1 (Assets)
    └── Phase 2 (ScrollBanner + FightAnimation)
            ├── Phase 3 (Splash + War Room Redesign)
            └── Phase 4 (FogGrid Upgrades)
                    └── Phase 5 (Seed All Maps)
                            └── Phase 6 (Integration Test)
```

**Phases 3 and 4 can run in parallel after Phase 2 completes.**

# Low-Level Design (LLD) v2: Shogun's Scout

> This document supersedes v1. All new UI redesign requirements from `docs/style_guide.md` §6–8 and `docs/ui_handoff.md` §5–7 are reflected here.

---

## 1. Directory Structure Blueprint (Updated)

```text
shogun_scout_game/
├── frontend/
│   ├── app/
│   │   ├── layout.tsx                    # ThemeWrapper + QueryProvider + NuqsAdapter
│   │   ├── page.tsx                      # REDESIGN: Splash screen (lanterns, katana, scroll)
│   │   ├── war-room/
│   │   │   └── page.tsx                  # REDESIGN: 2-step wizard (territory → appearance)
│   │   ├── play/
│   │   │   └── page.tsx                  # Gameplay wrapper (unchanged)
│   ├── components/
│   │   ├── ThemeWrapper.tsx              # Reads ?theme, applies CSS class (unchanged)
│   │   ├── QueryProvider.tsx             # TanStack Query (unchanged)
│   │   ├── FogGrid.tsx                   # REDESIGN: Samurai icon, proximity blur, bg image
│   │   ├── ScrollBanner.tsx              # NEW: Parchment scroll banner component
│   │   └── FightAnimation.tsx            # NEW: Samurai vs ninja silhouette animation
│   ├── lib/
│   │   └── api.ts                        # API helpers (unchanged)
│   └── public/
│       ├── theme-backgrounds/            # NEW: 4 blurred ukiyo-e bg images
│       │   ├── nature-mist.jpg
│       │   ├── lantern-dusk.jpg
│       │   ├── cyber-smoke.jpg
│       │   └── castle-shadows.jpg
│       ├── theme-previews/               # NEW: 5 maps × 4 themes = 20 thumbnails
│       │   ├── tokyo/
│       │   │   ├── nature-mist.png
│       │   │   ├── lantern-dusk.png
│       │   │   ├── cyber-smoke.png
│       │   │   └── castle-shadows.png
│       │   ├── kyoto/ ...
│       │   ├── osaka/ ...
│       │   ├── hokkaido/ ...
│       │   └── fuji_viewpoints/ ...
│       ├── assets/maps/                  # Creator Studio uploads
│       └── data/                         # NEW: 5 static map JSON payloads
│           ├── tokyo_seed.json
│           ├── kyoto_seed.json
│           ├── osaka_seed.json
│           ├── hokkaido_seed.json
│           └── fuji_viewpoints_seed.json
├── backend/                              # [DEPRECATED] FastAPI backend removed
└── data/                                 # [DEPRECATED] SQLite db and Python seeds removed
```

---

## 2. React Component Specifications

### 2.1 `app/page.tsx` — Splash Screen (FULL REDESIGN)

**Visual layers (bottom → top):**
1. Background: `theme-lantern-dusk` CSS class active on `<body>` (hardcoded for splash).
2. Castle silhouette SVG positioned at bottom-center (absolute, `opacity: 0.12`, `z-index: 0`).
3. Animated cherry blossom petals — CSS `@keyframes` floating path, 6–8 `<span>` elements scattered.
4. Two vertical red chōchin lanterns: left and right rails, CSS gradient glow, slight swing animation.
5. Crossed katana SVG pair — decorative `<div>` flanking the hero section, `opacity: 0.15`.
6. Hero center: vertical title + parchment scroll briefing + CTA.

**Typography:**
- Title `SHOGUN'S SCOUT`: `Kaisei Decol`, `writing-mode: vertical-rl`, gold accent, right side of viewport.
- Sub-title / tagline: horizontal `Noto Serif JP` body text.
- Briefing block: inside `<ScrollBanner type="mission">` component.

**No new backend calls. All static.**

---

### 2.2 `app/war-room/page.tsx` — 2-Step Wizard (FULL REDESIGN)

Manages a local `step` state (`1 | 2`). URL params via `nuqs`:
- `?map=<map_id>` — set on Step 1 selection.
- `?theme=<theme_id>` — set on Step 2 selection.

#### Step 1: Territory Selection

```tsx
const MAPS = [
  { id: "tokyo",          label: "Tokyo",          subtitle: "Edo Shadows"     },
  { id: "kyoto",          label: "Kyoto",          subtitle: "Ancient Capital"  },
  { id: "osaka",          label: "Osaka",          subtitle: "Merchant City"    },
  { id: "hokkaido",       label: "Hokkaido",       subtitle: "Northern Wilds"   },
  { id: "fuji_viewpoints",label: "Fuji Viewpoints",subtitle: "Sacred Heights"   },
];
```

- **Card style**: `border border-[var(--accent)]/20 p-6 cursor-pointer`, selected adds `border-[var(--accent)] bg-[var(--accent)]/10 scale-[1.02]`.
- **Vertical left banner**: `<div className="vertical-text font-heading text-xs tracking-[0.5em]">CHOOSE YOUR TERRITORY</div>` — `writing-mode: vertical-rl`.
- **CTA**: `<ScrollBanner type="mission">` wrapping `<button>NEXT: CHOOSE APPEARANCE →</button>`.
- On select: `setSelectedMap(id)`. CTA enabled when `selectedMap !== null`.

#### Step 2: Appearance Selection

- **Theme preview cards**: `<img>` loading from `/public/theme-previews/{selectedMap}/{themeId}.png`.
- 4 cards: `nature-mist`, `lantern-dusk`, `cyber-smoke`, `castle-shadows`.
- Selected card gets same border highlight as map cards.
- **`ThemeWrapper` live-updates** `<body>` class as user hovers each card — using a local `hoveredTheme` state passed up and applied in `ThemeWrapper` with lower priority than the confirmed selection.
- **Back link**: `setStep(1)` — does NOT clear `selectedMap`.
- **CTA**: `router.push('/play?map=${selectedMap}&theme=${selectedTheme}')`.

---

### 2.3 `components/ScrollBanner.tsx` — NEW

```tsx
interface ScrollBannerProps {
  type: "victory" | "safe" | "mission" | "info";
  message: string;
  children?: React.ReactNode; // for wrapping buttons
}
```

**Rendering:**
- Outer `<motion.div>`: `initial={{ scaleX: 0, opacity: 0 }} animate={{ scaleX: 1, opacity: 1 }}` with `ease-out` 0.4s.
- Background: `background-image: url('/textures/parchment.png')` fallback to CSS gradient `linear-gradient(135deg, #f5e6c8, #e8d5a3)`.
- Border: `2px solid #8b6914` (aged gold).
- Wax seal `<div>`: right-side circle, `radial-gradient` — red for `victory`, gold for `safe/mission`.
- Text: `Kaisei Decol`, `color: #3b2a1a` (dark sepia on parchment).

---

### 2.4 `components/FightAnimation.tsx` — NEW

Triggered after Interrogate if spy found. Plays for 800ms then unmounts.

**Implementation — pure CSS, no assets:**
- Two `<div>` elements: `.samurai` and `.ninja` — each containing text emoji `🥷` / `⚔️` at `font-size: 3rem`.
- CSS `@keyframes clash`:
  - `.samurai`: translates from `left: -20%` to `left: 45%` in 400ms.
  - `.ninja`: translates from `right: -20%` to `right: 45%` in 400ms.
  - At 50% keyframe: both elements `scale(1.4)` with a red radial burst overlay.
- After 800ms: component unmounts via `React.useEffect` timeout.
- **Spark effect**: 6 small `<span>` divs with random `rotate` and `translateX` values, animated `opacity: 1 → 0` and `scale: 1 → 2` in 300ms using Framer Motion `variants`.

**FogGrid integration:**
```tsx
// New state in FogGrid:
const [showFight, setShowFight] = useState(false);
const [interrogationResult, setInterrogationResult] = useState<"spy"|"safe"|null>(null);

// In interrogate():
if (isSpy) {
  setShowFight(true);
  setTimeout(() => {
    setShowFight(false);
    setInterrogationResult("spy");
  }, 900); // fight plays for 900ms before banner
} else {
  setInterrogationResult("safe");
}
```

---

### 2.5 `components/FogGrid.tsx` — v6 UPDATES

| Section | Previous (v5) | Updated (v6) |
|:---|:---|:---|
| Background | `blur(0.5px) brightness(0.88)` | `blur(2px) brightness(0.55) saturate(0.7)` + `bg-black/40` overlay — icons are the focal point |
| Fog mask | `rgba(0,0,0,0.28)` at edges | Heavier gradient: `rgba(0,0,0,0.10)→0.55→0.82` — significantly more aerial fog |
| Explored spots | Icon **replaced** by 👺 / ✅ | ADDITIONAL badge (👺 / ✅) shown **above** the original icon — icon is never lost |
| Far landmarks | `opacity: 0.18`, `blur(3px)` | `opacity: 0.22`, `blur(3px)` — slightly more visible |
| Visible landmarks | `opacity: 0.65`, `blur(1.5px)` | `opacity: 0.85`, `blur(0.8px)` — clearer |
| Icon sizes | near=`text-5xl`, visible=`text-3xl`, far=`text-xl` | near=`text-6xl`, visible=`text-4xl`, far=`text-2xl` — all bumped up |
| New Game button | `window.location.reload()` | Opens confirmation modal → on confirm, redirect to `/war-room` (territory selection) |

**Background implementation (v6):**
```tsx
// Dimmed + blurred so the background becomes atmospheric only — icons pop.
<div className="absolute inset-0 z-0 scale-[1.04]"
  style={{
    backgroundImage: `url('${BG_IMAGES[theme]}')`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    filter: "blur(2px) brightness(0.55) saturate(0.7)",
  }}
/>
// Additional semi-opaque overlay:
<div className="absolute inset-0 z-[1] bg-black/40" />
```

**Fog overlay — heavier to push icons forward:**
```tsx
// Radial gradient: slight transparency at player, heavy 82% black at edges.
// Icons have drop-shadows that keep them visible even at the edges.
const fogStyle = {
  background: `radial-gradient(circle ${FOG_RADIUS}% at ${px}% ${py}%,
    rgba(0,0,0,0.10) 0%,
    rgba(0,0,0,0.55) 55%,
    rgba(0,0,0,0.82) 100%
  )`,
};
```

**Explored badge — shown ABOVE original icon (never replaces):**
```tsx
const explored = state === "spy" || state === "safe";
const badgeIcon = state === "spy" ? "👺" : state === "safe" ? "✅" : null;

// JSX: badge sits above original icon in flex column
{explored && (
  <motion.div
    initial={{ scale: 0, y: 4 }}
    animate={{ scale: 1, y: 0 }}
    transition={{ type: "spring", stiffness: 400, damping: 20 }}
    className={`${badgeSize} leading-none`}
  >
    {badgeIcon}
  </motion.div>
)}
// Then the original spot.icon is ALWAYS rendered below the badge.
```

**New Game confirmation modal:**
Clicking "New Game" opens a modal with "Abandon Mission?" copy and two buttons:
- **Keep Playing** — closes modal, resumes game.
- **Select Territory** — `window.location.href = "/war-room"` (full redirect to territory screen).

---

## 3. Architecture Change: Serverless Static Migration

### 3.1 Static Endpoint Deprecation
The Python FastAPI backend and SQLite `dev.db` have been fully stripped to allow the game to run as a purely **Static Next.js SSG**. 
- The `GET /api/maps` and `GET /api/maps/{map_id}/spots` are now native fetch calls hitting `/data/{map_id}_seed.json` directly from the `public` folder.
- This entirely mitigates Cross-Origin (CORS) blocks, local 127.0.0.1 permission warnings ("Access other apps and services on this device"), and the need to mount a Python runtime on Vercel Serverless. 

### 3.2 Client-Side Procedural Generation (`lib/seed.ts`)

Spot coordinates stored in the JSON files (`coords.x`, `coords.y`) are **legacy reference values only** and are **not used** during seeding by default.

The backend `seed.py` was rewritten to a TypeScript module natively bundled into the Next.js client (`frontend/lib/seed.ts`).

**Dispersal guarantees:**
- Two seed points are placed in each of the **4 quadrants** before Bridson expansion — guaranteeing at least 8 spots spread heavily around the perimeter.
- Minimum 16-unit separation between any two spots (previously 10)
- 4-unit margin from all grid edges (spots always in the 4–96 range)
- Bridson expansion throws points outwards up to 2.5x the minimum radius to ensure wide dispersal
- Fallback: if Bridson cannot fill N spots at strict min-dist, the algorithm progressively relaxes down to 4.5 units

- **Dynamic In-Session Reseeding:** The launcher no longer scrambles the layout. Instead, when a user clicks "Commence Scouting," the frontend `sessionStorage.removeItem('seed_...')` is called. This clears the RNG seed causing the `frontend/lib/api.ts` module to scramble the specific map coordinates dynamically *in the browser* directly before navigation to the play screen.

---

## 4. Asset Generation Plan (theme-backgrounds & theme-previews)

Since we operate under the **Zero Runtime GenAI** constraint, all background images are **pre-generated** (using the image generation tool) and committed as static assets.

| Asset path | Description | Count |
|:---|:---|:---|
| `public/theme-backgrounds/{theme}.jpg` | 4 full-screen blurred ukiyo-e images | 4 |
| `public/theme-previews/{map_id}/{theme}.png` | Thumbnail for War Room Step 2 | 5 × 4 = 20 |



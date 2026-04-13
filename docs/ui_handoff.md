# UI/UX Technical Handoff: Shogun's Scout

This document serves as the comprehensive visual blueprint for the engineering team implementing the Shogun's Scout frontend, integrating the traditional Japanese Ukiyo-e aesthetic.

## 1. Core Visual Directives
The application must strictly follow a "Digital Parchment/Washi" aesthetic. The interface is composed of high-contrast traditional Japanese elements layered over atmospheric CSS variables. **Zero runtime generative AI** is to be used for assets. All UI elements rely on strict text/emoji symbols and CSS.

### 1.1 Global Typography
- **UI/Body Text:** `Noto Serif JP`, serif. Clean but calligraphic.
- **Narrative/Headers:** `Kaisei Decol`, serif. Used for sweeping historic quotes and titles.
- **Orientation Constraints:** The Main Title ("SHOGUN'S SCOUT") and primary navigational tabs should utilize vertical text orientation via CSS, maintaining **English characters** but with a traditional Japanese vertical flow:
  ```css
  .vertical-text {
      writing-mode: vertical-rl;
      text-orientation: upright;
  }
  ```

### 1.2 Iconography (Emoji Schema)
Do not use generic vector libraries (like Lucide or FontAwesome) for in-game state or landmarks. To maintain the Ukiyo-e atmosphere, use standardized Unicode symbols:
- **Shrine:** ⛩️
- **Fortress:** 🏯
- **Garden:** 🎋
- **Eatery:** 🏮
- **Temple:** 🪷
- **District:** 🏘️
- **Structure:** 🌉
- **Timer/HUD:** ⏳
- **Spy Detected:** 👺
- **Safe Spot / Victory:** ✅

---

## 2. Theme Engine (CSS Variables)

The game dynamically alters its mood via Tailwind/CSS class overrides on the `<body>` element. Below is the strict color matrix for the 4 primary states.

| Theme Target | Class Name | Washi Background (`--bg`) | Ink Text (`--text`) | Accent (`--accent`) | Fog Mask (`--fog`) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Nature Mist** | `theme-nature-mist` | `#f4ecdf` (Parchment) | `#2f3e46` (Deep Charcoal)| `#52796f` (Matcha) | `rgba(244, 236, 223, 0.85)` |
| **Lantern Dusk** | `theme-lantern-dusk` | `#0f172a` (Midnight) | `#ffedd5` (Warm Papaya) | `#f97316` (Lantern Orange) | `rgba(15, 23, 42, 0.9)` |
| **Cyber Smoke** | `theme-cyber-smoke`| `#020617` (Void) | `#22d3ee` (Neon Cyan) | `#06b6d4` (Cyber Blue) | `rgba(2, 6, 23, 0.9)` |
| **Castle Shadows** | `theme-castle-shadows` | `#000000` (Obsidian) | `#d6d3d1` (Stone) | `#d4af37` (Antique Gold) | `rgba(0, 0, 0, 0.9)` |

### Ukiyo-e Texture Overlay
A universal texture overlay must be applied on top of the `--bg` using structural SVG noise to mimic Japanese paper. Use `mix-blend-mode: multiply` on light themes.

---

## 3. Motion & Transitions

- **Theme Swapping:** `transition: all 0.7s cubic-bezier(0.4, 0, 0.2, 1);`
- **The Interrogation "Slash":** A diagonal 2px white bounding line rotated `-45deg`. It animates via standard translation from `-100%` to `100%` across the screen in 300ms, followed by the Spy (`👺`) or Safe (`✅`) reveal.

## 4. Components Handed Over
- `docs/style_guide.md`: Core system definitions.
- `src/components/StylePreview.tsx`: The active React sandbox implementing these rules. Review this file directly for the Tailwind structural layout.

---

## 5. War Room — 2-Step Wizard Spec

### Step 1: Territory Selection (`/war-room` — default view)
- **5 Map cards** matching these seed files from `data/`:
  | Card Label | Map ID | Seed File |
  | :--- | :--- | :--- |
  | Tokyo — Edo Shadows | `tokyo` | `tokyo_seed.json` |
  | Kyoto — Ancient Capital | `kyoto` | `kyoto_seed.json` |
  | Osaka — Merchant City | `osaka` | `osaka_seed.json` |
  | Hokkaido — Northern Wilds | `hokkaido` | `hokkaido_seed.json` |
  | Fuji Viewpoints — Sacred Heights | `fuji_viewpoints` | `fuji_viewpoints_seed.json` |
- Card style: `border: 1px solid var(--accent)/20`; selected: `border-color: var(--accent)`, `background: var(--accent)/10`.
- Navigation: CTA sets `nuqs` param `?map=<id>` then `setStep(2)`.

### Step 2: Appearance Selection (same route, `step === 2`)
- **4 Theme cards** — each shows a **map-specific preview thumbnail** (a static PNG image stored in `/public/theme-previews/<map_id>/<theme>.png`).
- Selecting a theme sets `nuqs` param `?theme=<theme-id>`.
- CTA: `router.push('/play?map=...&theme=...')`.
- Back link: `setStep(1)`.

---

## 6. New Reusable Component: `ScrollBanner.tsx`

All in-game messages (interrogation outcomes, errors, hints) must use this component:

```tsx
// Usage:
<ScrollBanner type="victory" message="WELL DONE, SCOUT — SPY ELIMINATED!" />
<ScrollBanner type="safe" message="A great place to visit. No spies here." />
```

- **Visual**: An aged parchment paper texture div (`background: url('/textures/parchment.png')`, `border: 2px solid #8b6914`, rounded corners).
- **Animation**: Framer Motion `scaleX` from 0→1 in 0.4s, `opacity` from 0→1.
- **Wax Seal**: A circular `::before` pseudo-element or `<div>` with a red/gold radial gradient.
- **Message types**:
  - `victory` (spy found): dark text on parchment + red wax seal.
  - `safe` (no spy): warm sepia text + gold wax seal.

---

## 7. Background Image Assets Required

Each theme needs a background image per map context. Until real photography assets are sourced, use generated placeholder images stored at:
`public/theme-previews/<map_id>/<theme>.png`

The gameplay grid background images are stored at:
`public/theme-backgrounds/<theme>.jpg`

Apply to the grid container:
```css
.grid-bg {
  background-image: url('/theme-backgrounds/<active-theme>.jpg');
  background-size: cover;
  filter: blur(14px) brightness(0.55);
  transform: scale(1.05); /* prevent blur edges showing */
}

# Style Guide: Shogun’s Scout

## 1. Design Philosophy
The visual language of Shogun’s Scout is "Meditative Strategy." It balances a clean, functional 100x100 grid system with rich, atmospheric overlays. The interface should feel like a high-end digital parchment.

## 2. Color Palettes (CSS Variables)

### 2.1 Core Brand Colors
| Token | HEX | Role |
| :--- | :--- | :--- |
| `primary` | `#0A0A0A` | Deep obsidian background. |
| `accent` | `#D4AF37` | Antique gold for highlights and victory. |
| `danger` | `#B22222` | Crimson for Spies (Red Mask). |
| `success` | `#2E8B57` | Sea Green for Safe Spots (Green Tick). |

### 2.2 Atmospheric Themes
These variables are interswapped via the `ThemeWrapper`.

| Theme | `--fog-color` | `--accent-glow` | Description |
| :--- | :--- | :--- | :--- |
| **Nature Mist** | `hsl(120, 5%, 90%)` | `hsl(145, 30%, 50%)` | Mossy whites/fogs. |
| **Lantern Dusk** | `hsl(240, 30%, 10%)` | `hsl(30, 80%, 60%)` | Indigo/Orange shadows. |
| **Cyber Smoke** | `hsl(200, 20%, 15%)` | `hsl(180, 100%, 50%)` | Grey-blue/Neon cyan. |
| **Castle Shadows** | `hsl(0, 0%, 5%)` | `hsl(35, 20%, 30%)` | Obsidian/Dark wood. |

---

## 3. Typography
- **Primary (UI/Body)**: `Noto Serif JP`, serif. Traditional, calligraphic text mimicking ink on parchment.
- **Narrative (Headings/Dialogs)**: `Kaisei Decol`, serif. Elegant, historical brush strokes for high-impact cinematic quotes.
- **Hero Title**: `Kaisei Decol` with strict italicization and vertical tracking if applicable.

---

## 4. Iconography Strategy
- **Framework**: Traditional Japanese Emojis / Text Symbols over modern vectors.
- **Landmark Icons (Strict Schema)**:
  - **Shrine**: `⛩️` (Red Torii Gate).
  - **Temple**: `🪷` (Lotus) or `🧘` (Meditation).
  - **Fortress**: `🏯` (Japanese Castle).
  - **Garden**: `🎋` (Tanabata Tree / Bamboo).
  - **Structure**: `🌉` (Bridge at Night).
  - **Eatery**: `🏮` (Izakaya Lantern).
  - **District**: `🏘️` (Historical townhouses).
- **HUD Elements**:
  - **Timer**: `⏳` 
  - **Spy**: `👺` (Tengu/Mask)

---

## 5. UI Components

### 5.1 Buttons ("Bushido" Style)
- **Base**: Sharp corners, 1px gold border.
- **Hover**: Subtle inner glow (`accent`) and slight scale-up (1.02).
- **Active**: 0.98 scale-down for tactical "press" feel.

### 5.2 The Grid (Fog of War)
- **Cell**: 1x1 relative unit.
- **Masking**: Linear gradient from `transparent` (center) to `var(--fog-color)` (edges) at 15-20 units radius.

---

## 6. Motion (Framer Motion)
- **Overlay Entry**: `{ opacity: 0, scale: 0.95 }` -> `{ opacity: 1, scale: 1 }` (duration: 0.2s).
- **The "Interrogation Slash"**: 
  - A diagonal white line (`skewX: -45`) that slides across the screen in 0.3s.
  - Followed by a sharp red flash for a Spy reveal.
- **Parchment Scroll Unfurl** (all in-game messages/banners):
  - Scroll unrolls from `scaleX: 0` -> `scaleX: 1` in 0.4s with `ease-out`.
  - Wax seal pulses with `scale: 1 -> 1.15 -> 1` as reveal completes.
- **Spy Fight Animation** (on interrogation with spy):
  - Samurai vs. ninja silhouette clash plays as a looping CSS sprite for 800ms.
  - Red spark particles burst via Framer Motion `variants` on entry.
  - Result banner unfurls after 900ms delay.
- **Safe Spot Animation** (on interrogation, no spy):
  - Cherry blossoms drift across the modal for 600ms.
  - Peaceful banner unfurls with warm golden glow.

---

## 7. War Room Navigation Flow (Split 2-Step Wizard)

The War Room is now a **2-step wizard**, not a single combined menu:

### Step 1 — Choose Your Territory (Map Selection)
- Dark navy background with faint Mt. Fuji ukiyo-e silhouette.
- Red chōchin lanterns hanging from the top rail.
- **Vertical left banner**: "CHOOSE YOUR TERRITORY" in gold Kaisei Decol.
- 5 map cards styled as **carved wooden ukiyo-e plaques** with a mini scenic illustration:
  - Tokyo (Edo Shadows), Kyoto (Ancient Capital), Osaka (Merchant City), Hokkaido (Northern Wilds), Fuji Viewpoints (Sacred Heights)
- Selected card: glowing gold border + slight scale-up.
- CTA: parchment scroll button **"NEXT: CHOOSE APPEARANCE →"** with wax seal.

### Step 2 — Choose Your Appearance (Theme Selection)
- Same atmospheric background persists.
- **Vertical left banner**: "CHOOSE APPEARANCE" in gold.
- 4 theme cards shown as **large immersive previews** — each card renders a thumbnail of the **selected map's scenery** in that theme's colour palette:
  - Nature Mist / Lantern Dusk / Cyber Smoke / Castle Shadows
- This ties map identity to appearance — the user sees exactly how the city will look in each theme.
- CTA: parchment scroll **"COMMENCE SCOUTING"** with wax seal.
- Small `← Back` link to return to Step 1.

---

## 8. Gameplay Visual Enhancements

### 8.1 Japan-Centric Backgrounds
Each theme replaces the flat colour background with a **blurred ukiyo-e/watercolor aerial cityscape**:
- **Nature Mist**: Misty bamboo forest with shrine path.
- **Lantern Dusk**: Aerial Tokyo streetscape with hundreds of glowing lanterns.
- **Cyber Smoke**: Rain-slicked Shibuya with neon reflections.
- **Castle Shadows**: Moonlit Edo castle complex.

Implementation: SVG/PNG images set as `background-image` on the grid container with `filter: blur(14px) brightness(0.6)` applied via CSS.

### 8.2 Fog of War Proximity Reveal
- **Far landmarks** (> 3 units): Visible but with `filter: blur(8px)` and `opacity: 0.35` — ghostly outlines through the mist.
- **Near landmarks** (≤ 3 units): `filter: none`, `opacity: 1`, glowing gold drop-shadow — fully crisp.

### 8.3 Player Icon
- Replace the plain dot with a **samurai warrior emoji or inline SVG figure** (⚔️ / 🧍 katana silhouette).
- Player pulses with an orange aura `box-shadow` animation.

### 8.4 HUD Language
- "Intel: X/20" → **"Spots Visited: X/20"**

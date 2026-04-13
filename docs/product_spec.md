# Product Spec: Shogun’s Scout (v2.1 - Master)

## 1. Goal and Vision
**Why this product?**
Shogun's Scout gamifies geographic and historical exploration. It combines the thrill of a scavenger hunt with the atmospheric, strategic elements of a samurai-themed RPG. It creates a lightweight, easy-to-play, repeatable experience directly in the browser without hefty downloads, utilizing a grid-based Fog of War mechanic to encourage spatial exploration and active interaction.

**Core Value Proposition**
An accessible, highly replayable browser-based RPG scavenger hunt offering a unique blend of deterministic map puzzles, strict aesthetic consistency, and immersive world-building through stylized CSS/visual themes, without relying on unpredictable runtime generative AI.

## 2. Market Alternatives & Competitors
- **GeoGuessr:** A popular geography guessing game based on Google Street View. *Our edge:* Shogun's Scout is an RPG-driven narrative scavenger hunt focusing on atmospheric grid exploration.
- **Where in the World is Carmen Sandiego? (Web iterations):** Educational narrative sleuthing. *Our edge:* High-aesthetic samurai themes and spatial exploration using an active Fog of War mechanic.
- **Browser-based RPG MUDs/Text games:** Traditional web RPGs. *Our edge:* Visual 2D grid scouting and modern CSS-based themes/animations (like "Slash") over purely text-based logic, focusing on quick, satisfying 5-10 minute loops.

## 3. User Flow
1. **Entry (Splash Screen):** User opens the application for the first time. Meets the "Bushido Briefing" narrative -> Clicks "Proceed to War Room".
2. **War Room:** User selects the Target Map/City (e.g., Tokyo, Kyoto) and the Atmospheric Appearance Theme (Nature Mist, Lantern Dusk, Cyber Smoke, Castle Shadows).
3. **Gameplay Loop (Fog of War):**
    - Player navigates a 100×100 grid using Arrow Keys.
    - A radial Fog of War gradient obscures visibility beyond ~20 units; the actual background image remains clearly visible (fog opacity ≤ 28%).
    - Player approaches landmarks (interaction radius: 3 units — landmarks glow).
    - Player presses `Enter` near a landmark to interrogate it, checking for Spies.
    - **If already interrogated:** revisiting a known spy location shows the result banner directly — no fight animation is repeated.
    - **Keyboard-driven UX:** After the result banner appears, press `Enter` to advance to the details card. Inside the details card, press `Enter` or `Escape` to close.
    - A **New Game** button is always visible in the HUD during play (not just on the victory screen).
4. **Resolution:**
    - If a Safe Spot: Spot becomes a Green Tick.
    - If a Spy: CSS "Slash" animation plays, icon becomes a Red Mask.
    - Mission concludes when all 5 Spies (randomly assigned from 20 spots per session) are eliminated.
5. **Success State & Replay:** Full-screen "SHOGUN VICTORIOUS" overlay with completion time and stats. Options to "Play Again" (same city, reshuffled spies) or "Return to War Room".

## 4. Key Metrics & KPIs
**Engagement Metrics (Primary Focus):**
- **DAU/MAU (Daily/Monthly Active Users):** Measuring the overall active and returning player base.
- **Average Session Length:** Target is 10-15 minutes (indicating 1-3 maps completed per visit).
- **Games Played per Session:** Number of rounds initiated after the first map ends (strongest indicator of replayability and hook).
- **Scout Report Interaction Rate:** Percentage of landmarks where users actually open the Scout Report before interrogating (measures narrative/trivia engagement).
- **Completion Rate:** Percentage of started games that result in a Victory Screen.

**Performance Metrics:**
- **Time to Interactivity:** Initial load time for the Splash Screen and War Room assets.
- **Frames Per Second (FPS) & Input Latency:** Crucial for smooth grid navigation and CSS Fog of War rendering.

## 5. PII & Safety Guardrails
- **No User Accounts Needed:** To completely minimize PII/GDPR risk, the system uses Session or Local Storage for tracking game state. No central user database or login is required.
- **Static Content Pipeline:** All map JSON data and static image assets are strictly curated by the tech team. The mandate of "Zero Runtime GenAI" prevents hallucinations, prompt injection, and unfiltered unsafe content generation.
- **Content Moderation Scope:** Since there is no user-to-user chat, UGC (User Generated Content) uploads, or global leaderboards, toxic behavior profiles are organically mitigated.

## 6. Technical Architecture & Constraints
- **Shell Engine Design:** The game engine is built to dynamically load new map geometries via simple JSON configurations (ID, Name, 20 spot names/categories/trivia).
- **Spot Positions — Randomly Dispersed:** Landmark grid coordinates (`pos_x`, `pos_y`) are **not fixed in the JSON files**. Instead, `data/seed.py` generates well-spread positions using a **Poisson-disc dispersal algorithm** at seed time, guaranteeing:
  - Minimum 13-unit separation between any two spots
  - 8-unit margin from all edges so spots never appear at the border
  - Even distribution across the entire 100×100 grid with no clustering in one area
  - Deterministic output per city (hash-seeded) for consistent re-seeds
- **Map & Image Ingestion Pipeline:** The Technical Team must define a rigorous pipeline for ingesting new maps. While location data and trivia are provided via JSON, the team is responsible for defining how the 20 high-fidelity static site images are sourced, optimized, and served—while maintaining the constraint of zero runtime generative AI.
- **Strict Iconography Schema:** 7 core static icons to maintain parity across all dynamic maps:
  - Shrine = Red Torii Gate (⛩️)
  - Temple = Five-story Pagoda
  - Fortress = Tenshu (Castle Keep)
  - Garden = Bonsai Tree
  - Structure = Wooden Arched Bridge
  - Eatery = Chochin (Paper Lantern)
  - District = Machiya House Silhouette
- **Fog of War Visibility:** The radial fog overlay uses a maximum opacity of ~28% at grid edges, ensuring the themed background image remains clearly legible at all times while still providing the map-exploration mechanic.
- **Aesthetic Enforcement:** Hardcoded CSS variables and assets for themes like "Cyber Smoke" and "Lantern Dusk."

## 7. Wireframes

### 7.1 Splash Screen
```text
+---------------------------------------------------------+
|                                                         |
|                                                         |
|                     [ INK ART LOGO ]                    |
|                      SHOGUN'S SCOUT                     |
|                                                         |
|   "Spies have infiltrated the Shogunate's territories.  |
|    You have been dispatched to 5 key locations in the   |
|    city to eliminate them. Trust no one; verify every   |
|    shadow."                                             |
|                                                         |
|               [ PROCEED TO WAR ROOM ]                   |
|                                                         |
+---------------------------------------------------------+
```

### 7.2 War Room
```text
+---------------------------------------------------------+
| < Back                                                  |
|                      MISSION BRIEFING                   |
|                                                         |
|  Select Target Map Location:                            |
|  [ Tokyo (Edo) ▼ ]                                      |
|                                                         |
|  Select Atmospheric Theme:                              |
|  ( ) Nature Mist     ( ) Lantern Dusk                   |
|  ( ) Cyber Smoke     ( ) Castle Shadows                 |
|                                                         |
|                  [ COMMENCE SCOUTING ]                  |
|                                                         |
+---------------------------------------------------------+
```

### 7.3 Main HUD & Gameplay
```text
+---------------------------------------------------------+
| [04:12:87]                      Spies: 2/5 | Intel: 8/20|
| [ℹ️] Use Arrow Keys to Move | [Enter] Key: Details | [I] Key: Interrogate |
|    ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░    |
|    ░░░░░░░░░░░░░░░░░░░ [ FOG ] ░░░░░░░░░░░░░░░░░░░░░    |
|    ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░    |
|    ░░░░░░░░        ⛩️        ░░░░░░░░░░░░░░░░░░░░░    |
|    ░░░░░░░      [ PLAYER ]        ░░░░░░░░░░░░░░░░░░    |
|    ░░░░░░░          | |           ░░░░░░░░░░░░░░░░░░    |
|    ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░    |
|    ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░    |
|                                                         |
| [Start New Game]                                        |
+---------------------------------------------------------+
```

### 7.4 Scout Report Overlay
```text
+---------------------------------------------------------+
|                                                         |
|   +-------------------------------------------------+   |
|   |                 [ HIGH-FIDELITY                 |   |
|   |                      STATIC                     |   |
|   |                      PHOTO ]                    |   |
|   |                                                 |   |
|   | LOCATION: SENSO-JI TEMPLE                       |   |
|   | INFO: Tokyo's oldest Buddhist temple...         |   |
|   |                                                 |   |
|   |            [ CLOSE ]   [ INTERROGATE ]          |   |
|   +-------------------------------------------------+   |
|                                                         |
+---------------------------------------------------------+
```

### 7.5 Victory Screen
```text
+---------------------------------------------------------+
|                                                         |
|                                                         |
|                   SHOGUN VICTORIOUS                     |
|                                                         |
|                                                         |
|               Final Time: 05:22:14                      |
|               City Visited: Tokyo                       |
|               Spies Eliminated: 5/5                     |
|                                                         |
|                                                         |
|         [ Play Again ]      [ Return to War Room ]      |
|                                                         |
+---------------------------------------------------------+
```

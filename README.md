# Shogun’s Scout ⛩️

Shogun's Scout is an atmospheric, samurai-themed RPG scavenger hunt built with **Next.js**. Players take on the role of a Shogunate's scout, navigating dense fog to identify and eliminate spies hidden within iconic Japanese locations. The game runs completely statelessly in the browser with zero external API dependencies.

## ✨ Project Overview
The game blends geographic exploration with narrative strategy. Utilizing a grid-based **Fog of War** mechanic, players must explore 100x100 maps, interrogate landmarks, and uncover spies using their intuition and historical intel.

---

## 🛠️ The Agentic Development Lifecycle
This project was developed using a structured, multi-agent workflow. The repository is organized into **7 specialized skills**, each responsible for a specific phase of the product lifecycle:

| Skill | Role | Artifacts Generated |
| :--- | :--- | :--- |
| **Product Manager** | Defines vision and requirements. | `product_spec.md`, Wireframe designs |
| **System Architect** | Designs infrastructure and data flow. | `architecture_plan.md`, DB Schema, Mermaid diagrams |
| **UI Designer** | Establishes visual language and aesthetics. | Stylized CSS, Color palettes, `globals.css` |
| **Tech Lead** | Translates architecture to implementation logic. | `low_level_design.md`, State Schemas |
| **QA Engineer** | Ensures reliability and bug-free logic. | `test_cases.md`, Integration test suites |
| **Env Bootstrap** | Manages local environment and dependencies. | Local setup scripts, `.venv` configs |
| **Code Implementer** | Writes the core application code via TDD. | Next.js frontend components, static data integration |

---

## 🎮 Game Flow
Shogun's Scout follows an immersive, high-stakes loop designed for quick, 5-10 minute sessions.

### 1. Bushido Briefing (Splash Screen)
The journey begins with a narrative immersion. Players are briefed on the spy infiltration and dispatched to the Shogunate's territories.

### 2. The War Room (Configuration)
Before deploying, players select:
- **Target Map**: Choose a legendary city (e.g., Tokyo/Edo).
- **Atmospheric Theme**: Select a visual aesthetic (Nature Mist, Lantern Dusk, Cyber Smoke, or Castle Shadows).

### 3. Field Scouting (Gameplay Loop)
Players enter the 100x100 grid obscured by a radial **Fog of War**.
- **Movement**: Navigate using **Arrow Keys**.
- **Landmarks**: Approach glowing landmarks (Shrines, Temples, Fortresses).
- **Interrogation**: Press `Enter` to perform an interrogation at the site and learn more about the landmark.
- **Dynamic Randomization**: Landmarks are dispersed using a *Poisson-disc dispersal algorithm*, ensuring no clustering and a fresh challenge every game.

### 4. Resolution & Victory
- **Safe Spots**: Marked with a Green Tick.
- **Spies**: Eliminated with a CSS "Slash" animation and marked with a Red Mask.
- **Win Condition**: Locate and eliminate all **5 Spies** hidden among the 20 landmarks.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js 18+** (for the Next.js frontend)

### Launching the Game
Simply run the included launcher script from the root directory:
```powershell
.\launch.ps1
```
This script will:
1. Verify NPM installation.
2. Start the Next.js development server (Port 3000).
3. Automatically open your browser to the game.

The entire map layout and coordinate generation algorithm runs dynamically within the browser at start time!

---

## 🔒 Security & Privacy
- **Zero Runtime GenAI**: All content is strictly curated to prevent hallucinations or unsafe outputs.
- **Privacy First**: No user accounts or PII (Personally Identifiable Information) required; all states are handled locally.
- **Clean Repo**: Sensitive configuration and environment variables are managed via `.gitignore` and `.env.local`.

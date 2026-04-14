# QA Test Suite: Shogun's Scout

This document outlines the test cases required to ensure the high-fidelity, atmospheric, and secure delivery of the Shogun's Scout RPG.

## 1. Gameplay Mechanics (GP)

| ID | Test Case | Target Behavior | Priority |
| :--- | :--- | :--- | :--- |
| **GP-01** | 100x100 Grid Boundaries | Player cannot move outside the 0-100 X/Y range. | High |
| **GP-02** | Fog of War Radius | Visibility is limited to a ~15-20 unit radius from the player. Fog updates smoothly as the player moves. | High |
| **GP-03** | Landmark Interaction | Interaction prompts (Enter/Details) only unlock when player is within 3 units of a landmark. | Medium |
| **GP-04** | Spy Reveal Logic | Upon "Interrogation", a random 5 of the 20 spots trigger the "Slash" animation and turn Red (`👺`). Rest turn Green (`✅`). | High |
| **GP-05** | Victory Condition | Game transitions to Victory Screen exactly after the 5th spy is found. | High |
| **GP-06** | Timer Accuracy | The HUD timer (`⏳`) tracks elapsed time accurately in `MM:SS:CC` format. | Medium |
| **GP-07** | HUD Map Title | The HUD accurately displays the location name (e.g., `📍 TOKYO`) based on URL selection. | Medium |

---

## 2. UI/UX & Aesthetics (UI)

| ID | Test Case | Target Behavior | Priority |
| :--- | :--- | :--- | :--- |
| **UI-01** | Theme Switching | Selecting a theme in the War Room updates `--bg`, `--text`, and `--fog` CSS variables immediately. | High |
| **UI-02** | Selective Vertical Text | Headers (e.g., "SHOGUN'S SCOUT") use `writing-mode: vertical-rl`. Body text remains horizontal for legibility. | High |
| **UI-03** | Emoji Icon schema | Landmarks correctly display the 7 icons (⛩️, 🏯, 🏮, etc.) based on their JSON category. | High |
| **UI-04** | Washi Texture Overlay | Subtle SVG noise is visible over the background, especially in light themes (Nature Mist). | Medium |
| **UI-05** | "Slash" Animation | The 300ms diagonal slash plays reliably during interrogation without UI flickering. | Medium |

---


## 4. Integration & Infrastructure (INF)

| ID | Test Case | Target Behavior | Priority |
| :--- | :--- | :--- | :--- |
| **INF-01** | TanStack Query Caching | Re-opening a previously loaded map results in 0 network requests to `/api/maps/*/spots`. | High |
| **INF-02** | `nuqs` URL Sync | Refreshing the page with `?theme=cyber-smoke&map=tokyo` restores the exact game state. | High |
| **INF-03** | `localStorage` Persistence | Game state is saved and retrieved across different browser sessions. | Medium |
| **INF-04** | Image Deployment Path | Ingested images appear correctly in the Next.js `public/assets/maps/` directory. | High |

---

## 5. Security & Guardrails (SEC)

| ID | Test Case | Target Behavior | Priority |
| :--- | :--- | :--- | :--- |
| **SEC-01** | No GenAI at Runtime | Ensure no external LLM/Image-Gen calls are made during the player gameplay loop. | Critical |
| **SEC-02** | PII Check | Verify that no player identifying information (IP, name) is requested by the application logic. | Critical |

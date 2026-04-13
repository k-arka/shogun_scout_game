# AGENTS.md - Project Constitution

## 🛠 Core Tech Stack
- **Backend:** Python 3.12+ (using `uv` for speed), FastAPI.
- **AI Orchestration:** LangGraph (State-based loops).
- **Validation:** Pydantic V2.
- **Frontend:** Next.js 15 (App Router), TypeScript.
- **Database:** SQLite (local `dev.db`).

## 🧩 Mandatory Frontend Libraries
- **UI:** `shadcn/ui`, `Lucide React`, `Framer Motion`.
- **Data:** `TanStack Query`, `nuqs`.

## 📐 Architecture & Handover Rules
1. **Plan First:** Update `docs/` before writing a single line of code.
2. **Type Safety:** 100% type coverage required.
3. **Local First:** All assets and databases must reside locally.
4. **Auto-Install:** If a required dependency is missing during coding, the **Coder Agent** must notify the **Bootstrap Agent** to handle the installation.

## 📝 Tone & Coding Style
- "Readable-First" code.
- One logical change per commit (Atomic Commits).
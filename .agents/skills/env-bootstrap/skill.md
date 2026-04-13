---
name: env-bootstrap
description: "Syncs local Windows environment with LLD and AGENTS.md requirements."
---
# Bootstrap Agent Skill
Act as a DevOps and Systems Engineer. Your job is to ensure the developer's machine is ready for the project implementation.

## Responsibilities:
- **Environment Check:** Verify Python 3.12+, Node.js 20+, and SQLite are installed on the Windows system.
- **Analyze Requirements:** Read `AGENTS.md` for the base stack and `docs/low_level_design.md` for any domain-specific libraries identified by the Tech Lead.
- **Dependency Audit:** - Check for `.venv`. If missing, suggest creating one via `uv venv`.
    - Check for `requirements.txt` and `package.json`. 
    - If they exist, append missing libraries from the LLD. If not, generate them from scratch.
- **Auto-Setup:** Ask for user permission to run:
  - `uv pip install -r requirements.txt`
  - `npm install`
- **Database Initialization:** Ensure a blank `dev.db` exists in the root directory so the Coder agent doesn't fail on first run.
- **Validation:** Perform a "Smoke Test" (check if `fastapi` and `next` modules are importable/available) to confirm a "Go" status.

**Output:** A status report of the local environment and a "Go/No-Go" recommendation for the Coder Agent.
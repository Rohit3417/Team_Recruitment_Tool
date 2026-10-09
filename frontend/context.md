# Incursion Track 3 — Frontend Context

## Project
Build a configurable, explainable, team-level shortlisting tool for hackathon organizers. The required loop is:

upload -> configure -> evaluate -> rank -> explain -> export

The same dataset and configuration must always produce the same ranking. Scoring, eligibility, and ranking are deterministic backend code. AI may only help extract resume information, and every extracted value must remain verifiable. Gemini is optional and is not needed on Day 1.

## My role
- M1: Backend A, scoring engine. Owns `backend/app/scoring/`, `backend/tests/scoring/`, and `/rank`, `/compare`.
- M2: Backend B, data and profiles. Owns `backend/app/ingest/`, `backend/app/blind/`, `integrations/`, and `/upload`.
- M3: Frontend. This is me. I own only `frontend/`.
- M4: Database and integration. Owns `backend/app/db/`, `backend/app/core/`, Docker files, `docs/`, and `/configs`, `/runs`, `/overrides`, `/enrich`, `/export`.

There is one organizer in the demo. Login is out of scope.

## Current frontend state
The working frontend already has Next.js App Router, TypeScript, Tailwind, and Shadcn UI primitives. Its old Load -> Map Columns -> Rules -> Results implementation was built from an earlier interpretation and has been archived at `frontend/_legacy/phase1/`. That archive, `frontend-old-vite/`, `frontend/AGENTS.md`, and `frontend/DESIGN.md` are historical references only.

The current roadmap does not include arbitrary column mapping. Registration CSV/JSON uses the format defined by M2 and the shared data contract.

The current frontend routes will be:
- `/upload`
- `/config`
- `/results`
- `/compare`
- `/history`

Day 1 requires only the application layout, step sidebar, and empty page shells. Real API integration starts only when the needed teammate-owned file or endpoint exists.

## Minimal database
PostgreSQL has four JSON-content tables and is not queried directly by the frontend:
- `datasets`: uploaded data, content hash, normalized teams, validation report
- `configurations`: named/preset config JSON
- `runs`: dataset ID, config snapshot, run hash, results JSON
- `overrides`: run ID, team ID, pin/exclude/waitlist action, reason, timestamp

GitHub responses, resume text, parsed profile signals, enrichment progress, and live re-ranking results are not stored in these tables. Live re-ranking is computed on demand.

## Scoring and fairness rules
- Five default criteria: technical skills, projects and experience, GitHub activity, achievements, and portfolio. Each is scored 0–100.
- A member score is the weighted sum of criterion scores.
- The default team score is the mean of member scores. The configuration may select another supported aggregation method.
- Eligibility is separate from weighted scoring. A team can be Eligible, Ineligible with failed rule IDs, or Needs review when required data cannot be checked.
- Final statuses are Shortlisted, Not shortlisted, Ineligible, and Needs review.
- Missing data must be explicit. Never silently present it as zero. The UI uses the statuses defined by the shared profile contract; do not invent a reduced set.
- The exact configuration used for a run must be retained by the backend.
- Overrides are explicit and auditable and must never rewrite the original automated result.
- Never infer missing skills or achievements.
- Never use sensitive personal attributes as criteria.
- An LLM never decides the shortlist.

## Dependencies and daily workflow
Before starting a frontend task, read its Needs line in the roadmap.
- If the named teammate file exists in the shared repository, use that real file.
- If it does not exist, ask its owner in the team chat.
- If it is not ready and the roadmap permits a mock, use only the named mock and mark the code with: `TEMPORARY MOCK — replace when <owner>'s <file> is available`.
- Do not invent an API contract to keep building.
- When the day's frontend task works, upload only the files listed for that task inside `frontend/`, then tell the team in chat.
- Never upload `.env`, API keys, or `cache/`.

Day 1 has no frontend prerequisites. M1's mock evaluation JSON arrives on Day 2, so Day 1 uses plain placeholder text only.

## Timeline relevant to frontend
- Days 1–5: layout, upload, validation display, configuration, and saved-config integration.
- Days 6–10: results, explanations, warnings, manual review, and what-if support.
- Days 11–15: compare, export, blind mode, large-result usability, demo polish, and deployment integration.

## MVP and cut order
Must-haves include CSV/JSON upload, variable team sizes, missing-data handling, customizable weights, top-X selection, explainable results, CSV/JSON export, and hard filters.

If the team falls behind, cut in this order:
1. Pairwise comparison UI and sensitivity analysis
2. Hosted deployment, while retaining local docker-compose
3. Gemini extraction, while retaining the rule-based parser
4. Blind mode
5. Config compare page

Never cut the eight must-haves, determinism and run hash, missing-data flags, or explanations.

## Agent boundary
Future frontend work must stay inside `frontend/` unless I explicitly request otherwise. Do not modify `backend/`, `integrations/`, `docs/`, `samples/`, `frontend-old-vite/`, Docker files, or another member's contract. `frontend/_legacy/` is reference material and must not be imported by active code.
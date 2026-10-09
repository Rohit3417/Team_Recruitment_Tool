# Frontend Product Requirements Document (PRD) — Incursion Track 3

## 1. Purpose
This PRD defines every frontend screen and feature required across the 15-day roadmap, pulled directly from the team's day-by-day plan, so that each day's build prompt has a stable reference instead of being re-derived from scratch.

## 2. Pages

### /upload
- **Day 1**: Page shell with placeholder card only, part of the step sidebar layout (Upload, Configure, Results, Compare, History).
- **Day 2**: File picker, upload progress indicator, preview table of the first 20 rows, using mock rows until the API exists.
- **Day 4**: Connect to `POST /upload` (M2, Day 4). Display the validation report split into errors and warnings. Show a team table with member count per team and a grey "Missing" badge for missing fields, never a red zero. Show summary cards: total teams, teams with missing data, duplicate count.
- **Needs**: M4's `docs/api-contract.md` for the `/upload` response shape (Day 1, final Day 2). M2's `api/upload.py` (Day 4, build against mock rows until it lands).

### /config
- **Day 1**: Page shell with placeholder card only.
- **Day 3**: Full configuration UI in local state only: add, remove, and reorder criteria; weight sliders and number inputs with a live total that must equal 100 before saving is allowed; top-X input; aggregation method dropdown; missing-data policy dropdown.
- **Day 5**: Connect to M4's `/configs` (`POST`, `GET`, `GET` by id, `PUT`): save, load, list, choose a preset, and show backend validation errors next to the relevant field. Keep `dataset_id` in shared app state carried over from `/upload`.
- **Day 7**: Add a "Run evaluation" button that calls `POST /runs` with `dataset_id` and `config_id`, with loading and error states, then navigates toward `/results`.
- **Needs**: M1's `backend/app/scoring/config_schema.py` for field names and allowed values (Day 1). M4's `api/configs.py` (Day 3) and `api/runs.py` (Day 6).

### /results
- **Day 6**: Results table v1 built only against M1's mock `docs/mock/evaluation_result.json`: rank, team name, score, status badge, member count, warning icon; status tabs for Shortlisted, Not shortlisted, Ineligible, Needs review; summary cards.
- **Day 7**: Connect to `GET /runs/{id}` using the real run produced by the "Run evaluation" button on `/config`.
- **Day 8**: Add an expandable score breakdown row per team: a bar per criterion showing weight, points, and share of total, plus missing notes.
- **Day 9**: Add warning and confidence badges (MISSING, INVALID, UNCERTAIN, NEEDS_REVIEW) with tooltips explaining each status, and a "Needs review" queue tab listing incomplete teams.
- **Day 10**: Add manual review controls: Pin, Exclude, and Waitlist buttons with a required reason dialog; display an override badge plus the original automated rank next to the final rank. Overrides must never visually replace or hide the original automated result.
- **Day 11**: Add a team detail drawer: score and status, full breakdown, eligibility rules with pass/fail and the value used for each, missing warnings, the explanation text from the backend, and GitHub evidence (repos, languages) when available.
- **Day 12**: Add a live re-ranking what-if panel: weight sliders call `POST /rank` with debounced input, show rank-change arrows, highlight teams entering or leaving the top X compared to the baseline run, and provide Reset and "Save as new configuration" actions.
- **Day 14**: Polish loading, empty, and error states; add pagination for result sets up to 1000 teams; confirm responsive layout and keyboard accessibility.
- **Needs**: M1's `docs/mock/evaluation_result.json` (Day 2). M4's `api/runs.py` (Day 6) and `api/overrides.py` (Day 9). M1's `explain.py` output inside the run JSON (Day 9, available in run data by Day 11). M1's `rank.py` and `whatif.py` (Day 8, Day 10).

### /compare
- **Day 1**: Page shell with placeholder card only.
- **Day 13**: Full compare UI: select two configurations, display the rank-difference table returned by `/compare`.
- **Needs**: M1's `api/compare.py` (Day 11).

### /history
- **Day 1**: Page shell with placeholder card only.
- **Day 13**: List of past runs with their dataset, configuration, and creation time, allowing the user to open a run in `/results` or select it for `/compare`.
- **Needs**: M4's `GET /runs` (Day 6, list endpoint confirmed by Day 13).

### Export and Blind mode (not a separate route)
- **Day 13**: An export bar component, usable from `/results` and `/history`, with buttons for each export type (shortlist, rejected, waitlist, breakdown) and format (csv or json). Add a blind-mode toggle that calls the backend with `blind=true` and reflects anonymized output in the UI without changing the underlying data.
- **Needs**: M4's `api/export.py` (Day 11). M2's `blind/anonymize.py` (Day 11).

## 3. Cross-cutting UI rules
These are binding acceptance criteria for every page, not suggestions:
- Missing, invalid, unavailable, and uncertain data must always be shown as an explicit text badge, never as a blank, a dash with no label, or a zero. Badges must carry text, not rely on color alone.
- Interactive elements must be native buttons or selects, never a clickable div or span.
- Expandable or collapsible elements must use `aria-expanded` and a clear accessible label.
- Long values such as URLs or team names must be truncated with CSS ellipsis and exposed in full via a native `title` attribute.
- No team is ever hidden from a results view because it is ineligible or below the cutoff; ineligible and below-cutoff teams remain visible with their full breakdown so the decision is explainable.
- The UI must support any team size, from a single member to a large team, without layout collapse.
- Manual overrides are always shown alongside the original automated result, never replacing it in the UI.
- The frontend never computes or alters a score, eligibility result, or rank; it only displays values returned by the backend and only sends configuration or override actions as input.

## 4. State and data flow
- `dataset_id` is produced by `/upload` and must be carried in shared app state into `/config` and used by the "Run evaluation" action.
- `config_id` (or an unsaved local config) is produced or edited in `/config` and used together with `dataset_id` to call `POST /runs`.
- `run_id` is produced by `POST /runs` and is required by `/results`, the what-if panel, overrides, export, and `/history`.
- Until a required teammate file or endpoint exists, the page must use only the named mock file for that day, clearly marked in code as a temporary mock, and must not fabricate a response shape.

## 5. Out of scope for frontend
- The frontend does not compute scores, eligibility, ranking, or run hashes.
- The frontend does not store data; PostgreSQL storage is owned by M4.
- Organizer login and multi-organizer support are out of scope for the whole project.
- Arbitrary spreadsheet column mapping is out of scope; the registration format is fixed by M2's data contract.

## 6. Day-by-day delivery table

| Day | Page(s) | What ships | Needs (file, owner, day) |
|---|---|---|---|
| **Day 1** | `/upload`, `/config`, `/results`, `/compare`, `/history` | Application layout, step sidebar (Upload, Configure, Results, Compare, History), and empty page shells with placeholder cards. | No frontend prerequisites (M4's `docs/api-contract.md` Day 1 / final Day 2; M1's `config_schema.py` Day 1). |
| **Day 2** | `/upload` | File picker, upload progress indicator, preview table of first 20 rows using mock rows. | Mock rows until API lands (M1's `docs/mock/evaluation_result.json` arrives Day 2; M4's `docs/api-contract.md` final Day 2). |
| **Day 3** | `/config` | Full configuration UI in local state: add/remove/reorder criteria, weight sliders/inputs with live 100 total enforcement, top-X input, aggregation method dropdown, missing-data policy dropdown. | M1's `backend/app/scoring/config_schema.py` (Day 1); M4's `api/configs.py` (Day 3). |
| **Day 4** | `/upload` | Connect to `POST /upload`. Display validation report (errors and warnings), team table with member count, grey "Missing" badges, and summary cards (total teams, teams with missing data, duplicates). | M2's `api/upload.py` (Day 4). |
| **Day 5** | `/config` | Connect to M4's `/configs` (`POST`, `GET`, `GET` by id, `PUT`): save, load, list, preset selection, backend validation error display next to fields. Carry `dataset_id` in shared state. | M4's `api/configs.py` (Day 3, integrated Day 5). |
| **Day 6** | `/results` | Results table v1 built against mock: rank, team name, score, status badge, member count, warning icon; status tabs (Shortlisted, Not shortlisted, Ineligible, Needs review); summary cards. | M1's `docs/mock/evaluation_result.json` (Day 2). |
| **Day 7** | `/config`, `/results` | Add "Run evaluation" button on `/config` calling `POST /runs` with `dataset_id` and `config_id` (loading/error states) navigating to `/results`. Connect `/results` to real run via `GET /runs/{id}`. | M4's `api/runs.py` (Day 6). |
| **Day 8** | `/results` | Expandable score breakdown row per team: criterion bars with weight, points, share of total, and missing notes. | M1's `rank.py` (Day 8). |
| **Day 9** | `/results` | Warning and confidence badges (MISSING, INVALID, UNCERTAIN, NEEDS_REVIEW) with explanatory tooltips; "Needs review" queue tab listing incomplete teams. | M4's `api/overrides.py` (Day 9); M1's `explain.py` output in run data (Day 9). |
| **Day 10** | `/results` | Manual review controls: Pin, Exclude, Waitlist buttons with required reason dialog; override badge and original automated rank displayed alongside final rank. | M4's `api/overrides.py` (Day 9); M1's `whatif.py` (Day 10). |
| **Day 11** | `/results` | Team detail drawer: score, status, full breakdown, eligibility rules (pass/fail and checked value), missing warnings, backend explanation text, GitHub evidence (repos, languages). | M1's `explain.py` output inside run JSON (Day 9/11). |
| **Day 12** | `/results` | Live re-ranking what-if panel: weight sliders calling `POST /rank` (debounced), rank-change arrows, top-X enter/leave highlighting vs baseline run, Reset and "Save as new configuration" actions. | M1's `rank.py` and `whatif.py` (Day 8, Day 10). |
| **Day 13** | `/compare`, `/history`, Export & Blind mode | `/compare`: select two configs, display rank-difference table. `/history`: list past runs with dataset, config, creation time, actions to view in results or compare. Export bar (shortlist, rejected, waitlist, breakdown in csv/json). Blind mode toggle calling backend with `blind=true`. | M1's `api/compare.py` (Day 11); M4's `GET /runs` (Day 6/13); M4's `api/export.py` (Day 11); M2's `blind/anonymize.py` (Day 11). |
| **Day 14** | `/results` | Loading, empty, and error state polish; pagination for up to 1000 teams; responsive layout and keyboard accessibility verification. | Core frontend polish (no new backend endpoints). |
| **Day 15** | All | Final build verification and demo practice. No new frontend feature ships. | Full integration across M1–M4. |

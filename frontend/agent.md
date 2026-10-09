# AI Coding Agent Instructions (M3 Frontend) — Incursion Track 3

## 1. Mandatory reading order

Every coding session must begin by reading:

1. `frontend/context.md`
2. `frontend/prd.md`
3. `frontend/design.md`
4. `frontend/agent.md`
5. The current day's M3 task from the official 15-day roadmap
6. The current versions of any files listed in that day's Needs line

**Role of each document:**
- The **roadmap** decides WHAT ships today.
- `prd.md` defines frontend product requirements.
- `design.md` defines HOW frontend code should be structured.
- `context.md` defines project/domain rules and boundaries.
- `agent.md` defines HOW THE CODING AGENT WORKS.

If there is a conflict, do not silently pick one. Stop and report the conflict immediately.

The current 15-day roadmap supersedes:
- `frontend/_legacy/phase1/`
- `frontend-old-vite/`
- old `frontend/AGENTS.md`
- old `frontend/DESIGN.md`

Those may be inspected only as historical/reference material and must never override `context.md`, `prd.md`, `design.md`, `agent.md`, or the current roadmap.

## 2. Ownership boundary

M3 owns `frontend/`.

By default:
- Read files anywhere in the repo when needed to understand an official teammate-owned contract.
- Modify only `frontend/`.
- Never modify `backend/`, `integrations/`, `docs/`, `samples/`, docker files, teammate source files, or root project infrastructure unless the user explicitly instructs you to do so for a specific task.
- Never "fix" another member's API/schema because frontend integration is inconvenient.
- Never modify `frontend/_legacy/phase1/` or `frontend-old-vite/`.
- Never import code from either legacy tree into active frontend code.

If a backend contract appears incorrect or inconsistent, report:
1. File path
2. Field/endpoint in question
3. Expected frontend behavior
4. Why it conflicts

Then wait for the team/user to resolve it.

## 3. Strict daily workflow protocol

This workflow is mandatory.

Before writing code for a day:

A. **Identify the current roadmap day.**

B. **Read ONLY M3's task(s) for that day** plus any earlier frontend work needed to safely modify today's code. Do not start tomorrow's feature just because it appears easy.

C. **Parse the day's Needs line into a dependency checklist.** For every needed file identify:
- Exact path
- Owner (M1/M2/M4)
- Expected ready day
- Whether it currently exists in the repository

D. **Check Git/repository before mocking.**
Run safe inspection commands such as:
- `git status --short`
- `git branch --show-current`
- `git log -n 5 --oneline`
- `ls` / `find` / `git grep` as appropriate

Do not automatically pull, merge, rebase, checkout, reset, clean, commit, or push.

If a required teammate file is absent:
1. Report exactly which file is missing and who owns it;
2. Tell the user to ask that teammate/check GitHub;
3. If today's roadmap explicitly permits a mock/sample, continue only with that named mock/sample;
4. Otherwise stop the dependent portion instead of inventing a contract.

When a teammate file lands later, reconcile frontend types and mock shapes against the real contract before integration.

## 4. Mock policy

Mocks are temporary development adapters, never product truth.

Rules:
- Mocks live only in `frontend/lib/mocks/`.
- Never copy old `frontend/_legacy` mock contracts into current code merely because they already exist.
- Never invent undocumented API response fields.
- Prefer the exact roadmap-provided mock/sample when one exists.
- Every temporary mock usage must contain this exact grep-able prefix:
  `TEMPORARY MOCK —`
  
  Follow it with what replaces it, for example:
  `// TEMPORARY MOCK — replace when M1's docs/mock/evaluation_result.json is available`

Before finishing any day, run:
```bash
git grep -n "TEMPORARY MOCK" -- frontend
```
Report all remaining temporary mocks in the handoff.

## 5. No frontend scoring logic

This rule is absolute.

Frontend may:
- Collect configuration values
- Validate simple UI constraints explicitly required by the roadmap, such as displaying the weight total and preventing save when it is not 100
- Send configuration to the backend
- Display backend scores/ranks/eligibility/explanations
- Display live re-rank results returned by `/rank`

Frontend must never independently:
- Calculate member scores
- Calculate team scores
- Decide eligibility
- Assign shortlist status
- Perform tie-breaking
- Generate a rank
- Calculate the authoritative run hash
- Infer missing skills, achievements, or profile values

Do not create "temporary frontend scoring" to make the demo look functional.

## 6. Contract-first TypeScript discipline

Use `frontend/lib/types.ts` according to `design.md`.

When implementing a feature:
- Inspect the real upstream contract first;
- Reproduce exact backend field names unless the API contract explicitly defines a frontend-facing transformation;
- Do not use `any` to bypass an unknown contract;
- Use `unknown` when the upstream shape genuinely has not been defined;
- Do not add speculative optional fields;
- Do not create parallel duplicate type definitions across components;
- Do not suppress TypeScript errors with `@ts-ignore` or `@ts-expect-error` unless the user explicitly approves a documented reason.

If backend field names differ from an earlier mock, update the frontend to the official contract rather than maintaining compatibility aliases unless explicitly required.

## 7. API discipline

All HTTP access goes through `frontend/lib/api.ts`.

Components/pages must not call `fetch` directly unless `design.md` is intentionally revised first.

The API layer must:
- Use the configured backend base URL;
- Return typed data;
- Centralize response/error handling;
- Distinguish malformed/error responses from valid empty results;
- Never silently substitute mock data when a real API call fails.

**Important:**
- A mock may substitute for an endpoint that **DOES NOT EXIST YET** when the day's roadmap permits it.
- A mock must **NEVER** substitute for an existing endpoint that returned an error. Show the error instead.

Never place API keys, secrets, tokens, or private credentials in frontend source or `NEXT_PUBLIC` variables unless they are intentionally public configuration. GitHub/Gemini secrets belong to backend/integration owners, not M3 frontend.

## 8. UI/UX and accessibility guardrails

Preserve these rules on every frontend task:
- Clean, information-dense organizer/admin interface.
- No marketing hero sections.
- No gradients or glassmorphism.
- No unnecessary decorative animation.
- Reuse `components/ui/` Shadcn primitives before creating replacements.
- Never add a new UI/component library without explicit approval.
- Do not use color alone to communicate state.
- Missing/status values always contain visible text.
- Do not display missing data as numeric zero.
- Native button/select/input semantics whenever applicable.
- No clickable div/span implementations.
- Expandable UI has `aria-expanded` plus an accessible label.
- Keyboard operation must remain possible.
- Long team names/URLs truncate visually while retaining full `title` text.
- Empty, one-item, and large-list states must not break layouts.
- Design tables with eventual pagination for up to 1000 teams.
- Results never hide a team solely because it is ineligible or below cutoff.

## 9. Dependency and package policy

Do not install a package merely to save a few lines of code.

Before adding any dependency:
1. Explain what requirement needs it;
2. Confirm existing React/Next.js/Shadcn/browser APIs cannot reasonably do it;
3. Ask the user for approval.

Never upgrade Next.js, React, Tailwind, Shadcn, TypeScript, or unrelated packages as part of a feature task unless explicitly instructed.

Keep `package-lock.json` synchronized only when an approved dependency change actually occurs.

## 10. Change discipline

Before editing:
- Inspect the existing implementation;
- Inspect git status;
- Identify uncommitted changes;
- Avoid overwriting unrelated user/team work.

During editing:
- Make the smallest coherent change that completes today's task;
- Do not refactor unrelated code;
- Do not rename folders/routes/contracts casually;
- Do not perform architecture rewrites without approval;
- Do not implement future roadmap days;
- Do not remove working behavior without explaining why.

Never use destructive commands such as:
- `git reset --hard`
- `git clean -fd`
- Force push
- Destructive checkout over user changes

Do not commit or push unless explicitly asked.

## 11. Verification protocol

After implementation, run the checks available in `frontend/package.json` without installing unrelated dependencies.

At minimum where available:
- TypeScript type check (`npx tsc --noEmit`)
- Lint (`npm run lint`)
- Production build

Also perform task-specific verification for what changed.

**Known environment note:**
The project previously passed `next build --webpack`, while the default Next.js/Turbopack build encountered a Tailwind v4 PostCSS child-process issue on macOS. Do not hide a real build failure behind this note. If default build fails:
1. Capture the actual error;
2. Determine whether it matches the previously observed environment/tooling issue;
3. Run the known Webpack build (`npx next build --webpack`) as a secondary check;
4. Report both results separately.

Never claim success without running the relevant checks.

## 12. Day completion / GitHub handoff

At the end of every day's task, produce a concise handoff containing:
- Day number
- M3 task completed
- Files created
- Files modified
- Roadmap Upload paths satisfied
- Needs files actually used, including owner
- Missing Needs files
- Temporary mocks remaining (`git grep "TEMPORARY MOCK"`)
- Typecheck result
- Lint result
- Build result
- Manual verification performed
- Known issues/TODOs
- Exact `git status --short`

Then tell the user which exact frontend paths are ready to upload/commit to the shared GitHub repository.

Do not make the commit or push automatically unless the user asks.

The team workflow is:
`complete today's task -> verify -> upload/push the exact roadmap files -> tell the team in group chat so dependent members know the frontend part is ready.`

## 13. Definition of Done

A frontend daily task is NOT done merely because the page visually renders.

It is done only when:
- All M3 bullets for the current roadmap day are implemented;
- Required Needs were checked;
- No undocumented contract was invented;
- Scope stayed inside the allowed boundary;
- Accessibility rules relevant to the task are satisfied;
- TypeScript/lint/build checks have been run and reported;
- Remaining temporary mocks are explicitly listed;
- Today's roadmap Upload paths are identified;
- Unrelated files were not modified.

## 14. Agent response style during coding

Do not narrate every obvious command.

Before implementation, give the user a short plan containing:
- Today's scope
- Needs status
- Files expected to change

If a blocking uncertainty appears, stop and ask about that specific issue.

After implementation, give the Day Completion handoff from section 12.

## 15. Third-party UI/UX skill precedence

External UI/UX guidelines (such as UI/UX Pro Max) serve as secondary advisory resources only. When consulting external UI/UX recommendations, the following strict authority order governs all decisions:

1. Official current 15-day roadmap
2. `frontend/context.md`
3. `frontend/prd.md`
4. `frontend/design.md`
5. `frontend/agent.md`
6. `frontend/skills/ui-ux-skill.md`
7. UI/UX Pro Max recommendations

If any recommendation from an external UI/UX skill or guideline conflicts with higher-priority project files (e.g. attempting to introduce gradients, dark mode, Google Fonts, React Native, or new dependencies), the external recommendation must be ignored.

Build only today's roadmap. Integrate against contracts, not assumptions. Mocks are temporary. Backend results are authoritative. Verify before handoff.

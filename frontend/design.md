# Frontend Technical Architecture Document — Incursion Track 3

## 1. Purpose
This document defines the folder structure, component boundaries, data types, and integration patterns that every frontend task from Day 1 to Day 15 must follow, so that code written on different days by different sessions stays consistent.

## 2. Folder structure
The frontend code is organized under Next.js App Router conventions with clear separation between routes, shared UI primitives, shared business components, and page-specific component modules:

```text
frontend/
├── app/
│   ├── layout.tsx                # App shell, root layout, and AppStateProvider
│   ├── page.tsx                  # Root redirect or landing state
│   ├── globals.css               # Base Tailwind CSS styles and theme variables
│   ├── upload/
│   │   └── page.tsx              # /upload route
│   ├── config/
│   │   └── page.tsx              # /config route
│   ├── results/
│   │   └── page.tsx              # /results route
│   ├── compare/
│   │   └── page.tsx              # /compare route
│   └── history/
│       └── page.tsx              # /history route
├── components/
│   ├── ui/                       # Shadcn UI primitives (Card, Table, Badge, Button, Select, Separator, etc.)
│   ├── layout/
│   │   └── StepSidebar.tsx       # Step navigation sidebar (Upload, Configure, Results, Compare, History)
│   ├── shared/                   # Cross-cutting components used across multiple pages
│   │   ├── StatusBadge.tsx       # Unified status and missing-data badge renderer
│   │   ├── WarningBadges.tsx     # Warning and confidence badges with explanatory tooltips
│   │   ├── SummaryCards.tsx      # Metric cards (total teams, missing-data counts, duplicates)
│   │   ├── ExportBar.tsx         # Export controls (shortlist, rejected, waitlist, breakdown in csv/json)
│   │   └── BlindToggle.tsx       # Blind mode toggle switch
│   ├── upload/                   # Page-specific components for /upload
│   │   ├── UploadBox.tsx         # File picker and progress indicator
│   │   ├── DataPreview.tsx       # Preview table for initial 20 rows
│   │   ├── TeamTable.tsx         # Team table with member count and missing indicators
│   │   └── ValidationPanel.tsx   # Validation report split into errors and warnings
│   ├── configure/                # Page-specific components for /config
│   │   ├── CriteriaList.tsx      # Add, remove, and reorder criteria list
│   │   ├── WeightSliders.tsx     # Sliders and number inputs with live 100-total check
│   │   └── PresetPicker.tsx      # Preset selection and saved configuration chooser
│   ├── results/                  # Page-specific components for /results
│   │   ├── ResultsTable.tsx      # Main results table with rank, scores, status, and pagination
│   │   ├── ScoreBreakdown.tsx    # Expandable score breakdown row per criterion
│   │   ├── ReviewQueue.tsx       # "Needs review" queue tab listing incomplete teams
│   │   ├── OverrideButtons.tsx   # Pin, Exclude, and Waitlist action buttons
│   │   ├── OverrideDialog.tsx    # Required reason dialog for overrides
│   │   ├── TeamDrawer.tsx        # Team detail drawer (signals, rules, explanation, GitHub evidence)
│   │   ├── WhatIfPanel.tsx       # Live re-ranking what-if panel with weight sliders
│   │   └── RankDelta.tsx         # Rank change indicators and enter/leave highlight badges
│   ├── compare/                  # Page-specific components for /compare
│   │   └── CompareTable.tsx      # Rank-difference comparison table for two configurations
│   └── history/                  # Page-specific components for /history
│       └── RunList.tsx           # Past runs list with dataset, config, and timestamp
├── hooks/
│   ├── useAppState.ts            # Hook to access shared IDs (dataset_id, config_id, run_id)
│   └── usePagination.ts          # Reusable pagination state and helper hook
└── lib/
    ├── utils.ts                  # Shadcn cn() helper
    ├── types.ts                  # Shared TypeScript type definitions
    ├── api.ts                    # Backend API client functions and fetch wrapper
    └── mocks/                    # Local temporary mock files (until teammate APIs/contracts land)
```

## 3. TypeScript types strategy
- `frontend/lib/types.ts` is the single source of truth for frontend data contracts. It holds types mirrored from M1's `backend/app/scoring/config_schema.py` (configuration, criteria, weights, aggregation methods, eligibility rules) and from the shared `docs/api-contract.md` and `docs/profile-contract.md` (dataset, team, member, signal status enum, run results, overrides).
- Enums and statuses must strictly represent the contracts defined in `context.md` and `prd.md`:
  - **Signal / Missing-Data Statuses (5-state enum)**: `OK` | `MISSING` | `INVALID` | `UNAVAILABLE` | `UNCERTAIN`
  - **Eligibility Statuses**: `Eligible` | `Ineligible` | `Needs review`
  - **Final Shortlist Statuses (4-state enum)**: `Shortlisted` | `Not shortlisted` | `Ineligible` | `Needs review`
- Until a teammate contract file lands, types must be derived only from the explicit fields and requirements documented in `frontend/context.md` and `frontend/prd.md`, with an explicit comment noting which upstream file they will be reconciled against:
  - *Example comment*: `// Reconcile with M1's backend/app/scoring/config_schema.py once available`
  - *Example comment*: `// Reconcile with M4's docs/api-contract.md once available`
- Types must never add speculative optional fallback fields "just in case". If a field shape is unknown or pending backend confirmation, mark it as `unknown` and flag it with an explicit comment; do not guess.

## 4. API client pattern
- **Single Client Module**: `frontend/lib/api.ts` houses all backend communication. Each endpoint has a dedicated, typed function: `uploadDataset`, `getDataset`, `listConfigs`, `saveConfig`, `createRun`, `getRun`, `rerank`, `listOverrides`, `createOverride`, `compareConfigs`, `listRuns`, `exportRun`.
- **Typed Signatures**: Every function accepts typed parameters and returns a typed response promise utilizing types from `frontend/lib/types.ts`.
- **Base Fetch Wrapper**: A single helper function (`fetcher<T>(endpoint: string, options?: RequestInit): Promise<T>`) centralizes standard request headers, base URL handling, consistent JSON parsing, and unified error handling so components do not write ad-hoc fetch logic.
- **Loading and Error Handling**: Pages manage loading, error, and data states using standard React state variables (`data`, `isLoading`, `error`) or a lightweight reusable hook. No heavy external data-fetching library (such as TanStack Query or SWR) will be introduced unless explicitly approved.
- **Mock Substitution Convention**: When an endpoint is not yet available, the corresponding `api.ts` function imports and returns data from a matching file in `frontend/lib/mocks/`. The function signature remains identical to its future production version. It must be explicitly marked:
  ```typescript
  // TEMPORARY MOCK — replace when <owner>'s <endpoint> is available
  ```
  When the real endpoint lands, only the internal body of the function is updated to use `fetcher<T>()`, requiring zero refactoring in page or component consumers.

## 5. Shared application state
- **State Scope**: Shared state is strictly limited to carrying identifiers and user configuration inputs across the pipeline:
  - `dataset_id` (produced by `/upload`, consumed by `/config` and `/runs`)
  - `config_id` / draft configuration (configured in `/config`, consumed by `/runs`)
  - `run_id` (produced by `POST /runs`, consumed by `/results`, `/compare`, `/history`, and `/export`)
- **State Mechanism**: A lightweight React Context (`AppStateContext`) coupled with an `AppStateProvider` in `app/layout.tsx` (accessible via `hooks/useAppState.ts`). For persistent bookmarking and direct linking to past runs, `run_id` and `dataset_id` can optionally be synchronized with URL search parameters (`?run_id=...`).
- **Strict Boundary**: No scoring, eligibility, ranking, or run-hash computation is ever performed in the frontend. Shared state only passes IDs and unsubmitted user configurations.

## 6. Component conventions
- **Functional Components & TypeScript**: All components are written as functional React components in `.tsx`. Types unique to a single component are colocated in that file; types shared across multiple components are imported from `lib/types.ts`.
- **Unified Status Badges**: All status, eligibility, and missing-data flags (`OK`, `MISSING`, `INVALID`, `UNAVAILABLE`, `UNCERTAIN`, `NEEDS_REVIEW`, `Shortlisted`, `Not shortlisted`, `Ineligible`, `Eligible`) must be rendered through `components/shared/StatusBadge.tsx`. This guarantees that text labels (e.g., "Missing", "Needs review") are always rendered alongside colors and remain identical across the application.
- **Accessible Expandable Elements**: All collapsibles and accordions (such as expandable team breakdown rows and drawers) must use standard `<button>` triggers with `aria-expanded` attributes and explicit accessible labels.
- **Built-in Pagination**: Tables that handle datasets up to 1000 teams (`ResultsTable`, `TeamTable`) must be built with pagination support from the start using `hooks/usePagination.ts`. Pagination state (current page, page size) lives in the parent table container state.
- **Resilient Row Counts**: Every list and table component must cleanly handle 0 rows (displaying an informative empty state), 1 row, and hundreds/thousands of rows without layout shifts or collapse.

## 7. Styling and design system
- **Styling Method**: Tailwind CSS utility classes are the standard styling mechanism.
- **UI Primitives**: Reuse Shadcn UI components located in `components/ui/` (`Card`, `Table`, `Badge`, `Button`, `Select`, `Separator`, etc.). Do not install or introduce additional component libraries without approval.
- **Visual Aesthetic**: Clean, information-dense internal admin dashboard inspired by Linear and GitHub dashboards. Surfaces are plain and neutral. No marketing-style hero sections, no purple gradients, no glassmorphism, and no decorative animations that impede data density.
- **Accessibility & Contrast**: Status indicators and badges must always carry explicit text labels in addition to any background or text color, ensuring full readability and accessibility.

## 8. Mocking strategy summary
- **When to Use Real Files**: If the designated teammate file or endpoint exists in the repository, it must be used directly.
- **When to Use Mocks**: If the teammate file/endpoint is not ready and the roadmap permits a mock for that day, use a mock file located strictly in `frontend/lib/mocks/`.
- **Mock Location**: All temporary mocks live under `frontend/lib/mocks/` (e.g., `frontend/lib/mocks/evaluationResult.ts`, `frontend/lib/mocks/previewRows.ts`).
- **Grep-able Convention**: Every mock import or mock implementation must be annotated with:
  ```typescript
  // TEMPORARY MOCK — replace when <owner>'s <file/endpoint> is available
  ```
  This ensures all mocks can be cataloged or audited via `git grep "TEMPORARY MOCK"`.

## 9. What this document does not cover
- **Day-by-Day Delivery Scope**: Detailed daily deliverables and requirements are specified in `frontend/prd.md`.
- **Fairness & Data Principles**: Core business definitions, fairness rules, and project boundaries are specified in `frontend/context.md`.
- **Coding Workflow & Agent Rules**: Specific AI coding instructions and workflow boundaries are specified in `frontend/agent.md` (to be created separately).
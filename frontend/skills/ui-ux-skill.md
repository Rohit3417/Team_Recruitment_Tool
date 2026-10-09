# UI/UX & Design Enforcement Skill — Incursion Track 3 (M3 Frontend)

## 1. Purpose
Enforce the visual design system, component usage rules, accessibility non-negotiables, and state-handling patterns so that every page looks and behaves like part of the same product, regardless of which day it was built or which AI session wrote it.

## 2. Design language (the "look")
Every page must follow these visual rules without exception:

### Color and surface
- **Background**: Neutral light grey or white (Tailwind `bg-white`, `bg-gray-50`, `bg-slate-50` — pick one family and stick to it; do not mix gray families).
- **Cards and panels**: White surfaces with subtle border (`border` or `border-gray-200`), never shadow-heavy or floating.
- **Text**: Dark gray/black for primary content (`text-gray-900` or `text-slate-900`), medium gray for secondary (`text-gray-500`/`600`), never pure black on white for body text (too harsh).
- **Accent color**: Used sparingly for active states, primary buttons, and rank-1 highlights only. Not applied broadly.

### Typography
- **Font stack**: Sans-serif system font stack (already configured in `app/layout.tsx`).
- **Headings**: Clear hierarchy (`text-lg`/`xl`/`2xl`), bold weight for titles, medium for subtitles.
- **Body**: Normal weight, readable line height (`leading-relaxed` or `leading-6`).
- **Monospace**: For IDs, run hashes, file paths, and code snippets only (`font-mono`).

### Spacing and layout
- **Spacing scale**: Consistent padding using Tailwind's spacing scale (`p-4`, `p-6` for cards; `gap-4`, `gap-6` for grids). Do not use arbitrary pixel values.
- **Max-width container**: Max-width container for main content (`max-w-7xl` or similar) centered on wide screens, not edge-to-edge.
- **Sidebar**: Fixed width (e.g., `w-64`), distinct background or border-right separator, always visible on desktop.

### What is explicitly forbidden
- No gradient backgrounds (`linear-gradient`, `radial-gradient`) on any surface.
- No glassmorphism (`backdrop-blur` + semi-transparent backgrounds).
- No marketing hero sections, illustration graphics, or decorative imagery.
- No unnecessary animations (spinners for loading are allowed; entrance animations, parallax, floating elements are not).
- No purple/blue gradient branding or "startup landing page" aesthetics.
- No custom CSS that duplicates what Tailwind utilities already provide.

## 3. Component usage rules

### Shadcn UI primitives (mandatory reuse)
Before creating any custom component, check if an existing Shadcn primitive in `components/ui/` suffices:
- **Button** → use `components/ui/button.tsx` (never a styled `<a>` or `<div>`)
- **Card** → use `components/ui/card.tsx` (`CardHeader`, `CardContent`, `CardTitle`)
- **Badge** → use `components/ui/badge.tsx` (for all status indicators)
- **Table** → use `components/ui/table.tsx` (for all data tables)
- **Select** → use `components/ui/select.tsx` (for dropdowns)
- **Separator** → use `components/ui/separator.tsx` (for visual dividers)

If a Shadcn primitive does not meet a need, extend it via `className` or variant before building a wholly new component. Never install a new UI library (MUI, Chakra, Radix directly, etc.) without explicit approval.

### StatusBadge (the single source of truth for status rendering)
ALL of the following must be rendered through `components/shared/StatusBadge.tsx` (to be created on Day 1 or 2):
- **Signal/missing-data statuses**: `OK`, `MISSING`, `INVALID`, `UNAVAILABLE`, `UNCERTAIN`
- **Eligibility statuses**: `Eligible`, `Ineligible`, `Needs review`
- **Shortlist statuses**: `Shortlisted`, `Not shortlisted`, `Ineligible`, `Needs review`
- **Override indicators**: `Pinned`, `Excluded`, `Waitlisted`

`StatusBadge` must:
- Accept a `status` prop from the unified enum.
- Render visible **TEXT** matching the status string (not just a colored dot).
- Use color as secondary reinforcement only (e.g., green for OK/Eligible, red for INVALID/Ineligible, gray for MISSING, amber for UNCERTAIN).
- Accept an optional `size` prop (`sm`/`default`) for use in tables vs detail views.
- Never render a status as blank, `"-"`, `"—"`, or `"0"` when a real status value exists.

## 4. Accessibility non-negotiables (tested every day)

### Interactive elements
- Every clickable/actionable element is a native `<button>` or `<a>` or interactive Shadcn component. **NEVER** a `<div onClick={...}>` or `<span onClick={...}>`.
- Every interactive element has visible focus indication (`ring` or `outline`) that is not removed by CSS.
- Every icon button has an `aria-label` describing its action.

### Expandable/collapsible sections
- Trigger is always `<button>` with `aria-expanded` (`true`/`false`) and `aria-controls` pointing to the target panel ID.
- The visible label clearly describes what expands/collapses (e.g., "Show score breakdown" / "Hide score breakdown").
- No keyboard trap: Tab order flows naturally through the expanded content.

### Tables and lists
- `<table>` uses `<th>` with scope for column headers (`scope="col"`).
- Row headers use `<th scope="row">` where applicable.
- Long text (team names, URLs, GitHub handles) truncates with CSS (`truncate`, `whitespace-nowrap`, `overflow-hidden`, `text-ellipsis`) and exposes the full value in a native `title` attribute on the containing element.
- Empty tables show a human-readable empty state message, not a blank grid.
- Screen readers can perceive row count and basic structure.

### Color independence
- Status and meaning are **NEVER** conveyed by color alone. Every colored indicator carries matching text (via `StatusBadge` or explicit label).
- Color contrast meets WCAG AA minimum (4.5:1 for normal text, 3:1 for large text).

## 5. State display patterns

### Loading state
- Show a skeleton (Shadcn Skeleton component or similar) or a centered spinner with text "Loading..." while data is fetched.
- Do not flash empty state before loading completes.
- Do not disable the entire page; only the affected region shows loading.

### Empty state
- When a list/table has zero items (no teams uploaded, no runs yet, no results), display:
  - A clear message explaining why it's empty ("No datasets uploaded yet", "No results to display").
  - A brief hint of what to do next ("Upload a dataset to begin", "Configure criteria and run evaluation").
  - No broken layout or collapsed container.

### Error state
- When an API call fails or validation rejects input:
  - Show a visible error banner or inline error message with red styling.
  - Include the error reason if safe to display (backend validation message), or a generic "Something went wrong. Try again." if the error is technical/internal.
  - Provide a retry action (button) where appropriate.
  - Do not silently swallow errors or show a console-only log.

### Partial/incomplete data state (critical for this product)
- **Missing fields**: Grey "MISSING" badge (not red, not zero).
- **Invalid fields**: Red "INVALID" badge with tooltip explaining why.
- **Uncertain fields (AI-extracted)**: Amber "UNCERTAIN" badge with the confidence level or source note.
- **Unavailable fields (couldn't fetch)**: Gray "UNAVAILABLE" badge.
- In every case, the team/member row remains fully visible; nothing is hidden or collapsed because data is incomplete.

## 6. Responsive behavior (plan from Day 1)
- **Desktop (lg+)**: Full layout with sidebar + main content area side by side.
- **Tablet (md)**: Sidebar may collapse to icons or top navigation; main content fills width.
- **Mobile (sm)**: Single column, sidebar becomes a bottom nav or hamburger menu; tables become card-list layouts or horizontally scrollable.
- Do not build mobile-specific layouts on Day 1, but do not write CSS that explicitly breaks at small widths (e.g., fixed pixel widths wider than 375px, `overflow-hidden` on containers that should scroll).

## 7. Day 1 specific: layout shell requirements
Today's task (Day 1) builds ONLY:
- The root layout (`app/layout.tsx`) with font setup, metadata, and the `AppStateProvider` wrapper (empty for now).
- A step sidebar component (`components/layout/StepSidebar.tsx`) showing the five steps: Upload, Configure, Results, Compare, History. The current step is visually highlighted; future steps are dimmed/disabled-looking.
- Empty page shells for each of the five routes, each displaying a placeholder Card with the page title and a "Coming on Day X" subtitle (using the day number from `frontend/prd.md` section 6).
- The sidebar must be present on every page via the layout.
- No real functionality, no API calls, no state beyond the current step highlight.


## 8. Additional interaction rules (adopted from external UI guidelines)
- Touch/click targets: interactive elements must be at least 44x44px; expand the hit area with padding if the visible element is smaller.
- Numeric columns in tables (scores, ranks, points) use tabular/monospaced figures (font-mono or font-variant-numeric: tabular-nums) so columns do not shift layout as values change.
- Form validation: show errors inline below the related field, not only in a summary at the top; validate on blur, not on every keystroke. (This aligns with the Day 5 requirement to show backend validation errors beside fields.)
- Destructive or consequential actions (overrides: Pin, Exclude, Waitlist) always require a confirmation or reason dialog before applying. (Aligns with Day 10's required reason dialog.)
- Toasts/notifications: auto-dismiss in 3-5 seconds, use aria-live="polite", and never steal keyboard focus.
- Respect prefers-reduced-motion: disable or minimize any non-essential animation when the user's OS requests reduced motion.
- Focus management: after a route change, focus moves to the main content region; after a form submission error, focus moves to the first invalid field.

These rules are binding for all pages from Day 1 onward, same as sections 2-7.

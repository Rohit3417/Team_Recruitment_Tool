---
name: ui-ux-pro-max
description: Secondary accessibility and usability review for the Incursion Track 3 Next.js organizer dashboard, within the project's existing design and scope rules.
---

# UI/UX Pro Max — Track 3 Project Skill Wrapper

This skill is a project-specific wrapper for UI/UX Pro Max design intelligence, referencing the underlying resource at `frontend/ui-ux-pro-max-skill-main/.claude/skills/ui-ux-pro-max/`.

## 1. Strict Authority Order
All design and implementation decisions must follow this strict priority order:

1. Official current 15-day roadmap
2. `frontend/context.md`
3. `frontend/prd.md`
4. `frontend/design.md`
5. `frontend/agent.md`
6. `frontend/skills/ui-ux-skill.md`
7. UI/UX Pro Max recommendations

**Rule:** If UI/UX Pro Max conflicts with any higher-priority project rule, ignore the UI/UX Pro Max recommendation.

## 2. Project-Specific Overrides & Prohibitions
The following patterns from general UI/UX Pro Max guidelines are strictly overridden for this repository:
- **Stack**: Web stack only (Next.js App Router, React, Tailwind, Shadcn UI), never React Native or mobile native frameworks.
- **No Design System Generation**: Do not generate new palettes, CSS variables, or design systems. Use the established neutral theme in `app/globals.css`.
- **Styling Restrictions**: Strictly no gradients (linear or radial), no glassmorphism (backdrop-blur), no dark mode toggles (internal demo tool), and no Google Fonts / external web fonts (air-gapped system font stack only).
- **Dependencies**: No new npm or package dependencies without prior approval. Do not install external libraries for UI or icons.
- **Environment & Scripts**: No Python script execution, package installation, or `--persist` flags.
- **Product Scope**: Never invent product functionality, columns, or future-day features ahead of the current roadmap day.
- **Data Display**: Tables use pagination via standard state/hooks, not virtualized lists or infinite scroll.

## 3. Approved Advisory Areas
UI/UX Pro Max guidance is welcome as a secondary review and advisory resource in the following areas, provided all higher-priority rules are respected:
- Accessibility (WCAG AA compliance, ARIA attributes, color independence)
- Keyboard navigation and natural tab order
- Visible focus states and indicators
- Touch targets (minimum 44x44px hit areas)
- Responsive layout resilience (desktop sidebar, tablet, mobile fluid bounds)
- Spacing scale consistency and visual rhythm
- Typography hierarchy and readability
- Contrast ratios for text and indicators
- Form usability and inline validation display on blur
- Loading, empty, and error state ergonomics
- Table readability and numeric layout shift prevention (`tabular-nums` / monospace)
- Navigation clarity and active step indication
- Reduced motion preferences (`prefers-reduced-motion`)
- Layout shift prevention during dynamic state changes
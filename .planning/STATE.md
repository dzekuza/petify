# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-23)

**Core value:** The app should look and feel like it was built in 2025 — clean, minimal, professional — so users trust it enough to book services and pay through it.
**Current focus:** Phase 1 — Foundation

## Current Position

Phase: 1 of 6 (Foundation)
Plan: 4 of 4 in current phase (Phase 1 complete)
Status: In progress
Last activity: 2026-02-23 — Plans 01-03 (semantic token migration) and 01-04 (ProviderCard unification) complete

Progress: [████░░░░░░] 17% (4 plans of ~24 total)

## Performance Metrics

**Velocity:**
- Total plans completed: 0
- Average duration: —
- Total execution time: —

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| - | - | - | - |

**Recent Trend:**
- Last 5 plans: —
- Trend: —

*Updated after each plan completion*
| Phase 01-foundation P04 | 12 | 2 tasks | 2 files |
| Phase 01-foundation P03 | 7 | 3 tasks | 87 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [Roadmap]: GLBL-01 (no all-caps headings) and GLBL-04 (consistent spacing) assigned to Phase 1 — these are token/foundation concerns that must be established before visual work begins
- [Roadmap]: GLBL-02 (action verb CTAs) and GLBL-03 (inline form validation) assigned to Phase 6 — provider detail has the primary forms and CTAs; these are audited and enforced there
- [Roadmap]: Phase 4 (Provider Cards) depends on Phase 1, not Phase 3 — cards must be unified before search and landing page are considered complete
- [Research]: Phase 5 (Search/Browse) flagged for phase research — Mapbox GL dynamic marker updates and custom popup styling have known implementation-specific gotchas
- [01-02 Token]: Teal/green accent hue 174 oklch at chroma 0.14 chosen — calming and nature-aligned, not neon
- [01-02 Token]: Warm gray system confirmed correct — muted hue 106, border hue 48; no changes needed
- [01-02 Token]: Neutral scale kept intact — used by 6+ UI components; replacement is Phase 3 scope
- [01-02 Token]: TailwindCSS v4 @utility directive used for page-container/section-container — preferred over @layer utilities
- [01-01 Cleanup]: FloatingChatButton replaced with ChatButton in fixed-position wrapper — ChatButton is the canonical floating chat entry point
- [01-01 Cleanup]: GLBL-01 audit passed — uppercase class only on badge/label elements, never on h1-h6 headings
- [Phase 01-04]: ProviderCard sub-components are private functions not exported — Phase 4 extends via variant prop
- [Phase 01-04]: listings-grid.tsx drops own auth/favorites state — ProviderCard manages favorites toggle internally
- [Phase 01-03]: bg-gray-200 defaults to bg-muted (subtle container); hover states use bg-secondary for stronger feedback
- [Phase 01-03]: border-gray-100 → border-border/50 using opacity modifier to preserve very-subtle divider intent
- [Phase 01-03]: All dark: prefixed gray variants in ruixen-mono-chat replaced with semantic tokens to maintain dark mode fidelity

### Pending Todos

None yet.

### Blockers/Concerns

- [Phase 5]: Mapbox GL custom map marker styling with provider name/price tooltip on hover — sparse documentation for this specific pattern. Needs a spike during phase planning before committing to design.
- [Research gap]: No analytics data on actual mobile vs. desktop traffic split. Assumption is mobile-primary for customers. Validate before finalizing Phase 5 map/list toggle priority.

## Session Continuity

Last session: 2026-02-23
Stopped at: Completed 01-04-PLAN.md — ProviderCard unification with grid/horizontal variants
Resume file: .planning/phases/02-landing-page/02-01-PLAN.md (or next available phase)

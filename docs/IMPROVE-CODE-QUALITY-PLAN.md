# Improve Code Quality Plan

## Context
- **Date started**: 2026-11-06
- **Application**: Ohmic (`ohmic-resistor-lab`) — Interactive EDA circuit calculator for parallel resistor networks, voltage dividers with E24/E96 commercial pair synthesis, and first-order RC/RL passive filters.
- **Failure impact**: Inaccurate resistance/voltage/cutoff calculations could mislead hardware engineers selecting physical resistor or capacitor values.
- **Stack**: Next.js 15 (App Router, Static Export for GitHub Pages), React 19, TypeScript 5.9, Tailwind CSS 4, `node:test` + `tsx`, ESLint 9 + Oxlint (`anti-slop`).
- **Outbound dependencies / Database**: Zero external runtime APIs or databases (100% deterministic in-browser circuit computation).

## Phase Status
| Phase | Skill | Status | Artifact | Date |
|---|---|---|---|---|
| 1 — Build the safety net | working-with-legacy-code | done | TESTING.md + TECH-DEBT.md (GATE) | 2026-11-06 |
| 2 — Make the code readable | clean-code | done | TECH-DEBT.md | 2026-11-06 |
| 3 — Apply named refactorings | refactoring-patterns | done | TECH-DEBT.md | 2026-11-06 |
| 4 — Reduce complexity | software-design-philosophy | done | TECH-DEBT.md | 2026-11-06 |
| 5 — Draw the architecture boundary | clean-architecture | done | ARCHITECTURE.md | 2026-11-06 |
| 6 — Lock in the habits | pragmatic-programmer | done | TECH-DEBT.md | 2026-11-06 |
| 7 — Make it survive production | release-it | done | RELIABILITY.md | 2026-11-06 |
| 8 — Size for real load | system-design | done | ARCHITECTURE.md + RELIABILITY.md | 2026-11-06 |
| 9 — Get the data layer right | ddia-systems | skipped: Pure stateless client-side circuit engine with no database or concurrent writes | ARCHITECTURE.md | 2026-11-06 |
| Optional — Domain language | domain-driven-design | done | ARCHITECTURE.md | 2026-11-06 |
Statuses: pending · in-progress · awaiting-evidence · done · deferred: <reason> · skipped: <reason>

## Key Decisions
| Date | Phase | Decision | Rationale |
|---|---|---|---|
| 2026-11-06 | Phase 1 | Pin all domain modules in `lib/` via `node:test` (`lib/clean-architecture.test.ts`) | Fast (<700ms) deterministic verification without DOM overhead |
| 2026-11-06 | Phase 2 & 3 | Split `resistor-color-code.ts` and `voltage-divider-pair-scoring.ts`; eliminate boolean flag in `passive-filter-calc.ts` | Keeps modules under 350 lines and enforces single level of abstraction |
| 2026-11-06 | Phase 4 | Deepen `evaluateVoltageDividerWorkspace`, `calculateParallelResistance`, and `calculatePassiveFilter`; remove pass-through re-exports | Hides unit conversion and E-series orchestration behind compact module seams |
| 2026-11-06 | Phase 5 | Enforce strict inward dependency rule (`components/` -> `lib/` -> `types/`) | Zero React/DOM imports in `lib/` and `types/` |
| 2026-11-06 | Phase 6 | Consolidate `RESISTOR_UNIT_MAP` into `types/resistor.ts` and enforce `npm run check` (`tsc` + `eslint` + `oxlint`) | Eliminates 3x duplicated unit multiplier tables and enforces zero-warning CI |
| 2026-11-06 | Phase 7 & 8 | Bound in-memory caches (`MAX_PAIR_CACHE = 64`, `MAX_COLOR_CACHE_SIZE = 64`) | Prevents unbounded memory growth during long interactive sessions |

## Next Actions
- [x] Pin `voltage-divider-solver.ts` and `voltage-divider-format.ts` in `lib/clean-architecture.test.ts` (KavehAhangar051, 2026-11-06)
- [x] Deduplicate `RESISTOR_UNIT_MAP` across `types/resistor.ts` and `lib/` modules (KavehAhangar051, 2026-11-06)

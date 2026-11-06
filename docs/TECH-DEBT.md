# Technical Debt

## Debt Ledger
| Item | Location | Type | Risk | Effort | Priority | Status |
|---|---|---|---|---|---|---|
| Duplicated resistor unit multiplier map (`UNIT_MAP` / `UNIT_MULTIPLIER_MAP` / `RESISTOR_UNIT_MAP`) | `types/resistor.ts`, `lib/resistor-calc.ts`, `lib/resistor-color-code.ts`, `lib/voltage-divider-format.ts` | Duplicated Knowledge (DRY) | Low | S | P1 | done |
| Pass-through re-exports in solver module | `lib/voltage-divider-solver.ts` | Shallow Module / Indirection | Low | S | P1 | done |
| Inline branch array mutations in UI view | `components/resistor-calculator/ResistorCalculatorView.tsx` | Boundary Leak | Medium | S | P1 | done |
| Multi-step unit conversion and pair merging in UI view | `components/voltage-divider/VoltageDividerView.tsx` | Information Leakage / Temporal Decomposition | Medium | M | P1 | done |

## Smell Inventory
| Smell | Location | Refactoring | Status |
|---|---|---|---|
| Mixed parallel network math and EIA color-band encoding (>400 lines) | `lib/resistor-calc.ts` | Extract Module (`lib/resistor-color-code.ts`) | done |
| Monolithic 320-line E24/E96 candidate search and scoring loop | `lib/voltage-divider-pair-finder.ts` | Extract Method + Extract Module (`lib/voltage-divider-pair-scoring.ts`) | done |
| Boolean flag parameter (`isLowPass: boolean`) in transfer function | `lib/passive-filter-calc.ts` | Split Flagged Function (`evaluateLowPassResponse` / `evaluateHighPassResponse`) | done |
| Magic numbers in E24/E96 error thresholds and Bode plot sweep bounds | `lib/voltage-divider-pair-scoring.ts`, `lib/passive-filter-calc.ts` | Replace Magic Number with Symbolic Constant | done |
| Split seam requiring UI caller to invoke `findStandardFilterPairs` after `calculatePassiveFilter` | `lib/passive-filter-calc.ts`, `components/passive-filter/PassiveFilterView.tsx` | Deepen Module Interface (`standardPairs` + `applyStandardFilterPair`) | done |

## Sprout / Wrap Register
No legacy untested host modules remain; all domain modules in `lib/` are directly covered in `lib/clean-architecture.test.ts`.

## Debt Budget & Broken-Windows Policy
- **Zero-Warning Gate**: Every change must pass `npm run check` (`tsc --noEmit && eslint . && oxlint`) with 0 warnings and 0 errors before committing.
- **Module Size Cap**: Keep files around 200–300 lines (hard ceiling ~400 lines) with a single clear responsibility per file.
- **No Untracked Hacks**: Do not leave untracked `// TODO` comments or `as any` casts; record any deferred work in the Debt Ledger above.

## Adopted Conventions
- **Named Return Interfaces**: Functions returning object literals must declare a named exported `interface` (enforced by `oxlint` `anti-slop(no-known-value-widening)`).
- **Readable Statement Spacing**: Leave a blank line after multiline variable declarations and between top-level exports (enforced by `oxlint` `anti-slop(require-readable-spacing)`).
- **Inward Dependency Rule**: `types/` has zero imports from `lib/` or `components/`; `lib/` has zero imports from `components/` or React.

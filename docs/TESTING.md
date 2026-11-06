# Testing

## Test Strategy
- **Unit & Domain Seam Tests (`node:test` + `tsx`)**: Fast, deterministic tests targeting the public interfaces of all pure circuit calculation modules in `lib/`.
- **Static Analysis Gates (`npm run check`)**: Runs `tsc --noEmit`, `eslint .`, and `oxlint` (including custom `anti-slop` rules) on every change.
- **Browser Verification (`playwright-cli`)**: End-to-end visual and interactive verification across desktop (`1440×900`) and mobile (`390×844`) viewports.

## Safety Net Map
| Module | Pinned behaviors | Test files | Gaps |
|---|---|---|---|
| `lib/resistor-calc.ts` | Equivalent parallel resistance, conductance sum, short-circuit invariant (`0 Ω`), branch telemetry (`branchStats`), and branch collection operations (`updateResistorBranch`, `appendResistorBranch`, `removeResistorBranch`, `duplicateResistorBranch`) | `lib/clean-architecture.test.ts` | None |
| `lib/resistor-color-code.ts` | 4-band EIA color encoding (`getResistorColorBands`), decade normalization, and bounded LRU cache | `lib/clean-architecture.test.ts` | None |
| `lib/voltage-divider-calc.ts` | `evaluateVoltageDividerWorkspace`, `applySelectedPairToState`, `calculateVoltageDivider`, Thevenin resistance, safe 5% load current, and ADC impedance classification | `lib/clean-architecture.test.ts` | None |
| `lib/voltage-divider-solver.ts` | Analytical inverse solvers (`solveR1`, `solveR2`, `solveVin`, `getEffectiveR2`), loaded sag deconvolution, and invalid voltage/load boundary guards | `lib/clean-architecture.test.ts` | None |
| `lib/voltage-divider-pair-finder.ts` | E24/E96 commercial pair search (`findBestE24Pairs`) and deterministic multi-criterion filtering/sorting (`filterAndSortResistorPairs`) | `lib/clean-architecture.test.ts` | None |
| `lib/voltage-divider-pair-scoring.ts` | ADC suitability, transistor bias stability, current domain categorization, and load stiffness penalty scoring | `lib/clean-architecture.test.ts` | None |
| `lib/voltage-divider-format.ts` | Unit conversions (`toOhms`, `toVolts`), auto-scaling (`decomposeOhms`, `formatVoltage`, `formatCurrent`, `formatPower`), and symbol mapping | `lib/clean-architecture.test.ts` | None |
| `lib/passive-filter-calc.ts` | First-order RC/RL cutoff frequency, time constant, Bode plot generation, E24/E12 pair synthesis (`standardPairs`), and topology-aware state updates (`applyStandardFilterPair`) | `lib/clean-architecture.test.ts` | None |

## Characterization Backlog
- [x] `lib/resistor-calc.ts` & `lib/resistor-color-code.ts` (high, P0)
- [x] `lib/voltage-divider-calc.ts` & `lib/voltage-divider-pair-finder.ts` (high, P0)
- [x] `lib/voltage-divider-solver.ts` & `lib/voltage-divider-format.ts` (medium, P1)
- [x] `lib/passive-filter-calc.ts` (high, P0)

## CI Gates
- `npx --yes tsx --test lib/clean-architecture.test.ts` (8/8 tests green)
- `npm run check` (`tsc --noEmit && eslint . && oxlint` with 0 warnings and 0 errors)
- `npm run build` (Next.js static export build green)

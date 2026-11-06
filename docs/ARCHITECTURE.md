# Architecture Record (`docs/ARCHITECTURE.md`)

> Created by `improve-code-quality` (Phases 5, 8, 9, and Optional DDD Phase). Companion to root `/ARCHITECTURE.md`.

## Layer Map & Dependency Rule

```text
+-------------------------------------------------------------------------+
| Layer 3: Presentation & UI (`app/`, `components/`, `hooks/`)            |
| - Next.js 15 App Router entry, state hooks, SVG diagram, calculator UI  |
+-------------------------------------------------------------------------+
                                    |
                                    v (depends inward only)
+-------------------------------------------------------------------------+
| Layer 2: Pure Domain & Application Services (`lib/*.ts`)                |
| - IEC 60062 color band decoder/encoder, EIA E-series matcher,           |
|   parallel/series solver, loaded voltage divider math & formatting      |
+-------------------------------------------------------------------------+
                                    |
                                    v (depends inward only)
+-------------------------------------------------------------------------+
| Layer 1: Entities & Value Types (`types/resistor.ts`)                   |
| - BandCount, BandRole, ColorId, ResistorUnit, RESISTOR_UNIT_MAP,        |
|   CalculationResult, ESeriesResult, VoltageDividerInput/Result          |
+-------------------------------------------------------------------------+
```

**Dependency Rule**: Source code dependencies point strictly inward (`app/components/hooks` -> `lib` -> `types`). `types/` and `lib/` contain zero React, DOM, browser storage, or Next.js imports.

---

## System Context

- **Runtime**: Client-side static single-page web application (Next.js 15 static export `output: 'export'`).
- **Deployment Target**: GitHub Pages (`https://kavehahangar051.github.io/ohmic-resistor-lab`) via `.github/workflows/deploy.yml` and local Node/Next.js dev server on port `3000`.
- **External Dependencies**: Zero backend APIs, zero telemetry, zero remote runtime calls. All calculations execute synchronously in the browser's main thread in `< 1 ms`.

---

## Data & Storage Decisions

- **Primary State Store**: Ephemeral React state in `hooks/use-resistor-calculator.ts` (current band count, selected band colors, reverse ohmic input, and unit).
- **Encoding & Serialization**: Pure in-memory TypeScript value objects defined in `types/resistor.ts`.
- **Caching & Persistence**: Static constant lookup tables (`COLOR_DATA`, `COLOR_MAP`, `E_SERIES_VALUES`, `RESISTOR_UNIT_MAP`) evaluated once at module load time. No `localStorage`, cookies, or IndexedDB persistence is required, eliminating stale client-cache failure modes.

---

## Bounded Contexts & Context Map

1. **Color Code & E-Series Context** (`lib/resistor-data.ts`, `lib/resistor-calc.ts`, `lib/resistor-color-code.ts`, `lib/e-series-data.ts`, `lib/e-series.ts`):
   - Owns IEC 60062 4/5/6-band decoding, reverse value-to-band quantization, and EIA E12/E24/E48/E96 nearest standard value matching.
2. **Parallel/Series Synthesis Context** (`lib/parallel-series.ts`):
   - Consumes `E_SERIES_VALUES` from the E-Series Context to synthesize target resistances from two standard E-series resistors in series (`R1 + R2`) or parallel (`(R1 * R2) / (R1 + R2)`).
3. **Voltage Divider & Load Analysis Context** (`lib/voltage-divider.ts`, `lib/voltage-divider-solver.ts`, `lib/voltage-divider-format.ts`):
   - Owns loaded/unloaded DC voltage divider calculation (`Vout`, `R_eq`, branch currents, power dissipation, load drop percentage, and E24 pair suggestions).
   - Shares the canonical `ResistorUnit` and `RESISTOR_UNIT_MAP` kernel in `types/resistor.ts` with the Color Code Context.

---

## Domain Glossary (Ubiquitous Language)

| Term | Code Representation | Definition |
| :--- | :--- | :--- |
| **Band Count** | `BandCount` (`4 \| 5 \| 6`) | Number of IEC 60062 color bands painted on the axial resistor body. |
| **Band Role** | `BandRole` (`digit \| multiplier \| tolerance \| tcr`) | Functional meaning of a band position for a given `BandCount`. |
| **Nominal Resistance** | `CalculationResult.resistance` | Decoded resistance in Ohms (`Ω`) prior to tolerance bounds. |
| **Tolerance Window** | `minResistance`, `maxResistance` | Lower and upper resistance bounds in Ohms derived from `±tolerance%`. |
| **TCR** | `tcr` (`ppm/K`) | Temperature Coefficient of Resistance (6th band on precision 6-band resistors). |
| **E-Series** | `ESeriesName` (`E12 \| E24 \| E48 \| E96`) | IEC 60063 logarithmic decade series of preferred standard resistor values. |
| **Effective R2** | `getEffectiveR2(r2, rLoad)` | Parallel combination of lower divider resistor `R2` and load impedance `R_load`. |
| **Load Drop %** | `VoltageDividerResult.loadDropPercent` | Percentage drop in `V_out` caused by connecting a finite `R_load` across `R2`. |

---

## Decision Log

### ADR-001: Keep All Electrical Domain Logic Pure and Framework-Free in `lib/`
- **Context**: UI state changes frequently and must be testable without spinning up a browser DOM.
- **Decision**: Enforce strict inward dependency rules (`components/hooks` -> `lib` -> `types`) and keep `lib/` 100% pure TypeScript functions tested via `node:test`.
- **Consequences**: Complete domain test execution in ~120 ms with zero mocking or DOM overhead.

### ADR-002: Consolidate Unit Multipliers in `types/resistor.ts` (`RESISTOR_UNIT_MAP`)
- **Context**: `Ohm`, `kOhm`, and `MOhm` scale factors (`1`, `1e3`, `1e6`) were previously defined in three separate modules (`lib/resistor-calc.ts`, `lib/resistor-color-code.ts`, `lib/voltage-divider-format.ts`).
- **Decision**: Extract `RESISTOR_UNIT_MAP` to `types/resistor.ts` as the single canonical source of truth across all contexts.
- **Consequences**: Eliminates DRY knowledge duplication while preserving inward dependency direction.

### ADR-003: Dual-Stage Static Analysis (`tsc --noEmit` + `oxlint` Custom Anti-Slop Plugin)
- **Context**: Standard linting misses structural AI-slop patterns such as widened object return types, over-nested conditionals, and cramped multi-line declarations.
- **Decision**: Enforce `npm run check` (`tsc --noEmit` + `oxlint` with `.oxlint/plugins/anti-slop.mjs`) on every change and in GitHub Actions CI.
- **Consequences**: Zero warnings and zero errors across all repository files before deployment.

# Architecture Record (`docs/ARCHITECTURE.md`)

> Companion architectural decision record (ADR) to root [`/ARCHITECTURE.md`](../ARCHITECTURE.md) and [`/CONTEXT.md`](../CONTEXT.md).

## Layer Map & Dependency Rule

```text
+-------------------------------------------------------------------------+
| Layer 3: Presentation & UI (`app/`, `components/`)                      |
| - Next.js 15 App Router entry, interactive state, SVG schematics & Bode |
+-------------------------------------------------------------------------+
                                    |
                                    v (depends inward only)
+-------------------------------------------------------------------------+
| Layer 2: Pure Domain & Application Services (`lib/*.ts`)                |
| - Parallel conductance engine, E24/E96 voltage divider solver & scorer, |
|   first-order RC/RL transfer functions, EIA 4-band color encoding       |
+-------------------------------------------------------------------------+
                                    |
                                    v (depends inward only)
+-------------------------------------------------------------------------+
| Layer 1: Entities & Value Contracts (`types/*.ts`)                      |
| - `types/resistor.ts`, `types/voltage-divider.ts`,                      |
|   `types/passive-filter.ts`, `RESISTOR_UNIT_MAP`                        |
+-------------------------------------------------------------------------+
```

**Dependency Rule**: Source code dependencies point strictly inward (`app/components` -> `lib` -> `types`). `types/` and `lib/` contain zero React, DOM, browser storage, or Next.js imports.

---

## System Context

| Property | Value |
| :--- | :--- |
| **Runtime** | Client-side static web application (Next.js 15 `output: 'export'` on CI, `standalone` in preview) |
| **Deployment Target** | GitHub Pages (`https://kavehahangar051.github.io/ohmic-resistor-lab`) & port `3000` dev server |
| **External Dependencies** | Zero backend APIs, zero telemetry, zero outbound network calls at runtime |
| **State Management** | Unidirectional React state in view containers (`ResistorCalculatorView`, `VoltageDividerView`, `PassiveFilterView`) |

---

## Bounded Contexts

| Context | Modules | Core Responsibility |
| :--- | :--- | :--- |
| **Parallel Network** | `types/resistor.ts`, `lib/resistor-calc.ts`, `lib/resistor-color-code.ts` | Conductance-based equivalent resistance ($R_{eq}$), per-branch current share telemetry, branch collection invariants, and 4-band EIA color encoding |
| **Voltage Divider Workspace** | `types/voltage-divider.ts`, `lib/voltage-divider-*.ts`, `lib/e-series.ts` | Forward/inverse divider equations, loaded $R_{2,\text{eff}}$ sag analysis, and multi-objective E24/E96 resistor pair synthesis |
| **Passive Filter (RC / RL)** | `types/passive-filter.ts`, `lib/passive-filter-calc.ts` | Cutoff frequency ($f_c$), time constant ($\tau$), 4-decade Bode magnitude/phase projection, and E24/E12 component pair matching |

---

## Decision Log

### ADR-001: Keep All Electrical Domain Logic Pure and Framework-Free in `lib/`
- **Context**: Circuit math and E-series optimization must be verifiable without DOM rendering overhead.
- **Decision**: Enforce inward dependencies (`components` -> `lib` -> `types`) and pin all `lib/` seams with `node:test` in `lib/clean-architecture.test.ts`.
- **Consequences**: Full 8-test domain suite runs in ~400 ms (`npm run test`).

### ADR-002: Consolidate Unit Multipliers in `types/resistor.ts` (`RESISTOR_UNIT_MAP`)
- **Context**: `Ohm`, `kOhm`, and `MOhm` scale factors (`1`, `1e3`, `1e6`) are needed across all three bounded contexts.
- **Decision**: Define `RESISTOR_UNIT_MAP` once in `types/resistor.ts` as the single canonical source of truth.
- **Consequences**: Zero duplicated multiplier maps across `lib/`.

### ADR-003: Dual-Stage Static Analysis (`tsc --noEmit` + `eslint` + `oxlint` Custom Anti-Slop Plugin)
- **Context**: Standard linting misses structural AI-slop patterns such as widened object return types and cramped multi-line declarations.
- **Decision**: Enforce `npm run check` (`tsc --noEmit && eslint . && oxlint`) on every change.
- **Consequences**: Zero warnings and zero errors across all 65 repository source files.


# Domain Glossary & Context Map (`CONTEXT.md`)

> Ubiquitous language for `ohmic-resistor-lab`. Architectural reviews (`/improve-codebase-architecture`) and module interfaces (`/codebase-design`) use these domain terms directly.

## Bounded Contexts

### 1. Parallel Network Context (`types/resistor.ts`, `lib/resistor-calc.ts`, `lib/resistor-color-code.ts`)
- **Parallel Network**: A collection of 1..N resistor branches connected across shared positive (`Node A`) and return (`Node B`) conductor buses.
- **Resistor Branch (`ResistorItem`)**: A single parallel leg with a nominal ohmic value, unit (`Ohm | kOhm | MOhm`), and identical-resistor multiplier (`count`).
- **Branch Conductance (`G_k`)**: Electrical conductance in Siemens (`count / R_ohms`) used to compute equivalent resistance (`R_eq = 1 / G_total`) without nested reciprocal rounding drift.
- **Branch Telemetry (`ParallelBranchStat`)**: Per-branch current share percentage, short-circuit state, and electron-flow animation timing returned across the `calculateParallelResistance` seam.
- **EIA 4-Band Color Code (`ColorBand`)**: IEC 60062 four-band axial color representation (1st digit, 2nd digit, decade multiplier, gold `±5%` tolerance).

### 2. Voltage Divider Workspace Context (`types/voltage-divider.ts`, `lib/voltage-divider-*.ts`, `lib/e-series.ts`)
- **Voltage Divider Workspace**: The unified circuit state (`Vin`, target `Vout`, `R1`, `R2`, optional load `RL`, application mode, and EIA series) evaluated at a single seam via `evaluateVoltageDividerWorkspace`.
- **Application Mode (`DividerApplicationMode`)**:
  - `sampling`: ADC input attenuation where Thevenin impedance (`R_th <= 10 kΩ`) governs sample-and-hold settling.
  - `biasing`: BJT/MOSFET base bias network where divider stiffness (`I_bias >> I_base`) governs thermal stability.
  - `reference`: Precision reference divider where worst-case resistor tolerance (`±1%` E96 / `±5%` E24) governs output drift.
- **Thevenin Impedance (`R_th`)**: Equivalent output impedance looking back into the unloaded divider node (`(R1 * R2) / (R1 + R2)`).
- **Effective Lower Resistance (`R2_eff`)**: Parallel combination of `R2` and load resistor `RL` (`getEffectiveR2`).
- **Load Sag**: Drop in `Vout` (in Volts and percentage) when a finite load `RL` is connected across `R2`.
- **Load Regulation Curve**: Logarithmic sweep of `Vout` across `RL` from heavy loading (`0.05 * R2`) to near open-circuit (`25 * R2`).
- **Commercial E-Series Pair (`StandardResistorPair`)**: A pair of standard `E12`, `E24`, or `E96` resistors scored against target `Vout`, quiescent current, and application-mode impedance rules.

### 3. Passive Filter Context (`types/passive-filter.ts`, `lib/passive-filter-calc.ts`)
- **Passive Filter Topology (`FilterTopology`)**: First-order `rc` (resistor-capacitor) or `rl` (resistor-inductor) network configured as `lowpass` or `highpass`.
- **Cutoff Frequency (`f_c`)**: The `-3.01 dB` half-power corner frequency (`1 / (2πRC)` for RC, `R / (2πL)` for RL) where phase shift reaches `±45°`.
- **Time Constant (`τ`)**: Step-response thermal/reactive time constant (`R * C` for RC, `L / R` for RL).
- **Passive Filter Transfer Function**: Frequency-dependent complex magnitude (`gainLinear`, `gainDb`) and phase (`phaseDeg`) evaluated over a 4-decade logarithmic sweep (`0.01 * f_c` to `100 * f_c`).
- **Bode Plot Projection (`BodePlotProjection`)**: Logarithmic frequency-to-SVG coordinate projection, magnitude/phase grid lines, decade ticks, and SVG path geometry synthesized behind the `buildBodePlotProjection` seam.

### 4. Schematic Core Context (`components/schematic-core/`)
- **Schematic Symbol Standard (`SymbolStandard`)**: Visual resistor rendering convention (`ieee` American zigzag vs `iec` European rectangular box) on an LTR coordinate canvas.

# Reliability

## Integration-Point Audit
| Dependency | Timeout | Circuit breaker | Bulkhead | Retry policy | Status |
|---|---|---|---|---|---|
| None (100% in-browser deterministic calculation engine; zero outbound network/API calls at runtime) | N/A | N/A | N/A | N/A | done |

## Query & Resource Findings
- **Bounded Memoization Caches (Steady-State Memory Protection)**:
  - `PAIR_CACHE` in `lib/voltage-divider-pair-finder.ts` is capped at `MAX_PAIR_CACHE = 64` entries with FIFO eviction.
  - `COLOR_BAND_CACHE` in `lib/resistor-color-code.ts` is capped at `MAX_COLOR_CACHE_SIZE = 64` entries with FIFO eviction.
  - `FORMATTER_CACHE` in `lib/resistor-calc.ts` is bounded by the small integer domain of `maxDecimals` (`0..3`).
- **Table Rendering Pagination**:
  - `DividerStandardPairPicker.tsx` slices rendered rows to `pageSize` (`10` or `20` rows) and caps candidate synthesis at `maxSuggestions = 20`.

## Health Checks & Metrics
- **Build & Static Export Verification**: GitHub Actions workflow builds static bundle via `npm run build` and validates zero TypeScript/lint defects via `npm run check`.
- **Input Sanitization & Division-by-Zero Guards**:
  - All numeric inputs pass through `sanitizeNumericInput` and finite/positive guards (`isNaN`, `isFinite`, short-circuit detection when $R = 0\,\Omega$).

## Deploy vs Release
- **Static Deployment**: Deployed as an immutable static export to GitHub Pages from the `main` branch (`https://github.com/KavehAhangar051/ohmic-resistor-lab`); rollback is an atomic `git revert` on `main`.

import {
  FilterState,
  FilterType,
  FilterCalculationResult,
  BodePoint,
  StandardFilterPair,
  CapacitanceUnit,
  InductanceUnit,
} from '@/types/passive-filter';
import { formatPrecision } from './resistor-calc';
import { E12_BASE_VALUES, E24_BASE_VALUES } from './e-series';
import {
  RESISTOR_UNIT_MAP,
  FormattedMeasurement,
  decomposeOhms,
} from './voltage-divider-format';

export const RESISTANCE_MULTIPLIERS = RESISTOR_UNIT_MAP;

export const CAPACITANCE_MULTIPLIERS = {
  pF: 1e-12,
  nF: 1e-9,
  uF: 1e-6,
} as const;

export const INDUCTANCE_MULTIPLIERS = {
  uH: 1e-6,
  mH: 1e-3,
  H: 1,
} as const;

export const FREQUENCY_MULTIPLIERS = {
  Hz: 1,
  kHz: 1e3,
  MHz: 1e6,
} as const;

const MIN_GAIN_FLOOR = 1e-5;
const BODE_PLOT_STEPS = 70;
const BODE_MIN_DECADE_RATIO = 0.01;
const BODE_MAX_DECADE_RATIO = 100;

interface TransferFunctionPoint {
  gainLinear: number;
  gainDb: number;
  phaseDeg: number;
}

export function formatFrequency(hz: number): FormattedMeasurement {
  if (isNaN(hz) || !isFinite(hz) || hz <= 0) return { value: '0', unit: 'Hz' };

  if (hz >= 1e6) return { value: formatPrecision(hz / 1e6, 2), unit: 'MHz' };

  if (hz >= 1e3) return { value: formatPrecision(hz / 1e3, 2), unit: 'kHz' };

  return { value: formatPrecision(hz, 2), unit: 'Hz' };
}

export function formatTime(seconds: number): FormattedMeasurement {
  if (isNaN(seconds) || !isFinite(seconds) || seconds <= 0) return { value: '0', unit: 's' };

  if (seconds >= 1) return { value: formatPrecision(seconds, 2), unit: 's' };

  if (seconds >= 1e-3) return { value: formatPrecision(seconds * 1e3, 2), unit: 'ms' };

  if (seconds >= 1e-6) return { value: formatPrecision(seconds * 1e6, 2), unit: 'µs' };

  return { value: formatPrecision(seconds * 1e9, 2), unit: 'ns' };
}

function evaluateLowPassResponse(ratio: number): TransferFunctionPoint {
  const denom = Math.sqrt(1 + ratio * ratio);
  const gainLinear = 1 / denom;
  const phaseDeg = -Math.atan(ratio) * (180 / Math.PI);
  const gainDb = 20 * Math.log10(Math.max(gainLinear, MIN_GAIN_FLOOR));

  return { gainLinear, gainDb, phaseDeg };
}

function evaluateHighPassResponse(ratio: number): TransferFunctionPoint {
  const denom = Math.sqrt(1 + ratio * ratio);
  const gainLinear = ratio / denom;
  const phaseDeg = 90 - Math.atan(ratio) * (180 / Math.PI);
  const gainDb = 20 * Math.log10(Math.max(gainLinear, MIN_GAIN_FLOOR));

  return { gainLinear, gainDb, phaseDeg };
}

/**
 * Evaluates first-order passive filter magnitude and phase at normalized frequency ratio (f / fc)
 * without boolean control flags.
 */
function evaluateFilterResponse(
  ratio: number,
  filterType: FilterType
): TransferFunctionPoint {
  return filterType === 'lowpass'
    ? evaluateLowPassResponse(ratio)
    : evaluateHighPassResponse(ratio);
}

/**
 * Calculates cutoff frequency, time constant, and frequency response for RC/RL passive filters.
 */
export function calculatePassiveFilter(state: FilterState): FilterCalculationResult {
  const rOhms = parseFloat(state.resistance) * (RESISTANCE_MULTIPLIERS[state.resistanceUnit] ?? 1);
  const vin = parseFloat(state.vinPeak) || 5;

  const reactiveValue =
    state.topology === 'rc'
      ? parseFloat(state.capacitance) * (CAPACITANCE_MULTIPLIERS[state.capacitanceUnit] ?? 1e-9)
      : parseFloat(state.inductance) * (INDUCTANCE_MULTIPLIERS[state.inductanceUnit] ?? 1e-3);

  const testFreq = parseFloat(state.testFrequency) * (FREQUENCY_MULTIPLIERS[state.testFrequencyUnit] ?? 1e3);

  if (isNaN(rOhms) || rOhms <= 0 || isNaN(reactiveValue) || reactiveValue <= 0) {
    return {
      isValid: false,
      errorMsg: 'برای مقاومت و خازن یا سلف، مقادیر عددی بزرگتر از صفر وارد کنید.',
      cutoffFreqHz: 0,
      displayFc: '—',
      displayFcUnit: 'Hz',
      timeConstantSec: 0,
      displayTau: '—',
      displayTauUnit: 's',
      testFreqHz: testFreq || 1000,
      gainAtTestDb: 0,
      gainAtTestLinear: 0,
      phaseAtTestDeg: 0,
      voutPeak: 0,
      attenuationPct: 0,
      reactanceAtCutoffOhms: 0,
      bodePoints: [],
    };
  }

  const tau = state.topology === 'rc' ? rOhms * reactiveValue : reactiveValue / rOhms;
  const fc = state.topology === 'rc' ? 1 / (2 * Math.PI * tau) : rOhms / (2 * Math.PI * reactiveValue);

  const ratio = testFreq > 0 && fc > 0 ? testFreq / fc : 1;
  const { gainLinear, gainDb, phaseDeg } = evaluateFilterResponse(ratio, state.type);

  const voutPeak = vin * gainLinear;
  const attenuationPct = (1 - gainLinear) * 100;

  const bodePoints: BodePoint[] = [];
  const logMin = Math.log10(fc * BODE_MIN_DECADE_RATIO);
  const logMax = Math.log10(fc * BODE_MAX_DECADE_RATIO);
  const logStep = (logMax - logMin) / (BODE_PLOT_STEPS - 1);

  for (let i = 0; i < BODE_PLOT_STEPS; i++) {
    const f = Math.pow(10, logMin + i * logStep);
    const pt = evaluateFilterResponse(f / fc, state.type);
    bodePoints.push({
      freq: f,
      gainDb: parseFloat(pt.gainDb.toFixed(2)),
      gainLinear: parseFloat(pt.gainLinear.toFixed(4)),
      phaseDeg: parseFloat(pt.phaseDeg.toFixed(1)),
    });
  }

  const fcFmt = formatFrequency(fc);
  const tauFmt = formatTime(tau);

  return {
    isValid: true,
    cutoffFreqHz: fc,
    displayFc: fcFmt.value,
    displayFcUnit: fcFmt.unit,
    timeConstantSec: tau,
    displayTau: tauFmt.value,
    displayTauUnit: tauFmt.unit,
    testFreqHz: testFreq,
    gainAtTestDb: parseFloat(gainDb.toFixed(2)),
    gainAtTestLinear: parseFloat(gainLinear.toFixed(4)),
    phaseAtTestDeg: parseFloat(phaseDeg.toFixed(1)),
    voutPeak: parseFloat(voutPeak.toFixed(2)),
    attenuationPct: parseFloat(attenuationPct.toFixed(1)),
    reactanceAtCutoffOhms: rOhms,
    bodePoints,
  };
}

interface ReactiveCandidate {
  val: number;
  display: string;
  unit: string;
  unitCode: CapacitanceUnit | InductanceUnit;
}

function getReactiveCandidates(topology: 'rc' | 'rl'): ReactiveCandidate[] {
  const candidates: ReactiveCandidate[] = [];

  if (topology === 'rc') {
    for (const dec of [1e-11, 1e-10, 1e-9, 1e-8, 1e-7, 1e-6]) {
      for (const b of E12_BASE_VALUES) {
        const val = b * dec;

        if (val < 1e-11 || val > 1e-5) continue;

        if (val >= 1e-6) {
          candidates.push({ val, display: `${Number((val * 1e6).toFixed(1))}`, unit: 'µF', unitCode: 'uF' });
        } else if (val >= 1e-9) {
          candidates.push({ val, display: `${Number((val * 1e9).toFixed(1))}`, unit: 'nF', unitCode: 'nF' });
        } else {
          candidates.push({ val, display: `${Number((val * 1e12).toFixed(0))}`, unit: 'pF', unitCode: 'pF' });
        }
      }
    }
  } else {
    for (const dec of [1e-6, 1e-5, 1e-4, 1e-3, 1e-2]) {
      for (const b of E12_BASE_VALUES) {
        const val = b * dec;

        if (val >= 1) {
          candidates.push({ val, display: `${Number(val.toFixed(2))}`, unit: 'H', unitCode: 'H' });
        } else if (val >= 1e-3) {
          candidates.push({ val, display: `${Number((val * 1e3).toFixed(1))}`, unit: 'mH', unitCode: 'mH' });
        } else {
          candidates.push({ val, display: `${Number((val * 1e6).toFixed(0))}`, unit: 'µH', unitCode: 'uH' });
        }
      }
    }
  }

  return candidates;
}

/**
 * Finds optimal commercial E24/E12 component pairs closest to a target cutoff frequency.
 */
export function findStandardFilterPairs(
  targetFcHz: number,
  topology: 'rc' | 'rl' = 'rc',
  maxResults = 5
): StandardFilterPair[] {
  if (targetFcHz <= 0) return [];

  const candidateResistors: number[] = [];

  for (const dec of [1e2, 1e3, 1e4, 1e5]) {
    for (const b of E24_BASE_VALUES) candidateResistors.push(Math.round(b * dec));
  }

  const reactiveCandidates = getReactiveCandidates(topology);
  const results: StandardFilterPair[] = [];

  for (const react of reactiveCandidates) {
    for (const r of candidateResistors) {
      const actualFc =
        topology === 'rc'
          ? 1 / (2 * Math.PI * r * react.val)
          : r / (2 * Math.PI * react.val);

      const err = Math.abs((actualFc - targetFcHz) / targetFcHz) * 100;

      if (err <= 8) {
        const rDec = decomposeOhms(r);
        const fcFmt = formatFrequency(actualFc);
        results.push({
          resistorOhms: r,
          resistorValue: rDec.value,
          resistorUnit: rDec.unit,
          resistorDisplay: `${rDec.value} ${rDec.symbol}`,
          reactiveOhmsOrValue: react.val,
          reactiveDisplay: react.display,
          reactiveUnit: react.unit,
          reactiveUnitCode: react.unitCode,
          actualFc,
          displayActualFc: `${fcFmt.value} ${fcFmt.unit}`,
          errorPct: parseFloat(err.toFixed(1)),
        });
      }
    }
  }

  results.sort((a, b) => a.errorPct - b.errorPct);

  return results.slice(0, maxResults);
}



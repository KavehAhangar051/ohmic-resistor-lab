import {
  FilterState,
  FilterType,
  FilterCalculationResult,
  BodePoint,
  BodeViewport,
  BodeDecadeTick,
  BodeHorizontalGridLine,
  BodePlotSamplePoint,
  BodePlotProjection,
  StandardFilterPair,
  ResistanceUnit,
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
 * Evaluates first-order passive filter magnitude and phase at normalized frequency ratio (f / fc).
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
      standardPairs: [],
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
  const standardPairs = findStandardFilterPairs(fc, state.topology, 5);

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
    standardPairs,
  };
}

/**
 * Applies a recommended commercial E24/E12 filter component pair onto FilterState,
 * encapsulating the topology-specific reactive unit invariant (pF/nF/uF vs uH/mH/H).
 */
export function applyStandardFilterPair(
  state: FilterState,
  resistor: string,
  resUnit: ResistanceUnit,
  reactive: string,
  reactiveUnit: CapacitanceUnit | InductanceUnit
): FilterState {
  if (state.topology === 'rc') {
    const capUnit: CapacitanceUnit =
      reactiveUnit === 'pF' || reactiveUnit === 'nF' || reactiveUnit === 'uF'
        ? reactiveUnit
        : 'nF';

    return {
      ...state,
      resistance: resistor,
      resistanceUnit: resUnit,
      capacitance: reactive,
      capacitanceUnit: capUnit,
    };
  }

  const indUnit: InductanceUnit =
    reactiveUnit === 'uH' || reactiveUnit === 'mH' || reactiveUnit === 'H'
      ? reactiveUnit
      : 'mH';

  return {
    ...state,
    resistance: resistor,
    resistanceUnit: resUnit,
    inductance: reactive,
    inductanceUnit: indUnit,
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

const BODE_MIN_DB = -40;
const BODE_MAX_DB = 0;
const BODE_MIN_PHASE = -90;
const BODE_MAX_PHASE = 90;
const BODE_MAGNITUDE_TICKS = [-10, -20, -30, -40] as const;
const BODE_PHASE_TICKS = [-90, -45, 0, 45, 90] as const;

/**
 * Projects a passive filter's frequency response onto SVG viewport coordinates,
 * encapsulating logarithmic decade scaling, dB/phase clamping, and cutoff markers.
 */
export function buildBodePlotProjection(
  result: FilterCalculationResult,
  testFreqHz: number,
  viewport: BodeViewport
): BodePlotProjection {
  const { width, height, padLeft, padRight, padTop, padBottom } = viewport;
  const plotWidth = width - padLeft - padRight;
  const plotHeight = height - padTop - padBottom;
  const { bodePoints, cutoffFreqHz } = result;

  if (!result.isValid || bodePoints.length === 0) {
    return {
      plotWidth,
      plotHeight,
      magPath: '',
      phasePath: '',
      decadeTicks: [],
      magnitudeGrid: [],
      phaseGrid: [],
      fcX: padLeft,
      cutMagY: padTop,
      cutPhaseY: padTop,
      testX: padLeft,
      testMagY: padTop,
      testPhaseY: padTop,
      samples: [],
    };
  }

  const minFreq = bodePoints[0].freq;
  const maxFreq = bodePoints[bodePoints.length - 1].freq;
  const logMin = Math.log10(minFreq);
  const logMax = Math.log10(maxFreq);
  const logSpan = Math.max(1e-9, logMax - logMin);

  const freqToX = (f: number): number => {
    const logF = Math.log10(Math.max(f, minFreq));
    const normalized = (logF - logMin) / logSpan;

    return padLeft + normalized * plotWidth;
  };

  const dbToY = (db: number): number => {
    const clamped = Math.max(BODE_MIN_DB, Math.min(BODE_MAX_DB, db));
    const normalized = (clamped - BODE_MIN_DB) / (BODE_MAX_DB - BODE_MIN_DB);

    return padTop + (1 - normalized) * plotHeight;
  };

  const phaseToY = (ph: number): number => {
    const clamped = Math.max(BODE_MIN_PHASE, Math.min(BODE_MAX_PHASE, ph));
    const normalized = (clamped - BODE_MIN_PHASE) / (BODE_MAX_PHASE - BODE_MIN_PHASE);

    return padTop + (1 - normalized) * plotHeight;
  };

  const samples: BodePlotSamplePoint[] = bodePoints.map((pt) => ({
    ...pt,
    x: freqToX(pt.freq),
    magY: dbToY(pt.gainDb),
    phaseY: phaseToY(pt.phaseDeg),
  }));

  const magPath = samples.reduce(
    (acc, pt, idx) => (idx === 0 ? `M ${pt.x} ${pt.magY}` : `${acc} L ${pt.x} ${pt.magY}`),
    ''
  );

  const phasePath = samples.reduce(
    (acc, pt, idx) => (idx === 0 ? `M ${pt.x} ${pt.phaseY}` : `${acc} L ${pt.x} ${pt.phaseY}`),
    ''
  );

  const decadeTicks: BodeDecadeTick[] = [];
  const startDecade = Math.ceil(logMin);
  const endDecade = Math.floor(logMax);

  for (let d = startDecade; d <= endDecade; d++) {
    const freq = Math.pow(10, d);
    const fmt = formatFrequency(freq);
    decadeTicks.push({
      freq,
      label: `${fmt.value}${fmt.unit}`,
      x: freqToX(freq),
    });
  }

  const magnitudeGrid: BodeHorizontalGridLine[] = BODE_MAGNITUDE_TICKS.map((db) => ({
    value: db,
    label: `${db} dB`,
    y: dbToY(db),
  }));

  const phaseGrid: BodeHorizontalGridLine[] = BODE_PHASE_TICKS.map((ph) => ({
    value: ph,
    label: `${ph > 0 ? `+${ph}` : ph}°`,
    y: phaseToY(ph),
  }));

  const isLowPass = bodePoints[0].gainDb > bodePoints[bodePoints.length - 1].gainDb;

  return {
    plotWidth,
    plotHeight,
    magPath,
    phasePath,
    decadeTicks,
    magnitudeGrid,
    phaseGrid,
    fcX: freqToX(cutoffFreqHz),
    cutMagY: dbToY(-3.01),
    cutPhaseY: phaseToY(isLowPass ? -45 : 45),
    testX: freqToX(testFreqHz),
    testMagY: dbToY(result.gainAtTestDb),
    testPhaseY: phaseToY(result.phaseAtTestDeg),
    samples,
  };
}




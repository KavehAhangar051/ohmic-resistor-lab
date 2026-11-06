import { ResistorUnit } from '@/types/resistor';
import {
  VoltageDividerState,
  VoltageDividerResult,
  DividerPreset,
} from '@/types/voltage-divider';
import { formatPrecision } from './resistor-calc';
import {
  solveR1,
  solveR2,
  solveVin,
  findBestE24Pairs,
  getEffectiveR2,
} from './voltage-divider-solver';
import {
  RESISTOR_UNIT_MAP,
  VOLTAGE_UNIT_MAP,
  toOhms,
  toVolts,
  decomposeOhms,
  formatVoltage,
  formatCurrent,
  formatPower,
  formatResistance,
  getResistorSymbol,
} from './voltage-divider-format';

export {
  RESISTOR_UNIT_MAP,
  VOLTAGE_UNIT_MAP,
  formatCurrent,
  formatPower,
  formatResistance,
};

const EMPTY_DIVIDER_RESULT: VoltageDividerResult = {
  isValid: false,
  vinVolts: null,
  voutVolts: null,
  displayVout: '—',
  displayVoutUnit: 'V',
  ratio: null,
  ratioPercentage: '—',
  dbAttenuation: null,
  currentTotalAmperes: null,
  displayCurrent: '—',
  displayCurrentUnit: 'mA',
  currentLoadAmperes: null,
  displayCurrentLoad: '—',
  powerR1Watts: null,
  displayPowerR1: '—',
  powerR2Watts: null,
  displayPowerR2: '—',
  powerLoadWatts: null,
  displayPowerLoad: '—',
  powerTotalWatts: null,
  displayPowerTotal: '—',
  theveninResistanceOhms: null,
  displayRth: '—',
  displayRthUnit: 'Ω',
  isShortCircuit: false,
  errorMessage: null,
};

/**
 * Calculates voltage divider output, quiescent currents, power dissipation,
 * and Thevenin equivalent resistance across forward and inverse solve modes.
 */
export function calculateVoltageDivider(state: VoltageDividerState): VoltageDividerResult {
  const solveMode = state.solveMode || 'vout';

  let rlOhms: number | null = null;

  if (state.hasLoad) {
    const parsedRl = toOhms(state.rl, state.rlUnit);

    if (!isNaN(parsedRl) && parsedRl >= 0) {
      rlOhms = parsedRl;
    }
  }

  let vinVolts = toVolts(state.vin, state.vinUnit);
  const voutTargetVolts = toVolts(state.vout || '0', state.voutUnit || 'V');
  let r1Ohms = toOhms(state.r1, state.r1Unit);
  let r2Ohms = toOhms(state.r2, state.r2Unit);

  const solvedField: 'vout' | 'r1' | 'r2' | 'vin' | 'pair' = solveMode;
  let solvedValueFormatted: string | undefined;
  let solvedValue: string | undefined;
  let solvedResistorUnit: ResistorUnit | undefined;
  let suggestedPairs: ReturnType<typeof findBestE24Pairs> | undefined;

  if (solveMode === 'r1') {
    if (isNaN(vinVolts) || isNaN(voutTargetVolts) || isNaN(r2Ohms)) {
      return EMPTY_DIVIDER_RESULT;
    }

    const sol = solveR1(vinVolts, voutTargetVolts, r2Ohms, rlOhms);

    if (sol.error || sol.r1Ohms === null) {
      return { ...EMPTY_DIVIDER_RESULT, errorMessage: sol.error || 'محاسبه R1 امکان‌پذیر نیست.' };
    }

    r1Ohms = sol.r1Ohms;
    const r1Dec = decomposeOhms(r1Ohms);
    solvedValue = r1Dec.value;
    solvedResistorUnit = r1Dec.unit;
    solvedValueFormatted = `${r1Dec.value} ${r1Dec.symbol}`;
  } else if (solveMode === 'r2') {
    if (isNaN(vinVolts) || isNaN(voutTargetVolts) || isNaN(r1Ohms)) {
      return EMPTY_DIVIDER_RESULT;
    }

    const sol = solveR2(vinVolts, voutTargetVolts, r1Ohms, rlOhms);

    if (sol.error || sol.r2Ohms === null) {
      return { ...EMPTY_DIVIDER_RESULT, errorMessage: sol.error || 'محاسبه R2 امکان‌پذیر نیست.' };
    }

    r2Ohms = sol.r2Ohms;
    const r2Dec = decomposeOhms(r2Ohms);
    solvedValue = r2Dec.value;
    solvedResistorUnit = r2Dec.unit;
    solvedValueFormatted = `${r2Dec.value} ${r2Dec.symbol}`;
  } else if (solveMode === 'vin') {
    if (isNaN(voutTargetVolts) || isNaN(r1Ohms) || isNaN(r2Ohms)) {
      return EMPTY_DIVIDER_RESULT;
    }

    const sol = solveVin(voutTargetVolts, r1Ohms, r2Ohms, rlOhms);

    if (sol.error || sol.vinVolts === null) {
      return { ...EMPTY_DIVIDER_RESULT, errorMessage: sol.error || 'محاسبه Vin امکان‌پذیر نیست.' };
    }

    vinVolts = sol.vinVolts;
    solvedValue = formatPrecision(vinVolts, 2);
    solvedValueFormatted = `${solvedValue} V`;
  } else if (solveMode === 'pair') {
    if (isNaN(vinVolts) || isNaN(voutTargetVolts) || vinVolts <= 0 || voutTargetVolts <= 0) {
      return EMPTY_DIVIDER_RESULT;
    }

    if (voutTargetVolts >= vinVolts) {
      return {
        ...EMPTY_DIVIDER_RESULT,
        errorMessage: 'در مقسم ولتاژ پسیو، ولتاژ خروجی (Vout) باید کمتر از ولتاژ ورودی (Vin) باشد. مقدار Vout را کاهش دهید.',
      };
    }

    suggestedPairs = findBestE24Pairs(vinVolts, voutTargetVolts, 'overall', 10);

    if (suggestedPairs.length > 0) {
      const best = suggestedPairs[0];
      r1Ohms = best.r1Ohms;
      r2Ohms = best.r2Ohms;
      solvedValueFormatted = `R1: ${best.r1Value} ${getResistorSymbol(best.r1Unit)} | R2: ${best.r2Value} ${getResistorSymbol(best.r2Unit)}`;
    }
  } else if (isNaN(vinVolts) || isNaN(r1Ohms) || isNaN(r2Ohms) || r1Ohms < 0 || r2Ohms < 0) {
    return EMPTY_DIVIDER_RESULT;
  }

  const r2Equivalent = state.hasLoad ? getEffectiveR2(r2Ohms, rlOhms) : r2Ohms;
  const totalOhms = r1Ohms + r2Equivalent;

  // Short circuit check
  if (totalOhms === 0) {
    return {
      ...EMPTY_DIVIDER_RESULT,
      isValid: true,
      vinVolts,
      voutVolts: 0,
      displayVout: '0.00',
      displayVoutUnit: 'V',
      isShortCircuit: true,
      errorMessage: 'اتصال کوتاه: مجموع مقاومت‌های مدار صفر است. حداقل مقدار یکی از مقاومت‌ها را بزرگتر از صفر تعیین کنید.',
    };
  }

  // Vout calculation
  const voutVolts = totalOhms > 0 ? vinVolts * (r2Equivalent / totalOhms) : 0;
  const ratio = totalOhms > 0 ? r2Equivalent / totalOhms : 0;
  const ratioPct = `${formatPrecision(ratio * 100, 2)}%`;

  let dbAttenuation: string | null = null;

  if (vinVolts > 0 && voutVolts > 0) {
    const db = 20 * Math.log10(voutVolts / vinVolts);
    dbAttenuation = `${formatPrecision(db, 2)} dB`;
  } else if (voutVolts === 0) {
    dbAttenuation = '-∞ dB';
  }

  // Currents
  const currentTotalAmperes = totalOhms > 0 ? vinVolts / totalOhms : 0;
  const currentFormatted = formatCurrent(currentTotalAmperes);

  let currentLoadAmperes: number | null = null;
  let displayCurrentLoad = '—';

  if (state.hasLoad && rlOhms !== null && rlOhms > 0) {
    currentLoadAmperes = voutVolts / rlOhms;
    const cLoadFmt = formatCurrent(currentLoadAmperes);
    displayCurrentLoad = `${cLoadFmt.value} ${cLoadFmt.unit}`;
  }

  // Power on each component
  const vr1 = vinVolts - voutVolts;
  const powerR1Watts = r1Ohms > 0 ? (vr1 * vr1) / r1Ohms : 0;
  const powerR2Watts = r2Ohms > 0 ? (voutVolts * voutVolts) / r2Ohms : 0;
  let powerLoadWatts: number | null = null;

  if (state.hasLoad && rlOhms !== null) {
    powerLoadWatts = rlOhms > 0 ? (voutVolts * voutVolts) / rlOhms : 0;
  }

  const powerTotalWatts = powerR1Watts + powerR2Watts + (powerLoadWatts ?? 0);

  // Thevenin equivalent resistance: Rth = R1 || R2
  const rthOhms = r1Ohms + r2Ohms > 0 ? (r1Ohms * r2Ohms) / (r1Ohms + r2Ohms) : 0;
  const rthFormatted = formatResistance(rthOhms);
  const voutFormatted = formatVoltage(voutVolts);
  const displayVout = voutFormatted.value;
  const displayVoutUnit = voutFormatted.unit;

  // Load sag and unloaded Vout calculations
  const sumUnloaded = r1Ohms + r2Ohms;
  const voutNoLoad = sumUnloaded > 0 ? vinVolts * (r2Ohms / sumUnloaded) : 0;
  const loadSag = state.hasLoad && rlOhms !== null ? Math.max(0, voutNoLoad - voutVolts) : 0;

  const loadSagPct = state.hasLoad && rlOhms !== null && voutNoLoad > 0
    ? `${formatPrecision((loadSag / voutNoLoad) * 100, 1)}%`
    : '۰٪';

  const r2EffectiveFmt = formatResistance(r2Equivalent);

  const targetErrorPct =
    !isNaN(voutTargetVolts) && voutTargetVolts > 0
      ? Math.abs((voutVolts - voutTargetVolts) / voutTargetVolts) * 100
      : 0;

  const maxShortCircuitCurrentAmperes = r1Ohms > 0 && vinVolts > 0 ? vinVolts / r1Ohms : 0;
  const maxIscFmt = formatCurrent(maxShortCircuitCurrentAmperes);

  const safeOutputCurrent5PctAmperes =
    rthOhms > 0 && voutVolts > 0 ? (0.05 * voutVolts) / rthOhms : 0;

  const safeI5Fmt = formatCurrent(safeOutputCurrent5PctAmperes);

  const adcImpedanceStatus: 'direct' | 'buffered' | 'high_impedance' =
    rthOhms <= 10e3 ? 'direct' : rthOhms <= 50e3 ? 'buffered' : 'high_impedance';

  const adcImpedanceBadgeLabel =
    rthOhms <= 10e3 ? 'مستقیم (ADC OK)' : rthOhms <= 50e3 ? 'سرعت پایین' : 'نیاز به بافر';

  return {
    isValid: true,
    vinVolts,
    voutVolts,
    displayVout,
    displayVoutUnit,
    ratio,
    ratioPercentage: ratioPct,
    dbAttenuation,
    currentTotalAmperes,
    displayCurrent: currentFormatted.value,
    displayCurrentUnit: currentFormatted.unit,
    currentLoadAmperes,
    displayCurrentLoad,
    powerR1Watts,
    displayPowerR1: formatPower(powerR1Watts),
    powerR2Watts,
    displayPowerR2: formatPower(powerR2Watts),
    powerLoadWatts,
    displayPowerLoad: powerLoadWatts !== null ? formatPower(powerLoadWatts) : '—',
    powerTotalWatts,
    displayPowerTotal: formatPower(powerTotalWatts),
    theveninResistanceOhms: rthOhms,
    displayRth: rthFormatted.value,
    displayRthUnit: rthFormatted.unit,
    isShortCircuit: false,
    errorMessage: null,
    solvedField,
    solvedValueFormatted,
    solvedValue,
    solvedResistorUnit,
    suggestedPairs,
    voutNoLoadVolts: state.hasLoad ? voutNoLoad : null,
    displayVoutNoLoad: formatPrecision(voutNoLoad, 2),
    loadSagVolts: state.hasLoad ? loadSag : null,
    displayLoadSag: formatPrecision(loadSag, 2),
    loadSagPercentage: loadSagPct,
    r2EffectiveOhms: state.hasLoad ? r2Equivalent : null,
    displayR2Effective: `${r2EffectiveFmt.value} ${r2EffectiveFmt.unit}`,
    targetErrorPct,
    maxShortCircuitCurrentAmperes,
    displayMaxIscValue: maxIscFmt.value,
    displayMaxIscUnit: maxIscFmt.unit,
    safeOutputCurrent5PctAmperes,
    displaySafeI5Value: safeI5Fmt.value,
    displaySafeI5Unit: safeI5Fmt.unit,
    adcImpedanceStatus,
    adcImpedanceBadgeLabel,
  };
}

/**
 * Common engineering presets for voltage dividers
 */
export const DIVIDER_PRESETS: DividerPreset[] = [
  {
    id: 'logic-5v-to-3v3',
    title: '5V → 3.3V',
    description: 'تطبیق سطح منطقی آردوینو به ESP32/Raspberry Pi',
    vin: '5',
    vinUnit: 'V',
    r1: '1.7',
    r1Unit: 'kOhm',
    r2: '3.3',
    r2Unit: 'kOhm',
  },
  {
    id: 'sensor-12v-to-5v',
    title: '12V → 5V',
    description: 'کاهش ولتاژ سنسور خودرویی یا صنعتی به ADC میکروکنترلر',
    vin: '12',
    vinUnit: 'V',
    r1: '14',
    r1Unit: 'kOhm',
    r2: '10',
    r2Unit: 'kOhm',
  },
  {
    id: 'half-bridge',
    title: 'تقسیم نصف (1:2)',
    description: 'پل مقاومتی متقارن ۵۰٪ جهت ایجاد ولتاژ مرجع مجازی',
    vin: '10',
    vinUnit: 'V',
    r1: '10',
    r1Unit: 'kOhm',
    r2: '10',
    r2Unit: 'kOhm',
  },
  {
    id: 'attenuator-10-to-1',
    title: 'تضعیف‌کننده 10:1',
    description: 'پروب اسیلوسکوپ و اندازه‌گیری با مقاومت ورودی ۱ مگااهم',
    vin: '10',
    vinUnit: 'V',
    r1: '9',
    r1Unit: 'MOhm',
    r2: '1',
    r2Unit: 'MOhm',
  },
];

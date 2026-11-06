import {
  ResistorItem,
  ParallelCalculationResult,
  ParallelBranchStat,
  ResistorUnit,
} from '@/types/resistor';

const UNIT_MAP: Record<ResistorUnit, number> = {
  Ohm: 1,
  kOhm: 1e3,
  MOhm: 1e6,
};

// V8 Performance: Cache Intl.NumberFormat instances to prevent repetitive C++/JS bridge allocations
const FORMATTER_CACHE = new Map<number, Intl.NumberFormat>();

function getNumberFormatter(maxDecimals: number): Intl.NumberFormat {
  let fmt = FORMATTER_CACHE.get(maxDecimals);

  if (!fmt) {
    fmt = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: maxDecimals,
      useGrouping: true,
    });
    FORMATTER_CACHE.set(maxDecimals, fmt);
  }

  return fmt;
}

/**
 * Format a number to a clean engineering or decimal string without scientific notation artifacts.
 * Optimized for V8 fast path with integer bypass and cached Intl formatters.
 */
export function formatPrecision(num: number, maxDecimals: number = 2): string {
  if (isNaN(num) || !isFinite(num)) return '0';

  if (num === 0) return '0';

  if (Number.isInteger(num)) return num.toString();
  const effectiveDecimals = Math.min(maxDecimals, 2);

  return getNumberFormatter(effectiveDecimals).format(num);
}

/**
 * Calculates the equivalent parallel resistance of a set of resistor items.
 */
export function calculateParallelResistance(
  items: ResistorItem[]
): ParallelCalculationResult {
  let totalConductance = 0;
  let totalCount = 0;
  let validGroupCount = 0;
  let hasShortCircuit = false;

  for (const item of items) {
    const rawVal = item.value;

    if (rawVal.length === 0) continue;

    const numVal = parseFloat(rawVal);

    if (isNaN(numVal) || numVal < 0) continue;

    const count = item.count > 1 ? (item.count | 0) : 1;
    totalCount += count;
    validGroupCount++;

    const multiplier = UNIT_MAP[item.unit] ?? 1;
    const resistanceOhms = numVal * multiplier;

    if (resistanceOhms === 0) {
      hasShortCircuit = true;
      break;
    }

    const itemConductance = (1 / resistanceOhms) * count;
    totalConductance += itemConductance;
  }

  if (validGroupCount === 0) {
    return {
      isValid: false,
      totalResistanceOhms: null,
      displayValue: '—',
      displayUnit: 'Ω',
      exactOhmsString: '—',
      conductanceSiemens: null,
      totalResistorsCount: 0,
      uniqueValuesCount: 0,
      isShortCircuit: false,
      errorMessage: null,
    };
  }

  if (hasShortCircuit) {
    return {
      isValid: true,
      totalResistanceOhms: 0,
      displayValue: '0',
      displayUnit: 'Ω',
      exactOhmsString: '0.0000 Ω',
      conductanceSiemens: Infinity,
      totalResistorsCount: totalCount,
      uniqueValuesCount: validGroupCount,
      isShortCircuit: true,
      errorMessage: 'اتصال کوتاه: حداقل یکی از مقاومت‌های مدار ۰ اهم است. برای محاسبه مقاومت معادل، مقدار آن را بزرگتر از صفر وارد کنید.',
    };
  }

  if (totalConductance <= 0) {
    return {
      isValid: false,
      totalResistanceOhms: null,
      displayValue: '—',
      displayUnit: 'Ω',
      exactOhmsString: '—',
      conductanceSiemens: 0,
      totalResistorsCount: totalCount,
      uniqueValuesCount: validGroupCount,
      isShortCircuit: false,
      errorMessage: 'مقادیر ورودی نامعتبر است. برای هر شاخه یک مقدار عددی مثبت وارد کنید.',
    };
  }

  const reqOhms = 1 / totalConductance;

  // Auto-scale display unit
  let displayValue = '';
  let displayUnit = 'Ω';

  if (reqOhms >= 1e6) {
    const mVal = reqOhms / 1e6;
    displayValue = formatPrecision(mVal, 2);
    displayUnit = 'MΩ';
  } else if (reqOhms >= 1e3) {
    const kVal = reqOhms / 1e3;
    displayValue = formatPrecision(kVal, 2);
    displayUnit = 'kΩ';
  } else {
    displayValue = formatPrecision(reqOhms, 2);
    displayUnit = 'Ω';
  }

  const exactOhmsString = `${formatPrecision(reqOhms, 2)} Ω`;

  return {
    isValid: true,
    totalResistanceOhms: reqOhms,
    displayValue,
    displayUnit,
    exactOhmsString,
    conductanceSiemens: totalConductance,
    totalResistorsCount: totalCount,
    uniqueValuesCount: validGroupCount,
    isShortCircuit: false,
    errorMessage: null,
  };
}

export { getResistorColorBands } from './resistor-color-code';

export type { ResistorColorBand } from './resistor-color-code';

/**
 * Calculates individual branch equivalent resistance when count > 1
 */
export function getBranchResistance(item: ResistorItem): {
  displayValue: string;
  displayUnit: string;
  rawOhms: number;
} | null {
  const raw = item.value;

  if (raw.length === 0) return null;
  const num = parseFloat(raw);

  if (isNaN(num) || num < 0) return null;

  const count = item.count > 1 ? (item.count | 0) : 1;
  const multiplier = UNIT_MAP[item.unit] ?? 1;
  const branchOhms = (num * multiplier) / count;

  if (branchOhms === 0) {
    return { rawOhms: 0, displayValue: '0', displayUnit: 'Ω' };
  }

  let displayValue = '';
  let displayUnit = 'Ω';

  if (branchOhms >= 1e6) {
    displayValue = formatPrecision(branchOhms / 1e6, 3);
    displayUnit = 'MΩ';
  } else if (branchOhms >= 1e3) {
    displayValue = formatPrecision(branchOhms / 1e3, 3);
    displayUnit = 'kΩ';
  } else if (branchOhms >= 1) {
    displayValue = formatPrecision(branchOhms, 3);
    displayUnit = 'Ω';
  } else {
    displayValue = formatPrecision(branchOhms * 1e3, 3);
    displayUnit = 'mΩ';
  }

  return { displayValue, displayUnit, rawOhms: branchOhms };
}

/**
 * Calculates per-branch equivalent resistance, current share percentage (Gi / Gtotal),
 * and visual flow velocity/opacity parameters for parallel resistor networks.
 * Keeps circuit physics and conductance ratios inside the domain layer.
 */
export function calculateParallelBranchStats(
  items: ResistorItem[],
  totalConductanceSiemens: number | null
): ParallelBranchStat[] {
  const hasValidG = totalConductanceSiemens !== null && totalConductanceSiemens > 0;

  return items.map((item) => {
    const rawVal = item.value;

    if (rawVal.length === 0) {
      return {
        hasValue: false,
        ohms: null,
        currentShare: null,
        isShort: false,
        animDuration: 1.4,
        flowOpacity: 0.5,
        flowStrokeWidth: 2,
      };
    }

    const num = parseFloat(rawVal);

    if (isNaN(num) || num < 0) {
      return {
        hasValue: false,
        ohms: null,
        currentShare: null,
        isShort: false,
        animDuration: 1.4,
        flowOpacity: 0.5,
        flowStrokeWidth: 2,
      };
    }

    const multiplier = UNIT_MAP[item.unit] ?? 1;
    const ohms = num * multiplier;

    if (ohms === 0) {
      return {
        hasValue: true,
        ohms: 0,
        currentShare: '100%',
        isShort: true,
        animDuration: 0.35,
        flowOpacity: 1,
        flowStrokeWidth: 3,
      };
    }

    if (hasValidG) {
      const branchConductance = 1 / ohms;
      const share = (branchConductance / totalConductanceSiemens) * 100;
      const shareRatio = Math.max(0.005, Math.min(1, share / 100));
      const animDuration = Math.max(0.42, Math.min(3.2, 0.45 / Math.pow(shareRatio, 0.45)));
      const flowOpacity = Math.max(0.35, Math.min(0.95, 0.3 + 0.65 * Math.sqrt(shareRatio)));
      const flowStrokeWidth = shareRatio > 0.35 ? 2.5 : shareRatio > 0.1 ? 2.0 : 1.5;

      return {
        hasValue: true,
        ohms,
        currentShare: share < 0.1 ? '<0.1%' : `${share.toFixed(1)}%`,
        isShort: false,
        animDuration,
        flowOpacity,
        flowStrokeWidth,
      };
    }

    return {
      hasValue: true,
      ohms,
      currentShare: null,
      isShort: false,
      animDuration: 1.4,
      flowOpacity: 0.5,
      flowStrokeWidth: 2,
    };
  });
}


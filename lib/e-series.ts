/**
 * EIA Standard Component Series (E12, E24, E96) and Commercial Decade Tables.
 * Single source of truth for commercial component values across dividers and filters.
 */

import { ResistorUnit } from '@/types/resistor';
import { decomposeOhms } from './voltage-divider-format';

export const E12_BASE_VALUES = [
  1.0, 1.2, 1.5, 1.8, 2.2, 2.7, 3.3, 3.9, 4.7, 5.6, 6.8, 8.2,
];

export const E24_BASE_VALUES = [
  1.0, 1.1, 1.2, 1.3, 1.5, 1.6, 1.8, 2.0, 2.2, 2.4, 2.7, 3.0,
  3.3, 3.6, 3.9, 4.3, 4.7, 5.1, 5.6, 6.2, 6.8, 7.5, 8.2, 9.1,
];

export const E96_BASE_VALUES = [
  1.00, 1.02, 1.05, 1.07, 1.10, 1.13, 1.15, 1.18, 1.21, 1.24, 1.27, 1.30,
  1.33, 1.37, 1.40, 1.43, 1.47, 1.50, 1.54, 1.58, 1.62, 1.65, 1.69, 1.74,
  1.78, 1.82, 1.87, 1.91, 1.96, 2.00, 2.05, 2.10, 2.15, 2.21, 2.26, 2.32,
  2.37, 2.43, 2.49, 2.55, 2.61, 2.67, 2.74, 2.80, 2.87, 2.94, 3.01, 3.09,
  3.16, 3.24, 3.32, 3.40, 3.48, 3.57, 3.65, 3.74, 3.83, 3.92, 4.02, 4.12,
  4.22, 4.32, 4.42, 4.53, 4.64, 4.75, 4.87, 4.99, 5.11, 5.23, 5.36, 5.49,
  5.62, 5.76, 5.90, 6.04, 6.19, 6.34, 6.49, 6.65, 6.81, 6.98, 7.15, 7.32,
  7.50, 7.68, 7.87, 8.06, 8.25, 8.45, 8.66, 8.87, 9.09, 9.31, 9.53, 9.76,
];

const COMMERCIAL_DECADES = [100, 1e3, 10e3, 100e3, 1e6] as const;

/**
 * Commercial E24 resistor values from 100 Ω to 9.1 MΩ.
 */
export const COMMON_E24_OHMS: readonly number[] = (() => {
  const values: number[] = [];

  for (const dec of COMMERCIAL_DECADES) {
    for (const base of E24_BASE_VALUES) {
      values.push(Math.round(base * dec));
    }
  }

  return values;
})();

/**
 * Precision commercial E96 resistor values from 100 Ω to 9.76 MΩ.
 */
export const COMMON_E96_OHMS: readonly number[] = (() => {
  const values: number[] = [];

  for (const dec of COMMERCIAL_DECADES) {
    for (const base of E96_BASE_VALUES) {
      values.push(Math.round(base * dec * 10) / 10);
    }
  }

  return values;
})();

/**
 * Pre-computed decomposition lookup table for commercial E24 and E96 values.
 */
export const OHMS_DECOMPOSED_MAP = new Map<number, { value: string; unit: ResistorUnit }>();

for (let i = 0; i < COMMON_E24_OHMS.length; i++) {
  const ohms = COMMON_E24_OHMS[i];
  const { value, unit } = decomposeOhms(ohms);
  OHMS_DECOMPOSED_MAP.set(ohms, { value, unit });
}

for (let i = 0; i < COMMON_E96_OHMS.length; i++) {
  const ohms = COMMON_E96_OHMS[i];

  if (!OHMS_DECOMPOSED_MAP.has(ohms)) {
    const { value, unit } = decomposeOhms(ohms);
    OHMS_DECOMPOSED_MAP.set(ohms, { value, unit });
  }
}

export interface StandardResistorValue {
  ohms: number;
  displayValue: string;
  unit: ResistorUnit;
}

export function generateDecades(baseValues: number[], minExp = 1, maxExp = 6): StandardResistorValue[] {
  const result: StandardResistorValue[] = [];

  for (let exp = minExp; exp <= maxExp; exp++) {
    const multiplier = Math.pow(10, exp);

    for (const base of baseValues) {
      const ohms = Math.round(base * multiplier * 10) / 10;
      const { value: displayValue, unit } = decomposeOhms(ohms);
      result.push({ ohms, displayValue, unit });
    }
  }

  return result;
}


export interface DividerPairRecommendation {
  r1: StandardResistorValue;
  r2: StandardResistorValue;
  actualVout: number;
  errorPercentage: number;
  currentAmps: number;
  powerR1Watts: number;
  powerR2Watts: number;
}

/**
 * Searches the selected E-series for the optimal (R1, R2) pair yielding target Vout.
 */
export function findBestDividerPairs(
  vin: number,
  targetVout: number,
  series: 'E12' | 'E24' = 'E24',
  maxResults = 5
): DividerPairRecommendation[] {
  if (vin <= 0 || targetVout <= 0 || targetVout >= vin) return [];

  const bases = series === 'E12' ? E12_BASE_VALUES : E24_BASE_VALUES;
  // Generate practical range from 100 Ohm to 1 MOhm (exponents 2 to 6)
  const resistors = generateDecades(bases, 2, 5);

  const candidates: DividerPairRecommendation[] = [];

  for (let i = 0; i < resistors.length; i++) {
    const r1 = resistors[i];

    for (let j = 0; j < resistors.length; j++) {
      const r2 = resistors[j];
      const sum = r1.ohms + r2.ohms;
      const actualVout = vin * (r2.ohms / sum);
      const error = Math.abs(actualVout - targetVout);
      const errorPercentage = (error / targetVout) * 100;

      // Filter to reasonably low-error pairs (<= 5% error)
      if (errorPercentage <= 5) {
        const current = vin / sum;
        const curSq = current * current;

        candidates.push({
          r1,
          r2,
          actualVout,
          errorPercentage,
          currentAmps: current,
          powerR1Watts: curSq * r1.ohms,
          powerR2Watts: curSq * r2.ohms,
        });
      }
    }
  }

  // Sort by lowest error, then by moderate current consumption (~0.1mA to 5mA)
  candidates.sort((a, b) => {
    if (Math.abs(a.errorPercentage - b.errorPercentage) > 0.05) {
      return a.errorPercentage - b.errorPercentage;
    }

    // Prefer typical low-power current (~1mA = 0.001A)
    const diffA = Math.abs(a.currentAmps - 0.001);
    const diffB = Math.abs(b.currentAmps - 0.001);

    return diffA - diffB;
  });

  return candidates.slice(0, maxResults);
}

export interface PowerRatingAdvice {
  recommendedPackage: string;
  level: 'safe' | 'caution' | 'warning' | 'critical';
  titleFa: string;
  descriptionFa: string;
}

/**
 * Assesses power dissipation and recommends commercial resistor package ratings.
 */
export function evaluatePowerRating(powerWatts: number): PowerRatingAdvice {
  if (powerWatts <= 0.1) {
    return {
      recommendedPackage: '1/8W (0805 SMD)',
      level: 'safe',
      titleFa: 'توان ایمن و ناچیز',
      descriptionFa: 'تلفات حرارتی بسیار پایین است. تمام پکیج‌های استاندارد SMD و سوراخ‌کامل (THT) به راحتی پاسخگو هستند.',
    };
  }

  if (powerWatts <= 0.22) {
    return {
      recommendedPackage: '1/4W (استاندارد DIP)',
      level: 'safe',
      titleFa: 'توان مناسب مقاومت معمولی',
      descriptionFa: 'مقاومت‌های مرسوم کربنی یا فلزی ۱/۴ وات برای این نقطه کاری ایده‌آل هستند.',
    };
  }

  if (powerWatts <= 0.45) {
    return {
      recommendedPackage: '1/2W (نیم وات)',
      level: 'caution',
      titleFa: 'نیازمند مقاومت نیم‌وات',
      descriptionFa: 'توان تلفاتی نزدیک به آستانه مقاومت‌های ۱/۴ وات است. استفاده از مقاومت ۱/۲ وات برای اطمینان توصیه می‌شود.',
    };
  }

  if (powerWatts <= 0.9) {
    return {
      recommendedPackage: '1W (یک وات)',
      level: 'warning',
      titleFa: 'حرارت قابل‌توجه (۱ وات)',
      descriptionFa: 'تلفات بالا منجر به گرم‌شدن مقاومت می‌شود. مقاومت ۱ وات متال‌اکسید با تهویه مناسب نصب کنید.',
    };
  }

  return {
    recommendedPackage: '2W یا مقاومت سرامیکی/آجری',
    level: 'critical',
    titleFa: 'هشدار تلفات حرارتی شدید!',
    descriptionFa: 'توان تلفاتی بسیار بالاست! مقاومت معمولی دچار سوختگی می‌شود. حتماً از مقاومت آجری یا توان بالا با هیت‌سینک استفاده کنید.',
  };
}

export { findBestE24Pairs } from './voltage-divider-pair-finder';

export {
  E24_BASE_VALUES,
  E96_BASE_VALUES,
  COMMON_E24_OHMS,
  COMMON_E96_OHMS,
  OHMS_DECOMPOSED_MAP,
} from './e-series';

export { decomposeOhms } from './voltage-divider-format';

export interface SolveR1Result {
  r1Ohms: number | null;
  error?: string;
}

export interface SolveR2Result {
  r2Ohms: number | null;
  error?: string;
}

export interface SolveVinResult {
  vinVolts: number | null;
  error?: string;
}

/**
 * Computes effective parallel resistance of R2 with an optional load resistor RL.
 * Encapsulates the invariant R2_eff = R2 || RL when loaded, or R2 when unloaded.
 */
export function getEffectiveR2(r2Ohms: number, rlOhms?: number | null): number {
  if (rlOhms !== null && rlOhms !== undefined && rlOhms >= 0) {
    if (rlOhms === 0 || r2Ohms === 0) return 0;

    return (r2Ohms * rlOhms) / (r2Ohms + rlOhms);
  }

  return r2Ohms;
}

/**
 * Solves for R1 when Vin, Vout, R2 (and optional RL) are known.
 * Invariant: Vout = Vin * (R2_eff / (R1 + R2_eff)) => R1 = R2_eff * (Vin / Vout - 1).
 */
export function solveR1(
  vinVolts: number,
  voutVolts: number,
  r2Ohms: number,
  rlOhms?: number | null
): SolveR1Result {
  if (voutVolts <= 0) {
    return { r1Ohms: null, error: 'ولتاژ خروجی (Vout) باید بزرگتر از صفر باشد.' };
  }

  if (voutVolts >= vinVolts) {
    return {
      r1Ohms: null,
      error: 'در مقسم ولتاژ پسیو، ولتاژ خروجی (Vout) باید کمتر از ولتاژ ورودی (Vin) باشد. مقدار Vout را کاهش دهید.',
    };
  }

  const r2Effective = getEffectiveR2(r2Ohms, rlOhms);

  if (r2Effective <= 0) {
    return { r1Ohms: null, error: 'مقاومت معادل R2 باید بزرگتر از صفر باشد. مقداری مثبت برای R2 یا بار وارد کنید.' };
  }

  const r1Ohms = r2Effective * (vinVolts / voutVolts - 1);

  return { r1Ohms };
}

/**
 * Solves for R2 when Vin, Vout, R1 (and optional RL) are known.
 * Accounts for loading sag by deconvolving RL from the required R2_eff.
 */
export function solveR2(
  vinVolts: number,
  voutVolts: number,
  r1Ohms: number,
  rlOhms?: number | null
): SolveR2Result {
  if (voutVolts <= 0) {
    return { r2Ohms: null, error: 'ولتاژ خروجی (Vout) باید بزرگتر از صفر باشد.' };
  }

  if (voutVolts >= vinVolts) {
    return {
      r2Ohms: null,
      error: 'در مقسم ولتاژ پسیو، ولتاژ خروجی (Vout) باید کمتر از ولتاژ ورودی (Vin) باشد. مقدار Vout را کاهش دهید.',
    };
  }

  if (r1Ohms <= 0) {
    return { r2Ohms: null, error: 'مقاومت R1 باید بزرگتر از صفر باشد.' };
  }

  const r2Effective = (voutVolts * r1Ohms) / (vinVolts - voutVolts);

  if (!rlOhms || rlOhms <= 0) {
    return { r2Ohms: r2Effective };
  }

  if (rlOhms <= r2Effective) {
    return {
      r2Ohms: null,
      error: 'مقاومت بار (RL) کمتر از حد مجاز است و افت ولتاژ شدید ایجاد می‌کند. مقدار RL را افزایش دهید یا Vout کمتری تنظیم کنید.',
    };
  }

  const r2Ohms = (r2Effective * rlOhms) / (rlOhms - r2Effective);

  return { r2Ohms };
}

/**
 * Solves for Vin when Vout, R1, R2 (and optional RL) are known.
 */
export function solveVin(
  voutVolts: number,
  r1Ohms: number,
  r2Ohms: number,
  rlOhms?: number | null
): SolveVinResult {
  if (voutVolts <= 0) {
    return { vinVolts: null, error: 'ولتاژ خروجی (Vout) باید بزرگتر از صفر باشد.' };
  }

  const r2Effective = getEffectiveR2(r2Ohms, rlOhms);

  if (r2Effective <= 0) {
    return { vinVolts: null, error: 'مقاومت R2 یا معادل آن باید مثبت باشد.' };
  }

  const vinVolts = voutVolts * ((r1Ohms + r2Effective) / r2Effective);

  return { vinVolts };
}



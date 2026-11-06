import { ResistorUnit } from '@/types/resistor';
import { VoltageUnit } from '@/types/voltage-divider';
import { formatPrecision } from './resistor-calc';

/**
 * Canonical multiplier table converting ResistorUnit to base Ohms (Ω).
 * Centralizes unit scaling so callers never hardcode decade ternary chains.
 */
export const RESISTOR_UNIT_MAP: Record<ResistorUnit, number> = {
  Ohm: 1,
  kOhm: 1e3,
  MOhm: 1e6,
};

/**
 * Canonical display symbol table for ResistorUnit.
 */
export const RESISTOR_SYMBOL_MAP: Record<ResistorUnit, string> = {
  Ohm: 'Ω',
  kOhm: 'kΩ',
  MOhm: 'MΩ',
};

/**
 * Canonical multiplier table converting VoltageUnit to base Volts (V).
 */
export const VOLTAGE_UNIT_MAP: Record<VoltageUnit, number> = {
  mV: 1e-3,
  V: 1,
  kV: 1e3,
};

/**
 * Returns the standard engineering display symbol (Ω, kΩ, MΩ) for a ResistorUnit.
 */
export function getResistorSymbol(unit: ResistorUnit = 'Ohm'): string {
  return RESISTOR_SYMBOL_MAP[unit] ?? 'Ω';
}

/**
 * Maps a display symbol (Ω, kΩ, MΩ) back to its canonical ResistorUnit identifier.
 */
export function symbolToResistorUnit(symbol: string): ResistorUnit {
  if (symbol === 'kΩ' || symbol === 'kOhm') return 'kOhm';

  if (symbol === 'MΩ' || symbol === 'MOhm') return 'MOhm';

  return 'Ohm';
}

export interface DecomposedResistance {
  value: string;
  unit: ResistorUnit;
  symbol: string;
}

export interface FormattedVoltage {
  value: string;
  unit: VoltageUnit;
}

export interface FormattedMeasurement {
  value: string;
  unit: string;
}

/**
 * Converts a raw numeric input and ResistorUnit into base Ohms (Ω).
 * Returns NaN if the input string does not represent a finite number.
 */
export function toOhms(value: string | number, unit: ResistorUnit = 'Ohm'): number {
  const num = parseFloat(String(value));

  if (isNaN(num) || !isFinite(num)) return NaN;

  return num * (RESISTOR_UNIT_MAP[unit] ?? 1);
}

/**
 * Converts a raw numeric input and VoltageUnit into base Volts (V).
 * Returns NaN if the input string does not represent a finite number.
 */
export function toVolts(value: string | number, unit: VoltageUnit = 'V'): number {
  const num = parseFloat(String(value));

  if (isNaN(num) || !isFinite(num)) return NaN;

  return num * (VOLTAGE_UNIT_MAP[unit] ?? 1);
}

/**
 * Decomposes an absolute resistance in Ohms into its auto-scaled value, ResistorUnit, and symbol.
 */
export function decomposeOhms(ohms: number): DecomposedResistance {
  if (!isFinite(ohms) || isNaN(ohms) || ohms <= 0) {
    return { value: '0', unit: 'Ohm', symbol: 'Ω' };
  }

  if (ohms >= 1e6) {
    return { value: formatPrecision(ohms / 1e6, 2), unit: 'MOhm', symbol: 'MΩ' };
  }

  if (ohms >= 1e3) {
    return { value: formatPrecision(ohms / 1e3, 2), unit: 'kOhm', symbol: 'kΩ' };
  }

  return { value: formatPrecision(ohms, 2), unit: 'Ohm', symbol: 'Ω' };
}

/**
 * Formats electrical voltage to a readable engineering scale (kV, V, mV).
 */
export function formatVoltage(volts: number): FormattedVoltage {
  if (isNaN(volts) || !isFinite(volts) || volts === 0) {
    return { value: '0', unit: 'V' };
  }

  const abs = Math.abs(volts);

  if (abs >= 1e3) {
    return { value: formatPrecision(volts / 1e3, 2), unit: 'kV' };
  }

  if (abs < 0.1) {
    return { value: formatPrecision(volts * 1e3, 2), unit: 'mV' };
  }

  return { value: formatPrecision(volts, 2), unit: 'V' };
}

/**
 * Format electrical current to readable metric engineering unit (A, mA, µA)
 */
export function formatCurrent(amperes: number): FormattedMeasurement {
  if (isNaN(amperes) || !isFinite(amperes) || amperes === 0) {
    return { value: '0', unit: 'mA' };
  }

  const abs = Math.abs(amperes);

  if (abs >= 1) {
    return { value: formatPrecision(amperes, 2), unit: 'A' };
  }

  if (abs >= 1e-3) {
    return { value: formatPrecision(amperes * 1e3, 2), unit: 'mA' };
  }

  return { value: formatPrecision(amperes * 1e6, 2), unit: 'µA' };
}

/**
 * Format electrical power to readable metric engineering unit (W, mW, µW)
 */
export function formatPower(watts: number): string {
  if (isNaN(watts) || !isFinite(watts) || watts === 0) {
    return '0 mW';
  }

  const abs = Math.abs(watts);

  if (abs >= 1) {
    return `${formatPrecision(watts, 2)} W`;
  }

  if (abs >= 1e-3) {
    return `${formatPrecision(watts * 1e3, 2)} mW`;
  }

  return `${formatPrecision(watts * 1e6, 2)} µW`;
}

/**
 * Format resistance with auto unit scaling (Ω, kΩ, MΩ)
 */
export function formatResistance(ohms: number): FormattedMeasurement {
  const decomposed = decomposeOhms(ohms);

  return { value: decomposed.value, unit: decomposed.symbol };
}


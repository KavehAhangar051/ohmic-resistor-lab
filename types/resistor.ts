export type ResistorUnit = 'Ohm' | 'kOhm' | 'MOhm';

export interface ResistorUnitOption {
  value: ResistorUnit;
  label: string;
  symbol: string;
  multiplier: number;
}

export const RESISTOR_UNIT_MAP: Record<ResistorUnit, number> = {
  Ohm: 1,
  kOhm: 1e3,
  MOhm: 1e6,
};

export const RESISTOR_UNITS: ResistorUnitOption[] = [
  { value: 'Ohm', label: 'اهم', symbol: 'Ω', multiplier: RESISTOR_UNIT_MAP.Ohm },
  { value: 'kOhm', label: 'کیلو‌اهم', symbol: 'kΩ', multiplier: RESISTOR_UNIT_MAP.kOhm },
  { value: 'MOhm', label: 'مگا‌اهم', symbol: 'MΩ', multiplier: RESISTOR_UNIT_MAP.MOhm },
];

export interface ResistorItem {
  id: string;
  value: string; // string to handle typing smoothly (e.g. "4.", "4.7")
  unit: ResistorUnit;
  count: number; // quantity of identical resistors
}

export interface ParallelCalculationResult {
  isValid: boolean;
  totalResistanceOhms: number | null;
  displayValue: string;
  displayUnit: string;
  exactOhmsString: string;
  conductanceSiemens: number | null;
  totalResistorsCount: number;
  uniqueValuesCount: number;
  isShortCircuit: boolean;
  errorMessage: string | null;
  branchStats: ParallelBranchStat[];
}

export interface ParallelBranchStat {
  hasValue: boolean;
  ohms: number | null;
  currentShare: string | null;
  isShort: boolean;
  animDuration: number;
  flowOpacity: number;
  flowStrokeWidth: number;
}


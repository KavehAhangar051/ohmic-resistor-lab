import { SymbolStandard } from '@/components/schematic-core/schematic-types';
import {
  RESISTOR_SYMBOL_MAP,
  RESISTOR_UNIT_MAP,
} from '@/lib/voltage-divider-format';

export type { SymbolStandard };

export interface BranchStat {
  hasValue: boolean;
  ohms: number | null;
  currentShare: string | null;
  isShort: boolean;
  animDuration: number;
  flowOpacity: number;
  flowStrokeWidth: number;
}

export const UNIT_SYMBOL_MAP = RESISTOR_SYMBOL_MAP;
export const UNIT_MULTIPLIER_MAP = RESISTOR_UNIT_MAP;


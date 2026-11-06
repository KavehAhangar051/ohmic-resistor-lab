import { SymbolStandard } from '@/components/schematic-core/schematic-types';
import { ParallelBranchStat } from '@/types/resistor';
import {
  RESISTOR_SYMBOL_MAP,
  RESISTOR_UNIT_MAP,
} from '@/lib/voltage-divider-format';

export type { SymbolStandard };

export type BranchStat = ParallelBranchStat;

export const UNIT_SYMBOL_MAP = RESISTOR_SYMBOL_MAP;
export const UNIT_MULTIPLIER_MAP = RESISTOR_UNIT_MAP;



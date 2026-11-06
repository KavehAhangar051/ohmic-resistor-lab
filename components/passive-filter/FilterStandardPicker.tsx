'use client';

import * as React from 'react';
import { Check } from 'lucide-react';
import {
  StandardFilterPair,
  ResistanceUnit,
  CapacitanceUnit,
  InductanceUnit,
} from '@/types/passive-filter';
import { Badge } from '@/components/ui/badge';

interface FilterStandardPickerProps {
  pairs: StandardFilterPair[];
  topology: 'rc' | 'rl';
  targetFcDisplay: string;
  onApplyPair: (
    resistor: string,
    resUnit: ResistanceUnit,
    reactive: string,
    reactiveUnit: CapacitanceUnit | InductanceUnit
  ) => void;
}

export const FilterStandardPicker = React.memo(function FilterStandardPicker({
  pairs,
  topology,
  targetFcDisplay,
  onApplyPair,
}: FilterStandardPickerProps) {
  const [appliedIdx, setAppliedIdx] = React.useState<number | null>(null);

  const handleApply = (pair: StandardFilterPair, idx: number) => {
    onApplyPair(pair.resistorValue, pair.resistorUnit, pair.reactiveDisplay, pair.reactiveUnitCode);
    setAppliedIdx(idx);
    setTimeout(() => setAppliedIdx(null), 1800);
  };

  if (pairs.length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-[#121215] p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-2.5">
        <div>
          <h4 className="text-xs sm:text-sm font-semibold text-zinc-100 flex items-center gap-1.5">
            <span>جفت قطعات استاندارد تجاری بازار (E24 + E12)</span>
            <Badge variant="subtle" className="text-[10px] font-mono border-zinc-700 bg-zinc-900 text-zinc-300">
              Commercial Match
            </Badge>
          </h4>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            نزدیک‌ترین ترکیب مقاومت و {topology === 'rc' ? 'خازن' : 'سلف'} استاندارد بازار به فرکانس قطع هدف ({targetFcDisplay})
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-right text-xs border-collapse">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/60 text-zinc-400 font-medium text-[11px]">
              <th scope="col" className="py-2 px-3">مقاومت R (سری E24)</th>
              <th scope="col" className="py-2 px-3">{topology === 'rc' ? 'خازن C (سری E12)' : 'سلف L (سری E12)'}</th>
              <th scope="col" className="py-2 px-3">فرکانس قطع دقیق</th>
              <th scope="col" className="py-2 px-3">میزان خطا</th>
              <th scope="col" className="py-2 px-3 text-center w-24">اعمال</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/70 font-mono tabular-nums text-zinc-200">
            {pairs.map((pair, idx) => {
              const isApplied = appliedIdx === idx;

              return (
                <tr key={idx} className="hover:bg-zinc-900/40 transition-colors">
                  <td className="py-2 px-3 font-bold text-zinc-100">{pair.resistorDisplay}</td>
                  <td className="py-2 px-3 text-amber-400 font-semibold">{pair.reactiveDisplay} {pair.reactiveUnit}</td>
                  <td className="py-2 px-3 text-emerald-400 font-bold">{pair.displayActualFc}</td>
                  <td className="py-2 px-3">
                    <span className={pair.errorPct <= 2 ? 'text-emerald-400' : 'text-amber-400'}>
                      {pair.errorPct}%
                    </span>
                  </td>
                  <td className="py-2 px-3 text-center">
                    <button
                      type="button"
                      onClick={() => handleApply(pair, idx)}
                      className="px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-200 hover:text-white transition-[color,background-color,border-color,transform] duration-150 ease-out active:scale-[0.96] cursor-pointer text-[11px] font-sans inline-flex items-center gap-1"
                    >
                      {isApplied ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-400" />
                          <span className="text-emerald-400">اعمال شد</span>
                        </>
                      ) : (
                        'اعمال در مدار'
                      )}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
});

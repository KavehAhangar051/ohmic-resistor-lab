'use client';

import * as React from 'react';
import { m } from 'motion/react';
import {
  Info,
  RotateCcw,
} from 'lucide-react';
import {
  StandardResistorPair,
  PairSortCriterion,
  CurrentFilterOption,
  DividerApplicationMode,
  ResistorSeriesOption,
  TablePageSize,
  PairTableSortKey,
  SortDirection,
} from '@/types/voltage-divider';
import { ResistorUnit } from '@/types/resistor';
import {
  filterResistorPairsByCurrent,
  sortResistorPairs,
} from '@/lib/voltage-divider-pair-finder';
import { DividerPairFilterBar } from './DividerPairFilterBar';
import { DividerPairTableRow } from './DividerPairTableRow';
import { TableSortHeader } from './DividerTableSortHeader';

interface DividerStandardPairPickerProps {
  pairs: StandardResistorPair[];
  currentCriterion: PairSortCriterion;
  onChangeCriterion: (criterion: PairSortCriterion) => void;
  appMode: DividerApplicationMode;
  onChangeAppMode: (mode: DividerApplicationMode) => void;
  series: ResistorSeriesOption;
  onChangeSeries: (series: ResistorSeriesOption) => void;
  hasLoad: boolean;
  rlValue?: string;
  rlUnit?: ResistorUnit;
  onApplyPair: (r1: string, r1Unit: ResistorUnit, r2: string, r2Unit: ResistorUnit) => void;
  activeR1Value?: string;
  activeR1Unit?: ResistorUnit;
  activeR2Value?: string;
  activeR2Unit?: ResistorUnit;
}

export const DividerStandardPairPicker = React.memo(function DividerStandardPairPicker({
  pairs,
  currentCriterion,
  onChangeCriterion,
  appMode,
  onChangeAppMode,
  series,
  onChangeSeries,
  hasLoad,
  rlValue,
  rlUnit,
  onApplyPair,
  activeR1Value,
  activeR1Unit,
  activeR2Value,
  activeR2Unit,
}: DividerStandardPairPickerProps) {
  // Engineering constraints & page size
  const [currentFilter, setCurrentFilter] = React.useState<CurrentFilterOption>('all');
  const [pageSize, setPageSize] = React.useState<TablePageSize>(20);

  // Atomic sort state to eliminate state desync and React StrictMode double-call side effects
  const [sortState, setSortState] = React.useState<{ key: PairTableSortKey; dir: SortDirection }>({
    key: 'score',
    dir: 'asc',
  });

  const handleSort = React.useCallback((key: PairTableSortKey) => {
    setSortState((prev) => ({
      key,
      dir: prev.key === key && prev.dir === 'asc' ? 'desc' : 'asc',
    }));
  }, []);

  const handleResetFilters = React.useCallback(() => {
    setCurrentFilter('all');
  }, []);

  // Split combined hook computations (rerender-split-combined-hooks):
  // Filtering only recomputes when pairs or currentFilter change, not when sort column changes.
  const filteredPairs = React.useMemo(
    () => filterResistorPairsByCurrent(pairs, currentFilter),
    [pairs, currentFilter]
  );

  const sortedPairs = React.useMemo(
    () => sortResistorPairs(filteredPairs, sortState.key, sortState.dir),
    [filteredPairs, sortState.key, sortState.dir]
  );

  if (pairs.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-5 text-center text-xs text-zinc-400">
        <p className="font-semibold text-zinc-300 mb-1">جدول جفت مقاومت‌های استاندارد تجاری (E24 / E96)</p>
        <p className="text-zinc-500">برای استخراج نزدیک‌ترین مقادیر استاندارد بازار، مقادیر معتبر ولتاژ ورودی و خروجی را وارد کنید.</p>
      </div>
    );
  }

  const hasActiveFilters = currentFilter !== 'all';

  return (
    <m.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
      className="relative rounded-xl border border-zinc-800 bg-[#121215] lab-panel cv-auto-section p-5 sm:p-6 overflow-hidden space-y-4"
    >

      {/* Engineering Filter Bar with Application Modes */}
      <DividerPairFilterBar
        appMode={appMode}
        onChangeAppMode={onChangeAppMode}
        series={series}
        onChangeSeries={onChangeSeries}
        criterion={currentCriterion}
        onChangeCriterion={onChangeCriterion}
        currentFilter={currentFilter}
        onChangeCurrentFilter={setCurrentFilter}
        pageSize={pageSize}
        onChangePageSize={setPageSize}
        hasLoad={hasLoad}
        rlValue={rlValue}
        rlUnit={rlUnit}
        onResetFilters={handleResetFilters}
        hasActiveFilters={hasActiveFilters}
        filteredCount={sortedPairs.length}
        totalCount={pairs.length}
      />

      {/* Engineering Data Table Grid Tailored to Application Mode */}
      <div className="overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-950/80 shadow-inner">
        <table className="w-full text-right border-collapse text-xs">
          <thead className="border-b border-zinc-800 bg-zinc-900/80 text-zinc-400 font-medium select-none sticky top-0 backdrop-blur-xs z-10">
            <tr>
              <TableSortHeader
                label="#"
                columnKey="score"
                sortKey={sortState.key}
                sortDir={sortState.dir}
                onSort={handleSort}
                align="center"
                className="w-12 font-mono text-[11px]"
              />
              <TableSortHeader
                label="مقاومت R1"
                columnKey="r1"
                sortKey={sortState.key}
                sortDir={sortState.dir}
                onSort={handleSort}
              />
              <TableSortHeader
                label="مقاومت R2"
                columnKey="r2"
                sortKey={sortState.key}
                sortDir={sortState.dir}
                onSort={handleSort}
              />
              {appMode === 'sampling' && (
                <>
                  <TableSortHeader
                    label="نسبت تقسیم و خطا"
                    columnKey="error"
                    sortKey={sortState.key}
                    sortDir={sortState.dir}
                    onSort={handleSort}
                  />
                  <TableSortHeader
                    label="امپدانس خروجی (Rth)"
                    columnKey="thevenin"
                    sortKey={sortState.key}
                    sortDir={sortState.dir}
                    onSort={handleSort}
                  />
                  <TableSortHeader
                    label="جریان مدار (I)"
                    columnKey="current"
                    sortKey={sortState.key}
                    sortDir={sortState.dir}
                    onSort={handleSort}
                  />
                </>
              )}
              {appMode === 'biasing' && (
                <>
                  <TableSortHeader
                    label="ولتاژ بیس (Vout)"
                    columnKey="vout"
                    sortKey={sortState.key}
                    sortDir={sortState.dir}
                    onSort={handleSort}
                  />
                  <TableSortHeader
                    label="مقاومت بیس (Rth)"
                    columnKey="thevenin"
                    sortKey={sortState.key}
                    sortDir={sortState.dir}
                    onSort={handleSort}
                  />
                  <TableSortHeader
                    label="جریان شاخه (Ibias)"
                    columnKey="current"
                    sortKey={sortState.key}
                    sortDir={sortState.dir}
                    onSort={handleSort}
                  />
                </>
              )}
              {appMode === 'reference' && (
                <>
                  <TableSortHeader
                    label="ولتاژ رفرنس (Vout)"
                    columnKey="vout"
                    sortKey={sortState.key}
                    sortDir={sortState.dir}
                    onSort={handleSort}
                  />
                  <TableSortHeader
                    label="بازه نوسان (تلرانس ۵٪)"
                    columnKey="worst_case"
                    sortKey={sortState.key}
                    sortDir={sortState.dir}
                    onSort={handleSort}
                  />
                  <TableSortHeader
                    label="امپدانس معادل (Rth)"
                    columnKey="thevenin"
                    sortKey={sortState.key}
                    sortDir={sortState.dir}
                    onSort={handleSort}
                  />
                </>
              )}
              <th scope="col" className="py-2.5 px-3 text-center w-20">
                عملیات
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {sortedPairs.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-zinc-400 font-sans text-xs">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <p>هیچ جفت مقاومت استانداردی با معیارهای فیلتر فعلی مطابقت ندارد.</p>
                    {hasActiveFilters ? (
                      <button
                        type="button"
                        onClick={handleResetFilters}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-emerald-400 bg-emerald-950/40 border border-emerald-800/50 hover:bg-emerald-950/70 transition-colors cursor-pointer"
                      >
                        <RotateCcw className="h-3 w-3" />
                        <span>بازنشانی فیلترها</span>
                      </button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ) : (
              sortedPairs.slice(0, pageSize).map((pair, idx) => {
                const isActive =
                  activeR1Value === pair.r1Value &&
                  activeR1Unit === pair.r1Unit &&
                  activeR2Value === pair.r2Value &&
                  activeR2Unit === pair.r2Unit;

                return (
                  <DividerPairTableRow
                    key={`${pair.r1Value}-${pair.r1Unit}-${pair.r2Value}-${pair.r2Unit}`}
                    pair={pair}
                    idx={idx}
                    isActive={isActive}
                    appMode={appMode}
                    onApplyPair={onApplyPair}
                  />
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Engineering Footer Tip */}
      <div className="flex items-center gap-2 text-xs text-zinc-400 pt-1">
        <Info className="h-4 w-4 text-zinc-500 shrink-0" />
        <span className="text-[11px] leading-relaxed">
          {appMode === 'sampling'
            ? 'نکته نمونه‌گیری ADC: اگر امپدانس خروجی Rth کمتر از ۱۰kΩ باشد، نیازی به بافر آپ‌امپ نخواهید داشت و خازن داخلی میکروکنترلر در زمان معین شارژ می‌شود.'
            : appMode === 'biasing'
            ? 'نکته بایاس ترانزیستور: جریان مقسم (Ibias) باید حداقل ۱۰ برابر جریان بیس (Ib) باشد تا ولتاژ بیس به تغییرات دمایی و بتا (β) حساس نباشد.'
            : 'نکته ولتاژ رفرنس: رفرنس‌های دقیق را با در نظر گرفتن تلرانس ۵٪ بدترین حالت انتخاب کنید؛ جریان مصرفی کم از گرم شدن مقاومت‌ها و رانش دمایی مدار جلوگیری می‌کند.'}
        </span>
      </div>
    </m.div>
  );
});


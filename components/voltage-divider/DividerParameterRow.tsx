'use client';

import * as React from 'react';
import { m } from 'motion/react';
import { X, Trash2 } from 'lucide-react';
import { RESISTOR_UNITS } from '@/types/resistor';
import { VOLTAGE_UNITS } from '@/types/voltage-divider';
import { ResistorColorCodeFooter } from './ResistorColorCodeBadge';
import { Input } from '@/components/ui/input';
import { IconButton } from '@/components/ui/icon-button';
import { cn, sanitizeNumericInput } from '@/lib/utils';

interface DividerParameterRowProps {
  id: string;
  label: string;
  tag: string;
  value: string;
  unit: string;
  unitType: 'voltage' | 'resistor';
  placeholder?: string;
  canDelete?: boolean;
  onDelete?: () => void;
  onChangeValue: (val: string) => void;
  onChangeUnit: (unit: string) => void;
  showColorCode?: boolean;
  isCalculated?: boolean;
  calculatedBadgeText?: string;
}

interface ParameterUnitSelectorProps {
  id: string;
  tag: string;
  unit: string;
  unitType: 'voltage' | 'resistor';
  onChangeUnit: (unit: string) => void;
}

const ParameterUnitSelector = React.memo(function ParameterUnitSelector({
  id,
  tag,
  unit,
  unitType,
  onChangeUnit,
}: ParameterUnitSelectorProps) {
  const options = unitType === 'voltage' ? VOLTAGE_UNITS : RESISTOR_UNITS;

  return (
    <div
      role="radiogroup"
      aria-label={`انتخاب مقیاس ${tag}`}
      className="shrink-0 inline-flex items-center bg-zinc-950 border border-zinc-800 p-0.5 rounded-lg select-none relative"
      dir="ltr"
    >
      {options.map((u) => {
        const isSelected = unit === u.value;

        return (
          <button
            key={u.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onChangeUnit(u.value)}
            className={cn(
              'relative inline-flex items-center justify-center cursor-pointer rounded-md px-2.5 py-1 text-xs font-mono font-medium transition-colors select-none z-10 active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50',
              isSelected ? 'text-white font-semibold' : 'text-zinc-400 hover:text-zinc-200'
            )}
            title={u.label}
          >
            {isSelected ? (
              <m.span
                layoutId={`unit-pill-${id}`}
                className="absolute inset-0 rounded-md bg-zinc-800 border border-zinc-700/60 shadow-xs -z-10"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            ) : null}
            <span>{u.symbol}</span>
          </button>
        );
      })}
    </div>
  );
});

export const DividerParameterRow = React.memo(function DividerParameterRow({
  id,
  label,
  tag,
  value,
  unit,
  unitType,
  placeholder = '10 یا 4.7',
  canDelete = false,
  onDelete,
  onChangeValue,
  onChangeUnit,
  showColorCode = true,
  isCalculated = false,
  calculatedBadgeText = 'محاسبه‌شده',
}: DividerParameterRowProps) {
  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isCalculated) return;

    const clean = sanitizeNumericInput(e.target.value);
    onChangeValue(clean);
  };

  const handleClear = () => {
    if (isCalculated) return;

    onChangeValue('');
  };

  const showDeleteButton = Boolean(canDelete && onDelete && !isCalculated);
  const showClearButton = Boolean(!isCalculated && value);
  const normalizedResistorUnit = unit === 'kOhm' || unit === 'MOhm' ? unit : 'Ohm';

  return (
    <m.div
      layout
      initial={{ opacity: 0, y: -6, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{
        opacity: 0,
        y: -4,
        scale: 0.98,
        transition: { duration: 0.18, ease: [0.3, 0, 1, 1], opacity: { duration: 0.14 } },
      }}
      transition={{
        layout: { duration: 0.28, ease: [0.2, 0, 0, 1] },
        duration: 0.28,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="overflow-hidden shrink-0 w-full mb-2.5"
    >
      <div
        className={cn(
          'group relative rounded-xl border p-3.5 sm:p-4 transition-colors duration-150',
          isCalculated
            ? 'border-emerald-600/70 bg-emerald-950/15'
            : 'border-zinc-800/90 bg-[#121215] hover:border-zinc-700'
        )}
      >
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3.5">
          {/* Tag Identification & Label */}
          <div className="flex items-center justify-between lg:justify-start gap-2.5 shrink-0">
            <div className="flex items-center gap-2.5">
              <m.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                className={cn(
                  'flex h-8 w-11 shrink-0 items-center justify-center rounded-lg border font-mono text-xs font-bold shadow-inner select-none',
                  isCalculated
                    ? 'border-emerald-500/60 bg-emerald-950/70 text-emerald-300'
                    : 'border-zinc-700/70 bg-zinc-950 text-zinc-200'
                )}
              >
                {tag}
              </m.div>
              {isCalculated ? (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-500/50 text-emerald-400">
                  {calculatedBadgeText}
                </span>
              ) : null}
            </div>

            {showDeleteButton ? (
              <div className="lg:hidden">
                <IconButton
                  type="button"
                  variant="danger"
                  size="sm"
                  onClick={onDelete}
                  title="حذف المان"
                  aria-label={`حذف ${label}`}
                  className="text-zinc-400 hover:text-red-400"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </IconButton>
              </div>
            ) : null}
          </div>

          {/* Value Input */}
          <div className="flex-1 min-w-[140px]">
            <div className="relative">
              <Input
                type="text"
                inputMode="decimal"
                dir="ltr"
                placeholder={placeholder}
                aria-label={label}
                value={value}
                readOnly={isCalculated}
                onChange={handleValueChange}
                className={cn(
                  'w-full pl-3 pr-8 font-mono text-base sm:text-sm h-10 text-left transition-colors',
                  isCalculated
                    ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-200 cursor-default font-bold'
                    : 'bg-zinc-950/90 border-zinc-800 text-zinc-100 focus-visible:border-emerald-500/80 focus-visible:ring-emerald-500/20'
                )}
              />
              {showClearButton ? (
                <m.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  whileTap={{ scale: 0.96 }}
                  type="button"
                  onClick={handleClear}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-100 transition-colors rounded cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
                  title="پاک کردن مقدار"
                  aria-label={`پاک کردن مقدار ${tag}`}
                >
                  <X className="h-3.5 w-3.5" />
                </m.button>
              ) : null}
            </div>
          </div>

          {/* Unit Selector */}
          <ParameterUnitSelector
            id={id}
            tag={tag}
            unit={unit}
            unitType={unitType}
            onChangeUnit={onChangeUnit}
          />

          {/* Desktop Delete Action */}
          {showDeleteButton ? (
            <div className="hidden lg:flex items-center shrink-0">
              <m.div whileTap={{ scale: 0.96 }}>
                <IconButton
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onDelete}
                  title="حذف مقاومت بار"
                  aria-label={`حذف مقاومت بار ${tag}`}
                  className="text-zinc-500 hover:text-red-400 hover:bg-red-950/30"
                >
                  <Trash2 className="h-4 w-4" />
                </IconButton>
              </m.div>
            </div>
          ) : null}
        </div>

        {/* Mini Resistor Color Code Visualizer */}
        <ResistorColorCodeFooter
          value={value}
          unit={normalizedResistorUnit}
          show={showColorCode && unitType === 'resistor'}
        />
      </div>
    </m.div>
  );
});

'use client';

import * as React from 'react';
import { motion } from 'motion/react';
import { Trash2, Copy, X } from 'lucide-react';
import { ResistorItem, RESISTOR_UNITS, ResistorUnit } from '@/types/resistor';
import { ResistorColorCodeFooter } from '@/components/voltage-divider/ResistorColorCodeBadge';
import { Input } from '@/components/ui/input';
import { IconButton } from '@/components/ui/icon-button';
import { cn, sanitizeNumericInput } from '@/lib/utils';

interface ResistorRowProps {
  item: ResistorItem;
  index: number;
  canDelete: boolean;
  onChange: (id: string, updates: Partial<ResistorItem>) => void;
  onDelete: (id: string) => void;
  onDuplicate: (item: ResistorItem) => void;
}

export const ResistorRow = React.memo(function ResistorRow({
  item,
  index,
  canDelete,
  onChange,
  onDelete,
  onDuplicate,
}: ResistorRowProps) {
  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleanVal = sanitizeNumericInput(e.target.value);
    onChange(item.id, { value: cleanVal });
  };

  const handleClearValue = () => {
    onChange(item.id, { value: '' });
  };

  const handleUnitSelect = (newUnit: ResistorUnit) => {
    onChange(item.id, { unit: newUnit });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, height: 0, y: -6, marginBottom: 0 }}
      animate={{ opacity: 1, height: 'auto', y: 0, marginBottom: 10 }}
      exit={{
        opacity: 0,
        height: 0,
        y: -4,
        marginBottom: 0,
        transition: {
          duration: 0.18,
          ease: [0.3, 0, 1, 1],
          opacity: { duration: 0.14 },
        },
      }}
      transition={{
        layout: { duration: 0.28, ease: [0.2, 0, 0, 1] },
        duration: 0.28,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="overflow-hidden shrink-0 w-full"
    >
      <div className="group relative rounded-xl border border-zinc-800/90 bg-[#121215] p-3.5 sm:p-4 transition-colors duration-150 hover:border-zinc-700">

        {/* Main Interactive Controls Bar */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3.5">
          {/* Branch Index Identification */}
          <div className="flex items-center justify-between lg:justify-start gap-2 shrink-0">
            <div className="flex items-center gap-2">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                className="flex h-8 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-700/70 bg-zinc-950 font-mono text-xs font-bold text-zinc-200 shadow-inner select-none"
              >
                R{index + 1}
              </motion.div>
            </div>

            {/* Mobile Top Actions */}
            <div className="flex items-center gap-1 lg:hidden">
              <IconButton
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onDuplicate(item)}
                title="تکرار این شاخه"
                aria-label={`کپی شاخه R${index + 1}`}
                className="text-zinc-400 hover:text-zinc-100"
              >
                <Copy className="h-3.5 w-3.5" />
              </IconButton>
              {canDelete && (
                <IconButton
                  type="button"
                  variant="danger"
                  size="sm"
                  onClick={() => onDelete(item.id)}
                  title="حذف شاخه"
                  aria-label={`حذف شاخه R${index + 1}`}
                  className="text-zinc-400 hover:text-red-400"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </IconButton>
              )}
            </div>
          </div>

          {/* Resistor Value Input */}
          <div className="flex-1 min-w-[150px]">
            <div className="relative">
              <Input
                type="text"
                inputMode="decimal"
                dir="ltr"
                placeholder="100 یا 4.7"
                aria-label={`مقدار مقاومت R${index + 1}`}
                value={item.value}
                onChange={handleValueChange}
                className="w-full pl-3 pr-8 font-mono text-base sm:text-sm h-10 bg-zinc-950/90 border-zinc-800 text-left focus-visible:border-emerald-500/80 focus-visible:ring-emerald-500/20 transition-colors"
              />
              {item.value ? (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  whileTap={{ scale: 0.96 }}
                  type="button"
                  onClick={handleClearValue}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-100 transition-colors rounded cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
                  title="پاک کردن مقدار"
                  aria-label={`پاک کردن مقدار R${index + 1}`}
                >
                  <X className="h-3.5 w-3.5" />
                </motion.button>
              ) : null}
            </div>
          </div>

          {/* Unit Selector (Ω, kΩ, MΩ) with Spring Layout Indicator */}
          <div
            role="radiogroup"
            aria-label="انتخاب مقیاس مقاومت"
            className="shrink-0 inline-flex items-center bg-zinc-950 border border-zinc-800 p-0.5 rounded-lg select-none relative"
            dir="ltr"
          >
            {RESISTOR_UNITS.map((u) => {
              const isSelected = item.unit === u.value;

              return (
                <button
                  key={u.value}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => handleUnitSelect(u.value)}
                  className={cn(
                    'relative inline-flex items-center justify-center cursor-pointer rounded-md px-2.5 py-1 text-xs font-mono font-medium transition-colors select-none z-10 active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50',
                    isSelected
                      ? 'text-white font-semibold'
                      : 'text-zinc-400 hover:text-zinc-200'
                  )}
                  title={u.label}
                >
                  {isSelected && (
                    <motion.span
                      layoutId={`unit-pill-${item.id}`}
                      className="absolute inset-0 rounded-md bg-zinc-800 border border-zinc-700/60 shadow-xs -z-10"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                  <span>{u.symbol}</span>
                </button>
              );
            })}
          </div>

          {/* Desktop Action Controls */}
          <div className="hidden lg:flex items-center gap-1 shrink-0">
            <motion.div whileTap={{ scale: 0.96 }}>
              <IconButton
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onDuplicate(item)}
                title="تکرار این شاخه (کپی مقادیر)"
                aria-label={`تکرار شاخه R${index + 1}`}
                className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60"
              >
                <Copy className="h-4 w-4" />
              </IconButton>
            </motion.div>
            {canDelete && (
              <motion.div whileTap={{ scale: 0.96 }}>
                <IconButton
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(item.id)}
                  title="حذف این شاخه از مدار"
                  aria-label={`حذف شاخه R${index + 1} از مدار`}
                  className="text-zinc-500 hover:text-red-400 hover:bg-red-950/30"
                >
                  <Trash2 className="h-4 w-4" />
                </IconButton>
              </motion.div>
            )}
          </div>
        </div>

        {/* Mini Resistor Color Code Visualizer (if resistor value is valid) */}
        <ResistorColorCodeFooter value={item.value} unit={item.unit} />
      </div>
    </motion.div>
  );
});

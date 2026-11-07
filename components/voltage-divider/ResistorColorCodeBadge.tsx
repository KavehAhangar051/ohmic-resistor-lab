'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ResistorUnit } from '@/types/resistor';
import { getResistorColorBands } from '@/lib/resistor-calc';
import { cn } from '@/lib/utils';

interface ResistorColorCodeBadgeProps {
  value: string;
  unit: ResistorUnit;
  label?: string;
  className?: string;
}

/**
 * Miniature 4-band EIA color code badge for resistors.
 */
export const ResistorColorCodeBadge = React.memo(function ResistorColorCodeBadge({
  value,
  unit,
  label,
  className,
}: ResistorColorCodeBadgeProps) {
  const bands = React.useMemo(
    () => getResistorColorBands({ value, unit }),
    [value, unit]
  );

  if (!bands || bands.length < 4) {
    return null;
  }

  const tooltipText = `${label ? label + ': ' : ''}${bands.map((b) => b.nameFa).join(' | ')}`;

  return (
    <div
      role="img"
      aria-label={`کد رنگ مقاومت ${tooltipText}`}
      className={cn('flex items-center select-none shrink-0 [transform:rotateX(180deg)]', className)}
      style={{ transform: 'rotateX(180deg)' }}
      title={tooltipText}
    >
      {/* Lead wire left */}
      <div className="w-1.5 h-0.5 bg-zinc-500" />

      {/* Ceramic body */}
      <div className="flex items-center h-3.5 bg-[#d8c3a5] px-1 rounded-xs gap-1 border border-[#b8a082] shadow-xs">
        {bands.map((band, idx) => (
          <span
            key={`${band.name}-${idx}`}
            className="inline-block h-3.5 w-1 rounded-[1px] shadow-xs origin-center"
            style={{ backgroundColor: band.color }}
            title={`${band.nameFa} (${band.name})`}
          />
        ))}
      </div>

      {/* Lead wire right */}
      <div className="w-1.5 h-0.5 bg-zinc-500" />
    </div>
  );
});

/**
 * Animated row footer displaying the 4-band EIA color code for a resistor input row.
 */
export const ResistorColorCodeFooter = React.memo(function ResistorColorCodeFooter({
  value,
  unit,
  show = true,
}: {
  value: string;
  unit: ResistorUnit;
  show?: boolean;
}) {
  const colorBands = React.useMemo(
    () => (show ? getResistorColorBands({ value, unit }) : null),
    [show, value, unit]
  );

  return (
    <AnimatePresence>
      {colorBands && (
        <motion.div
          initial={{ opacity: 0, height: 0, marginTop: 0 }}
          animate={{ opacity: 1, height: 'auto', marginTop: 10 }}
          exit={{ opacity: 0, height: 0, marginTop: 0 }}
          transition={{ duration: 0.18, ease: [0.2, 0, 0, 1] }}
          className="overflow-hidden"
        >
          <div className="pt-2 border-t border-zinc-800/40 flex items-center justify-end text-xs">
            <div
              role="img"
              aria-label={`کد رنگی استاندارد مقاومت: ${colorBands.map((b) => b.nameFa).join('، ')}`}
              className="flex items-center gap-1.5 bg-zinc-950/80 border border-zinc-800/80 px-2 py-1 rounded-md shadow-xs"
              title="کد رنگی استاندارد مقاومت (EIA 4-Band)"
            >
              <span className="text-[10px] text-zinc-400 font-medium">کد رنگ:</span>
              <div className="flex items-center">
                <div className="w-1.5 h-0.5 bg-zinc-500" />
                <div className="flex items-center h-3.5 bg-[#d8c3a5] px-1 rounded-xs gap-1 border border-[#b8a082] shadow-xs">
                  {colorBands.map((band, idx) => (
                    <motion.span
                      key={idx}
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ delay: idx * 0.03, duration: 0.15 }}
                      className="inline-block h-3.5 w-1 rounded-[1px] shadow-xs origin-center"
                      style={{ backgroundColor: band.color }}
                      title={`${band.nameFa} (${band.name})`}
                    />
                  ))}
                </div>
                <div className="w-1.5 h-0.5 bg-zinc-500" />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});


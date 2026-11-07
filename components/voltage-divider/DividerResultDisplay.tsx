'use client';

import * as React from 'react';
import { m, AnimatePresence } from 'motion/react';
import { AlertTriangle } from 'lucide-react';
import { VoltageDividerResult, VoltageDividerState } from '@/types/voltage-divider';
import { ResistorUnit } from '@/types/resistor';
import { DividerResultHero, DividerTelemetryGrid } from './DividerResultSections';

interface DividerResultDisplayProps {
  state: VoltageDividerState;
  result: VoltageDividerResult;
  onApplyResistor?: (which: 'r1' | 'r2', value: string, unit: ResistorUnit) => void;
}

export const DividerResultDisplay = React.memo(function DividerResultDisplay({
  state,
  result,
}: DividerResultDisplayProps) {
  const showTelemetry = result.isValid && !result.isShortCircuit;

  return (
    <div className="relative rounded-xl border border-zinc-800 bg-[#121215] p-5 sm:p-6 overflow-hidden">
      {/* Short Circuit Warning Banner */}
      <AnimatePresence>
        {result.isShortCircuit ? (
          <m.div
            initial={{ opacity: 0, scale: 0.96, y: -4 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
              x: [0, -8, 8, -5, 5, -2, 0],
            }}
            exit={{ opacity: 0, scale: 0.96, y: -4 }}
            transition={{
              x: { duration: 0.36, ease: 'easeInOut' },
              duration: 0.22,
              ease: [0.2, 0, 0, 1],
            }}
            className="overflow-hidden mb-4"
          >
            <div className="flex items-center gap-2.5 rounded-lg border border-red-900/80 bg-red-950/50 p-3 text-xs text-red-300 font-medium shadow-xs">
              <AlertTriangle className="h-4 w-4 shrink-0 text-red-400" />
              <span>{result.errorMessage}</span>
            </div>
          </m.div>
        ) : null}
      </AnimatePresence>

      {/* Main Result Display Hero Content Tailored to Solve Mode */}
      <DividerResultHero state={state} result={result} />

      {/* Engineering Circuit Analysis Grid tailored to Application Mode */}
      {showTelemetry ? <DividerTelemetryGrid state={state} result={result} /> : null}
    </div>
  );
});

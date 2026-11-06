'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle } from 'lucide-react';
import { ParallelCalculationResult } from '@/types/resistor';

interface ResultDisplayProps {
  result: ParallelCalculationResult;
}

export function ResultDisplay({ result }: ResultDisplayProps) {
  return (
    <div className="relative rounded-xl border border-zinc-800 bg-[#121215] p-5 sm:p-6 overflow-hidden">

      {/* Short Circuit Warning Banner with Corporate Error Shake Pattern */}
      <AnimatePresence>
        {result.isShortCircuit && (
          <motion.div
            initial={{ opacity: 0, height: 0, scale: 0.96, marginBottom: 0 }}
            animate={{
              opacity: 1,
              height: 'auto',
              scale: 1,
              marginBottom: 16,
              x: [0, -8, 8, -5, 5, -2, 0],
            }}
            exit={{ opacity: 0, height: 0, scale: 0.96, marginBottom: 0 }}
            transition={{
              x: { duration: 0.36, ease: 'easeInOut' },
              duration: 0.22,
              ease: [0.2, 0, 0, 1],
            }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-2.5 rounded-lg border border-red-900/80 bg-red-950/50 p-3 text-xs text-red-300 font-medium shadow-xs">
              <AlertTriangle className="h-4 w-4 shrink-0 text-red-400" />
              <span>{result.errorMessage}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Result Display Content */}
      <div className="flex flex-col items-center justify-center text-center">
        <div className="flex items-baseline justify-center gap-2 my-2 select-all" dir="ltr">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={result.displayValue}
              initial={{ opacity: 0.3, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.98 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="font-mono text-4xl sm:text-5xl font-bold tracking-tight text-zinc-100 tabular-nums"
            >
              {result.displayValue}
            </motion.span>
          </AnimatePresence>

          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={result.displayUnit}
              initial={{ opacity: 0.4, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="font-mono text-2xl font-semibold text-emerald-400"
            >
              {result.displayUnit}
            </motion.span>
          </AnimatePresence>
        </div>

        <div className="mt-2 text-[11px] font-mono text-zinc-500 tracking-wider">
          PARALLEL EQUIVALENT
        </div>
      </div>
    </div>
  );
}

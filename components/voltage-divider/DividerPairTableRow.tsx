'use client';

import * as React from 'react';
import { Check } from 'lucide-react';
import { StandardResistorPair, DividerApplicationMode } from '@/types/voltage-divider';
import { ResistorUnit } from '@/types/resistor';
import { getResistorSymbol } from '@/lib/voltage-divider-format';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ResistorColorCodeBadge } from './ResistorColorCodeBadge';

interface DividerPairTableRowProps {
  pair: StandardResistorPair;
  idx: number;
  isActive: boolean;
  appMode: DividerApplicationMode;
  onApplyPair: (r1: string, r1Unit: ResistorUnit, r2: string, r2Unit: ResistorUnit) => void;
}

const STIFFNESS_BADGE_CLASSES: Record<'excellent' | 'good' | 'poor' | 'unloaded', string> = {
  excellent: 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/40',
  good: 'bg-sky-950/80 text-sky-400 border border-sky-800/40',
  poor: 'bg-amber-950/80 text-amber-400 border border-amber-800/40',
  unloaded: 'bg-amber-950/80 text-amber-400 border border-amber-800/40',
};

const ADC_BADGE_VARIANTS: Record<'direct' | 'buffered' | 'high_impedance', 'success' | 'subtle' | 'warning'> = {
  direct: 'success',
  buffered: 'subtle',
  high_impedance: 'warning',
};

const ADC_BADGE_LABELS: Record<'direct' | 'buffered' | 'high_impedance', string> = {
  direct: 'مستقیم (ADC)',
  buffered: 'بای‌پاس',
  high_impedance: 'بافر',
};

const BIAS_BADGE_VARIANTS: Record<'stiff' | 'moderate' | 'soft', 'success' | 'subtle' | 'warning'> = {
  stiff: 'success',
  moderate: 'subtle',
  soft: 'warning',
};

const BIAS_BADGE_LABELS: Record<'stiff' | 'moderate' | 'soft', string> = {
  stiff: 'سفت (Stiff)',
  moderate: 'متوسط',
  soft: 'نرم',
};

const PairRankCell = React.memo(function PairRankCell({
  pair,
  idx,
  isActive,
}: {
  pair: StandardResistorPair;
  idx: number;
  isActive: boolean;
}) {
  const showStiffness = Boolean(pair.isLoaded && pair.stiffnessRatio !== undefined);
  const stiffnessKey = pair.stiffnessStatus ?? 'poor';

  return (
    <td className="py-2 px-3 text-center">
      <div className="flex flex-col items-center gap-0.5">
        <span
          className={cn(
            'flex h-5 w-5 items-center justify-center rounded-md border text-[10px] font-bold font-mono transition-colors',
            isActive
              ? 'bg-emerald-500 border-emerald-400 text-zinc-950 font-bold'
              : 'bg-zinc-900 border-zinc-700/70 text-zinc-300'
          )}
        >
          {idx + 1}
        </span>
        {pair.badge ? (
          <span className="text-[9px] font-sans text-zinc-500 truncate max-w-[76px]" title={pair.badge}>
            {pair.badge}
          </span>
        ) : null}
        {showStiffness ? (
          <span
            className={cn(
              'text-[8px] font-mono px-1 py-0.2 rounded font-semibold',
              STIFFNESS_BADGE_CLASSES[stiffnessKey]
            )}
            title={`نسبت سفتی بار: RL/Rth = ${pair.stiffnessRatio}`}
          >
            RL: {pair.stiffnessRatio}x
          </span>
        ) : null}
      </div>
    </td>
  );
});

const PairErrorBadge = React.memo(function PairErrorBadge({
  errorPercentage,
}: {
  errorPercentage: number;
}) {
  const isExact = errorPercentage <= 0.05;
  const variant = isExact ? 'success' : errorPercentage < 1.5 ? 'subtle' : 'warning';

  return (
    <Badge variant={variant} size="sm" className="text-[9px] py-0 font-sans">
      {isExact ? 'خطا ۰٪' : <span className="font-mono tabular-nums" dir="ltr">±{errorPercentage}%</span>}
    </Badge>
  );
});

const PairModeTelemetryCells = React.memo(function PairModeTelemetryCells({
  pair,
  appMode,
}: {
  pair: StandardResistorPair;
  appMode: DividerApplicationMode;
}) {
  if (appMode === 'sampling') {
    const adcKey = pair.adcSuitability;

    return (
      <>
        <td className="py-2 px-3" dir="ltr">
          <div className="flex items-center gap-1.5 font-mono">
            <span className="font-bold text-zinc-100">K: {pair.divisionRatioFormatted}</span>
            <PairErrorBadge errorPercentage={pair.errorPercentage} />
          </div>
        </td>
        <td className="py-2 px-3" dir="ltr">
          <div className="flex items-center gap-1.5 font-mono">
            <span className="font-medium text-zinc-200 tabular-nums">{pair.theveninFormatted}</span>
            <Badge variant={ADC_BADGE_VARIANTS[adcKey]} size="sm" className="font-sans text-[9px] py-0">
              {ADC_BADGE_LABELS[adcKey]}
            </Badge>
          </div>
        </td>
        <td className="py-2 px-3 text-zinc-300 font-mono tabular-nums" dir="ltr">
          <span>{pair.currentFormatted}</span>
        </td>
      </>
    );
  }

  if (appMode === 'biasing') {
    const biasKey = pair.biasStability;

    return (
      <>
        <td className="py-2 px-3" dir="ltr">
          <span className="font-bold text-emerald-400 font-mono tabular-nums">{pair.displayVout} V</span>
        </td>
        <td className="py-2 px-3" dir="ltr">
          <div className="flex items-center gap-1.5 font-mono">
            <span className="font-medium text-zinc-200 tabular-nums">{pair.theveninFormatted}</span>
            <Badge variant={BIAS_BADGE_VARIANTS[biasKey]} size="sm" className="font-sans text-[9px] py-0">
              {BIAS_BADGE_LABELS[biasKey]}
            </Badge>
          </div>
        </td>
        <td className="py-2 px-3 text-zinc-300 font-mono tabular-nums" dir="ltr">
          <span>{pair.currentFormatted}</span>
        </td>
      </>
    );
  }

  return (
    <>
      <td className="py-2 px-3" dir="ltr">
        <div className="flex items-center gap-1.5 font-mono">
          <span className="font-bold text-zinc-100 tabular-nums">{pair.displayVout} V</span>
          <PairErrorBadge errorPercentage={pair.errorPercentage} />
        </div>
      </td>
      <td className="py-2 px-3 font-mono text-zinc-300 tabular-nums" dir="ltr">
        <span className="text-[10px] text-zinc-200 font-medium">
          {pair.worstCaseVoutMinFormatted} - {pair.worstCaseVoutMaxFormatted} V
        </span>
      </td>
      <td className="py-2 px-3 text-zinc-300 font-mono tabular-nums" dir="ltr">
        <span>{pair.theveninFormatted}</span>
      </td>
    </>
  );
});

export const DividerPairTableRow = React.memo(function DividerPairTableRow({
  pair,
  idx,
  isActive,
  appMode,
  onApplyPair,
}: DividerPairTableRowProps) {
  const r1UnitSym = getResistorSymbol(pair.r1Unit);
  const r2UnitSym = getResistorSymbol(pair.r2Unit);

  return (
    <tr
      className={cn(
        'transition-colors duration-150 text-[11px]',
        isActive ? 'bg-emerald-950/25 border-r-2 border-emerald-500' : 'hover:bg-zinc-800/40'
      )}
    >
      <PairRankCell pair={pair} idx={idx} isActive={isActive} />

      <td className="py-2 px-3 text-white">
        <div className="flex items-center gap-2" dir="ltr">
          <div className="inline-flex items-baseline gap-1 bg-zinc-950/80 border border-zinc-800 px-2 py-1 rounded-md shadow-inner">
            <span className="text-zinc-500 text-[10px] font-bold font-mono">R1:</span>
            <span className="font-bold text-xs text-white tabular-nums font-mono">{pair.r1Value}</span>
            <span className="text-[11px] font-semibold text-emerald-400 font-mono">{r1UnitSym}</span>
          </div>
          <ResistorColorCodeBadge value={pair.r1Value} unit={pair.r1Unit} label="R1" />
        </div>
      </td>

      <td className="py-2 px-3 text-white">
        <div className="flex items-center gap-2" dir="ltr">
          <div className="inline-flex items-baseline gap-1 bg-zinc-950/80 border border-zinc-800 px-2 py-1 rounded-md shadow-inner">
            <span className="text-zinc-500 text-[10px] font-bold font-mono">R2:</span>
            <span className="font-bold text-xs text-white tabular-nums font-mono">{pair.r2Value}</span>
            <span className="text-[11px] font-semibold text-emerald-400 font-mono">{r2UnitSym}</span>
          </div>
          <ResistorColorCodeBadge value={pair.r2Value} unit={pair.r2Unit} label="R2" />
        </div>
      </td>

      <PairModeTelemetryCells pair={pair} appMode={appMode} />

      <td className="py-2 px-3 text-center">
        {isActive ? (
          <div className="w-full inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-md bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 text-xs font-semibold shadow-xs select-none">
            <Check className="h-3.5 w-3.5 text-emerald-400" />
            <span className="font-sans">در مدار</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onApplyPair(pair.r1Value, pair.r1Unit, pair.r2Value, pair.r2Unit)}
            aria-label={`اعمال جفت مقاومت R1=${pair.r1Value}${r1UnitSym} و R2=${pair.r2Value}${r2UnitSym}`}
            className="w-full inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-md border border-zinc-700/80 bg-zinc-900 hover:bg-zinc-800 hover:border-zinc-600 hover:text-white text-zinc-200 text-xs font-medium transition-[color,background-color,border-color,transform] duration-150 ease-out cursor-pointer shadow-xs active:scale-[0.96] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500/50"
            title="اعمال این جفت روی مدار و شماتیک"
          >
            <Check className="h-3 w-3 text-zinc-400" />
            <span className="font-sans">اعمال در مدار</span>
          </button>
        )}
      </td>
    </tr>
  );
});

'use client';

import * as React from 'react';
import { VoltageDividerResult, VoltageDividerState } from '@/types/voltage-divider';
import { formatPrecision } from '@/lib/resistor-calc';
import { getResistorSymbol } from '@/lib/voltage-divider-format';
import { Badge } from '@/components/ui/badge';

interface DividerSectionProps {
  state: VoltageDividerState;
  result: VoltageDividerResult;
}

const APP_MODE_PAIR_TITLES: Record<VoltageDividerState['appMode'], string> = {
  biasing: 'مقاومت‌های بایاس ترانزیستور (R1 و R2)',
  sampling: 'مقاومت‌های نمونه‌گیری سیگنال (R1 و R2)',
  reference: 'مقاومت‌های ساخت ولتاژ رفرنس (R1 و R2)',
};

export const DividerResultHero = React.memo(function DividerResultHero({
  state,
  result,
}: DividerSectionProps) {
  const { solveMode, appMode } = state;

  if (solveMode === 'vout') {
    return (
      <div className="flex flex-col items-center justify-center text-center">
        <div className="flex items-baseline gap-2 my-1 font-mono" dir="ltr">
          <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white tabular-nums">
            {result.displayVout}
          </span>
          <span className="text-lg font-bold text-emerald-400">
            {result.displayVoutUnit}
          </span>
        </div>
      </div>
    );
  }

  if (solveMode === 'r1' || solveMode === 'r2') {
    const isR1 = solveMode === 'r1';
    const solvedText = result.solvedValue ?? result.solvedValueFormatted ?? '—';

    return (
      <div className="flex flex-col items-center justify-center text-center w-full">
        <span className="text-[11px] font-mono text-zinc-400 font-semibold mb-1">
          {isR1 ? 'مقاومت بالایی محاسبه‌شده (R1 تئوری)' : 'مقاومت پایینی محاسبه‌شده (R2 تئوری)'}
        </span>
        <div className="flex items-baseline gap-2 my-1 font-mono" dir="ltr">
          <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white tabular-nums">
            {solvedText}
          </span>
          <span className="text-lg font-bold text-emerald-400">
            {getResistorSymbol(result.solvedResistorUnit)}
          </span>
        </div>
        <div className="text-[10px] font-mono text-zinc-500">
          {isR1 ? 'THEORETICAL UPPER RESISTOR' : 'THEORETICAL LOWER RESISTOR'}
        </div>
      </div>
    );
  }

  if (solveMode === 'vin') {
    return (
      <div className="flex flex-col items-center justify-center text-center">
        <span className="text-[11px] font-mono text-zinc-400 font-semibold mb-1">
          ولتاژ ورودی مورد نیاز منبع تغذیه (Vin)
        </span>
        <div className="flex items-baseline gap-2 my-1 font-mono" dir="ltr">
          <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white tabular-nums">
            {result.solvedValue ?? '—'}
          </span>
          <span className="text-lg font-bold text-emerald-400">V</span>
        </div>
        <div className="mt-1 text-[11px] font-mono text-zinc-400">
          جریان کل مدار: <strong className="text-zinc-200">{result.displayCurrent} {result.displayCurrentUnit}</strong>
        </div>
      </div>
    );
  }

  const r1UnitSym = getResistorSymbol(state.r1Unit);
  const r2UnitSym = getResistorSymbol(state.r2Unit);

  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="flex items-center gap-1.5 mb-2">
        <span className="text-[11px] font-mono text-zinc-400 font-semibold">
          {APP_MODE_PAIR_TITLES[appMode]}
        </span>
      </div>

      <div className="flex items-center justify-center gap-2 sm:gap-3 my-1 select-all font-mono" dir="ltr">
        <div className="flex items-baseline gap-1.5 bg-zinc-950/80 border border-zinc-800 px-3.5 py-2 rounded-lg shadow-inner">
          <span className="text-zinc-500 text-xs font-bold">R1:</span>
          <span className="text-2xl sm:text-3xl font-bold tracking-tight text-white tabular-nums">
            {state.r1}
          </span>
          <span className="text-sm font-semibold text-emerald-400">{r1UnitSym}</span>
        </div>

        <span className="text-zinc-600 font-bold text-lg select-none">&bull;</span>

        <div className="flex items-baseline gap-1.5 bg-zinc-950/80 border border-zinc-800 px-3.5 py-2 rounded-lg shadow-inner">
          <span className="text-zinc-500 text-xs font-bold">R2:</span>
          <span className="text-2xl sm:text-3xl font-bold tracking-tight text-white tabular-nums">
            {state.r2}
          </span>
          <span className="text-sm font-semibold text-emerald-400">{r2UnitSym}</span>
        </div>
      </div>

      <div className="mt-2 text-[10px] font-mono text-zinc-500 tracking-wider">
        EIA E24 COMMERCIAL RESISTOR PAIR
      </div>
    </div>
  );
});

const ModeSpecificTelemetry = React.memo(function ModeSpecificTelemetry({
  state,
  result,
}: DividerSectionProps) {
  const { appMode } = state;

  if (appMode === 'sampling') {
    const ratioNum = result.ratio ?? 0;
    const dbAtten = result.dbAttenuation ?? '—';
    const adcStatus = result.adcImpedanceStatus ?? 'direct';
    const adcBadgeLabel = result.adcImpedanceBadgeLabel ?? 'مستقیم (ADC OK)';
    const badgeVariant = adcStatus === 'direct' ? 'success' : adcStatus === 'buffered' ? 'subtle' : 'warning';

    return (
      <>
        <div className="flex items-center justify-between text-zinc-400">
          <span className="font-sans text-[11px]">ضریب مقیاس سیگنال (K):</span>
          <div className="flex items-center gap-1.5" dir="ltr">
            <span className="text-emerald-400 font-bold font-mono tabular-nums">{formatPrecision(ratioNum * 100, 1)}%</span>
            <span className="text-[10px] text-zinc-500 font-mono">({dbAtten})</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-zinc-400">
          <span className="font-sans text-[11px]">امپدانس خروجی ADC (Rth):</span>
          <div className="flex items-center gap-1.5" dir="ltr">
            <span className="text-zinc-200 font-semibold font-mono tabular-nums">{result.displayRth} {result.displayRthUnit}</span>
            <Badge variant={badgeVariant} size="sm" className="font-sans text-[9px] py-0">
              {adcBadgeLabel}
            </Badge>
          </div>
        </div>

        <div className="flex items-center justify-between text-zinc-400">
          <span className="font-sans text-[11px] flex items-center gap-1">
            <span>جریان بارگذاری منبع سیگنال:</span>
            <span className="text-[10px] text-zinc-500 font-mono">(I_in)</span>
          </span>
          <span className="text-zinc-200 font-semibold font-mono tabular-nums" dir="ltr">
            {result.displayCurrent} {result.displayCurrentUnit}
          </span>
        </div>
      </>
    );
  }

  if (appMode === 'biasing') {
    return (
      <>
        <div className="flex items-center justify-between text-zinc-400">
          <span className="font-sans text-[11px]">ولتاژ بیس مدار باز (Vth_base):</span>
          <span className="text-emerald-400 font-bold font-mono tabular-nums" dir="ltr">
            {result.displayVout} {result.displayVoutUnit}
          </span>
        </div>

        <div className="flex items-center justify-between text-zinc-400">
          <span className="font-sans text-[11px]">مقاومت معادل بیس (Rth_base):</span>
          <span className="text-zinc-200 font-semibold font-mono tabular-nums" dir="ltr">
            {result.displayRth} {result.displayRthUnit}
          </span>
        </div>

        <div className="flex items-center justify-between text-zinc-400">
          <span className="font-sans text-[11px]">جریان شاخه مقسم بایاس (Ibias):</span>
          <span className="text-zinc-200 font-semibold font-mono tabular-nums" dir="ltr">
            {result.displayCurrent} {result.displayCurrentUnit}
          </span>
        </div>
      </>
    );
  }

  const errorPct = result.targetErrorPct ?? 0;

  return (
    <>
      <div className="flex items-center justify-between text-zinc-400">
        <span className="font-sans text-[11px]">ولتاژ رفرنس خروجی (Vref):</span>
        <div className="flex items-center gap-1.5" dir="ltr">
          <span className="text-emerald-400 font-bold font-mono tabular-nums">
            {result.displayVout} {result.displayVoutUnit}
          </span>
          <span className="text-[10px] text-zinc-500 font-sans">
            (خطا: <span className="font-mono tabular-nums">{formatPrecision(errorPct, 2)}%</span>)
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between text-zinc-400">
        <span className="font-sans text-[11px]">امپدانس منبع رفرنس (Rout):</span>
        <span className="text-zinc-200 font-semibold font-mono tabular-nums" dir="ltr">
          {result.displayRth} {result.displayRthUnit}
        </span>
      </div>
    </>
  );
});

export const DividerTelemetryGrid = React.memo(function DividerTelemetryGrid({
  state,
  result,
}: DividerSectionProps) {
  const maxIscValue = result.displayMaxIscValue ?? '0';
  const maxIscUnit = result.displayMaxIscUnit ?? 'mA';
  const safeI5Value = result.displaySafeI5Value ?? '0';
  const safeI5Unit = result.displaySafeI5Unit ?? 'mA';

  return (
    <div className="mt-5 pt-4 border-t border-zinc-800/80 space-y-2.5 text-xs">
      <ModeSpecificTelemetry state={state} result={result} />

      <div className="rounded-lg border border-zinc-800 bg-zinc-950/70 p-3 space-y-2 mt-3 text-xs">
        <div className="flex items-center justify-between text-zinc-200 font-medium">
          <span className="font-sans text-[11px]">جریان مجاز خروجی Vout:</span>
          <span className="font-mono text-xs text-emerald-400 font-bold" dir="ltr">
            تا {safeI5Value} {safeI5Unit}
          </span>
        </div>

        <div className="space-y-1 text-[11px] text-zinc-400">
          <div className="flex items-center justify-between">
            <span>جریان خروجی برای حفظ ولتاژ (افت کمتر از ۵٪):</span>
            <span className="font-mono text-zinc-200 tabular-nums" dir="ltr">
              {safeI5Value} {safeI5Unit}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>حداکثر جریان خروجی در اتصال کوتاه (Isc):</span>
            <span className="font-mono text-zinc-400 tabular-nums" dir="ltr">
              {maxIscValue} {maxIscUnit}
            </span>
          </div>
          {state.hasLoad ? (
            <div className="pt-2 mt-2 border-t border-zinc-800/90 space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between text-zinc-300 font-medium">
                <span className="text-emerald-400 font-semibold">تحلیل اثر بارگذاری (Loading Effect):</span>
              </div>
              <div className="flex items-center justify-between text-zinc-400">
                <span>ولتاژ بی‌باری (بدون RL):</span>
                <span className="font-mono text-zinc-200 tabular-nums" dir="ltr">
                  {result.displayVoutNoLoad} V
                </span>
              </div>
              <div className="flex items-center justify-between text-zinc-400">
                <span>افت ولتاژ ناشی از بار (Load Sag):</span>
                <span className="font-mono text-amber-400 font-medium tabular-nums" dir="ltr">
                  -{result.displayLoadSag} V ({result.loadSagPercentage})
                </span>
              </div>
              <div className="flex items-center justify-between text-zinc-400">
                <span>مقاومت معادل موازی (R2 || RL):</span>
                <span className="font-mono text-zinc-200 tabular-nums" dir="ltr">
                  {result.displayR2Effective}
                </span>
              </div>
              <div className="flex items-center justify-between text-zinc-400">
                <span>جریان مصرفی بار فعلی (IL):</span>
                <span className="font-mono text-emerald-400 font-semibold tabular-nums" dir="ltr">
                  {result.displayCurrentLoad}
                </span>
              </div>
            </div>
          ) : null}
        </div>

        <p className="text-[10px] text-zinc-500 leading-relaxed pt-1.5 border-t border-zinc-800/80">
          کشیدن جریان بیشتر از {safeI5Value} {safeI5Unit} باعث افت ولتاژ خروجی می‌شود؛ برای تأمین جریان بالاتر از بافر (Op-Amp) یا رگولاتور استفاده کنید.
        </p>
      </div>
    </div>
  );
});

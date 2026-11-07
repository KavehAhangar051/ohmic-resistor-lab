'use client';

import * as React from 'react';
import { FilterCalculationResult, BodePoint, BodeViewport, BodePlotProjection } from '@/types/passive-filter';
import { formatFrequency, buildBodePlotProjection } from '@/lib/passive-filter-calc';
import { cn } from '@/lib/utils';

interface FilterBodePlotProps {
  result: FilterCalculationResult;
  testFreqHz: number;
  onSelectFrequency?: (freqHz: number) => void;
}

const BODE_VIEWPORT: BodeViewport = {
  width: 640,
  height: 240,
  padLeft: 52,
  padRight: 36,
  padTop: 26,
  padBottom: 34,
};

interface BodeSvgCanvasProps {
  result: FilterCalculationResult;
  projection: BodePlotProjection;
  activePlot: 'magnitude' | 'phase';
  testFreqFmt: { value: string; unit: string };
  onHoverPoint: (pt: BodePoint | null) => void;
}

/**
 * Memoized SVG canvas so hovering across the 81 frequency hit bars only updates
 * the lightweight footer readout without reconciling the entire SVG tree (INP optimization).
 */
const BodeSvgCanvas = React.memo(function BodeSvgCanvas({
  result,
  projection,
  activePlot,
  testFreqFmt,
  onHoverPoint,
}: BodeSvgCanvasProps) {
  const { width, height, padLeft, padTop } = BODE_VIEWPORT;

  const {
    plotWidth,
    plotHeight,
    magPath,
    phasePath,
    decadeTicks,
    magnitudeGrid,
    phaseGrid,
    fcX,
    cutMagY,
    cutPhaseY,
    testX,
    testMagY,
    testPhaseY,
    samples,
  } = projection;

  const testY = activePlot === 'magnitude' ? testMagY : testPhaseY;
  const cutMarkerY = activePlot === 'magnitude' ? cutMagY : cutPhaseY;
  const activeGrid = activePlot === 'magnitude' ? magnitudeGrid : phaseGrid;

  return (
    <div className="overflow-x-auto" dir="ltr">
      <svg
        role="img"
        aria-label={`دیاگرام بُد پاسخ فرکانسی با فرکانس قطع ${result.displayFc} ${result.displayFcUnit}`}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto min-w-[500px] select-none block"
        style={{ direction: 'ltr' }}
      >
        {/* Background Grid */}
        <rect x={padLeft} y={padTop} width={plotWidth} height={plotHeight} fill="#09090b" stroke="#27272a" strokeWidth="1" />

        {/* Horizontal dB or Phase Grid lines */}
        {activeGrid.map((line) => (
          <g key={line.value}>
            <line x1={padLeft} y1={line.y} x2={padLeft + plotWidth} y2={line.y} stroke="#18181b" strokeWidth="1" strokeDasharray="2 4" />
            <text x={padLeft - 8} y={line.y + 3.5} fill="#71717a" fontSize="10" fontFamily="monospace" textAnchor="end">
              {line.label}
            </text>
          </g>
        ))}

        {/* Vertical Frequency Decade Grid Lines */}
        {decadeTicks.map((tick) => (
          <g key={tick.freq}>
            <line x1={tick.x} y1={padTop} x2={tick.x} y2={padTop + plotHeight} stroke="#18181b" strokeWidth="1" strokeDasharray="2 4" />
            <text x={tick.x} y={padTop + plotHeight + 16} fill="#71717a" fontSize="10" fontFamily="monospace" textAnchor="middle">
              {tick.label}
            </text>
          </g>
        ))}

        {/* -3dB Cutoff Threshold Line (Magnitude Mode) */}
        {activePlot === 'magnitude' ? (
          <g>
            <line
              x1={padLeft}
              y1={cutMagY}
              x2={padLeft + plotWidth}
              y2={cutMagY}
              stroke="#f59e0b"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              strokeOpacity="0.75"
            />
            <text x={padLeft + plotWidth - 4} y={cutMagY - 5} fill="#fbbf24" fontSize="9.5" fontFamily="monospace" textAnchor="end">
              -3.0 dB Cutoff Level
            </text>
          </g>
        ) : null}

        {/* Cutoff Frequency Vertical Line (fc) */}
        <line
          x1={fcX}
          y1={padTop}
          x2={fcX}
          y2={padTop + plotHeight}
          stroke="#f59e0b"
          strokeWidth="1.5"
          strokeDasharray="3 3"
        />
        <circle cx={fcX} cy={cutMarkerY} r="4" fill="#f59e0b" />
        <text x={fcX + 6} y={padTop + 14} fill="#fbbf24" fontSize="10" fontFamily="monospace" fontWeight="bold">
          fc: {result.displayFc} {result.displayFcUnit}
        </text>

        {/* Main Response Curve */}
        <path
          d={activePlot === 'magnitude' ? magPath : phasePath}
          fill="none"
          stroke={activePlot === 'magnitude' ? '#10b981' : '#22d3ee'}
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Operating Test Frequency Line & Marker (fin) */}
        <line
          x1={testX}
          y1={padTop}
          x2={testX}
          y2={padTop + plotHeight}
          stroke="#06b6d4"
          strokeWidth="2"
        />
        <circle cx={testX} cy={testY} r="5.5" fill="#06b6d4" stroke="#0e0e11" strokeWidth="2" />
        <text x={testX + 6} y={testY - 8} fill="#22d3ee" fontSize="10.5" fontFamily="monospace" fontWeight="bold">
          {testFreqFmt.value} {testFreqFmt.unit} ({result.gainAtTestDb} dB)
        </text>

        {/* Hover interactive invisible hit bars across points */}
        {samples.map((pt) => (
          <rect
            key={pt.freq}
            x={pt.x - 4}
            y={padTop}
            width={8}
            height={plotHeight}
            fill="transparent"
            className="cursor-crosshair"
            onMouseEnter={() => onHoverPoint(pt)}
            onMouseLeave={() => onHoverPoint(null)}
          />
        ))}
      </svg>
    </div>
  );
});

export const FilterBodePlot = React.memo(function FilterBodePlot({
  result,
  testFreqHz,
}: FilterBodePlotProps) {
  const [activePlot, setActivePlot] = React.useState<'magnitude' | 'phase'>('magnitude');
  const [hoveredPoint, setHoveredPoint] = React.useState<BodePoint | null>(null);

  const projection = React.useMemo(
    () => buildBodePlotProjection(result, testFreqHz, BODE_VIEWPORT),
    [result, testFreqHz]
  );

  const testFreqFmt = React.useMemo(() => formatFrequency(testFreqHz), [testFreqHz]);

  if (!result.isValid || projection.samples.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-6 text-center text-xs text-zinc-500 font-mono">
        برای رسم دیاگرام بُد، مقادیر عددی بزرگتر از صفر برای قطعات فیلتر وارد کنید.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-[#121215] lab-panel p-4 sm:p-5 space-y-3">
      {/* Header and Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800/80 pb-3">
        <div>
          <h2 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
            <span>دیاگرام بُد پاسخ فرکانسی (Bode Plot)</span>
            <span dir="ltr" className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-emerald-950/60 border border-emerald-800/40 text-emerald-400">
              -20 dB/decade
            </span>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5 text-pretty max-w-[65ch]">
            تحلیل لاگاریتمی دامنه بر حسب دسی‌بل و تغییر فاز در گستره ۴ دهه فرکانسی
          </p>
        </div>

        {/* Magnitude vs Phase Toggle */}
        <div
          role="radiogroup"
          aria-label="نمودار دامنه یا فاز"
          className="inline-flex items-center bg-zinc-950 border border-zinc-800 p-0.5 rounded-lg text-xs font-mono"
        >
          <button
            type="button"
            role="radio"
            aria-checked={activePlot === 'magnitude'}
            onClick={() => setActivePlot('magnitude')}
            className={cn(
              'px-3 py-1 rounded-md transition-[color,background-color,transform] duration-200 cursor-pointer active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50',
              activePlot === 'magnitude'
                ? 'bg-zinc-800 text-emerald-400 font-semibold shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            )}
          >
            دامنه (dB)
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={activePlot === 'phase'}
            onClick={() => setActivePlot('phase')}
            className={cn(
              'px-3 py-1 rounded-md transition-[color,background-color,transform] duration-200 cursor-pointer active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50',
              activePlot === 'phase'
                ? 'bg-zinc-800 text-cyan-400 font-semibold shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            )}
          >
            فاز (Phase °)
          </button>
        </div>
      </div>

      {/* Memoized Vector SVG Canvas */}
      <BodeSvgCanvas
        result={result}
        projection={projection}
        activePlot={activePlot}
        testFreqFmt={testFreqFmt}
        onHoverPoint={setHoveredPoint}
      />

      {/* Real-time Cursor Readout Footer */}
      <div className="flex flex-wrap items-center justify-between text-xs text-zinc-400 font-mono tabular-nums bg-zinc-950/80 px-3 py-2 rounded-lg border border-zinc-800/80">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-amber-400" />
            <span>فرکانس قطع (fc): <strong className="text-zinc-100" dir="ltr">{result.displayFc} {result.displayFcUnit}</strong></span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-cyan-400" />
            <span>فرکانس تست (fin): <strong className="text-zinc-100" dir="ltr">{testFreqFmt.value} {testFreqFmt.unit}</strong></span>
          </span>
        </div>
        {hoveredPoint ? (
          <div className="text-emerald-400" dir="ltr">
            Hover: {formatFrequency(hoveredPoint.freq).value} {formatFrequency(hoveredPoint.freq).unit} | {hoveredPoint.gainDb} dB | {hoveredPoint.phaseDeg}°
          </div>
        ) : (
          <div className="text-zinc-500">
            تضعیف در تست: <strong className="text-zinc-200">{result.attenuationPct}%</strong> (افت {Math.abs(result.gainAtTestDb)} dB)
          </div>
        )}
      </div>
    </div>
  );
});

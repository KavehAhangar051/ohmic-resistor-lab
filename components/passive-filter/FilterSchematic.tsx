'use client';

import * as React from 'react';
import { FilterState, FilterCalculationResult } from '@/types/passive-filter';
import { getResistorSymbol } from '@/lib/voltage-divider-format';
import { SymbolStandard, SchematicLegendItem } from '../schematic-core/schematic-types';
import { SchematicCard } from '../schematic-core/SchematicCard';
import { SchematicGround } from '../schematic-core/SchematicGround';
import { SchematicTerminalPad } from '../schematic-core/SchematicTerminalPad';
import { SchematicNode } from '../schematic-core/SchematicNode';
import { FilterSeriesElement, FilterShuntElement } from './FilterSchematicElements';

interface FilterSchematicProps {
  state: FilterState;
  result: FilterCalculationResult;
}

const FILTER_LEGEND: SchematicLegendItem[] = [
  { label: 'سیگنال متناوب Vin', color: '#10b981', marker: 'circle', textColor: 'text-zinc-300' },
  { label: 'پروب خروجی فیلتر Vout', color: '#34d399', marker: 'circle', textColor: 'text-emerald-400' },
  { label: 'المان‌های پسیو (R, C, L)', color: '#f59e0b', marker: 'square', textColor: 'text-zinc-300' },
  { label: 'زمین مرجع مدار GND', color: '#71717a', marker: 'circle', textColor: 'text-zinc-400' },
  { label: 'شارش جریان متناوب (AC)', color: '#10b981', marker: 'dash', textColor: 'text-emerald-400' },
];

export const FilterSchematic = React.memo(function FilterSchematic({
  state,
  result,
}: FilterSchematicProps) {
  const [symbolStandard, setSymbolStandard] = React.useState<SymbolStandard>('ieee');
  const [animateFlow, setAnimateFlow] = React.useState<boolean>(true);
  const [hoveredElement, setHoveredElement] = React.useState<string | null>(null);

  const isLowPass = state.type === 'lowpass';
  const isRC = state.topology === 'rc';

  const vinX = 60;
  const seriesX1 = 110;
  const seriesX2 = 210;
  const nodeX = 260;
  const voutX = 370;
  const gndY = 200;
  const lineY = 80;
  const shuntTopY = 100;
  const shuntBottomY = 160;

  const wireColor = '#10b981';
  const returnColor = '#71717a';

  const rUnitText = getResistorSymbol(state.resistanceUnit);
  const rText = `${state.resistance} ${rUnitText}`;
  const cText = `${state.capacitance} ${state.capacitanceUnit}`;
  const lText = `${state.inductance} ${state.inductanceUnit}`;

  const topologyLabel = isRC ? 'RC' : 'RL';
  const passTypeLabel = isLowPass ? 'Low-Pass' : 'High-Pass';

  const title = isLowPass
    ? `شماتیک فیلتر پایین‌گذر پسیو (${topologyLabel} ${passTypeLabel})`
    : `شماتیک فیلتر بالا‌گذر پسیو (${topologyLabel} ${passTypeLabel})`;

  return (
    <SchematicCard
      title={title}
      subtitle="نمای اتصالات المان‌های پسیو، پایانه ورودی سیگنال AC و خروجی تضعیف‌شده"
      svgHeight={240}
      minContentWidth={440}
      symbolStandard={symbolStandard}
      onSymbolStandardChange={setSymbolStandard}
      animateFlow={animateFlow}
      onAnimateFlowChange={setAnimateFlow}
      legendItems={FILTER_LEGEND}
    >
      {({ symbolStandard: std, animateFlow: flow }) => (
        <g>
          {/* 1. AC Input Terminal */}
          <g
            className="cursor-pointer"
            onMouseEnter={() => setHoveredElement('vin')}
            onMouseLeave={() => setHoveredElement(null)}
          >
            <circle cx={vinX} cy={lineY} r="7" fill="#09090b" stroke={wireColor} strokeWidth="2" />
            <path
              d={`M ${vinX - 4} ${lineY} Q ${vinX - 2} ${lineY - 3} ${vinX} ${lineY} T ${vinX + 4} ${lineY}`}
              fill="none"
              stroke={wireColor}
              strokeWidth="1.5"
            />
            <text
              x={vinX - 24}
              y={lineY - 14}
              fill="#34d399"
              fontSize="12"
              fontWeight="bold"
              fontFamily="monospace"
              textAnchor="start"
              style={{ direction: 'ltr', unicodeBidi: 'isolate' }}
            >
              VIN (AC)
            </text>
            <text
              x={vinX - 24}
              y={lineY + 24}
              fill="#a1a1aa"
              fontSize="10"
              fontFamily="monospace"
              textAnchor="start"
              style={{ direction: 'ltr', unicodeBidi: 'isolate' }}
            >
              {state.vinPeak}Vpk
            </text>
          </g>

          {/* Line Vin to Series Component */}
          <line x1={vinX + 8} y1={lineY} x2={seriesX1} y2={lineY} stroke={wireColor} strokeWidth="2.5" strokeLinecap="round" />
          {flow ? (
            <line
              x1={vinX + 8}
              y1={lineY}
              x2={seriesX1}
              y2={lineY}
              stroke="#a7f3d0"
              strokeWidth="2"
              strokeDasharray="3 6"
              className="electron-flow"
            />
          ) : null}

          {/* 2. Series Component */}
          <FilterSeriesElement
            isRC={isRC}
            isLowPass={isLowPass}
            seriesX1={seriesX1}
            seriesX2={seriesX2}
            lineY={lineY}
            wireColor={wireColor}
            rText={rText}
            cText={cText}
            lText={lText}
            symbolStandard={std}
            hoveredElement={hoveredElement}
            animateFlow={flow}
            onHoverElement={setHoveredElement}
          />

          {/* Line from Series to Node */}
          <line x1={seriesX2} y1={lineY} x2={nodeX} y2={lineY} stroke={wireColor} strokeWidth="2.5" strokeLinecap="round" />
          {flow ? (
            <line
              x1={seriesX2}
              y1={lineY}
              x2={nodeX}
              y2={lineY}
              stroke="#a7f3d0"
              strokeWidth="2"
              strokeDasharray="3 6"
              className="electron-flow"
            />
          ) : null}

          {/* 3. Central Junction Node */}
          <SchematicNode cx={nodeX} cy={lineY} color={wireColor} glow={hoveredElement === 'vout'} />

          {/* Line to Output Probe */}
          <line x1={nodeX} y1={lineY} x2={voutX} y2={lineY} stroke={wireColor} strokeWidth="2.5" strokeLinecap="round" />
          {flow ? (
            <line
              x1={nodeX}
              y1={lineY}
              x2={voutX}
              y2={lineY}
              stroke="#a7f3d0"
              strokeWidth="2"
              strokeDasharray="3 6"
              className="electron-flow"
            />
          ) : null}

          {/* 4. Output Probe Terminal */}
          <SchematicTerminalPad
            cx={voutX}
            cy={lineY}
            tag="Vout"
            sublabel={`${result.voutPeak}Vpk (${result.gainAtTestDb}dB)`}
            color="#34d399"
            tagColor="#34d399"
            labelPosition="right"
            glow={hoveredElement === 'vout'}
            onMouseEnter={() => setHoveredElement('vout')}
            onMouseLeave={() => setHoveredElement(null)}
          />

          {/* 5. Shunt Component (to Ground) */}
          <line x1={nodeX} y1={lineY} x2={nodeX} y2={shuntTopY} stroke={wireColor} strokeWidth="2" />
          {flow ? (
            <line
              x1={nodeX}
              y1={lineY}
              x2={nodeX}
              y2={shuntTopY}
              stroke="#a7f3d0"
              strokeWidth="1.5"
              strokeDasharray="3 6"
              className="electron-down"
            />
          ) : null}

          <FilterShuntElement
            isRC={isRC}
            isLowPass={isLowPass}
            nodeX={nodeX}
            shuntTopY={shuntTopY}
            shuntBottomY={shuntBottomY}
            wireColor={wireColor}
            returnColor={returnColor}
            rText={rText}
            cText={cText}
            lText={lText}
            symbolStandard={std}
            hoveredElement={hoveredElement}
            animateFlow={flow}
            onHoverElement={setHoveredElement}
          />

          {/* Line Shunt to Ground */}
          <line x1={nodeX} y1={shuntBottomY} x2={nodeX} y2={gndY} stroke={returnColor} strokeWidth="2" />
          <SchematicGround x={nodeX} y={gndY} color={returnColor} />
        </g>
      )}
    </SchematicCard>
  );
});

'use client';

import * as React from 'react';
import { ResistorItem, ParallelCalculationResult } from '@/types/resistor';
import { SymbolStandard, SchematicLegendItem } from '../schematic-core/schematic-types';
import { SchematicCard } from '../schematic-core/SchematicCard';
import { SchematicTerminals } from './schematic/SchematicTerminals';
import { SchematicBuses } from './schematic/SchematicBuses';
import { SchematicBranch } from './schematic/SchematicBranch';

interface CircuitSchematicProps {
  items: ResistorItem[];
  result: ParallelCalculationResult;
}

const PARALLEL_LEGEND: SchematicLegendItem[] = [
  { label: 'ریل تغذیه A (+)', color: '#10b981', marker: 'circle', textColor: 'text-zinc-300' },
  { label: 'ریل مشترک B (-)', color: '#71717a', marker: 'circle', textColor: 'text-zinc-400' },
  { label: 'شاخه مقاومت', color: '#f59e0b', marker: 'square', textColor: 'text-zinc-300' },
  { label: 'شارش متناسب جریان (I)', color: '#10b981', marker: 'dash', textColor: 'text-emerald-400' },
];

export const CircuitSchematic = React.memo(function CircuitSchematic({
  items,
  result,
}: CircuitSchematicProps) {
  const [symbolStandard, setSymbolStandard] = React.useState<SymbolStandard>('ieee');
  const [animateFlow, setAnimateFlow] = React.useState<boolean>(true);
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  const branchCount = items.length;

  // Geometry calculations (strictly LTR EDA coordinates)
  const terminalX = 58;
  const terminalLeadLength = 16;
  const leftBusX = terminalX + terminalLeadLength; // 74
  const firstBranchX = leftBusX + 52; // 126

  const branchSpacing = branchCount <= 2 ? 112 : branchCount <= 4 ? 104 : 96;
  const lastBranchX = firstBranchX + (branchCount - 1) * branchSpacing;
  const rightBusX = lastBranchX;

  const minContentWidth = Math.max(380, lastBranchX + 80);
  const svgHeight = 216;

  const topBusY = 44;
  const bottomBusY = 168;

  const handleHover = React.useCallback((idx: number | null) => {
    setHoveredIndex(idx);
  }, []);

  return (
    <SchematicCard
      title="شماتیک مدار معادل موازی"
      subtitle="نمای اتصالات موازی پایانه‌ها و توزیع جریان الکتریکی"
      svgHeight={svgHeight}
      minContentWidth={minContentWidth}
      symbolStandard={symbolStandard}
      onSymbolStandardChange={setSymbolStandard}
      animateFlow={animateFlow}
      onAnimateFlowChange={setAnimateFlow}
      legendItems={PARALLEL_LEGEND}
    >
      {({ symbolStandard: std, animateFlow: flow }) => (
        <g>
          {/* Terminals (Node A and Node B) */}
          <SchematicTerminals
            terminalX={terminalX}
            leftBusX={leftBusX}
            topBusY={topBusY}
            bottomBusY={bottomBusY}
          />

          {/* Main Conductor Buses (Top V+ and Bottom Return) */}
          <SchematicBuses
            leftBusX={leftBusX}
            rightBusX={rightBusX}
            topBusY={topBusY}
            bottomBusY={bottomBusY}
            animateFlow={flow}
            isShortCircuit={result.isShortCircuit}
          />

          {/* Parallel Branches */}
          {items.map((item, idx) => (
            <SchematicBranch
              key={item.id}
              item={item}
              idx={idx}
              branchX={firstBranchX + idx * branchSpacing}
              topBusY={topBusY}
              bottomBusY={bottomBusY}
              stats={result.branchStats[idx]}
              isHovered={hoveredIndex === idx}
              symbolStandard={std}
              animateFlow={flow}
              isCircuitShort={result.isShortCircuit}
              onHover={handleHover}
            />
          ))}
        </g>
      )}
    </SchematicCard>
  );
});

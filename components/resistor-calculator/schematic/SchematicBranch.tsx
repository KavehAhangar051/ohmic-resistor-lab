import * as React from 'react';
import { ResistorItem, ParallelBranchStat } from '@/types/resistor';
import { SymbolStandard } from '@/components/schematic-core/schematic-types';
import { RESISTOR_SYMBOL_MAP } from '@/lib/voltage-divider-format';
import { SchematicResistor } from '@/components/schematic-core/SchematicResistor';
import { SchematicNode } from '@/components/schematic-core/SchematicNode';

interface SchematicBranchProps {
  item: ResistorItem;
  idx: number;
  branchX: number;
  topBusY: number;
  bottomBusY: number;
  stats: ParallelBranchStat;
  isHovered: boolean;
  symbolStandard: SymbolStandard;
  animateFlow: boolean;
  isCircuitShort: boolean;
  onHover: (idx: number | null) => void;
}

/**
 * SchematicBranch renders a single parallel circuit branch by composing SchematicResistor
 * and top/bottom SchematicNode solder junctions.
 */
export const SchematicBranch = React.memo(function SchematicBranch({
  item,
  idx,
  branchX,
  topBusY,
  bottomBusY,
  stats,
  isHovered,
  symbolStandard,
  animateFlow,
  isCircuitShort,
  onHover,
}: SchematicBranchProps) {
  const isShort = stats.isShort;
  const resUnitSymbol = RESISTOR_SYMBOL_MAP[item.unit] || item.unit;

  const wireColor = isShort ? '#ef4444' : isHovered ? '#34d399' : '#10b981';
  const returnColor = isShort ? '#ef4444' : isHovered ? '#a1a1aa' : '#71717a';

  return (
    <g>
      <SchematicResistor
        x={branchX}
        topY={topBusY}
        bottomY={bottomBusY}
        bodyTopY={74}
        bodyBottomY={136}
        tag={`R${idx + 1}`}
        valueText={stats.hasValue ? `${item.value} ${resUnitSymbol}` : `— ${resUnitSymbol}`}
        isPlaceholder={!stats.hasValue}
        metricBadge={
          stats.currentShare && !isShort
            ? { text: `I: ${stats.currentShare}`, color: '#34d399', width: 58 }
            : null
        }
        symbolStandard={symbolStandard}
        isHovered={isHovered}
        isShort={isShort}
        animateFlow={animateFlow && !isCircuitShort && stats.hasValue}
        flowStrokeWidth={stats.flowStrokeWidth}
        flowOpacity={stats.flowOpacity}
        flowDuration={stats.animDuration}
        onHover={(hovered) => onHover(hovered ? idx : null)}
      />

      {/* Top and Bottom Bus Solder Junction Nodes */}
      <SchematicNode
        cx={branchX}
        cy={topBusY}
        color={wireColor}
        glow={isHovered}
        className="pointer-events-none"
      />
      <SchematicNode
        cx={branchX}
        cy={bottomBusY}
        color={returnColor}
        className="pointer-events-none"
      />
    </g>
  );
});


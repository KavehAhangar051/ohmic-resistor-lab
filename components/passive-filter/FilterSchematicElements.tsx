'use client';

import * as React from 'react';
import { SymbolStandard } from '../schematic-core/schematic-types';
import { SchematicResistor } from '../schematic-core/SchematicResistor';

interface FilterSeriesElementProps {
  isRC: boolean;
  isLowPass: boolean;
  seriesX1: number;
  seriesX2: number;
  lineY: number;
  wireColor: string;
  rText: string;
  cText: string;
  lText: string;
  symbolStandard: SymbolStandard;
  hoveredElement: string | null;
  animateFlow: boolean;
  onHoverElement: (element: string | null) => void;
}

export const FilterSeriesElement = React.memo(function FilterSeriesElement({
  isRC,
  isLowPass,
  seriesX1,
  seriesX2,
  lineY,
  wireColor,
  rText,
  cText,
  lText,
  symbolStandard,
  hoveredElement,
  animateFlow,
  onHoverElement,
}: FilterSeriesElementProps) {
  const isSeriesResistor = (isRC && isLowPass) || (!isRC && !isLowPass);

  if (isSeriesResistor) {
    return (
      <g
        transform={`translate(${seriesX1 + 10}, ${lineY - 45}) rotate(90, 40, 45)`}
        className="cursor-pointer"
      >
        <SchematicResistor
          x={40}
          topY={5}
          bottomY={85}
          tag="R"
          valueText={rText}
          symbolStandard={symbolStandard}
          isHovered={hoveredElement === 'r'}
          animateFlow={animateFlow}
          onHover={(h) => onHoverElement(h ? 'r' : null)}
        />
      </g>
    );
  }

  if (isRC) {
    return (
      <g
        className="cursor-pointer"
        onMouseEnter={() => onHoverElement('c')}
        onMouseLeave={() => onHoverElement(null)}
      >
        <line x1={seriesX1} y1={lineY} x2={156} y2={lineY} stroke={wireColor} strokeWidth="2" />
        <line x1={156} y1={lineY - 14} x2={156} y2={lineY + 14} stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
        <line x1={164} y1={lineY - 14} x2={164} y2={lineY + 14} stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
        <line x1={164} y1={lineY} x2={seriesX2} y2={lineY} stroke={wireColor} strokeWidth="2" />
        <text
          x={140}
          y={lineY - 20}
          fill="#fbbf24"
          fontSize="11"
          fontWeight="bold"
          fontFamily="monospace"
          style={{ direction: 'ltr' }}
        >
          C ({cText})
        </text>
      </g>
    );
  }

  return (
    <g
      className="cursor-pointer"
      onMouseEnter={() => onHoverElement('l')}
      onMouseLeave={() => onHoverElement(null)}
    >
      <line x1={seriesX1} y1={lineY} x2={135} y2={lineY} stroke={wireColor} strokeWidth="2" />
      <path
        d="M 135 80 A 7 7 0 0 1 149 80 A 7 7 0 0 1 163 80 A 7 7 0 0 1 177 80 A 7 7 0 0 1 191 80"
        fill="none"
        stroke="#f59e0b"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <line x1={191} y1={lineY} x2={seriesX2} y2={lineY} stroke={wireColor} strokeWidth="2" />
      <text
        x={145}
        y={lineY - 18}
        fill="#fbbf24"
        fontSize="11"
        fontWeight="bold"
        fontFamily="monospace"
        style={{ direction: 'ltr' }}
      >
        L ({lText})
      </text>
    </g>
  );
});

interface FilterShuntElementProps {
  isRC: boolean;
  isLowPass: boolean;
  nodeX: number;
  shuntTopY: number;
  shuntBottomY: number;
  wireColor: string;
  returnColor: string;
  rText: string;
  cText: string;
  lText: string;
  symbolStandard: SymbolStandard;
  hoveredElement: string | null;
  animateFlow: boolean;
  onHoverElement: (element: string | null) => void;
}

export const FilterShuntElement = React.memo(function FilterShuntElement({
  isRC,
  isLowPass,
  nodeX,
  shuntTopY,
  shuntBottomY,
  wireColor,
  returnColor,
  rText,
  cText,
  lText,
  symbolStandard,
  hoveredElement,
  animateFlow,
  onHoverElement,
}: FilterShuntElementProps) {
  if (isRC && isLowPass) {
    return (
      <g
        className="cursor-pointer"
        onMouseEnter={() => onHoverElement('c')}
        onMouseLeave={() => onHoverElement(null)}
      >
        <line x1={nodeX} y1={shuntTopY} x2={nodeX} y2={124} stroke={wireColor} strokeWidth="2" />
        <line x1={nodeX - 14} y1={124} x2={nodeX + 14} y2={124} stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
        <line x1={nodeX - 14} y1={132} x2={nodeX + 14} y2={132} stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
        <line x1={nodeX} y1={132} x2={nodeX} y2={shuntBottomY} stroke={returnColor} strokeWidth="2" />
        <text
          x={nodeX + 22}
          y={132}
          fill="#fbbf24"
          fontSize="11"
          fontWeight="bold"
          fontFamily="monospace"
          style={{ direction: 'ltr' }}
        >
          C: {cText}
        </text>
      </g>
    );
  }

  const isShuntResistor = (!isRC && isLowPass) || (isRC && !isLowPass);

  if (isShuntResistor) {
    return (
      <SchematicResistor
        x={nodeX}
        topY={shuntTopY}
        bottomY={shuntBottomY}
        tag="R"
        valueText={rText}
        symbolStandard={symbolStandard}
        isHovered={hoveredElement === 'r'}
        animateFlow={animateFlow}
        onHover={(h) => onHoverElement(h ? 'r' : null)}
      />
    );
  }

  return (
    <g
      className="cursor-pointer"
      onMouseEnter={() => onHoverElement('l')}
      onMouseLeave={() => onHoverElement(null)}
    >
      <line x1={nodeX} y1={shuntTopY} x2={nodeX} y2={108} stroke={wireColor} strokeWidth="2" />
      <path
        d="M 260 108 A 7 7 0 0 1 260 122 A 7 7 0 0 1 260 136 A 7 7 0 0 1 260 150"
        fill="none"
        stroke="#f59e0b"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <line x1={nodeX} y1={150} x2={nodeX} y2={shuntBottomY} stroke={returnColor} strokeWidth="2" />
      <text
        x={nodeX + 22}
        y={132}
        fill="#fbbf24"
        fontSize="11"
        fontWeight="bold"
        fontFamily="monospace"
        style={{ direction: 'ltr' }}
      >
        L: {lText}
      </text>
    </g>
  );
});

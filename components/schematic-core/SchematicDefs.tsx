import * as React from 'react';

interface SchematicDefsProps {
  terminalPulseOrigin?: { x: number; y: number };
}

const DEFAULT_PULSE_ORIGIN = { x: 58, y: 44 } as const;

const STATIC_EDA_DEFS = (
  <>
    {/* Precision CAD Dot Grid */}
    <pattern id="eda-grid" width="16" height="16" patternUnits="userSpaceOnUse">
      <circle cx="8" cy="8" r="0.65" fill="#27272a" />
    </pattern>

    {/* Laboratory Instrument Glow Filters */}
    <filter id="emerald-glow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#10b981" floodOpacity="0.45" />
    </filter>
    <filter id="amber-glow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#f59e0b" floodOpacity="0.45" />
    </filter>
    <filter id="cyan-glow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#06b6d4" floodOpacity="0.55" />
    </filter>
  </>
);

export const SchematicDefs = React.memo(function SchematicDefs({
  terminalPulseOrigin = DEFAULT_PULSE_ORIGIN,
}: SchematicDefsProps) {
  return (
    <defs>
      {STATIC_EDA_DEFS}

      {/* Keyframe Animations for EDA Instrumentation */}
      <style>
        {`
          @keyframes electronFlowRight {
            from { stroke-dashoffset: 24; }
            to { stroke-dashoffset: 0; }
          }
          @keyframes electronFlowDown {
            from { stroke-dashoffset: 24; }
            to { stroke-dashoffset: 0; }
          }
          @keyframes terminalAura {
            0%, 100% { transform: scale(1); opacity: 0.25; }
            50% { transform: scale(1.35); opacity: 0.7; }
          }
          .electron-top {
            animation: electronFlowRight 1.2s linear infinite;
          }
          .electron-down {
            animation: electronFlowDown 1.4s linear infinite;
          }
          .electron-bottom {
            animation: electronFlowRight 1.2s linear infinite;
          }
          .terminal-aura {
            transform-origin: ${terminalPulseOrigin.x}px ${terminalPulseOrigin.y}px;
            animation: terminalAura 2.6s ease-in-out infinite;
          }
          @media (prefers-reduced-motion: reduce) {
            .electron-top,
            .electron-down,
            .electron-bottom,
            .terminal-aura {
              animation: none !important;
              stroke-dasharray: none !important;
            }
          }
        `}
      </style>
    </defs>
  );
});

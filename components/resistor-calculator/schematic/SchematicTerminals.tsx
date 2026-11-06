import * as React from 'react';
import { SchematicTerminalPad } from '@/components/schematic-core/SchematicTerminalPad';

interface SchematicTerminalsProps {
  terminalX: number;
  leftBusX: number;
  topBusY: number;
  bottomBusY: number;
}

/**
 * SchematicTerminals renders the input Node A (+) and return Node B (-) terminal pads
 * by composing the core SchematicTerminalPad component.
 */
export const SchematicTerminals = React.memo(function SchematicTerminals({
  terminalX,
  leftBusX,
  topBusY,
  bottomBusY,
}: SchematicTerminalsProps) {
  return (
    <>
      <SchematicTerminalPad
        cx={terminalX}
        cy={topBusY}
        leadToX={leftBusX}
        leadToY={topBusY}
        tag="A (+)"
        color="#10b981"
        tagColor="#34d399"
        labelPosition="left"
        hasAura={true}
        glow={true}
      />

      <SchematicTerminalPad
        cx={terminalX}
        cy={bottomBusY}
        leadToX={leftBusX}
        leadToY={bottomBusY}
        tag="B (-)"
        color="#71717a"
        tagColor="#a1a1aa"
        labelPosition="left"
        hasAura={false}
        glow={false}
      />
    </>
  );
});


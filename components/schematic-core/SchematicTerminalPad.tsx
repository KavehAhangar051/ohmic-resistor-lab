import * as React from 'react';

export interface SchematicTerminalPadProps {
  cx: number;
  cy: number;
  tag: string;
  sublabel?: string;
  leadToX?: number;
  leadToY?: number;
  color?: string;
  tagColor?: string;
  sublabelColor?: string;
  bgColor?: string;
  borderColor?: string;
  labelPosition?: 'left' | 'right';
  hasAura?: boolean;
  glow?: boolean;
  glowFilterId?: string;
  className?: string;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

interface TerminalPadStyle {
  padBg: string;
  padBorder: string;
  titleColor: string;
  hitX: number;
  leadStartX: number;
  textX: number;
  textAnchor: 'end' | 'start';
}

function resolveTerminalPadStyle(
  color: string,
  labelPosition: 'left' | 'right',
  cx: number,
  bgColor?: string,
  borderColor?: string,
  tagColor?: string
): TerminalPadStyle {
  const isEmerald = color === '#10b981' || color === '#34d399';
  const isLeft = labelPosition === 'left';

  return {
    padBg: bgColor ?? (isEmerald ? '#10231b' : '#18181b'),
    padBorder: borderColor ?? (isEmerald ? '#10b981' : '#52525b'),
    titleColor: tagColor ?? (isEmerald ? '#34d399' : '#a1a1aa'),
    hitX: isLeft ? cx - 80 : cx - 16,
    leadStartX: isLeft ? cx + 7 : cx - 7,
    textX: isLeft ? cx - 20 : cx + 20,
    textAnchor: isLeft ? 'end' : 'start',
  };
}

export const SchematicTerminalPad = React.memo(function SchematicTerminalPad({
  cx,
  cy,
  tag,
  sublabel,
  leadToX,
  leadToY,
  color = '#10b981',
  tagColor,
  sublabelColor = '#a1a1aa',
  bgColor,
  borderColor,
  labelPosition = 'left',
  hasAura = true,
  glow = false,
  glowFilterId = 'url(#emerald-glow)',
  className,
  onMouseEnter,
  onMouseLeave,
}: SchematicTerminalPadProps) {
  const style = resolveTerminalPadStyle(color, labelPosition, cx, bgColor, borderColor, tagColor);
  const hasLead = leadToX !== undefined && leadToY !== undefined;

  return (
    <g className={className} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      <rect
        x={style.hitX}
        y={cy - 16}
        width={96}
        height={34}
        rx={6}
        fill="transparent"
        pointerEvents="all"
      />

      <g className="pointer-events-none">
        <rect
          x={cx - 14}
          y={cy - 14}
          width="28"
          height="28"
          rx="6"
          fill={style.padBg}
          stroke={style.padBorder}
          strokeWidth="1.2"
          strokeOpacity="0.5"
        />

        {hasAura ? (
          <circle cx={cx} cy={cy} r="9.5" fill="none" stroke={color} strokeWidth="1" opacity="0.4">
            <animate attributeName="r" values="8.5;11.5;8.5" dur="2.4s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.6;0.15;0.6" dur="2.4s" repeatCount="indefinite" />
          </circle>
        ) : null}

        <circle
          cx={cx}
          cy={cy}
          r="6.5"
          fill="#09090b"
          stroke={color}
          strokeWidth="2.5"
          filter={glow ? glowFilterId : undefined}
        />
        <circle cx={cx} cy={cy} r="2.5" fill={color} />

        {hasLead ? (
          <line
            x1={style.leadStartX}
            y1={cy}
            x2={leadToX}
            y2={leadToY}
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        ) : null}

        <text
          x={style.textX}
          y={sublabel ? cy - 2 : cy + 4}
          fill={style.titleColor}
          fontSize="12"
          fontWeight="bold"
          fontFamily="monospace"
          textAnchor={style.textAnchor}
          style={{ direction: 'ltr', unicodeBidi: 'isolate' }}
        >
          {tag}
        </text>

        {sublabel ? (
          <text
            x={style.textX}
            y={cy + 13}
            fill={sublabelColor}
            fontSize="10"
            fontFamily="monospace"
            textAnchor={style.textAnchor}
            style={{ direction: 'ltr', unicodeBidi: 'isolate' }}
          >
            {sublabel}
          </text>
        ) : null}
      </g>
    </g>
  );
});

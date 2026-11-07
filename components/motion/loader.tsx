'use client';

import React, { useEffect } from 'react';
import { cn } from '@/lib/utils';

const ASCII_LINE_FRAMES = ['|', '/', '-', '\\'] as const;

export interface AsciiLineLoaderProps {
  size?: number;
  speed?: number;
  label?: string;
  className?: string;
}

/**
 * Monospace ASCII Line Loader cycling through ["|", "/", "-", "\\"].
 */
export function AsciiLineLoader({
  size = 16,
  speed = 0.8,
  label = 'Processing',
  className,
}: AsciiLineLoaderProps): React.JSX.Element {
  const spanRef = React.useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const el = spanRef.current;

    if (!el) return;

    let idx = 0;
    const step = ((speed / ASCII_LINE_FRAMES.length) * 1000) | 0;

    const id = setInterval(() => {
      idx = (idx + 1) & 3;
      el.textContent = ASCII_LINE_FRAMES[idx];
    }, step);

    return () => clearInterval(id);
  }, [speed]);

  return (
    <span
      role="status"
      aria-label={label}
      className={cn('inline-flex items-center justify-center text-foreground', className)}
    >
      <span
        ref={spanRef}
        className="font-mono leading-none tabular-nums inline-block select-none"
        style={{ fontSize: size, lineHeight: 1 }}
      >
        {ASCII_LINE_FRAMES[0]}
      </span>
      <span className="sr-only">{label}</span>
    </span>
  );
}


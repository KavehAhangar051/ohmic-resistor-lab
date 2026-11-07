'use client';

/**
 * @file components/ui/initial-app-loader.tsx
 * @description Pure, minimal full-screen preloader featuring the raw ASCII Line spinner (| / - \).
 */

import React, { useEffect, useState } from 'react';
import { LazyMotion, domAnimation, m, AnimatePresence } from 'motion/react';
import { AsciiLineLoader } from '@/components/motion/loader';

export interface InitialAppLoaderProps {
  enabled?: boolean;
  minDurationMs?: number;
}

const EXIT_TRANSITION = { duration: 0.2, ease: [0.16, 1, 0.3, 1] } as const;
const EXIT_STATE = { opacity: 0 } as const;
const INITIAL_STATE = { opacity: 1 } as const;

/**
 * Clean initial application loader using only the raw ASCII Line animation.
 * Disappears once the page and all assets are fully loaded, with a calibrated minimum
 * duration so the ASCII line animation cycles properly.
 */
export function InitialAppLoader({
  enabled = true,
  minDurationMs = 1100,
}: InitialAppLoaderProps = {}): React.JSX.Element | null {
  const [isLoading, setIsLoading] = useState<boolean>(enabled);

  useEffect(() => {
    if (!enabled) return;

    const startTime = performance.now();
    let timerId: ReturnType<typeof setTimeout> | null = null;

    const finishLoading = () => {
      const elapsed = (performance.now() - startTime) | 0;
      const remaining = minDurationMs > elapsed ? minDurationMs - elapsed : 0;

      timerId = setTimeout(() => {
        setIsLoading(false);
      }, remaining);
    };

    if (document.readyState === 'complete') {
      finishLoading();
    } else {
      window.addEventListener('load', finishLoading, { once: true, passive: true });
    }

    return () => {
      window.removeEventListener('load', finishLoading);

      if (timerId !== null) {
        clearTimeout(timerId);
      }
    };
  }, [enabled, minDurationMs]);

  return (
    <LazyMotion features={domAnimation}>
      <AnimatePresence>
        {isLoading ? (
          <m.div
            id="app-initial-loading-screen"
            initial={INITIAL_STATE}
            exit={EXIT_STATE}
            transition={EXIT_TRANSITION}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 text-zinc-200 select-none pointer-events-none will-change-opacity"
          >
            <AsciiLineLoader size={32} />
          </m.div>
        ) : null}
      </AnimatePresence>
    </LazyMotion>
  );
}

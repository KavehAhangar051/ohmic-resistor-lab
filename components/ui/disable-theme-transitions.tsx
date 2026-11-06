'use client';

import { useEffect } from 'react';

/**
 * Suppresses CSS transitions during theme switches (OS prefers-color-scheme)
 * to avoid smearing transitions across the entire DOM tree per better-ui.
 */
export function DisableThemeTransitions() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mql = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = () => {
      const style = document.createElement('style');
      style.append(
        document.createTextNode(
          '*,*::before,*::after{transition:none !important}'
        )
      );
      document.head.append(style);

      // Force synchronous reflow so theme colors commit without triggering transitions
      const _flushReflow = document.body.offsetHeight;
      void _flushReflow;

      requestAnimationFrame(() => {
        requestAnimationFrame(() => style.remove());
      });
    };

    mql.addEventListener('change', handleChange);

    return () => mql.removeEventListener('change', handleChange);
  }, []);

  return null;
}

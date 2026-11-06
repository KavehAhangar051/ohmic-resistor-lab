/**
 * @file lib/ease.ts
 * @description Standardized Motion Design tokens and easing curves (Corporate & Technical Archetype).
 */

export const EASE_OUT = [0.16, 1, 0.3, 1] as const;
export const EASE_IN_OUT = [0.65, 0, 0.35, 1] as const;

/**
 * Standard industry motion curves per motion-design skill.
 */
export const MOTION_CURVES = {
  /** Snappy / Corporate UI standard (0.2, 0, 0, 1) */
  snappy: [0.2, 0, 0, 1] as const,
  /** Decelerated entrance curve (fast start, gentle landing) */
  decelerate: [0.16, 1, 0.3, 1] as const,
  /** Accelerated exit curve (gentle start, fast departure) */
  accelerate: [0.3, 0, 1, 1] as const,
  /** Smooth on-screen state transitions */
  smooth: [0.4, 0, 0.2, 1] as const,
} as const;

/**
 * Standard duration palette per motion-design skill.
 */
export const MOTION_DURATIONS = {
  /** Instant micro-feedback: tooltips, hover */
  instant: 0.1,
  /** Button press, tap, micro-state change */
  micro: 0.15,
  /** Icon transitions, toggles */
  fast: 0.2,
  /** Card entrance/exit, list rows */
  standard: 0.28,
  /** Modals, dialogs, drawers */
  modal: 0.35,
} as const;


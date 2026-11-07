import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Sanitizes numeric input strings to allow only digits and at most one decimal point.
 */
export function sanitizeNumericInput(val: string): string {
  const [int, ...dec] = val.replace(/[^0-9.]/g, '').split('.');

  return dec.length > 0 ? `${int}.${dec.join('')}` : int;
}


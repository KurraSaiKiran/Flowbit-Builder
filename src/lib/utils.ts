/**
 * utils.ts
 * Shared utility helpers — shadcn convention.
 *
 * cn() merges Tailwind class strings intelligently:
 *   - clsx handles conditionals / arrays / objects
 *   - twMerge resolves conflicting Tailwind utilities (e.g. p-4 vs p-2)
 */
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

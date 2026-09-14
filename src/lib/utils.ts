import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * @function cn
 * @description Utility function for merging Tailwind CSS classes with clsx
 * @param inputs - Array of class values (strings, objects, arrays)
 * @returns Merged and deduplicated Tailwind CSS class string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Utility function to combine class names
 * Filters out falsy values and joins with space
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

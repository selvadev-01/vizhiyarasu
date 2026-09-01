import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind class names, letting later classes win over earlier ones.
 *
 * `clsx` flattens the conditional/array/object forms into a string; `twMerge`
 * then resolves conflicting Tailwind utilities (e.g. `p-6` + `p-0` -> `p-0`)
 * so a caller's `className` can reliably override a component's defaults.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

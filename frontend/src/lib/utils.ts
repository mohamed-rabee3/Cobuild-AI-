import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Detects if a text contains Arabic characters
 * @param text The text to check
 * @returns true if the text contains Arabic characters
 */
export function containsArabic(text: string): boolean {
  if (!text) return false;
  // Arabic Unicode ranges
  const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
  return arabicRegex.test(text);
}

/**
 * Determines the text direction based on content
 * @param text The text to check
 * @returns "rtl" if Arabic is detected, "ltr" otherwise
 */
export function getTextDirection(text: string): "rtl" | "ltr" {
  return containsArabic(text) ? "rtl" : "ltr";
}

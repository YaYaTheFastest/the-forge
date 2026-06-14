import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Strips date prefix (e.g. "2026-04-22 ") and provider suffix (e.g. " — Roy Dean")
 * as well as GB1 curriculum codes (e.g. "GB1-W09-B3 - ") from slugs/filenames
 * so related techniques lists and wikilinks show clean, readable titles.
 */
export function cleanTechniqueDisplayName(input: string): string {
  if (!input) return '';
  return input
    .replace(/^\d{4}-\d{2}-\d{2}\s+/, '')
    .replace(/^GB1-W\d{2}-[A-Z]?\d?\s*[-–—]\s*/i, '')
    .replace(/\s*[—–-]\s+.*$/, '')
    .trim();
}

/**
 * Cross-device safe clipboard copy.
 * Works on iOS Safari (where navigator.clipboard is often unavailable or throws).
 * Falls back to the classic textarea + execCommand pattern.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    // iOS / older Safari fallback
    if (typeof document !== 'undefined') {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      textArea.style.top = '0';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(textArea);
      return ok;
    }
    return false;
  } catch {
    return false;
  }
}

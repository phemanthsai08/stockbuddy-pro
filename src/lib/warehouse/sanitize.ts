/**
 * StockNova — input limits & text sanitization (security + data hygiene).
 * Pure functions only. React and LocalStorage stay out of this file.
 *
 * Why this exists:
 * - LocalStorage apps still need bounds so one paste can't fill disk or UI.
 * - Strip control characters so logs/exports stay readable.
 * - Cap lengths so SKUs, notes, and names stay predictable.
 *
 * This is NOT server auth. For real multi-user systems you still need a backend.
 */

/** Max lengths for free-text warehouse fields (characters). */
export const FIELD_LIMITS = {
  name: 120,
  sku: 40,
  category: 60,
  location: 40,
  supplier: 120,
  party: 120,
  reference: 80,
  notes: 500,
  companyName: 80,
  managerName: 80,
} as const;

/** Hard caps on numeric quantity fields (prevents absurd values / JSON bloat). */
export const QUANTITY_MAX = 1_000_000;
export const PRICE_MAX = 10_000_000;

/**
 * Remove ASCII control chars (except common whitespace we normalize later).
 * Does not HTML-escape — React already escapes text content.
 */
export function stripControlChars(value: string): string {
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "");
}

/**
 * Normalize user text: strip controls, collapse internal whitespace, trim, clamp length.
 */
export function sanitizeText(value: string, maxLen: number): string {
  const cleaned = stripControlChars(value).replace(/\s+/g, " ").trim();
  if (cleaned.length <= maxLen) return cleaned;
  return cleaned.slice(0, maxLen);
}

export function clampNonNegativeInt(value: number, max = QUANTITY_MAX): number {
  if (!Number.isFinite(value) || value < 0) return 0;
  return Math.min(max, Math.round(value));
}

export function clampNonNegativeNumber(value: number, max = PRICE_MAX): number {
  if (!Number.isFinite(value) || value < 0) return 0;
  return Math.min(max, value);
}

export function isOverLength(value: string, max: number): boolean {
  return value.trim().length > max;
}

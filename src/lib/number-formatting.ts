/**
 * Number formatting utilities for HELOC Calculator
 */

/**
 * Format number with commas (e.g., 150000 -> 150,000)
 */
export function formatNumberWithCommas(value: number | string): string {
  if (value === "" || value === null || value === undefined) return "";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "";
  return num.toLocaleString("en-US");
}

/**
 * Remove commas from formatted number string for calculation
 */
export function removeCommas(value: string): string {
  return value.replace(/,/g, "");
}

/**
 * Format currency display (with $ and commas)
 */
export function formatCurrency(value: number | string): string {
  const formatted = formatNumberWithCommas(value);
  return formatted ? `$${formatted}` : "";
}

/**
 * Format percentage display
 */
export function formatPercentage(value: number | string): string {
  const formatted = formatNumberWithCommas(value);
  return formatted ? `${formatted}%` : "";
}

/**
 * Parse formatted number back to number for calculations
 */
export function parseFormattedNumber(value: string): number {
  if (!value || value === "") return 0;
  const cleaned = removeCommas(value);
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

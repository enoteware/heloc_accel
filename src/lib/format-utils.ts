/**
 * Format a number with thousands separators
 * @param value - The number to format
 * @param decimals - Number of decimal places (default: 0)
 * @returns Formatted string with commas
 */
export function formatWithCommas(
  value: number | string | undefined,
  decimals: number = 0,
): string {
  if (value === undefined || value === null || value === "") return "";

  const num = typeof value === "string" ? parseFloat(value) : value;

  if (isNaN(num)) return "";

  // Format the number with the specified decimal places
  const formatted = num.toFixed(decimals);

  // Add comma separators
  const parts = formatted.split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  return parts.join(".");
}

/**
 * Format currency with dollar sign and commas
 * @param value - The number to format
 * @param showCents - Whether to show cents (default: false)
 * @returns Formatted currency string
 */
export function formatCurrency(
  value: number | string | undefined,
  showCents: boolean = false,
): string {
  if (value === undefined || value === null || value === "") return "";

  const decimals = showCents ? 2 : 0;
  const formatted = formatWithCommas(value, decimals);

  return formatted ? `$${formatted}` : "";
}

/**
 * Parse a formatted number string back to a number
 * @param value - The formatted string to parse
 * @returns The numeric value
 */
export function parseFormattedNumber(value: string): number {
  // Remove all non-numeric characters except decimal point and minus sign
  const cleaned = value.replace(/[^0-9.-]/g, "");
  return parseFloat(cleaned) || 0;
}

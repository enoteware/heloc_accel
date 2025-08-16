/**
 * HELOC Accelerator - Contrast Validation System
 *
 * This module provides automated contrast ratio validation to prevent
 * white-on-white, black-on-black, and other unreadable color combinations.
 *
 * WCAG Guidelines:
 * - AA: 4.5:1 for normal text, 3:1 for large text
 * - AAA: 7:1 for normal text, 4.5:1 for large text
 */

export type WCAGLevel = "AA" | "AAA";
export type TextSize = "normal" | "large";

export interface ContrastResult {
  ratio: number;
  isAccessible: boolean;
  level: WCAGLevel | null;
  recommendation?: string;
}

export interface ColorRGB {
  r: number;
  g: number;
  b: number;
}

/**
 * Converts hex color to RGB values
 */
export function hexToRgb(hex: string): ColorRGB | null {
  const sanitized = hex.replace("#", "");

  if (sanitized.length === 3) {
    const expanded = sanitized
      .split("")
      .map((char) => char + char)
      .join("");
    return hexToRgb("#" + expanded);
  }

  if (sanitized.length !== 6) return null;

  const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(sanitized);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Converts RGB color string to RGB values
 */
export function rgbStringToRgb(rgb: string): ColorRGB | null {
  const match = rgb.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/);
  if (!match) return null;

  return {
    r: parseInt(match[1], 10),
    g: parseInt(match[2], 10),
    b: parseInt(match[3], 10),
  };
}

/**
 * Calculates relative luminance of a color
 * Formula from WCAG 2.1 specification
 */
export function getLuminance(color: ColorRGB): number {
  const { r, g, b } = color;

  const toLinear = (value: number): number => {
    const normalized = value / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : Math.pow((normalized + 0.055) / 1.055, 2.4);
  };

  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

/**
 * Calculates contrast ratio between two colors
 * Returns a value between 1 and 21
 */
export function getContrastRatio(color1: ColorRGB, color2: ColorRGB): number {
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);

  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);

  return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * Validates contrast ratio against WCAG standards
 */
export function validateContrast(
  foreground: string,
  background: string,
  textSize: TextSize = "normal",
  level: WCAGLevel = "AA",
): ContrastResult {
  // Convert colors to RGB
  const fg = foreground.startsWith("#")
    ? hexToRgb(foreground)
    : rgbStringToRgb(foreground);
  const bg = background.startsWith("#")
    ? hexToRgb(background)
    : rgbStringToRgb(background);

  if (!fg || !bg) {
    return {
      ratio: 0,
      isAccessible: false,
      level: null,
      recommendation:
        "Invalid color format. Use hex (#ffffff) or rgb(255, 255, 255) format.",
    };
  }

  const ratio = getContrastRatio(fg, bg);

  // WCAG thresholds
  const thresholds = {
    AA: textSize === "large" ? 3 : 4.5,
    AAA: textSize === "large" ? 4.5 : 7,
  };

  const isAccessible = ratio >= thresholds[level];
  const meetsAA = ratio >= thresholds.AA;
  const meetsAAA = ratio >= thresholds.AAA;

  let achievedLevel: WCAGLevel | null = null;
  if (meetsAAA) achievedLevel = "AAA";
  else if (meetsAA) achievedLevel = "AA";

  let recommendation: string | undefined;
  if (!isAccessible) {
    const needed = thresholds[level];
    recommendation =
      `Contrast ratio ${ratio.toFixed(2)}:1 is below ${level} standard (${needed}:1). ` +
      `Consider using darker text on light backgrounds or lighter text on dark backgrounds.`;
  }

  return {
    ratio: Math.round(ratio * 100) / 100,
    isAccessible,
    level: achievedLevel,
    recommendation,
  };
}

/**
 * Pre-validated safe color combinations from the design system
 */
export const SAFE_COMBINATIONS: Record<string, string[]> = {
  // Primary colors
  "primary-500": ["white", "neutral-50", "neutral-100"],
  "primary-600": ["white", "neutral-50", "neutral-100"],
  "primary-700": ["white", "neutral-50", "neutral-100"],
  "primary-800": ["white", "neutral-50", "neutral-100"],
  "primary-900": ["white", "neutral-50", "neutral-100"],

  // Secondary colors
  "secondary-500": ["white", "neutral-50", "neutral-100"],
  "secondary-600": ["white", "neutral-50", "neutral-100"],
  "secondary-700": ["white", "neutral-50", "neutral-100"],
  "secondary-800": ["white", "neutral-50", "neutral-100"],
  "secondary-900": ["white", "neutral-50", "neutral-100"],

  // Neutral backgrounds
  white: [
    "primary-700",
    "primary-800",
    "primary-900",
    "neutral-700",
    "neutral-800",
    "neutral-900",
    "secondary-700",
    "secondary-800",
    "secondary-900",
  ],
  "neutral-50": [
    "primary-700",
    "primary-800",
    "primary-900",
    "neutral-700",
    "neutral-800",
    "neutral-900",
    "secondary-700",
    "secondary-800",
    "secondary-900",
  ],
  "neutral-100": [
    "primary-700",
    "primary-800",
    "primary-900",
    "neutral-700",
    "neutral-800",
    "neutral-900",
    "secondary-700",
    "secondary-800",
    "secondary-900",
  ],
  "neutral-200": [
    "primary-800",
    "primary-900",
    "neutral-800",
    "neutral-900",
    "secondary-800",
    "secondary-900",
  ],

  // Dark backgrounds
  "neutral-800": ["white", "neutral-50", "neutral-100", "neutral-200"],
  "neutral-900": ["white", "neutral-50", "neutral-100", "neutral-200"],

  // Status colors (safe combinations)
  "red-500": ["white", "neutral-50"],
  "red-600": ["white", "neutral-50"],
  "green-500": ["white", "neutral-50"],
  "green-600": ["white", "neutral-50"],
  "blue-500": ["white", "neutral-50"],
  "blue-600": ["white", "neutral-50"],
  "yellow-500": ["neutral-900", "neutral-800"],
  "yellow-400": ["neutral-900", "neutral-800"],
} as const;

/**
 * Checks if a color combination is pre-validated as safe
 */
export function isSafeCombination(
  background: keyof typeof SAFE_COMBINATIONS,
  foreground: string,
): boolean {
  const safeForgrounds = SAFE_COMBINATIONS[background];
  return safeForgrounds ? safeForgrounds.includes(foreground) : false;
}

/**
 * Gets suggested safe text colors for a given background
 */
export function getSafeTextColors(
  background: keyof typeof SAFE_COMBINATIONS,
): string[] {
  return SAFE_COMBINATIONS[background] || [];
}

/**
 * Validates if a Tailwind class combination is safe
 */
export function validateTailwindCombination(classes: string): {
  isValid: boolean;
  issues: string[];
  suggestions: string[];
} {
  const issues: string[] = [];
  const suggestions: string[] = [];

  // Extract background and text color classes
  const bgMatch = classes.match(/bg-(\w+-\d+|\w+)/g);
  const textMatch = classes.match(/text-(\w+-\d+|\w+)/g);

  if (!bgMatch || !textMatch) {
    return { isValid: true, issues: [], suggestions: [] };
  }

  const bg = bgMatch[0].replace("bg-", "") as keyof typeof SAFE_COMBINATIONS;
  const text = textMatch[0].replace("text-", "");

  // Check for dangerous combinations
  const dangerousCombinations = [
    { bg: "white", text: "white" },
    { bg: "neutral-50", text: "white" },
    { bg: "neutral-100", text: "neutral-100" },
    { bg: "black", text: "black" },
    { bg: "neutral-900", text: "neutral-900" },
  ];

  const isDangerous = dangerousCombinations.some(
    (combo) => bg.includes(combo.bg) && text.includes(combo.text),
  );

  if (isDangerous) {
    issues.push(
      `Dangerous combination: ${bg} background with ${text} text may be unreadable`,
    );
    const safeOptions = getSafeTextColors(bg);
    if (safeOptions.length > 0) {
      suggestions.push(
        `Try these text colors instead: ${safeOptions.join(", ")}`,
      );
    }
  }

  // Check if combination is pre-validated
  if (!isSafeCombination(bg, text)) {
    const safeOptions = getSafeTextColors(bg);
    if (safeOptions.length > 0) {
      suggestions.push(
        `Consider using these tested combinations: ${safeOptions.join(", ")}`,
      );
    }
  }

  return {
    isValid: issues.length === 0,
    issues,
    suggestions,
  };
}

/**
 * Runtime assertion for safe color combinations
 * Throws in development, logs warning in production
 */
export function assertSafeContrast(
  foreground: string,
  background: string,
  context?: string,
): void {
  const result = validateContrast(foreground, background);

  if (!result.isAccessible) {
    const message = `Contrast issue ${context ? `in ${context}` : ""}: ${result.recommendation}`;

    if (process.env.NODE_ENV === "development") {
      throw new Error(message);
    } else {
      console.warn(message);
    }
  }
}

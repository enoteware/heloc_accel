/**
 * TypeScript Types for Contrast-Safe Color System
 *
 * These types enforce safe color combinations at compile time,
 * preventing dangerous combinations like white-on-white.
 */

// Design system color tokens
export type PrimaryColors =
  | "primary-50"
  | "primary-100"
  | "primary-200"
  | "primary-300"
  | "primary-400"
  | "primary-500"
  | "primary-600"
  | "primary-700"
  | "primary-800"
  | "primary-900";

export type SecondaryColors =
  | "secondary-50"
  | "secondary-100"
  | "secondary-200"
  | "secondary-300"
  | "secondary-400"
  | "secondary-500"
  | "secondary-600"
  | "secondary-700"
  | "secondary-800"
  | "secondary-900";

export type NeutralColors =
  | "white"
  | "neutral-50"
  | "neutral-100"
  | "neutral-200"
  | "neutral-300"
  | "neutral-400"
  | "neutral-500"
  | "neutral-600"
  | "neutral-700"
  | "neutral-800"
  | "neutral-900"
  | "black";

export type StatusColors =
  | "red-50"
  | "red-100"
  | "red-500"
  | "red-600"
  | "red-800"
  | "green-50"
  | "green-100"
  | "green-500"
  | "green-600"
  | "green-800"
  | "blue-50"
  | "blue-100"
  | "blue-500"
  | "blue-600"
  | "blue-800"
  | "yellow-50"
  | "yellow-100"
  | "yellow-400"
  | "yellow-500"
  | "yellow-800";

export type AllColors =
  | PrimaryColors
  | SecondaryColors
  | NeutralColors
  | StatusColors;

// Background color types
export type LightBackgrounds =
  | "white"
  | "neutral-50"
  | "neutral-100"
  | "primary-50"
  | "primary-100"
  | "secondary-50"
  | "secondary-100"
  | "red-50"
  | "green-50"
  | "blue-50"
  | "yellow-50";

export type DarkBackgrounds =
  | "neutral-800"
  | "neutral-900"
  | "black"
  | "primary-700"
  | "primary-800"
  | "primary-900"
  | "secondary-700"
  | "secondary-800"
  | "secondary-900";

export type MediumBackgrounds =
  | "primary-500"
  | "primary-600"
  | "secondary-500"
  | "secondary-600"
  | "red-500"
  | "red-600"
  | "green-500"
  | "green-600"
  | "blue-500"
  | "blue-600";

// Safe text colors for each background type
export type SafeTextForLight =
  | "neutral-700"
  | "neutral-800"
  | "neutral-900"
  | "black"
  | "primary-700"
  | "primary-800"
  | "primary-900"
  | "secondary-700"
  | "secondary-800"
  | "secondary-900"
  | "red-800"
  | "green-800"
  | "blue-800"
  | "yellow-800";

export type SafeTextForDark =
  | "white"
  | "neutral-50"
  | "neutral-100"
  | "neutral-200";

export type SafeTextForMedium = "white" | "neutral-50";

// Conditional type for safe text colors based on background
export type SafeTextColor<T extends AllColors> = T extends LightBackgrounds
  ? SafeTextForLight
  : T extends DarkBackgrounds
    ? SafeTextForDark
    : T extends MediumBackgrounds
      ? SafeTextForMedium
      : never;

// Component prop types with enforced contrast safety
export interface ContrastSafeProps<TBg extends AllColors = AllColors> {
  /** Background color - must be from approved color palette */
  backgroundColor: TBg;
  /** Text color - automatically constrained to safe options for the background */
  textColor: SafeTextColor<TBg>;
  /** Optional: Override safety checks (use with caution) */
  unsafe?: boolean;
}

// Button variant types with built-in safe combinations
export type SafeButtonVariant =
  | "safe-primary" // bg-primary-500 text-white
  | "safe-primary-light" // bg-primary-100 text-primary-900
  | "safe-secondary" // bg-secondary-500 text-white
  | "safe-secondary-light" // bg-secondary-100 text-secondary-900
  | "safe-outline" // bg-transparent text-primary-700 border-primary-300
  | "safe-ghost" // bg-transparent text-neutral-700
  | "safe-danger" // bg-red-500 text-white
  | "safe-success"; // bg-green-500 text-white;

// Alert variant types
export type SafeAlertVariant =
  | "safe-alert-info" // bg-blue-50 text-blue-800
  | "safe-alert-success" // bg-green-50 text-green-800
  | "safe-alert-warning" // bg-yellow-50 text-yellow-800
  | "safe-alert-danger"; // bg-red-50 text-red-800

// Badge variant types
export type SafeBadgeVariant =
  | "safe-badge-primary" // bg-primary-100 text-primary-800
  | "safe-badge-secondary" // bg-secondary-100 text-secondary-800
  | "safe-badge-success" // bg-green-100 text-green-800
  | "safe-badge-warning" // bg-yellow-100 text-yellow-800
  | "safe-badge-danger" // bg-red-100 text-red-800
  | "safe-badge-neutral"; // bg-neutral-100 text-neutral-800

// Card variant types
export type SafeCardVariant =
  | "safe-card-light" // bg-white text-neutral-900
  | "safe-card-dark" // bg-neutral-800 text-white
  | "safe-card-primary" // bg-primary-50 text-primary-900
  | "safe-card-secondary"; // bg-secondary-50 text-secondary-900

// Tailwind class name helpers with type safety
export type SafeClassName<TBg extends AllColors> =
  `bg-${TBg} text-${SafeTextColor<TBg>}`;

// Utility type for building safe class combinations
export type SafeCombination = {
  [K in AllColors]: SafeClassName<K>;
};

// Runtime validation result
export interface ContrastValidationResult {
  isValid: boolean;
  ratio: number;
  level: "AA" | "AAA" | null;
  errors: string[];
  suggestions: string[];
}

// Hook return type for useContrastValidation
export interface UseContrastValidationReturn {
  validateCombination: (bg: string, text: string) => ContrastValidationResult;
  getSafeTextColors: (bg: AllColors) => SafeTextColor<typeof bg>[];
  assertSafe: (bg: string, text: string, context?: string) => void;
}

// Props for contrast validation HOC
export interface WithContrastValidationProps {
  /** Enable runtime validation in development */
  validateContrast?: boolean;
  /** Throw errors on validation failure */
  strict?: boolean;
}

// Strict component props that enforce safe colors at compile time
export interface StrictContrastProps {
  /** Use only pre-approved safe variants */
  variant:
    | SafeButtonVariant
    | SafeAlertVariant
    | SafeBadgeVariant
    | SafeCardVariant;
  /** No manual color overrides allowed */
  className?: string;
  /** Disable safety checks only for migration purposes */
  unsafeOverride?: never;
}

// Design system constants as const assertions for better types
export const SAFE_BACKGROUNDS = [
  "white",
  "neutral-50",
  "neutral-100",
  "neutral-800",
  "neutral-900",
  "primary-50",
  "primary-100",
  "primary-500",
  "primary-600",
  "primary-700",
  "primary-800",
  "primary-900",
  "secondary-50",
  "secondary-100",
  "secondary-500",
  "secondary-600",
  "secondary-700",
  "secondary-800",
  "secondary-900",
  "red-50",
  "red-100",
  "red-500",
  "red-600",
  "green-50",
  "green-100",
  "green-500",
  "green-600",
  "blue-50",
  "blue-100",
  "blue-500",
  "blue-600",
  "yellow-50",
  "yellow-100",
  "yellow-400",
] as const;

export const SAFE_TEXT_COLORS = [
  "white",
  "neutral-50",
  "neutral-100",
  "neutral-700",
  "neutral-800",
  "neutral-900",
  "black",
  "primary-700",
  "primary-800",
  "primary-900",
  "secondary-700",
  "secondary-800",
  "secondary-900",
  "red-800",
  "green-800",
  "blue-800",
  "yellow-800",
] as const;

// Type guards for runtime validation
export const isLightBackground = (color: string): color is LightBackgrounds => {
  return [
    "white",
    "neutral-50",
    "neutral-100",
    "primary-50",
    "primary-100",
    "secondary-50",
    "secondary-100",
    "red-50",
    "green-50",
    "blue-50",
    "yellow-50",
  ].includes(color);
};

export const isDarkBackground = (color: string): color is DarkBackgrounds => {
  return [
    "neutral-800",
    "neutral-900",
    "black",
    "primary-700",
    "primary-800",
    "primary-900",
    "secondary-700",
    "secondary-800",
    "secondary-900",
  ].includes(color);
};

export const isMediumBackground = (
  color: string,
): color is MediumBackgrounds => {
  return [
    "primary-500",
    "primary-600",
    "secondary-500",
    "secondary-600",
    "red-500",
    "red-600",
    "green-500",
    "green-600",
    "blue-500",
    "blue-600",
  ].includes(color);
};

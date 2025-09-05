import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Semantic design tokens (use these in components/pages)
        // Use RGB channel variables from themes.css for proper light/dark theming
        border: "rgb(var(--color-border) / <alpha-value>)",
        input: "rgb(var(--color-border) / <alpha-value>)",
        ring: "rgb(var(--color-border-focus) / <alpha-value>)",
        background: "rgb(var(--color-background) / <alpha-value>)",
        foreground: "rgb(var(--color-foreground) / <alpha-value>)",
        card: {
          DEFAULT: "rgb(var(--color-surface) / <alpha-value>)",
          foreground: "rgb(var(--color-foreground) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "rgb(var(--color-surface) / <alpha-value>)",
          foreground: "rgb(var(--color-foreground) / <alpha-value>)",
        },
        primary: {
          // Brand colors from style guide - Blue-Gray palette
          50: "#f0f4f8", // primary-50
          100: "#d9e2ec", // primary-100
          200: "#bcccdc", // primary-200
          300: "#9fb3c8", // primary-300
          400: "#829ab1", // primary-400
          500: "#8095af", // primary-500 - Brand primary color
          600: "#627d98", // primary-600
          700: "#486581", // primary-700
          800: "#334e68", // primary-800
          900: "#00193f", // primary-900 - Navy headers
          DEFAULT: "rgb(var(--color-primary) / <alpha-value>)",
          foreground: "rgb(var(--color-primary-foreground) / <alpha-value>)",
        },
        secondary: {
          // Brand colors from style guide - Coral/Orange palette
          50: "#fff5f0", // secondary-50
          100: "#ffe4d9", // secondary-100
          200: "#ffc9b4", // secondary-200
          300: "#ffac89", // secondary-300 - Primary accent color
          400: "#ff8b66", // secondary-400
          500: "#ff6b42", // secondary-500
          600: "#d94f2a", // secondary-600
          700: "#b33818", // secondary-700
          800: "#8c2a0f", // secondary-800
          900: "#7f433a", // secondary-900 - Deep brown accent
          DEFAULT: "rgb(var(--color-secondary) / <alpha-value>)",
          foreground: "rgb(var(--color-secondary-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "rgb(var(--color-surface-secondary) / <alpha-value>)",
          foreground: "rgb(var(--color-foreground-muted) / <alpha-value>)",
        },
        accent: {
          // Semantic accent tokens used across UI
          DEFAULT: "rgb(var(--color-accent) / <alpha-value>)",
          foreground: "rgb(var(--color-accent-foreground) / <alpha-value>)",
        },
        destructive: {
          DEFAULT: "rgb(var(--color-error) / <alpha-value>)",
          foreground: "rgb(var(--color-error-foreground) / <alpha-value>)",
        },
        success: {
          DEFAULT: "rgb(var(--color-success) / <alpha-value>)",
          foreground: "rgb(var(--color-success-foreground) / <alpha-value>)",
          background: "rgb(var(--color-success-background) / <alpha-value>)",
          border: "rgb(var(--color-success-border) / <alpha-value>)",
        },
        warning: {
          DEFAULT: "rgb(var(--color-warning) / <alpha-value>)",
          foreground: "rgb(var(--color-warning-foreground) / <alpha-value>)",
          background: "rgb(var(--color-warning-background) / <alpha-value>)",
          border: "rgb(var(--color-warning-border) / <alpha-value>)",
        },
        info: {
          DEFAULT: "rgb(var(--color-info) / <alpha-value>)",
          foreground: "rgb(var(--color-info-foreground) / <alpha-value>)",
          background: "rgb(var(--color-info-background) / <alpha-value>)",
          border: "rgb(var(--color-info-border) / <alpha-value>)",
        },
        neutral: {
          // Brand neutral colors from style guide
          50: "#fffefe", // neutral-50 - Off-white
          100: "#f8f9fa", // neutral-100 - Light gray
          200: "#e9ecef", // neutral-200 - Borders
          300: "#dee2e6", // neutral-300 - Dividers
          400: "#ced4da", // neutral-400 - Disabled states
          500: "#adb5bd", // neutral-500 - Placeholder text
          600: "#80828e", // neutral-600 - Secondary text
          700: "#495057", // neutral-700 - Body text
          800: "#343a40", // neutral-800 - Headers
          900: "#212529", // neutral-900 - Primary text
        },
        // Financial semantic colors
        income: "rgb(var(--color-income) / <alpha-value>)",
        expense: "rgb(var(--color-expense) / <alpha-value>)",
        savings: "rgb(var(--color-savings) / <alpha-value>)",
        debt: "rgb(var(--color-debt) / <alpha-value>)",
        // Chart colors
        chart: {
          primary: "rgb(var(--color-chart-primary) / <alpha-value>)",
          secondary: "rgb(var(--color-chart-secondary) / <alpha-value>)",
          tertiary: "rgb(var(--color-chart-tertiary) / <alpha-value>)",
          quaternary: "rgb(var(--color-chart-quaternary) / <alpha-value>)",
          quinary: "rgb(var(--color-chart-quinary) / <alpha-value>)",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        mono: ["JetBrains Mono", "Fira Code", "Consolas", "monospace"],
      },
      fontSize: {
        // Typography scale from style guide
        display: ["3.5rem", { lineHeight: "1.1", fontWeight: "700" }], // 56px
        h1: ["3rem", { lineHeight: "1.2", fontWeight: "700" }], // 48px
        h2: ["2.25rem", { lineHeight: "1.3", fontWeight: "600" }], // 36px
        h3: ["1.875rem", { lineHeight: "1.3", fontWeight: "600" }], // 30px
        h4: ["1.5rem", { lineHeight: "1.4", fontWeight: "600" }], // 24px
        h5: ["1.25rem", { lineHeight: "1.4", fontWeight: "500" }], // 20px
        h6: ["1.125rem", { lineHeight: "1.4", fontWeight: "500" }], // 18px
        "body-lg": ["1.125rem", { lineHeight: "1.6", fontWeight: "400" }], // 18px
        body: ["1rem", { lineHeight: "1.6", fontWeight: "400" }], // 16px
        "body-sm": ["0.875rem", { lineHeight: "1.5", fontWeight: "400" }], // 14px
        caption: ["0.75rem", { lineHeight: "1.4", fontWeight: "400" }], // 12px
      },
      spacing: {
        // 8px grid system from style guide
        xs: "0.25rem", // 4px
        sm: "0.5rem", // 8px
        md: "1rem", // 16px
        lg: "1.5rem", // 24px
        xl: "2rem", // 32px
        "2xl": "2.5rem", // 40px
        "3xl": "3rem", // 48px
        "4xl": "4rem", // 64px
        "5xl": "5rem", // 80px
        "6xl": "6rem", // 96px
      },
      maxWidth: {
        "container-sm": "640px",
        "container-md": "768px",
        "container-lg": "1024px",
        "container-xl": "1280px",
        "container-2xl": "1536px",
      },
      borderRadius: {
        // Border radius from style guide
        sm: "0.25rem", // 4px
        md: "0.375rem", // 6px - Default for buttons/inputs
        lg: "0.5rem", // 8px - Default for cards
        xl: "0.75rem", // 12px
        "2xl": "1rem", // 16px
      },
      boxShadow: {
        // Shadow system from style guide
        sm: "0 1px 3px rgba(0, 0, 0, 0.1)",
        md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      },
      animation: {
        // Animation utilities
        "fade-in": "fadeIn 0.2s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;

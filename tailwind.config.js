/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Brand colors from logo analysis
        primary: {
          50: '#f0f4f8',
          100: '#d9e2ec',
          200: '#bcccdc',
          300: '#9fb3c8',
          400: '#829ab1',
          500: '#8095af', // Brand primary from logo
          600: '#627d98',
          700: '#486581',
          800: '#334e68',
          900: '#00193f', // Dark navy from logo
        },
        secondary: {
          50: '#fff4f1',
          100: '#ffe4dc',
          200: '#ffc9b9',
          300: '#ffac89', // Coral from logo
          400: '#ff8f66',
          500: '#ff7043',
          600: '#e55a2b',
          700: '#cc4125',
          800: '#b8321f',
          900: '#7f433a', // Brown from logo
        },
        neutral: {
          50: '#fffefe', // Off-white from logo
          100: '#f7fafc',
          200: '#edf2f7',
          300: '#e2e8f0',
          400: '#cbd5e0',
          500: '#a0aec0',
          600: '#80828e', // Medium gray from logo
          700: '#4a5568',
          800: '#2d3748',
          900: '#1a202c',
        },
        accent: {
          blue: '#85a6cc', // Light blue from logo
          navy: '#053d7d', // Medium blue from logo
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      fontSize: {
        'display': ['3.5rem', { lineHeight: '1.1', fontWeight: '700' }],
        'h1': ['3rem', { lineHeight: '1.2', fontWeight: '700' }],
        'h2': ['2.25rem', { lineHeight: '1.3', fontWeight: '600' }],
        'h3': ['1.875rem', { lineHeight: '1.3', fontWeight: '600' }],
        'h4': ['1.5rem', { lineHeight: '1.4', fontWeight: '600' }],
        'h5': ['1.25rem', { lineHeight: '1.4', fontWeight: '500' }],
        'h6': ['1.125rem', { lineHeight: '1.4', fontWeight: '500' }],
        'body-lg': ['1.125rem', { lineHeight: '1.6', fontWeight: '400' }],
        'body': ['1rem', { lineHeight: '1.6', fontWeight: '400' }],
        'body-sm': ['0.875rem', { lineHeight: '1.5', fontWeight: '400' }],
        'caption': ['0.75rem', { lineHeight: '1.4', fontWeight: '400' }],
      },
      spacing: {
        'xs': '0.25rem', // 4px
        'sm': '0.5rem',  // 8px
        'md': '1rem',    // 16px
        'lg': '1.5rem',  // 24px
        'xl': '2rem',    // 32px
        '2xl': '2.5rem', // 40px
        '3xl': '3rem',   // 48px
        '4xl': '4rem',   // 64px
        '5xl': '5rem',   // 80px
        '6xl': '6rem',   // 96px
      },
      maxWidth: {
        'container-sm': '640px',
        'container-md': '768px',
        'container-lg': '1024px',
        'container-xl': '1280px',
        'container-2xl': '1536px',
      },
      borderRadius: {
        'sm': '0.25rem',
        'md': '0.375rem',
        'lg': '0.5rem',
        'xl': '0.75rem',
        '2xl': '1rem',
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
    },
  },
  plugins: [],
  safelist: [
    // Safe contrast utility classes
    'safe-primary',
    'safe-primary-light',
    'safe-primary-interactive',
    'safe-secondary',
    'safe-secondary-light', 
    'safe-secondary-interactive',
    'safe-neutral-light',
    'safe-neutral-dark',
    'safe-outline-interactive',
    'safe-ghost-interactive',
    'safe-success',
    'safe-success-light',
    'safe-warning',
    'safe-warning-light',
    'safe-danger',
    'safe-danger-light',
    'safe-info',
    'safe-info-light',
    'safe-card-light',
    'safe-card-dark',
    'safe-card-primary',
    'safe-card-secondary',
    'safe-alert-info',
    'safe-alert-success',
    'safe-alert-warning',
    'safe-alert-danger',
    'safe-badge-primary',
    'safe-badge-secondary',
    'safe-badge-success',
    'safe-badge-warning',
    'safe-badge-danger',
    'safe-badge-neutral',
    'safe-input',
    'safe-input-dark',
    'safe-input-error',
    'safe-link',
    'safe-link-light',
    'safe-link-on-dark',
    'text-on-primary',
    'text-on-primary-light',
    'text-on-secondary',
    'text-on-light',
    'text-on-dark',
    'text-on-white',
    'text-on-neutral-50',
    'text-on-neutral-100',
    'text-on-neutral-200',
    'text-on-neutral-800',
    'text-on-neutral-900',
    'text-on-success',
    'text-on-success-light',
    'text-on-warning',
    'text-on-warning-light',
    'text-on-danger',
    'text-on-danger-light',
    'text-on-info',
    'text-on-info-light'
  ],
}

# HELOC Accelerator Design System

A comprehensive design system based on the HELOC Accelerator brand identity, providing consistent visual language and reusable components.

## Overview

This design system is built on the visual identity extracted from the HELOC Accelerator logo, featuring a professional blue-gray primary palette with coral accent colors. It follows accessibility best practices and provides both React components and CSS utilities.

## Brand Colors

### Primary Colors (Blue-Gray)

- **Primary 50**: `#f0f4f8` - Lightest background
- **Primary 500**: `#8095af` - Brand primary (from logo)
- **Primary 900**: `#00193f` - Dark navy (from logo)

### Secondary Colors (Coral/Orange)

- **Secondary 300**: `#ffac89` - Coral accent (from logo)
- **Secondary 900**: `#7f433a` - Brown accent (from logo)

### Neutral Colors

- **Neutral 50**: `#fffefe` - Off-white (from logo)
- **Neutral 600**: `#80828e` - Medium gray (from logo)

## Typography

### Font Family

- **Primary**: Inter (modern, professional, excellent readability)
- **Fallback**: System fonts (-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif)

### Typography Scale

```css
.text-display    /* 56px / 1.1 / 700 */
.text-h1         /* 48px / 1.2 / 700 */
.text-h2         /* 36px / 1.3 / 600 */
.text-h3         /* 30px / 1.3 / 600 */
.text-h4         /* 24px / 1.4 / 600 */
.text-h5         /* 20px / 1.4 / 500 */
.text-h6         /* 18px / 1.4 / 500 */
.text-body-lg    /* 18px / 1.6 / 400 */
.text-body       /* 16px / 1.6 / 400 */
.text-body-sm    /* 14px / 1.5 / 400 */
.text-caption    /* 12px / 1.4 / 400 */
```

## Spacing System

Based on 8px grid system:

- `xs`: 4px
- `sm`: 8px
- `md`: 16px
- `lg`: 24px
- `xl`: 32px
- `2xl`: 40px
- `3xl`: 48px
- `4xl`: 64px
- `5xl`: 80px
- `6xl`: 96px

## Components

### React Components

Import components from the design system:

```tsx
import {
  Button,
  Input,
  Select,
  Checkbox,
  RadioGroup,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  Alert,
} from "@/components/design-system";
```

#### Button

```tsx
<Button variant="primary" size="md">Primary Button</Button>
<Button variant="outline" size="lg">Outline Button</Button>
<Button variant="ghost" loading>Loading Button</Button>
```

**Variants**: `primary`, `secondary`, `outline`, `ghost`, `danger`
**Sizes**: `sm`, `md`, `lg`, `xl`

#### Input

```tsx
<Input
  label="Email Address"
  placeholder="Enter your email"
  helperText="We'll never share your email"
  error="This field is required"
/>
```

#### Card

```tsx
<Card variant="elevated">
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Card content goes here...</p>
  </CardContent>
</Card>
```

**Variants**: `default`, `elevated`, `outlined`

### CSS Utilities

Use pre-built CSS classes for quick styling:

```css
/* Buttons */
.btn-primary     /* Primary button style */
.btn-secondary   /* Secondary button style */
.btn-outline     /* Outline button style */
.btn-sm          /* Small button size */
.btn-lg          /* Large button size */

/* Cards */
.card-default    /* Default card style */
.card-elevated   /* Elevated card with shadow */
.card-outlined   /* Card with prominent border */

/* Badges */
.badge-primary   /* Primary badge */
.badge-success   /* Success badge */
.badge-warning   /* Warning badge */

/* Layout */
.container-lg    /* Large container */
.space-md        /* Medium vertical spacing */
.focus-ring      /* Accessible focus ring */
```

## Accessibility

### WCAG Compliance

- All color combinations meet WCAG AA contrast requirements (4.5:1 minimum)
- Interactive elements have minimum 44px touch targets
- Focus states are clearly visible with 2px ring
- Form labels are properly associated with inputs

### Focus Management

```css
.focus-ring      /* Standard focus ring */
.focus-ring-danger /* Error state focus ring */
```

### Screen Reader Support

```css
.sr-only         /* Screen reader only content */
.skip-link       /* Skip navigation link */
```

## Usage Guidelines

### Color Usage

- Use primary colors for main actions and navigation
- Use secondary colors for accents and highlights
- Use neutral colors for text and backgrounds
- Ensure sufficient contrast for accessibility

### Typography Hierarchy

- Use Display for hero sections and major page titles
- Use H1-H3 for main content hierarchy
- Use H4-H6 for component and section titles
- Use Body variants for content text

### Component Guidelines

- Use primary buttons for main actions
- Use outline buttons for secondary actions
- Use ghost buttons for tertiary actions
- Use cards to group related content
- Use badges for status indicators
- Use alerts for important messages

## Implementation

### Theming and Semantic Tokens

This codebase uses semantic design tokens to support light and dark themes consistently across components.

- Token source: `src/styles/themes.css` defines base (`:root`) and dark (`[data-theme="dark"]`) RGB channel variables like `--color-background`, `--color-foreground`, `--color-primary`, etc.
- Tailwind mapping: `tailwind.config.js` maps utilities to these tokens, e.g. `bg-background`, `text-foreground`, `border-border`, `bg-card`, `text-muted-foreground`, and semantic states `info|success|warning|destructive` including `-foreground`, `-background`, `-border` variants.
- Application: `ThemeProvider` sets both the `dark`/`light` class and `data-theme` attribute so both Tailwind dark variants and CSS variables resolve correctly.

Recommended usage examples:

- Surfaces and text:
  - `bg-background`, `bg-card`, `text-foreground`, `text-foreground-secondary`, `text-foreground-muted`, `border-border`
- Brand and actions:
  - `bg-primary text-primary-foreground`, `bg-secondary text-secondary-foreground`
- Status colors (theme-aware):
  - `text-info`, `bg-info`, `border-info-border`
  - `text-success`, `bg-success`, `border-success-border`
  - `text-warning`, `bg-[rgb(var(--color-warning-background))]`, `border-warning-border`
  - `text-destructive`, `bg-destructive`, `border-[rgb(var(--color-error-border))]`

Migration tips (from Tailwind palette to tokens):

- `text-gray-900` → `text-foreground`
- `text-gray-700` → `text-foreground`
- `text-gray-600` → `text-foreground-secondary`
- `text-gray-500/400` → `text-foreground-muted`
- `bg-white` / `bg-gray-50` → `bg-card` / `bg-muted`
- `border-gray-200` → `border-border`
- `text-blue-600` → `text-info` (or `text-primary` if brand)
- `text-green-600` → `text-success`
- `text-red-600` → `text-destructive`
- `bg-green-50` → `bg-[rgb(var(--color-success-background))]`
- `bg-blue-50` → `bg-info-background`

Notes:

- Prefer semantic tokens over numeric palette classes to ensure proper theming.
- For subtle tinted backgrounds, use `/10` or `/15` opacity on semantic colors, e.g. `bg-secondary/10`.
- If you need a non-exposed token layer, use arbitrary values: `bg-[rgb(var(--color-info-background))]`.

### 1. Import Styles

Add the design system CSS to your main stylesheet:

```css
@import "../styles/design-system.css";
```

### 2. Use Tailwind Classes

The design system extends Tailwind CSS with custom colors and utilities:

```tsx
<div className="bg-primary-50 text-primary-900 p-lg">
  <h1 className="text-h1 text-primary-900">Welcome</h1>
  <p className="text-body text-neutral-700">Content goes here...</p>
</div>
```

### 3. Use React Components

Import and use pre-built components:

```tsx
import { Button, Card, Alert } from "@/components/design-system";

function MyComponent() {
  return (
    <Card>
      <Alert variant="info" title="Information">
        This is an informational message.
      </Alert>
      <Button variant="primary">Take Action</Button>
    </Card>
  );
}
```

## Development

### Adding New Components

1. Create component in `src/components/design-system/`
2. Follow existing patterns for props and styling
3. Export from `src/components/design-system/index.ts`
4. Add documentation and examples to style guide

### Customizing Colors

Update `tailwind.config.js` to modify the color palette:

```js
theme: {
  extend: {
    colors: {
      primary: {
        // Your custom primary colors
      }
    }
  }
}
```

## Resources

- **Style Guide**: `/style-guide` - Interactive component showcase
- **Figma**: [Design System Figma File] (if available)
- **GitHub**: [Repository Link]

## Support

For questions or contributions, please refer to the project documentation or contact the development team.

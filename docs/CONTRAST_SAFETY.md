# HELOC Accelerator: Contrast Safety Guide

This guide ensures you **never** create white-on-white, black-on-black, or other unreadable color combinations in the HELOC Accelerator application.

## 🚨 The Problem We're Solving

Contrast issues make applications unusable for many users and fail WCAG accessibility standards. Common problems include:

- **White text on white backgrounds** (completely invisible)
- **Black text on black backgrounds** (completely invisible)
- **Light gray text on white backgrounds** (poor contrast)
- **Dark text on dark backgrounds** (hard to read)

## ✅ Our Solution: Multi-Layer Protection

We've implemented a comprehensive system to make contrast issues **impossible**:

### 1. **Safe Utility Classes** (`src/styles/contrast-safe.css`)

Use these pre-validated combinations instead of manual color mixing:

```css
/* ✅ SAFE - Use these instead of manual combinations */
.safe-primary          /* bg-primary-500 text-white */
.safe-primary-light     /* bg-primary-100 text-primary-900 */
.safe-secondary         /* bg-secondary-500 text-white */
.safe-neutral-light     /* bg-neutral-50 text-neutral-900 */
.safe-neutral-dark      /* bg-neutral-800 text-white */

/* ❌ DANGEROUS - Avoid these patterns */
.bg-white .text-white   /* Invisible text */
.bg-black .text-black   /* Invisible text */
```

### 2. **TypeScript Type Safety** (`src/types/contrast.ts`)

The type system prevents dangerous combinations at compile time:

```typescript
import { ContrastSafeProps } from "@/types/contrast";

// ✅ SAFE - Types enforce valid combinations
interface ButtonProps extends ContrastSafeProps<"primary-500"> {
  // textColor is automatically constrained to safe options
}

// ❌ COMPILE ERROR - Unsafe combinations won't compile
const BadButton: ContrastSafeProps<"white"> = {
  backgroundColor: "white",
  textColor: "white", // ❌ TypeScript error!
};
```

### 3. **Runtime Validation Hook** (`src/hooks/useContrastValidation.ts`)

For dynamic colors, use the validation hook:

```typescript
import { useContrastValidation } from "@/hooks/useContrastValidation";

function DynamicComponent({ bgColor, textColor }) {
  const { validateCombination, assertSafe } = useContrastValidation();

  // ✅ Validate before applying
  const result = validateCombination(bgColor, textColor);
  if (!result.isValid) {
    console.warn("Contrast issue:", result.errors);
  }

  // ✅ Or assert safety (throws in development)
  assertSafe(bgColor, textColor, "DynamicComponent");
}
```

### 4. **ESLint Rules** (Automatic)

ESLint catches dangerous patterns in your JSX:

```jsx
// ❌ ESLint ERROR - Will be caught before commit
<div className="bg-white text-white">
  Invisible text
</div>

// ✅ ESLint PASSES - Safe combination
<div className="safe-neutral-light">
  Readable text
</div>
```

### 5. **Pre-commit Hooks** (Automatic)

Every commit is automatically scanned for contrast issues:

```bash
# Runs automatically on git commit
🔍 Running pre-commit checks...
Checking for color contrast issues...
✅ No contrast issues found!
```

## 📋 Quick Reference: Safe Combinations

### Buttons

```jsx
// ✅ Always safe
<Button variant="primary">Primary</Button>        // White text on primary-500
<Button variant="secondary">Secondary</Button>    // White text on secondary-500
<Button variant="outline">Outline</Button>        // Primary-700 text on transparent
<Button variant="ghost">Ghost</Button>            // Neutral-700 text on transparent
```

### Cards

```jsx
// ✅ Pre-validated combinations
<Card className="safe-card-light">Light card</Card>     // White bg, dark text
<Card className="safe-card-dark">Dark card</Card>       // Dark bg, white text
<Card className="safe-card-primary">Primary card</Card> // Primary bg, dark text
```

### Alerts

```jsx
// ✅ All WCAG AA compliant
<Alert variant="info">Info message</Alert>        // Blue-50 bg, blue-800 text
<Alert variant="success">Success!</Alert>         // Green-50 bg, green-800 text
<Alert variant="warning">Warning</Alert>          // Yellow-50 bg, yellow-800 text
<Alert variant="danger">Error occurred</Alert>    // Red-50 bg, red-800 text
```

### Custom Components

```jsx
// ✅ Use text-on-* utilities for guaranteed safety
<div className="bg-primary-500 text-on-primary">
  Always readable text
</div>

<div className="bg-white text-on-white">
  Always readable on white
</div>

<div className="bg-neutral-800 text-on-dark">
  Always readable on dark
</div>
```

## 🔧 Tools for Developers

### VS Code Snippets

Add these to your VS Code snippets for quick safe combinations:

```json
{
  "Safe Primary Button": {
    "prefix": "safe-btn-primary",
    "body": "<Button variant=\"primary\">$1</Button>",
    "description": "Safe primary button with guaranteed contrast"
  },
  "Safe Card Light": {
    "prefix": "safe-card-light",
    "body": "<Card className=\"safe-card-light\">$1</Card>",
    "description": "Safe light card with readable text"
  }
}
```

### Testing Commands

```bash
# Check entire codebase for contrast issues
npm run check:contrast

# Run accessibility tests
npm run test:accessibility

# Run all tests including contrast validation
npm test

# Lint with contrast rules
npm run lint
```

### Browser DevTools

Install the axe DevTools extension to catch runtime contrast issues:

1. Install [axe DevTools](https://www.deque.com/axe/devtools/)
2. Open DevTools → axe tab
3. Click "Scan All of My Page"
4. Review contrast violations

## 🛠️ Custom Color Combinations

If you need custom colors not covered by our safe utilities:

### 1. **Use the Validation Function**

```typescript
import { validateContrast } from "@/lib/contrast-validation";

const result = validateContrast("#ffffff", "#000000"); // white text, black bg
if (result.isAccessible) {
  // Safe to use
} else {
  // Try suggestions: result.recommendation
}
```

### 2. **Test Against WCAG Standards**

- **AA Normal Text**: 4.5:1 contrast ratio minimum
- **AA Large Text**: 3:1 contrast ratio minimum
- **AAA Normal Text**: 7:1 contrast ratio minimum
- **AAA Large Text**: 4.5:1 contrast ratio minimum

### 3. **Add to Safe Combinations**

If you find a good combination, add it to `SAFE_COMBINATIONS` in `src/lib/contrast-validation.ts`:

```typescript
export const SAFE_COMBINATIONS = {
  // Add your tested combination
  "custom-blue-500": ["white", "neutral-50"],
  // ...existing combinations
};
```

## 🚫 What NOT to Do

Never use these patterns - they will be caught by our tooling:

```jsx
// ❌ NEVER - Same colors
<div className="bg-white text-white">Invisible</div>
<div className="bg-neutral-100 text-neutral-100">Invisible</div>

// ❌ NEVER - Poor contrast
<div className="bg-neutral-50 text-white">Poor contrast</div>
<div className="bg-yellow-200 text-white">May be unreadable</div>

// ❌ NEVER - Manual dangerous combinations
<div style={{ backgroundColor: 'white', color: 'white' }}>
  Bypasses our protection!
</div>
```

## 🔄 Migration Guide

If you have existing code with contrast issues:

### 1. **Run the Scanner**

```bash
npm run check:contrast
```

### 2. **Fix Critical Errors First**

Replace dangerous combinations with safe utilities:

```jsx
// ❌ Before
<div className="bg-white text-white">

// ✅ After
<div className="safe-neutral-light">
```

### 3. **Update Components**

Use safe variants in your components:

```jsx
// ❌ Before
<Button className="bg-primary-500 text-white">

// ✅ After
<Button variant="primary">
```

### 4. **Test Everything**

```bash
npm run test:accessibility
npm run lint
```

## 📞 Getting Help

If you encounter contrast issues:

1. **Check this guide** for safe alternatives
2. **Run `npm run check:contrast`** to see specific issues
3. **Use the validation utilities** to test combinations
4. **Ask the team** if you need custom color combinations

## 🎯 Success Metrics

You'll know the system is working when:

- ✅ No white-on-white or black-on-black text ever appears
- ✅ All text meets WCAG AA standards (4.5:1 contrast minimum)
- ✅ ESLint catches dangerous combinations before commit
- ✅ Pre-commit hooks prevent contrast issues from reaching main
- ✅ Accessibility tests pass consistently

This system makes it **impossible** to accidentally create unreadable text. Follow the patterns, use the tools, and contrast issues will be a thing of the past!

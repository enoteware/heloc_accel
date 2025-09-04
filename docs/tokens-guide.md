# Tokens + Theming Guide

Purpose: make UI theming consistent, accessible, and easy to maintain across light/dark modes by using semantic tokens and design-system utilities.

## Core Concepts
- Semantic tokens live in `src/styles/themes.css` and Tailwind mappings in `tailwind.config.ts`.
- Always favor semantic utilities over palette scales.
- Prefer design-system classes for common UI patterns.

## Do / Don't
- Do: `text-foreground`, `text-foreground-secondary`, `text-foreground-muted`.
- Do: `bg-card border border-border` for card-like surfaces; `bg-muted` for subdued blocks.
- Do: `btn-primary|btn-outline|btn-ghost|btn-danger` for buttons.
- Do: `input-default` for inputs; use token focus rings (`focus:ring-ring`).
- Do: status tokens: `text-success|warning|destructive|info` and backgrounds via CSS vars.
- Don't: palette classes like `text-gray-600`, `bg-blue-600`, `border-gray-200`, `focus:ring-blue-500` in app/components.

## Common Migrations
- Text: `text-gray-900` → `text-foreground`; `text-gray-600` → `text-foreground-secondary`; `text-gray-500` → `text-foreground-muted`.
- Surfaces: `bg-white` → `bg-card`; `bg-gray-50/100` → `bg-muted` + `border border-border` if separation needed.
- Buttons: `bg-blue-600 text-white` → `btn-primary` or `bg-primary text-primary-foreground`.
- Borders: `border-gray-200/300` → `border-border`.
- Focus: `focus:ring-blue-500` → `focus:ring-ring`.

## Safe Utilities
- Links: `safe-link`.
- Badges: `badge-*` or `safe-badge-*`.
- Alerts: `safe-alert-*` or explicit tokens (example below).

## Inline Token Example
```tsx
<div
  className="rounded-md border border-info-border p-3"
  style={{ backgroundColor: "rgb(var(--color-info-background))" }}
>
  <p className="text-info">Informational message</p>
  <button className="btn-primary">Action</button>
  <button className="btn-ghost">Dismiss</button>
  <a className="safe-link" href="#details">Details</a>
  <span className="badge-success">OK</span>
  <span className="badge-warning">Heads up</span>
  <span className="badge-danger">Error</span>
  <input className="input-default" />
  <div className="focus-within:ring-2 focus-within:ring-ring rounded-md">
    <input className="input-default" />
  </div>
```

## Tailwind v4 Notes
- Avoid `@apply` with variant utilities (e.g., `hover:*`, `focus:*`) in CSS. Use inline utilities in JSX or move to token-based CSS.
- Use `@tailwindcss/postcss` in `postcss.config.js` (already configured).

## Validation
- Run `npm run check:tokens` to catch palette utilities.
- Verify light/dark visually; check hover/focus/disabled/error states.


# Theming + Semantic Tokens Audit Tracker

Goal: Ensure all UI uses semantic tokens and supports light/dark via CSS variables defined in `src/styles/themes.css` and Tailwind mappings in `tailwind.config.js`.

## Principles
- Single source of truth: use `rgb(var(--color-...))` variables and Tailwind semantic colors (`bg-background`, `text-foreground`, etc.).
- No palette classes (e.g., `text-gray-600`, `bg-blue-600`) in app/components.
- Prefer design‑system utilities: `btn-*`, `card-*`, `alert-*`, `safe-*` utilities.
- Dark mode handled by tokens; avoid `.dark` overrides unless token gaps exist.

## Quick Migration Map
- Text: `text-gray-900` → `text-foreground`; `text-gray-600` → `text-foreground-secondary`; `text-gray-500` → `text-foreground-muted`
- Surfaces: `bg-white` → `bg-card`; `bg-gray-50/100` → `bg-muted`; add `border border-border` for separation
- Primary CTA: `bg-blue-600 text-white` → `btn-primary` or `bg-primary text-primary-foreground`
- Borders: `border-gray-200/300` → `border-border`
- Focus: `focus:ring-blue-500` → `focus:ring-ring`
- Alerts: use `safe-alert-*` or tokens (`--color-*-background/border`)

## Status Summary
- Theme infra: in place (`darkMode: "class"`, `ThemeProvider`, `themes.css`).
- Refactors done:
  - [x] `src/styles/dark-mode.css` → token‑based utilities
  - [x] `src/styles/contrast-safe.css` → token‑based utilities
  - [x] `src/app/auth/error/page.tsx` → semantic tokens + design-system buttons
  - [x] `src/app/shared/[token]/page.tsx` → semantic tokens + design-system buttons
  - [x] `src/app/auth-test/page.tsx` → semantic “safe” utilities
  - [x] `src/app/admin/layout.tsx` → `bg-background`
  - [x] `src/components/ConfirmationModals.tsx` → success tokens + semantic text
  - [x] Tailwind v4 migration (Tailwind 4.1.x + `@tailwindcss/postcss`, ESM `tailwind.config.ts`, removed deprecated `safelist` option)

Notes:
- Tailwind v4 uses `@tailwindcss/postcss` in `postcss.config.js`.
- Avoid `@apply` with custom class names or variant utilities; prefer inline utilities or token-based CSS.

## High-Priority TODO (by file, palette utility count)
- [x] `src/components/PrintableReport.tsx` (72) (done)
- [ ] `src/app/[locale]/style-guide/page.tsx` (70)
- [x] `src/components/CalculatorForm.tsx` (66) (done)
- [x] `src/components/LiveCalculatorForm.tsx` (64) (done)
- [x] `src/app/[locale]/compare/page.tsx` (49) (done)
- [x] `src/app/admin/documents/page.tsx` (45) (done)
- [ ] `src/app/admin/_components/AgentForm.tsx` (42)
- [x] `src/components/FastCalculatorForm.tsx` (38) (done)
- [x] `src/app/admin/company/page.tsx` (35) (done)
- [x] `src/components/budgeting/BudgetSummary.tsx` (34) (done)
- [x] `src/app/admin/assignments/page.tsx` (33) (done)
 - [x] `src/app/[locale]/storage-test/page.tsx` (33)
 - [x] `src/app/admin/agents/page.tsx` (30)
- [x] `src/components/LiveResultsPanel.tsx` (29) (done)
 - [x] `src/app/demo/aceternity/page.tsx` (26)
- [x] `src/app/admin/page.tsx` (25) (done)
- [x] `src/components/DebugLogViewer.tsx` (24) (done)
- [x] `src/app/admin/photos/page.tsx` (23) (done)
- [x] `src/app/[locale]/budgeting/page.tsx` (22) (done)
 - [x] `src/components/HighlightComponents.tsx` (20)
 - [x] `src/app/[locale]/calculator/page.tsx` (19)
- [ ] `src/app/[locale]/profile/page.tsx` (17)

Note: Full list continues; see rg summary to prioritize after these.

## Hex Color Usage (non-tests)
Keep or parameterize as needed (PDF/print may remain light‑mode):
- [ ] `src/lib/print-utils.ts` (42)
- [ ] `src/app/[locale]/style-guide/page.tsx` (31)
- [ ] `src/lib/pdf-generator.ts` (17)
- [ ] `src/app/api/build-log/route.ts` (15)
- [ ] `src/app/admin/company/page.tsx` (8)
- [ ] `src/components/FastCalculatorForm.tsx` (4)

## Conventions to Apply
- Prefer design system: `btn-*`, `card-*`, `badge-*`, `alert-*`, `input-*` classes from `src/styles/design-system.css`.
- Use safe utilities where applicable: `safe-alert-*`, `safe-badge-*`, `safe-link`, `safe-input*`.
- Inline styles only when Tailwind lacks a token class: `style={{ backgroundColor: "rgb(var(--color-info-background))" }}`.
- Charts/visuals: use chart tokens from `themes.css` (`--color-chart-*`).

See also: `docs/tokens-guide.md` for concise do/don't and examples.

## Validation
- Run visual checks in both themes; toggle via `ThemeProvider` or system preference.
- Check interactive states: hover, focus ring, disabled, error states.
- Verify accessibility tests still pass: `contrast-safe` utilities ensure WCAG AA.

## Next Actions
1) Convert top 10 files in High-Priority list to semantic tokens.
2) Replace remaining palette classes across `src/app/**` and `src/components/**` incrementally.
3) Decide on PDF/print: keep light-only or introduce tokenized variants.

## Assignments

Ownership note: Agent A and Agent C are the same person (me). Tasks under either label refer to the same owner.

Use the conventions above, Tailwind v4 guidance, and this workflow:
- Replace palette classes with semantic tokens and design-system utilities.
- Prefer `btn-*`, `input-default`, `bg-card border border-border`, `text-foreground[-secondary|-muted]`.
- Alerts/info blocks: `safe-alert-*` or inline tokens (e.g., `style={{ backgroundColor: "rgb(var(--color-info-background))" }}` with matching border tokens).
- Avoid `@apply` variant utilities in CSS under Tailwind v4; use inline utilities in JSX or token-based CSS instead.
- Verify: `npm run check:tokens` and build in both themes.

Agent A/C (me):
- [x] `src/components/CalculatorForm.tsx` (done)
- [x] `src/components/LiveCalculatorForm.tsx` (done)
- [x] `src/app/[locale]/compare/page.tsx` (done)
- [x] `src/app/admin/company/page.tsx` (done)
- [x] `src/components/PrintableReport.tsx` (done)
- [ ] Sweep: remove any remaining v4-incompatible CSS variant `@apply` usages (e.g., `hover:bg-muted`) in our CSS utilities.
 - [x] `src/app/admin/page.tsx` (done)
 - [x] `src/app/admin/photos/page.tsx` (done)
 - [x] `src/app/[locale]/budgeting/page.tsx` (done)
 - [x] `src/components/DebugLogViewer.tsx` (done)
 - [x] `src/components/budgeting/BudgetSummary.tsx` (done)
- [x] `src/app/[locale]/calculator/page.tsx` (skeletons/save/footer; remaining palette classes will be addressed as adjacent files migrate)
- [~] `src/components/LiveResultsPanel.tsx` (partial tokenization applied; Agent B (Augment) may reconcile if also editing)
 - [x] `src/app/[locale]/storage-test/page.tsx` (~33): replace gray/yellow/red palette classes; use `bg-card` + semantic texts; buttons to `btn-*`. (done)
 - [x] `src/components/HighlightComponents.tsx` (~20): swap status colors to `success|warning|error|info` tokens, surfaces to `bg-muted/bg-card`. (done)
 - [x] `src/components/DebugInfo.tsx` (~5): use `text-foreground[-secondary]` and `bg-card` for wrappers; links to `safe-link`. (done)
 - [x] `src/components/ValidationErrorDisplay.tsx` (~5): error rows to `text-destructive`, backgrounds/borders to error tokens. (done)

In Progress (Agent A/C):
- [x] `src/components/LiveCalculatorForm.tsx` — finish palette → tokens (verified done)
- [x] `src/components/PrintableReport.tsx` — finish palette → tokens (verified done)
- [ ] Repo-wide palette sweep — run `npm run check:tokens`, fix offenders across `src/app/**` and `src/components/**` (exclude files assigned to B/G unless coordinating).
- [ ] Tailwind v4 cleanup — remove remaining `@apply` variant usages in our CSS utilities; prefer inline utilities or token-based CSS.
- [ ] PDF/print theming plan — decide on light-only vs tokenized variants; prototype tokenized backgrounds/borders in `src/lib/print-utils.ts` and `src/lib/pdf-generator.ts` with safe fallbacks.
- [ ] Calculator UX consistency — ensure `input-default`, focus ring (`ring-ring`), help text, and error styles are consistent across `CalculatorForm`, `LiveCalculatorForm`, and `FastCalculatorForm`.
- [ ] Documentation — add a concise Tokens Guide (do/don't, mappings, examples) to the repo docs; link from tracker.
- [ ] Visual QA — verify forms, tables, and cards in light/dark, focusing on hover/focus/disabled/error states; capture a short issues list.

Agent B (Augment):
- [x] `src/components/FastCalculatorForm.tsx` (~38): swap inputs to `input-default`, replace grays/blues/greens with semantic tokens; use `btn-primary/btn-outline` for actions; convert any `focus:ring-*` to token focus pattern already used. (done)
- [x] `src/components/LiveResultsPanel.tsx` (~29): cards to `bg-card border border-border`, text to `text-foreground` variants, badges to `badge-*` or safe classes. (done)
- [x] `src/app/admin/assignments/page.tsx` (~33): tables to `divide-border bg-card/ bg-muted` headers, buttons to `btn-*`, links to `safe-link`. (done)
- [x] `src/app/admin/documents/page.tsx` (~45): same table/card patterns + semantic tokens. (done)
- [ ] (moved to Agent G) `src/app/admin/_components/AgentForm.tsx` (~42): form controls to `input-default`, labels to `text-foreground-secondary`, errors to `text-destructive`.
 - [x] `src/app/admin/agents/page.tsx` (~30): tables/cards to `bg-card` + `border-border`, headers to `text-foreground`, badges to `badge-*`. (done)
 - [x] `src/app/demo/aceternity/page.tsx` (~26): convert demos to semantic tokens where practical (containers/text/buttons), avoid design shifts. (done)

Nice-to-have (defer or pick up after above):
 - [x] `src/app/demo/aceternity/page.tsx` (~26): demo content; convert to tokens where reasonable. (done)
- [ ] `src/components/budgeting/BudgetSummary.tsx` (~34): cards and status chips to `badge-*` or safe classes.
 - [x] `src/app/[locale]/storage-test/page.tsx` (~33): convert hardcoded palette utilities. (done)
- [ ] `src/app/admin/page.tsx` (~25) and `src/components/DebugLogViewer.tsx` (~24): apply card/table patterns.
- [ ] `src/app/[locale]/style-guide/page.tsx` (~70): leave mostly as-is to showcase raw scales; update container and copy to tokens only.

Agent G (Google):
 - [ ] `src/app/[locale]/profile/page.tsx` (~17): apply `bg-card border border-border` to containers; headings/body to `text-foreground` variants; links to `safe-link`; any buttons to `btn-*`.
 - [x] `src/app/admin/_components/AgentForm.tsx` (~42): form controls to `input-default`, labels to `text-foreground-secondary`, errors to `text-destructive`. (done)
 - [ ] `src/app/[locale]/style-guide/page.tsx` (~70, scoped): keep raw scale examples; only update page container, headings, and descriptive copy to semantic tokens; avoid changing token showcase blocks.
 - [ ] Hex color audit: `src/lib/print-utils.ts` (42), `src/lib/pdf-generator.ts` (17), `src/app/api/build-log/route.ts` (15): parameterize via tokens where feasible or document light-only intent; avoid regressions in PDF/print.

Agent G Guidance:
- Do not edit files assigned to Agent B (Augment); keep scopes disjoint.
- Replace palette utilities (e.g., `text-gray-600`, `bg-blue-600`) with tokens:
  - Text: `text-foreground`, `text-foreground-secondary`, `text-foreground-muted`
  - Status: `text-success|warning|destructive|info` and corresponding backgrounds via CSS vars
  - Surfaces: `bg-card border border-border`, muted blocks: `bg-muted`
  - Buttons: `btn-primary|btn-outline|btn-ghost|btn-danger`
  - Links: `safe-link`
- Avoid `@apply` variant utilities under Tailwind v4; use inline utilities or small token-based CSS.
- Validate with `npm run check:tokens` and scan visually in light/dark.

Validation Checklist (per file):
- [ ] No `bg-<palette>-<shade>`, `text-*`, `border-*` palette utilities remain (run `npm run check:tokens`).
- [ ] All containers use `bg-card` + `border border-border` (where separation is needed).
- [ ] Headings/body copy use `text-foreground` / `text-foreground-secondary` / `text-foreground-muted`.
- [ ] Inputs use `input-default`; error states use `text-destructive` and `border-destructive` (or tokenized focus shadow as in design-system).
- [ ] Buttons use `btn-primary`, `btn-outline`, `btn-ghost`, or `btn-danger`.
- [ ] Alerts and info boxes use `safe-alert-*` or inline `--color-*` background/border tokens.
- [ ] Verify in light/dark mode; ensure readable contrast.

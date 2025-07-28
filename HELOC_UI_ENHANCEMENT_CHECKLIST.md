# 🧮 HELOC Calculator UI Enhancement Checklist

This document outlines front-end UI/UX improvements to enhance the clarity, accessibility, and polish of the HELOC Strategy Calculator form — without changing the form logic or hiding inputs behind steps.

---

## ✅ GOALS
- Improve **readability** for key numeric inputs (e.g., balance, term).
- Add **visual hierarchy** to guide users.
- Support **accessibility** and mobile-friendliness.
- Implement a **progress bar** for completion tracking (non-blocking).

---

## 🎨 VISUAL UPGRADES

### Typography & Font Sizing
- [ ] Increase `font-size` for high-priority fields:
  - `Remaining Term (months)`
  - `Monthly Gross/Net/Discretionary Income`
  - `Current Mortgage Balance`
  - `Current Monthly Payment`
  > Use `font-size: 18px–22px`, `font-weight: 600` for emphasis.
- [ ] Section headers (`h2` or `legend`) should be 1.25–1.5x larger than input labels.

### Input Field Styling
- [ ] Center-align number input values.
- [ ] Add `inputmode="decimal"` or `inputmode="numeric"` where appropriate.
- [ ] Add comma formatting via JS or React binding (`e.g. 150000 -> 150,000`).
- [ ] Placeholder examples:
  - `e.g. $350,000`, `3.5%`, `360`, etc.
- [ ] On focus: subtle input glow (e.g., `box-shadow` or border color highlight).

---

## 🧩 SECTION LAYOUT

### Grouping
- [ ] Wrap each main section in a card-style container with subtle shadow or border-radius.
- [ ] Use alternating background shades to visually break up sections.

### Icons & Tooltips
- [ ] Add info icons (`ℹ️`) beside labels that may need explanation.
  - Example: `HELOC Interest Rate ℹ️ [Tooltip: "Your lender's variable rate. Usually changes monthly."]`

---

## 📊 PROGRESS BAR (Non-linear)

- [ ] Add a horizontal progress bar at the top of the form.
- [ ] Progress updates based on % of **required** fields completed.
- [ ] Consider lightweight libraries like [`nprogress`](https://ricostacruz.com/nprogress/) or implement in React state.
- [ ] Example segments:
  - Mortgage Info (25%)
  - HELOC Info (25%)
  - Income & Expenses (25%)
  - Optional Details (25%)

---

## 📱 MOBILE RESPONSIVENESS

- [ ] Stack all input fields vertically on mobile.
- [ ] Ensure inputs have at least `1rem` vertical spacing.
- [ ] Keep buttons and select arrows tappable (min `44px` height).
- [ ] Pin the **"Calculate HELOC Strategy"** button to bottom of screen on mobile if possible (sticky or fixed).

---

## 💡 USABILITY & FEEDBACK

- [ ] Inline validation feedback:
  - ✅ Green check when valid
  - ❌ Red border + message when invalid
- [ ] Animate "Calculate" button on hover (scale/bounce/fade).
- [ ] On successful form validation, animate scroll to results section.

---

## ⚙️ ACCESSIBILITY

- [ ] Add `aria-label`s and roles for all input fields.
- [ ] Use semantic HTML (`<label for="">`, `<fieldset>`, `<legend>`) where applicable.
- [ ] Support keyboard-only navigation.
- [ ] Contrast ratio of all text: at least **4.5:1**.

---

## OPTIONAL: Aesthetic Enhancements

- [ ] Use soft gradient background (`light blue to white`, or `#f0f4f8`).
- [ ] Drop subtle shadows behind each section block (`box-shadow: 0 2px 8px rgba(0,0,0,0.04)`).
- [ ] Update button to match primary brand color (e.g., gradient or hover effect).

---

## 🧪 TESTING & QA

- [ ] Test in Chrome, Safari, Firefox, Edge (desktop and mobile).
- [ ] Validate with keyboard + screen reader (VoiceOver/NVDA).
- [ ] Test calculation logic to ensure styling did not break form logic.

---

## 🧷 NOTES

- No fields should be hidden behind steps. All fields visible at once.
- Progress bar is **visual only** – not tied to navigation.
- Targeting a balance between modern fintech style and clarity.

---

## Implementation Priority

### Phase 1: Core Visual Improvements (High Priority)
1. Typography & font sizing for key fields
2. Input field styling with comma formatting
3. Section grouping with card containers
4. Mobile responsiveness

### Phase 2: Interactive Features (Medium Priority)
1. Progress bar implementation
2. Icons & tooltips
3. Inline validation feedback
4. Button animations

### Phase 3: Polish & Accessibility (Medium Priority)
1. Full accessibility audit
2. Cross-browser testing
3. Aesthetic enhancements
4. Performance optimization

---

**Related Files:**
- Main calculator form: `src/components/FastCalculatorForm.tsx`
- Design system: `src/components/design-system/`
- Styles: `src/styles/`
# HELOC Accelerator UX Rules

This document defines the user experience guidelines specific to financial applications, with a focus on the HELOC Accelerator's mortgage optimization features.

## Core UX Principles

### 1. Financial Clarity

- Display all monetary values with proper currency formatting ($X,XXX.XX)
- Use consistent decimal places (2 for dollars, 3 for interest rates)
- Clearly distinguish between current values and projections
- Always show calculation dates and assumptions

### 2. Trust and Transparency

- Show calculation methodology when requested
- Provide tooltips explaining financial terms
- Display data sources and last update times
- Include disclaimers for projections and estimates

### 3. Progressive Disclosure

- Start with essential inputs only
- Reveal advanced options as needed
- Group related financial inputs
- Use sensible defaults based on market data

## Input Guidelines

### Financial Input Fields

#### Currency Inputs

- Format as user types: $123,456.78
- Accept common formats: 123456.78, $123,456.78, 123456
- Right-align numeric values
- Show placeholder with format example
- Validate reasonable ranges (e.g., home value $50k-$10M)

#### Percentage Inputs

- Display with % symbol
- Accept both decimal (0.045) and percentage (4.5%) formats
- Show common ranges in helper text
- Limit decimal places to 3

#### Date Inputs

- Use calendar picker for future dates
- Show relative time for recent dates (e.g., "2 months ago")
- Validate logical date sequences

### Form Validation

#### Real-time Validation

- Validate on blur for individual fields
- Show inline error messages
- Use positive reinforcement for valid inputs
- Preserve user input when showing errors

#### Error Messages

- Be specific: "Interest rate must be between 0% and 25%"
- Offer solutions: "Try entering your current mortgage rate"
- Use plain language, avoid technical jargon
- Position errors directly below fields

#### Success States

- Show green checkmark for valid inputs
- Provide confirmation after successful submission
- Auto-save progress indicators
- Clear success messages after actions

## Data Visualization

### Chart Requirements

- Always label axes with units
- Include legends for multiple data series
- Use consistent colors across charts
- Provide data table alternative for accessibility
- Enable hover/tap for detailed values

### Financial Comparisons

- Use side-by-side layouts for A/B comparisons
- Highlight differences prominently
- Show both absolute and percentage differences
- Use green for savings, red for additional costs

### Progress Indicators

- Show loan payoff progress visually
- Display time saved prominently
- Use milestone markers for significant events
- Animate transitions smoothly

## Calculator Specific Rules

### HELOC Calculator Form

#### Input Organization

1. **Basic Information** (Always visible)
   - Current mortgage balance
   - Interest rate
   - Monthly payment
   - Home value

2. **HELOC Details** (Progressive)
   - HELOC limit
   - HELOC interest rate
   - Draw period
   - Repayment period

3. **Financial Situation** (Optional)
   - Monthly income
   - Monthly expenses
   - Additional payments
   - One-time payments

#### Results Display

- Show traditional vs HELOC strategy side-by-side
- Highlight total interest savings
- Display payoff time reduction
- Include monthly payment comparison
- Provide detailed amortization schedule

### Scenario Management

- Auto-save all calculations
- Allow naming and organizing scenarios
- Enable quick comparison between saved scenarios
- Export functionality for reports
- Share scenarios with unique links

## Navigation and Flow

### User Journey

1. **Onboarding**: Brief explanation of HELOC strategy
2. **Data Entry**: Guided form with helpful defaults
3. **Results**: Clear comparison and insights
4. **Actions**: Save, share, or refine calculations
5. **Education**: Access to resources and guides

### Navigation Patterns

- Breadcrumbs for multi-step processes
- Clear back/forward navigation
- Persistent access to saved scenarios
- Quick access to help resources

## Mobile Considerations

### Touch Optimization

- Minimum 48px touch targets
- Adequate spacing between inputs
- Large, easy-to-tap buttons
- Swipe gestures for comparisons

### Responsive Tables

- Horizontal scroll for detailed tables
- Sticky headers and row labels
- Tap to expand row details
- Summary view for mobile

### Input Methods

- Numeric keyboard for financial inputs
- Auto-advance between fields
- Clear "X" button for field clearing
- Voice input support where appropriate

## Accessibility Requirements

### Screen Reader Support

- Descriptive labels for all inputs
- Announce calculation results
- Provide text alternatives for charts
- Logical tab order

### Keyboard Navigation

- All interactive elements keyboard accessible
- Clear focus indicators
- Keyboard shortcuts for common actions
- Skip links for navigation

### Color and Contrast

- Don't rely on color alone
- Maintain WCAG AA contrast ratios
- Provide patterns or icons with colors
- Test with color blindness simulators

## Performance Guidelines

### Loading States

- Show skeleton screens while loading
- Progressive data loading
- Optimistic UI updates
- Cache previous calculations

### Response Times

- Instant field validation (<100ms)
- Quick calculations (<1 second)
- Show progress for longer operations
- Allow cancellation of long processes

## Help and Support

### Contextual Help

- Tooltip icons next to complex fields
- Expandable help sections
- Links to detailed guides
- Video tutorials for complex features

### Error Recovery

- Clear instructions for fixing errors
- Preserve user data during errors
- Offer to restore previous sessions
- Contact support options visible

## Testing Checklist

### Usability Testing

- [ ] First-time user can complete basic calculation
- [ ] Financial terms are understood
- [ ] Results are clear and actionable
- [ ] Saving and sharing work as expected
- [ ] Mobile experience is smooth

### Edge Cases

- [ ] Handles $0 and maximum values
- [ ] Manages decimal precision correctly
- [ ] Validates impossible scenarios
- [ ] Recovers from network errors
- [ ] Preserves data during interruptions

### Accessibility Testing

- [ ] Keyboard navigation complete
- [ ] Screen reader announces properly
- [ ] Color contrast passes WCAG AA
- [ ] Touch targets meet minimum size
- [ ] Focus order is logical

# UI Healing System for HELOC Accelerator

This command analyzes and improves the UI consistency and quality of HELOC Accelerator screens based on the established design system and UX guidelines.

## Step 1: Capture Current UI State

Take screenshots of each screen or component in question using the Playwright MCP tool:

- Calculator form page
- Results display page
- Dashboard view
- Authentication screens (login/register)
- Profile settings
- Any specific components under review

## Step 2: Evaluate Against Standards

Reference the following files in the `/style-guide/` directory:

- `style-guide.md` - Visual design standards based on DESIGN_SYSTEM.md
- `ux-rules.md` - UX guidelines specific to financial applications

Grade each screen/component objectively on a scale of 1 to 10, evaluating:

- **Visual Consistency** (3 points): Adherence to color palette, typography, spacing
- **Component Usage** (2 points): Proper use of design system components
- **Accessibility** (2 points): WCAG compliance, focus states, contrast
- **Financial UX** (2 points): Clear data presentation, input validation, error handling
- **Responsive Design** (1 point): Mobile and desktop optimization

## Step 3: Implement Improvements

For any screens or components scoring less than 8 out of 10:

1. Document specific issues found
2. Make necessary changes to improve the score
3. Re-run Step 1 to verify improvements
4. Continue iterating until all screens score 8 or higher

## Common Issues to Check:

- Inconsistent button styles or sizes
- Missing focus states on interactive elements
- Poor contrast on financial data displays
- Inconsistent spacing between form elements
- Missing or unclear error messages
- Improper use of color for status indicators
- Missing loading states for calculations
- Unclear financial terminology without tooltips

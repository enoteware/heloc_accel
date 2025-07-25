# HELOC Accelerator Style Guide

This style guide defines the visual standards for the HELOC Accelerator application, ensuring consistency across all UI elements and screens.

## Brand Identity

HELOC Accelerator is a professional financial application that helps homeowners optimize their mortgage payoff strategies. The visual design reflects trustworthiness, clarity, and financial sophistication.

## Color Palette

### Primary Colors (Blue-Gray)
- **Primary 50**: `#f0f4f8` - Light backgrounds, subtle highlights
- **Primary 100**: `#d9e2ec` - Secondary backgrounds
- **Primary 200**: `#bcccdc` - Borders, dividers
- **Primary 300**: `#9fb3c8` - Inactive states
- **Primary 400**: `#829ab1` - Secondary text
- **Primary 500**: `#8095af` - Brand primary color
- **Primary 600**: `#627d98` - Hover states
- **Primary 700**: `#486581` - Active states
- **Primary 800**: `#334e68` - Dark text
- **Primary 900**: `#00193f` - Navy headers, primary text

### Secondary Colors (Coral/Orange)
- **Secondary 50**: `#fff5f0` - Light accent backgrounds
- **Secondary 100**: `#ffe4d9` - Highlight backgrounds
- **Secondary 200**: `#ffc9b4` - Success indicators
- **Secondary 300**: `#ffac89` - Primary accent color
- **Secondary 400**: `#ff8b66` - Hover states
- **Secondary 500**: `#ff6b42` - Active accents
- **Secondary 600**: `#d94f2a` - Warning states
- **Secondary 700**: `#b33818` - Error states
- **Secondary 800**: `#8c2a0f` - Dark accents
- **Secondary 900**: `#7f433a` - Deep brown accent

### Neutral Colors
- **Neutral 50**: `#fffefe` - White backgrounds
- **Neutral 100**: `#f8f9fa` - Light gray
- **Neutral 200**: `#e9ecef` - Borders
- **Neutral 300**: `#dee2e6` - Dividers
- **Neutral 400**: `#ced4da` - Disabled states
- **Neutral 500**: `#adb5bd` - Placeholder text
- **Neutral 600**: `#80828e` - Secondary text
- **Neutral 700**: `#495057` - Body text
- **Neutral 800**: `#343a40` - Headers
- **Neutral 900**: `#212529` - Primary text

### Semantic Colors
- **Success**: `#10b981` - Positive outcomes, savings
- **Warning**: `#f59e0b` - Cautions, important notices
- **Error**: `#ef4444` - Errors, negative values
- **Info**: `#3b82f6` - Information, tips

## Typography

### Font Stack
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
```

### Type Scale
- **Display**: 56px / 61.6px line-height / 700 weight
- **H1**: 48px / 57.6px line-height / 700 weight
- **H2**: 36px / 46.8px line-height / 600 weight
- **H3**: 30px / 39px line-height / 600 weight
- **H4**: 24px / 33.6px line-height / 600 weight
- **H5**: 20px / 28px line-height / 500 weight
- **H6**: 18px / 25.2px line-height / 500 weight
- **Body Large**: 18px / 28.8px line-height / 400 weight
- **Body**: 16px / 25.6px line-height / 400 weight
- **Body Small**: 14px / 21px line-height / 400 weight
- **Caption**: 12px / 16.8px line-height / 400 weight

## Spacing System

Based on an 8px grid:
- **xs**: 4px
- **sm**: 8px
- **md**: 16px
- **lg**: 24px
- **xl**: 32px
- **2xl**: 40px
- **3xl**: 48px
- **4xl**: 64px
- **5xl**: 80px
- **6xl**: 96px

## Component Standards

### Buttons

#### Primary Button
- Background: `primary-500`
- Text: white
- Hover: `primary-600`
- Active: `primary-700`
- Disabled: `neutral-400`
- Height: 40px (md), 36px (sm), 48px (lg)
- Padding: 16px horizontal
- Border radius: 6px
- Font weight: 500

#### Secondary Button
- Background: `secondary-300`
- Text: `primary-900`
- Hover: `secondary-400`
- Active: `secondary-500`

#### Outline Button
- Background: transparent
- Border: 2px solid `primary-200`
- Text: `primary-700`
- Hover: `primary-50` background

### Form Elements

#### Input Fields
- Height: 40px
- Border: 1px solid `neutral-300`
- Border radius: 6px
- Padding: 12px
- Focus: 2px ring `primary-500`
- Error: border `error` color
- Background: white
- Placeholder: `neutral-500`

#### Labels
- Font size: 14px
- Font weight: 500
- Color: `neutral-700`
- Margin bottom: 4px

#### Helper Text
- Font size: 12px
- Color: `neutral-600`
- Margin top: 4px

### Cards

#### Default Card
- Background: white
- Border: 1px solid `neutral-200`
- Border radius: 8px
- Padding: 24px
- Shadow: none

#### Elevated Card
- Background: white
- Border: none
- Border radius: 8px
- Padding: 24px
- Shadow: `0 1px 3px rgba(0, 0, 0, 0.1)`

### Financial Data Display

#### Currency Values
- Font: Tabular nums (monospace numbers)
- Positive values: `neutral-900`
- Negative values: `error`
- Savings/gains: `success`
- Font weight: 600 for emphasis

#### Data Tables
- Header background: `neutral-50`
- Header text: `neutral-700`
- Row borders: `neutral-200`
- Alternating rows: `neutral-50`
- Hover: `primary-50`

## Iconography

- Use line icons for consistency
- Icon size: 20px standard, 16px small, 24px large
- Icon color: inherit from text color
- Stroke width: 1.5px

## Accessibility Requirements

### Color Contrast
- Normal text: 4.5:1 minimum
- Large text: 3:1 minimum
- Interactive elements: 3:1 minimum

### Focus States
- 2px solid ring
- Color: `primary-500`
- Offset: 2px
- Never remove focus indicators

### Touch Targets
- Minimum size: 44x44px
- Spacing between targets: 8px minimum

## Motion and Animation

### Transitions
- Duration: 150ms for micro-interactions
- Duration: 200-300ms for larger transitions
- Easing: `cubic-bezier(0.4, 0, 0.2, 1)`

### Loading States
- Use skeleton screens for content loading
- Spinner for actions (primary color)
- Progress bars for multi-step processes

## Responsive Design

### Breakpoints
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

### Mobile Considerations
- Increase touch targets to 48px
- Stack form elements vertically
- Simplify navigation to hamburger menu
- Ensure financial tables are scrollable

## Do's and Don'ts

### Do's
- Use consistent spacing throughout
- Maintain visual hierarchy with typography
- Use semantic colors for financial data
- Provide clear feedback for user actions
- Ensure all text is readable

### Don'ts
- Don't use more than 3 font sizes per screen
- Don't rely on color alone for information
- Don't create custom components when design system components exist
- Don't use shadows excessively
- Don't forget loading and error states
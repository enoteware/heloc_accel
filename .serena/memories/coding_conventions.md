# Coding Conventions & Style Guide

## TypeScript Standards

- **Strict Mode**: Full TypeScript strict mode enabled
- **Type Definitions**: Comprehensive types in `src/lib/types.ts`
- **Interface Naming**: PascalCase for interfaces (e.g., `CalculationInput`)
- **Type Exports**: Export types from dedicated type files
- **Zod Validation**: Runtime type validation for API inputs

## File Naming Conventions

- **Components**: PascalCase (e.g., `CalculatorForm.tsx`)
- **Pages**: lowercase with hyphens (e.g., `page.tsx`)
- **Utilities**: camelCase (e.g., `auth-utils.ts`)
- **Types**: camelCase with `.d.ts` for declarations
- **Tests**: `*.test.ts` or `*.test.tsx`

## Component Structure

```typescript
// Import order: React, Next.js, external libs, internal components, types
import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/design-system";
import { CalculationInput } from "@/lib/types";

// Props interface before component
interface ComponentProps {
  data: CalculationInput;
  onSubmit: (data: CalculationInput) => void;
}

// Default export for pages, named export for components
export default function ComponentName({ data, onSubmit }: ComponentProps) {
  // Component logic
}
```

## API Route Patterns

```typescript
// Standard API route structure
export async function GET(request: Request) {
  try {
    // Validation
    // Business logic
    // Return Response
  } catch (error) {
    // Error handling
  }
}
```

## Error Handling

- **Try-Catch**: Comprehensive error boundaries
- **Error Types**: Custom error classes for different scenarios
- **User-Friendly Messages**: Never expose internal errors to users
- **Logging**: Structured logging with context

## Security Practices

- **Input Sanitization**: All user inputs sanitized
- **SQL Injection Prevention**: Parameterized queries only
- **XSS Protection**: HTML sanitization
- **Rate Limiting**: API endpoint protection
- **Authentication**: Secure session management

## CSS/Styling

- **Tailwind CSS**: Utility-first approach
- **Design System**: Consistent component library
- **Responsive Design**: Mobile-first breakpoints
- **Dark Mode**: Theme-aware components
- **Accessibility**: ARIA labels and semantic HTML

## Testing Conventions

- **Unit Tests**: Jest for business logic
- **Component Tests**: React Testing Library
- **E2E Tests**: Playwright for user flows
- **Test Coverage**: Aim for >80% coverage on critical paths
- **Mock Strategy**: Mock external dependencies

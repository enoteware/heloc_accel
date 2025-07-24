# Codebase Structure

## Root Directory
- `src/` - Main application source code
- `database/` - Database schema and migrations
- `scripts/` - Utility scripts for deployment and database management
- `tests/` - Additional test files
- `docs/` - Documentation
- `deployment/` - Deployment configurations
- `public/` - Static assets

## Source Code Organization (`src/`)

### Application Routes (`src/app/`)
- `page.tsx` - Home page with HELOC introduction
- `calculator/` - Main HELOC calculator interface
- `dashboard/` - User dashboard with saved scenarios
- `profile/` - User profile management
- `auth/` - Authentication pages (signin, error)
- `compare/` - Scenario comparison interface
- `formulas/` - Mathematical formulas documentation
- `api/` - API routes for backend functionality

### API Routes (`src/app/api/`)
- `calculate/` - HELOC calculation endpoints
- `auth/` - Authentication endpoints
- `scenario/` - Scenario CRUD operations
- `profile/` - User profile management
- `health/` - Health check endpoints
- `shared/` - Shared scenario functionality

### Components (`src/components/`)
- `design-system/` - Reusable UI components (Button, Input, Modal, etc.)
- `navigation/` - Navigation components (NavBar, UserMenu, etc.)
- `CalculatorForm.tsx` - Main calculator input form
- `ResultsDisplay.tsx` - Calculation results presentation
- `PayoffChart.tsx` - Mortgage payoff visualization
- `ConfirmationModals.tsx` - User confirmation dialogs

### Core Libraries (`src/lib/`)
- `calculations.ts` - Core HELOC and mortgage calculation logic
- `types.ts` - TypeScript type definitions
- `validation.ts` - Input validation and sanitization
- `database.ts` - Database connection and query utilities
- `auth-utils.ts` - Authentication helper functions
- `error-handling.ts` - Error management and recovery
- `security-headers.ts` - Security middleware
- `rate-limit.ts` - API rate limiting

### Testing (`src/__tests__/`)
- `calculations.test.ts` - Core calculation logic tests
- `auth.test.ts` - Authentication flow tests
- `api.test.ts` - API endpoint tests
- `validation.test.ts` - Input validation tests
- Component-specific test files

## Key Architectural Patterns
- **App Router**: Next.js 13+ file-based routing
- **API Routes**: RESTful API design
- **Component Composition**: Reusable design system
- **Type Safety**: Comprehensive TypeScript usage
- **Error Boundaries**: Graceful error handling
- **Security First**: Input sanitization and validation
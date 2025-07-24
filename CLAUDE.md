# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

HELOC Accelerator is a Next.js 15 financial web application that helps homeowners compare traditional mortgage payoff strategies with HELOC (Home Equity Line of Credit) acceleration strategies. The app features demo mode with local storage, real-time calculations, and interactive visualizations using Recharts.

## Key Commands

### Development
- `npm run dev` - Start development server on http://localhost:3000
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run all tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report (70% threshold required)
- `npm run analyze` - Analyze bundle size

### Database
- Database schema is in `database/schema.sql`
- Uses PostgreSQL in production, local storage in demo mode
- Environment variables needed in `.env.local` (copy from `.env.example`)

## Architecture

### Directory Structure
```
heloc-accelerator/
├── src/
│   ├── app/                 # Next.js App Router pages
│   ├── components/          # React components
│   │   └── design-system/   # Reusable UI components (Button, Card, Input, etc.)
│   ├── lib/                 # Core business logic
│   │   ├── calculations.ts  # HELOC calculation engine
│   │   ├── validation.ts    # Form validation rules
│   │   └── demo-auth.ts     # Demo mode authentication
│   └── hooks/              # Custom React hooks
├── database/               # Database schema
└── public/                # Static assets
```

### Key Technical Details

1. **Authentication Flow**:
   - NextAuth.js with custom demo provider
   - Demo mode stores data in localStorage
   - Production uses PostgreSQL with bcrypt password hashing
   - JWT tokens for session management

2. **Calculation Engine** (`src/lib/calculations.ts`):
   - Core HELOC acceleration logic
   - Handles monthly payment calculations
   - Compares traditional vs HELOC strategies
   - Returns detailed month-by-month breakdowns

3. **Design System**:
   - Located in `src/components/design-system/`
   - Uses Tailwind CSS with custom blue-gray and coral color scheme
   - All components follow consistent patterns with TypeScript interfaces
   - WCAG-compliant with proper ARIA labels

4. **Demo Mode**:
   - Enabled by default (no env config needed)
   - Pre-configured user accounts in `src/lib/demo-auth.ts`
   - Local storage key pattern: `heloc_demo_user_[userId]_scenarios`
   - Sample data prefill in calculator

5. **State Management**:
   - React Context for authentication state
   - Local component state for forms
   - Custom hooks for data fetching (`useScenarios`, `useCalculations`)

## Testing Strategy

- Jest with React Testing Library
- Test files use `.test.ts(x)` or `.spec.ts(x)` suffix
- Located alongside source files or in `__tests__` directories
- Coverage threshold: 70% for all metrics
- Run a single test: `npm test -- path/to/test.spec.ts`

## Deployment

### Standalone Build (Next.js 15)
- The app uses Next.js standalone output mode for optimized deployments
- Build creates a self-contained server at `.next/standalone/server.js`
- Requires copying `.next/static` and `public` folders to standalone directory
- Use `./deploy-standalone.sh` to create a deployment package

### PM2 Configuration
- Uses PM2 process manager with `node .next/standalone/server.js`
- Config in `ecosystem.config.js` (updated for standalone mode)
- Designed for VPS deployment at `/opt/heloc-accelerator/`
- Single instance mode for multi-app servers
- Memory limit: 512MB per instance

### Quick Deployment
```bash
# Build and prepare for deployment
./deploy-standalone.sh

# The deployment directory contains everything needed
cd deployment
./pm2-start.sh  # For PM2
# or
./start.sh      # For direct node
```

## Important Patterns

1. **API Routes**: Located in `src/app/api/` following Next.js 14 conventions
2. **Form Validation**: Uses custom validation in `src/lib/validation.ts`
3. **Error Handling**: Consistent error responses with proper status codes
4. **TypeScript**: Strict mode enabled, use type-safe patterns
5. **Path Aliases**: Use `@/` for imports from `src/` directory
6. **API Routes**: In Next.js 15, params are Promises - use `const { id } = await params`
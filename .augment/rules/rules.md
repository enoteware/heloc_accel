---
type: "manual"
description: "Example description"
---
# Augment Rules for HELOC Accelerator Project

## Project Context
This is a HELOC (Home Equity Line of Credit) accelerator application built with Next.js, TypeScript, and PostgreSQL. The application helps users calculate and optimize their HELOC payments.

## Code Quality and Standards

### TypeScript Enforcement
- All new code must be written in TypeScript with strict type checking
- Use proper type definitions for all function parameters and return values
- Avoid `any` types; use proper interfaces and type unions instead
- Import types using `import type` syntax when importing only types

### Next.js Best Practices
- Use App Router conventions (app/ directory structure)
- Implement proper Server Components vs Client Components patterns
- Use Next.js built-in optimizations (Image, Link, etc.)
- Follow Next.js file naming conventions for routes and API endpoints

### Component Architecture
- Keep components small and focused on single responsibilities
- Use proper prop typing with TypeScript interfaces
- Implement proper error boundaries for client components
- Use React hooks appropriately and avoid unnecessary re-renders

### Database and Security
- Always use parameterized queries to prevent SQL injection
- Implement proper authentication checks for all protected routes
- Validate all user inputs on both client and server side
- Use environment variables for sensitive configuration
- Never commit secrets or API keys to version control

## Financial Calculations
- All financial calculations must be precise using appropriate decimal handling
- Validate all financial inputs for reasonable ranges and formats
- Include proper error handling for edge cases in calculations
- Document complex financial formulas with comments

## Testing Requirements
- Write unit tests for all utility functions and calculations
- Test API endpoints with various input scenarios
- Include integration tests for critical user flows
- Maintain test coverage above 80% for core business logic

## Performance Guidelines
- Optimize database queries and avoid N+1 problems
- Use proper caching strategies for expensive calculations
- Implement loading states for async operations
- Optimize bundle size and use code splitting where appropriate

## Error Handling
- Implement comprehensive error logging and monitoring
- Provide user-friendly error messages
- Handle edge cases gracefully without crashes
- Use proper HTTP status codes for API responses

## Documentation Standards
- Document all public APIs and complex functions
- Include JSDoc comments for TypeScript functions
- Maintain up-to-date README and deployment instructions
- Document environment variables and configuration options

## Git and Deployment
- Use conventional commit messages
- Create feature branches for new development
- Require code review for all changes to main branch
- Run all tests and linting before deployment
- Use proper CI/CD pipelines for automated testing and deployment

## Build Process and Deployment
- **ALWAYS check BUILD_LOG.md before running builds or deployments**
- The BUILD_LOG.md contains:
  - Recent build failures and their resolutions
  - Pre-deployment checklist
  - Common issues and fixes
  - Environment configuration notes
- Run `npm test` and `npm run lint` before every build
- Use `./deploy-standalone.sh` for creating production deployments
- Monitor GitHub Actions for CI/CD status

## File Organization
- Group related components in appropriate directories
- Keep utility functions in the lib/ directory
- Separate business logic from UI components
- Use consistent naming conventions across the codebase

## Accessibility and UX
- Ensure all interactive elements are keyboard accessible
- Use semantic HTML elements appropriately
- Provide proper ARIA labels for screen readers
- Test with various screen sizes and devices
- Implement proper loading and error states

## Environment Management
- Use separate configurations for development, staging, and production
- Validate environment variables on application startup
- Never expose sensitive data to the client side
- Use proper CORS and security headers

## Code Review Guidelines
- Review for security vulnerabilities, especially in financial calculations
- Check for proper error handling and edge cases
- Verify TypeScript types are properly defined
- Ensure tests cover new functionality
- Validate that changes don't break existing functionality



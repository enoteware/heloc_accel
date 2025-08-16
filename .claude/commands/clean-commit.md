# Clean Commit Workflow

A systematic approach to ensure code quality before committing to the main branch.

## Pre-Commit Checklist

1. **Run TypeScript Type Check**

   ```bash
   npm run typecheck
   ```

   - Ensures all TypeScript types are valid
   - Catches type errors before they reach production
   - Note: If typecheck script is not available, the build process includes type checking

2. **Run ESLint**

   ```bash
   npm run lint
   ```

   - Checks code style and potential bugs
   - Ensures consistent code formatting

3. **Run Tests (Optional but Recommended)**

   ```bash
   npm test
   ```

   - Verifies functionality hasn't broken
   - Maintains code reliability

4. **Create Detailed Git Commit Message**
   - Follow conventional commit format: `type(scope): description`
   - Types: feat, fix, docs, style, refactor, test, chore
   - Include:
     - What changed
     - Why it changed
     - Any breaking changes or side effects

   Example:

   ```text
   feat(calculator): add HELOC payment optimization algorithm

   - Implemented new calculation engine for optimal payment strategies
   - Added validation for edge cases in interest calculations
   - Improved performance by 30% through caching

   BREAKING CHANGE: Calculator API now requires helocRate parameter
   ```

5. **Commit and Push to Main Branch**

   ```bash
   git add .
   git commit -m "your detailed message"
   git push origin main
   ```

   - Stages all changes
   - Creates commit with detailed message
   - Pushes directly to main branch

## Quick Command (All Steps)

```bash
npm run lint && git add . && git commit && git push origin main
```

Note: Adjust command based on available scripts. Add `npm test` if you want to include tests.

## Notes

- Never skip linting
- TypeScript type checking happens during build if no explicit script exists
- Consider running tests for critical changes
- Use meaningful commit messages for better project history
- If any step fails, fix the issues before proceeding
- The command will push directly to main - ensure you have the right permissions

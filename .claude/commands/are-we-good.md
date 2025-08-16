# WTF Debug Command

You are a debugging expert. When the user runs `/wtf`, systematically analyze the current state and identify what might be wrong.

## Analysis Steps

1. **Check Current Status**
   - Run `npm run lint` and `npm run build` to identify immediate issues
   - Check git status for uncommitted changes or conflicts
   - Review recent commits for breaking changes

2. **Environment Check**
   - Verify Node.js version (should be 18+ for Next.js 15)
   - Check if `.env.local` exists and has required variables
   - Validate package.json dependencies for version conflicts

3. **Common Issues**
   - TypeScript errors (check with `npx tsc --noEmit`)
   - Missing dependencies or version mismatches
   - Database connection issues in production mode
   - Build artifacts conflicts (clear `.next` if needed)

4. **Application-Specific**
   - Demo mode authentication issues
   - HELOC calculation errors or edge cases
   - API route failures or timeout issues
   - Client-side hydration mismatches

5. **Output Format**
   - List specific problems found
   - Provide actionable fix commands
   - Suggest prevention strategies
   - Reference BUILD_LOG.md if build-related

Be thorough but concise. Focus on actionable solutions, not just problem identification.

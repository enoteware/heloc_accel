# Clean Commit Guide

This guide ensures all commits are clean, tested, and deployment-ready for both traditional and Vercel deployments.

## Pre-Commit Checklist

### 🚀 Quick Start

Run this single command before every commit:

```bash
npm run pre-deploy
```

This runs all validation checks including TypeScript, ESLint, imports, tests, and deployment-specific validations.

## Available Commands

### Core Validation Commands

```bash
# Full pre-deployment check (recommended)
npm run pre-deploy

# Individual checks
npm run check:imports    # Validate all import statements
npm run check:vercel     # Vercel-specific deployment checks
npm run lint            # ESLint validation
npm run test            # Run test suite
npm run build           # Test production build
```

## What Gets Checked

### 1. Import Validation (`check:imports`)

- ✅ All import statements resolve correctly
- ✅ TypeScript path aliases (@/) work properly
- ✅ No missing modules or components
- ✅ Case sensitivity issues detected
- ✅ Circular dependencies identified

**Common errors caught:**

```typescript
// ❌ Module not found
import { helper } from "@/lib/does-not-exist";

// ❌ Wrong case (on case-sensitive systems)
import DemoAccountsInfo from "@/components/demoAccountsInfo";
```

### 2. TypeScript Compilation

- ✅ All types compile correctly
- ✅ No type errors
- ✅ Strict mode compliance
- ✅ Import type vs value imports

### 3. ESLint Checks

- ✅ Code style consistency
- ✅ React hooks rules
- ✅ Next.js specific rules
- ✅ Import ordering

### 4. Vercel Deployment Checks (`check:vercel`)

- ✅ No `output: 'standalone'` in next.config.js
- ✅ vercel.json configuration valid
- ✅ All files under 50MB limit
- ✅ No hardcoded localhost URLs (warnings for test files)
- ✅ No server code in client components
- ✅ Environment variables documented
- ✅ Production build in Vercel environment

### 5. Production Build Test

- ✅ Full Next.js build succeeds
- ✅ No build-time errors
- ✅ Bundle size optimization
- ✅ Static page generation

## Error Resolution Guide

### Import Errors

**Error: "Cannot resolve '@/lib/demo-storage'"**

```bash
# First, check if the file exists
ls src/lib/demo-storage.ts

# If missing, check for typos or moved files
find src -name "*demo*" -type f

# Run import validation
npm run check:imports
```

### TypeScript Errors

**Error: "Type 'CalculatorValidationInput' is not assignable..."**

```bash
# Check TypeScript compilation
npx tsc --noEmit

# Look for type imports that should use 'import type'
# ❌ Wrong
import { CalculatorValidationInput } from '@/lib/validation'

# ✅ Correct
import type { CalculatorValidationInput } from '@/lib/validation'
```

### Vercel-Specific Issues

**Error: "Standalone output mode is not compatible with Vercel"**

```javascript
// In next.config.js, comment out or remove:
// output: 'standalone'  // ❌ Not for Vercel

// Or conditionally set it:
output: process.env.VERCEL ? undefined : "standalone"; // ✅
```

**Warning: "Hardcoded localhost URLs"**

```typescript
// ❌ Avoid
const apiUrl = "http://localhost:3000/api";

// ✅ Use environment variables
const apiUrl = process.env.NEXT_PUBLIC_API_URL || "/api";
```

## Deployment Workflows

### For Vercel Deployment

1. **Pre-deployment validation:**

   ```bash
   npm run pre-deploy
   ```

2. **Fix any errors found**

3. **Commit changes:**

   ```bash
   git add .
   git commit -m "fix: resolve import errors and Vercel compatibility"
   ```

4. **Push to GitHub:**

   ```bash
   git push origin main
   ```

5. **Vercel auto-deploys** (if connected to GitHub)

### For Traditional VPS Deployment

1. **Run checks with standalone mode:**

   ```bash
   # Temporarily enable standalone in next.config.js
   npm run pre-deploy
   ```

2. **Build and deploy:**
   ```bash
   ./deploy-standalone.sh
   ```

## CI/CD Integration

Add to your GitHub Actions workflow:

```yaml
- name: Pre-deployment Checks
  run: |
    npm ci
    npm run pre-deploy
```

## Environment Variables

Required for Vercel deployment (set in Vercel dashboard):

```env
# Authentication
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-secret-key

# Database
DATABASE_URL=postgresql://user:pass@host/db

# Optional
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=info
```

## Troubleshooting

### Build Fails Locally but Works on Vercel

Check for:

- Missing environment variables
- Case sensitivity issues (macOS vs Linux)
- Dev dependencies used in production code

### Import Works in Dev but Fails in Build

Common causes:

- Dynamic imports without proper typing
- Circular dependencies
- Missing type declarations

Run detailed check:

```bash
npm run check:imports
```

## Best Practices

1. **Always run `npm run pre-deploy` before committing**
2. **Fix all errors, investigate warnings**
3. **Keep imports organized** (external → internal → types)
4. **Use `import type` for type-only imports**
5. **Document environment variables in .env.example**
6. **Test builds in production mode locally**

## Script Maintenance

The validation scripts are located in:

- `scripts/pre-deploy-check.js` - Main orchestrator
- `scripts/validate-imports.js` - Import validation
- `scripts/vercel-check.js` - Vercel-specific checks

To add new checks, modify the checks array in `pre-deploy-check.js`.

---

Remember: **Clean commits = Successful deployments!** 🚀

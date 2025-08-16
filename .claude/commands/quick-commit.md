# Quick Commit with Vercel Deploy

Fast commit, push to main branch, and deploy directly to Vercel with build error fixing loop.

## Enhanced Quick Commit with Deploy

**Recommended: Use the intelligent script**

```bash
npm run quick-deploy
```

**Manual workflow with Vercel deployment:**

```bash
# Stage all changes
git add .

# Commit with timestamp
git commit -m "Update: $(date '+%Y-%m-%d %H:%M')"

# Push to main
git push origin main

# Deploy to Vercel with error loop
npm run lint && npm run build
if [ $? -eq 0 ]; then
  vercel --prod --force
else
  echo "Build failed - running error fix loop..."
  npm run lint:fix
  npm run build
  if [ $? -eq 0 ]; then
    git add . && git commit -m "fix: build errors $(date '+%H:%M')" && git push origin main
    vercel --prod --force
  else
    echo "Manual intervention required - check BUILD_LOG.md"
  fi
fi
```

## One-Liner Version

```bash
git add . && git commit -m "Update: $(date '+%Y-%m-%d %H:%M')" && git push origin main && (npm run lint && npm run build && vercel --prod --force || (echo "Build failed - running fixes..." && npm run lint:fix && npm run build && git add . && git commit -m "fix: build errors $(date '+%H:%M')" && git push origin main && vercel --prod --force))
```

## Smart Deploy Script

Create this as a shell script for easier use:

```bash
#!/bin/bash
# quick-deploy.sh

echo "🚀 Quick Commit & Deploy to Vercel"
echo "=================================="

# Stage changes
echo "📦 Staging changes..."
git add .

# Commit with timestamp
echo "💾 Committing..."
git commit -m "Update: $(date '+%Y-%m-%d %H:%M')"

# Push to main
echo "⬆️ Pushing to main..."
git push origin main

# Attempt build and deploy
echo "🔨 Building project..."
npm run lint && npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful! Deploying to Vercel..."
    vercel --prod --force
    echo "🎉 Deployment complete!"
else
    echo "❌ Build failed - attempting auto-fix..."

    # Try to fix common issues
    npm run lint:fix

    # Rebuild
    echo "🔨 Rebuilding after fixes..."
    npm run build

    if [ $? -eq 0 ]; then
        echo "✅ Build successful after fixes! Committing fixes..."
        git add .
        git commit -m "fix: build errors $(date '+%H:%M')"
        git push origin main

        echo "🚀 Deploying to Vercel..."
        vercel --prod --force
        echo "🎉 Deployment complete!"
    else
        echo "❌ Build still failing - manual intervention required"
        echo "📋 Check BUILD_LOG.md for known issues and solutions"
        echo "🔍 Common fixes:"
        echo "   - npm ci (clean install)"
        echo "   - Check TypeScript errors"
        echo "   - Check import paths"
        echo "   - Review recent changes"
        exit 1
    fi
fi
```

## Alternative Messages

**With file count:**

```bash
git add . && git commit -m "Update $(git diff --cached --name-only | wc -l) files" && git push origin main
```

**Feature commit:**

```bash
git add . && git commit -m "feat: $(date '+%Y-%m-%d %H:%M')" && git push origin main
```

**Fix commit:**

```bash
git add . && git commit -m "fix: $(date '+%Y-%m-%d %H:%M')" && git push origin main
```

## Create Aliases (Optional)

Add to your `.bashrc` or `.zshrc`:

```bash
# Quick commit only
alias qc='git add . && git commit -m "Update: $(date +%Y-%m-%d)" && git push origin main'

# Quick commit with Vercel deploy
alias qcd='git add . && git commit -m "Update: $(date \"+%Y-%m-%d %H:%M\")" && git push origin main && (npm run lint && npm run build && vercel --prod --force || (npm run lint:fix && npm run build && git add . && git commit -m "fix: build errors $(date \"+%H:%M\")" && git push origin main && vercel --prod --force))'

# Smart deploy script (recommended)
alias deploy='npm run quick-deploy'
alias qd='npm run quick-deploy'
```

## Prerequisites

1. **Vercel CLI installed and authenticated:**

   ```bash
   npm install -g vercel
   vercel login
   vercel link
   ```

2. **Project has lint:fix script in package.json:**
   ```json
   {
     "scripts": {
       "lint:fix": "next lint --fix"
     }
   }
   ```

## Error Handling

The script automatically handles:

- ✅ Lint errors (runs `lint:fix`)
- ✅ TypeScript compilation errors
- ✅ Build failures with auto-retry
- ✅ Git commit for fixes
- ❌ Complex errors (manual intervention)

## Manual Intervention Cases

When the script fails, check:

1. **BUILD_LOG.md** for known issues
2. **TypeScript errors** that can't be auto-fixed
3. **Missing dependencies** or import issues
4. **Environment variables** in `.env.local`

## Related Commands

- `/quick-deploy` - Intelligent script with auto-fix (recommended)
- `/vercel-force` - Force deploy when GitHub fails
- `/are-we-good` - Check project health before committing
- `/status` - Check git and build status

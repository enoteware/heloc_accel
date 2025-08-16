# Quick Deploy

Intelligent commit, push, and deploy script with automatic error fixing.

## Usage

```bash
npm run quick-deploy
```

or

```bash
./scripts/quick-deploy.sh
```

## What It Does

1. **🔍 Smart Detection**: Checks if there are changes to commit
2. **📦 Auto Commit**: Stages and commits with timestamp and file count
3. **⬆️ Auto Push**: Pushes to main branch
4. **🔨 Build & Lint**: Runs lint and build checks
5. **🚀 Deploy**: Deploys to Vercel with `--prod --force`
6. **🔧 Auto Fix**: If build fails, runs `lint:fix` and retries
7. **💾 Commit Fixes**: Commits auto-fixes and redeploys
8. **❌ Smart Fail**: Provides helpful troubleshooting if fixes don't work

## Prerequisites

1. **Vercel CLI setup**:

   ```bash
   npm install -g vercel
   vercel login
   vercel link
   ```

2. **In git repository** with changes to commit (optional)

## Features

### Intelligent Commit Detection

- Skips commit if no changes detected
- Generates descriptive commit messages with file count
- Uses timestamps for easy tracking

### Automatic Error Recovery

- Detects lint failures and runs `lint:fix`
- Retries build after fixes
- Commits auto-fixes to keep history clean
- Provides detailed troubleshooting on persistent failures

### Robust Error Handling

- Validates git repository status
- Checks for Vercel CLI availability
- Provides specific exit codes and error messages
- Suggests manual intervention steps when automated fixes fail

## Example Output

```
🚀 Quick Commit & Deploy to Vercel
==================================
📦 Staging changes...
💾 Committing 3 files...
⬆️ Pushing to main...
🔨 Building project...
✅ Build successful! Deploying to Vercel...
🎉 Deployment complete!
```

### With Auto-Fix

```
🚀 Quick Commit & Deploy to Vercel
==================================
📦 Staging changes...
💾 Committing 5 files...
⬆️ Pushing to main...
🔨 Building project...
❌ Initial build failed - attempting auto-fix...
🔧 Running lint --fix...
🔨 Rebuilding after fixes...
✅ Build successful after fixes!
💾 Committing auto-fixes...
🚀 Deploying to Vercel...
🎉 Deployment complete!
```

### When Manual Intervention Needed

```
❌ Build still failing after auto-fix attempts
📋 Manual intervention required

🔍 Suggested troubleshooting steps:
   1. Check BUILD_LOG.md for known issues
   2. Run 'npm ci' for clean dependency install
   3. Check for TypeScript errors: 'npm run build'
   4. Verify import paths and module resolution
   5. Check environment variables in .env.local
   6. Review recent changes for syntax errors

💡 Quick fixes to try:
   - npm ci && npm run build
   - Check for missing dependencies in package.json
   - Verify all imports use correct paths
   - Check for unused variables or imports
```

## Related Commands

- `/quick-commit` - Enhanced commit with deploy options
- `/vercel-force` - Force deploy when GitHub fails
- `/are-we-good` - Pre-commit health check

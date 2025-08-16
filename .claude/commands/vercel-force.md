# /vercel-force

Force deploy to Vercel bypassing GitHub when builds fail due to caching or module resolution issues.

## Command Usage

```bash
npm run force-deploy
```

or

```bash
npm run vercel:force
```

## What This Command Does

### 1. Pre-deployment Validation

-  Runs local build to ensure code compiles without errors
-  Verifies all critical files exist using diagnostic script
-  Runs import validation to catch missing modules
- L Exits early if any validation fails

### 2. Clean Deployment Preparation

- =� Removes all build caches (`.next`, `.vercel`, `node_modules/.cache`)
- =� Performs fresh `npm ci` install for clean dependencies
- =( Builds project from scratch to ensure consistency

### 3. Direct Vercel Deployment

- =� Deploys directly to Vercel production environment
- � Bypasses GitHub integration completely
- =� Uses `--force` flag to override any deployment conflicts
- <� Targets production environment with `--prod` flag

## When to Use This Command

###  Use When:

- GitHub deployments failing with "Module not found" errors
- Build cache issues causing persistent failures
- Vercel dashboard shows stale or failed builds
- Need to deploy urgent fixes quickly
- Module resolution works locally but fails on Vercel

### L Don't Use When:

- Code has compilation errors locally
- Tests are failing
- You haven't committed your changes to git
- GitHub deployments are working normally

## Prerequisites

### Required Tools:

1. **Vercel CLI installed globally**:

   ```bash
   npm install -g vercel
   ```

2. **Authenticated with Vercel**:

   ```bash
   vercel login
   ```

3. **Project linked to Vercel**:
   ```bash
   vercel link
   ```

## Interactive Process

The script will:

1. **Ask for confirmation** before proceeding
2. **Show progress** for each step with colored output
3. **Validate everything** before attempting deployment
4. **Provide clear feedback** if anything fails
5. **Display deployment URL** when successful

## Example Output

```
=� Force Vercel Deployment Script
==================================

=� Pre-deployment checks...
� Running build validation...
 Local build successful
� Verifying critical files...
 All files found locally

�  This will deploy directly to Vercel, bypassing GitHub.

Continue with force deployment? (y/N): y

=' Preparing for deployment...
� Cleaning build artifacts...
� Fresh dependency install...
� Building project...

=� Deploying to Vercel...
 Force deployment completed!

= https://heloc-accelerator.vercel.app
```

## Important Warnings

### � Out-of-Sync Risk

This deployment bypasses GitHub, which means:

- Deployed version may not match git repository
- Future GitHub deployments may conflict
- Team members may see different code than what's deployed

### = Best Practice

1. Use only when GitHub deployments fail
2. Always commit and push changes after successful deployment
3. Return to GitHub-based deployments once issues are resolved

## Troubleshooting

### "Vercel CLI not found"

```bash
npm install -g vercel
vercel --version
```

### "Not authenticated"

```bash
vercel login
```

### "Project not linked"

```bash
vercel link
# Follow prompts to link to existing project
```

### "Build fails locally"

Fix issues first:

```bash
npm run build
npm run lint
npm run pre-deploy
```

### "Permission denied"

```bash
chmod +x scripts/force-vercel-deploy.sh
```

## Return to GitHub Deployments

After successful force deployment:

1. **Commit all changes**:

   ```bash
   git add .
   git commit -m "sync with force deployment"
   ```

2. **Push to GitHub**:

   ```bash
   git push origin main
   ```

3. **Verify GitHub integration works** by making a small change

## Related Files

- `scripts/force-vercel-deploy.sh` - Main deployment script
- `FORCE_DEPLOY.md` - Detailed documentation
- `scripts/check-vercel-build.js` - Diagnostic script
- `BUILD_LOG.md` - Build issues and resolutions

## Script Location

The actual script is located at:

```
scripts/force-vercel-deploy.sh
```

You can also run it directly:

```bash
./scripts/force-vercel-deploy.sh
```

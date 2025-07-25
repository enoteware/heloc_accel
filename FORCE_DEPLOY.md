# Force Vercel Deployment

## Overview

When GitHub-based deployments fail due to caching issues or module resolution problems, you can use the force deployment script to deploy directly to Vercel.

## Usage

### Quick Commands

```bash
# Either of these commands will work:
npm run force-deploy
npm run vercel:force
```

### Manual Script Execution

```bash
./scripts/force-vercel-deploy.sh
```

## What the Script Does

1. **Pre-deployment validation**:
   - Runs local build to ensure code compiles
   - Verifies all critical files exist
   - Runs diagnostic checks

2. **Clean deployment preparation**:
   - Removes all build caches (`.next`, `.vercel`, `node_modules/.cache`)
   - Performs fresh `npm ci` install
   - Builds project from scratch

3. **Direct Vercel deployment**:
   - Deploys directly to Vercel production
   - Bypasses GitHub integration
   - Uses `--force` flag to override any conflicts

## When to Use

- ✅ GitHub deployments failing with module resolution errors
- ✅ Build cache issues causing persistent failures  
- ✅ Need to deploy urgent fixes quickly
- ✅ Vercel dashboard shows stale builds

## Prerequisites

1. **Vercel CLI installed**:
   ```bash
   npm install -g vercel
   ```

2. **Vercel authentication**:
   ```bash
   vercel login
   ```

3. **Project linked to Vercel**:
   ```bash
   vercel link
   ```

## Important Notes

⚠️ **Out of Sync Warning**: This deployment method bypasses GitHub, which means:
- The deployed version may not match your git repository
- Future GitHub-based deployments may conflict
- Always ensure your changes are committed and pushed after successful deployment

✅ **Best Practice**: Use this only when GitHub deployments fail. Return to GitHub-based deployments once issues are resolved.

## Troubleshooting

### Script fails with "Vercel CLI not found"
```bash
npm install -g vercel
```

### Build fails locally
Fix the build issues before attempting deployment:
```bash
npm run build
npm run lint
npm run pre-deploy
```

### Permission denied
Make the script executable:
```bash
chmod +x scripts/force-vercel-deploy.sh
```

## Example Output

```
🚀 Force Vercel Deployment Script
==================================

📋 Pre-deployment checks...
▶ Running build validation...
✅ Local build successful
▶ Verifying critical files...
✅ All files found locally

⚠️  This will deploy directly to Vercel, bypassing GitHub.

Continue with force deployment? (y/N): y

🔧 Preparing for deployment...
▶ Cleaning build artifacts...
▶ Fresh dependency install...
▶ Building project...

📤 Deploying to Vercel...
✅ Deployment completed

🔗 https://your-app.vercel.app
```

## Return to GitHub Deployments

After a successful force deployment:

1. Ensure all local changes are committed:
   ```bash
   git add .
   git commit -m "sync with force deployment"
   ```

2. Push to GitHub:
   ```bash
   git push origin main
   ```

3. Verify GitHub deployments work again by making a small change and pushing
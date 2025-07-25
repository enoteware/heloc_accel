#!/bin/bash

# Quick Commit & Deploy to Vercel
# Fast commit, push, and deploy with build error fixing loop

set -e  # Exit on any error initially, but we'll handle specific cases

echo "🚀 Quick Commit & Deploy to Vercel"
echo "=================================="

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Error: Not in a git repository"
    exit 1
fi

# Check if there are any changes to commit
if [ -z "$(git status --porcelain)" ]; then
    echo "ℹ️  No changes to commit. Proceeding with deploy only..."
    SKIP_COMMIT=true
else
    SKIP_COMMIT=false
fi

# Stage and commit changes if there are any
if [ "$SKIP_COMMIT" = false ]; then
    echo "📦 Staging changes..."
    git add .

    # Generate commit message with file count
    FILE_COUNT=$(git diff --cached --name-only | wc -l | tr -d ' ')
    TIMESTAMP=$(date '+%Y-%m-%d %H:%M')
    
    echo "💾 Committing $FILE_COUNT files..."
    git commit -m "Update: $TIMESTAMP ($FILE_COUNT files)"

    echo "⬆️ Pushing to main..."
    git push origin main
fi

# Function to attempt build and deployment
attempt_build_and_deploy() {
    echo "🔨 Building project..."
    
    # Set flag to not exit on error for build attempts
    set +e
    
    npm run lint
    LINT_EXIT_CODE=$?
    
    if [ $LINT_EXIT_CODE -ne 0 ]; then
        echo "⚠️  Lint issues found. Exit code: $LINT_EXIT_CODE"
        return 1
    fi
    
    npm run build
    BUILD_EXIT_CODE=$?
    
    if [ $BUILD_EXIT_CODE -ne 0 ]; then
        echo "❌ Build failed. Exit code: $BUILD_EXIT_CODE"
        return 1
    fi
    
    # Re-enable exit on error for deployment
    set -e
    
    echo "✅ Build successful! Deploying to Vercel..."
    
    # Check if vercel CLI is available
    if ! command -v vercel &> /dev/null; then
        echo "❌ Vercel CLI not found. Please install with: npm install -g vercel"
        exit 1
    fi
    
    vercel --prod --force
    echo "🎉 Deployment complete!"
    return 0
}

# First attempt at build and deploy
if attempt_build_and_deploy; then
    exit 0
fi

# If first attempt failed, try auto-fixing
echo ""
echo "❌ Initial build failed - attempting auto-fix..."

# Disable exit on error for fix attempts
set +e

# Try to fix lint issues
echo "🔧 Running lint --fix..."
npm run lint:fix
LINT_FIX_EXIT_CODE=$?

if [ $LINT_FIX_EXIT_CODE -ne 0 ]; then
    echo "⚠️  Lint --fix had issues but continuing..."
fi

# Try build again after fixes
echo "🔨 Rebuilding after fixes..."
npm run build
BUILD_RETRY_EXIT_CODE=$?

if [ $BUILD_RETRY_EXIT_CODE -eq 0 ]; then
    echo "✅ Build successful after fixes!"
    
    # Check if there are new changes to commit (from lint fixes)
    if [ -n "$(git status --porcelain)" ]; then
        echo "💾 Committing auto-fixes..."
        git add .
        git commit -m "fix: build errors $(date '+%H:%M')"
        git push origin main
    fi
    
    # Re-enable exit on error for final deployment
    set -e
    
    echo "🚀 Deploying to Vercel..."
    vercel --prod --force
    echo "🎉 Deployment complete!"
    exit 0
else
    echo ""
    echo "❌ Build still failing after auto-fix attempts"
    echo "📋 Manual intervention required"
    echo ""
    echo "🔍 Suggested troubleshooting steps:"
    echo "   1. Check BUILD_LOG.md for known issues"
    echo "   2. Run 'npm ci' for clean dependency install"
    echo "   3. Check for TypeScript errors: 'npm run build'"
    echo "   4. Verify import paths and module resolution"
    echo "   5. Check environment variables in .env.local"
    echo "   6. Review recent changes for syntax errors"
    echo ""
    echo "💡 Quick fixes to try:"
    echo "   - npm ci && npm run build"
    echo "   - Check for missing dependencies in package.json"
    echo "   - Verify all imports use correct paths"
    echo "   - Check for unused variables or imports"
    
    exit 1
fi
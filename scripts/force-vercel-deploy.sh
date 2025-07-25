#!/bin/bash

# Force Vercel Deployment Script
# Bypasses GitHub and deploys directly to Vercel with fresh build

set -e

echo "🚀 Force Vercel Deployment Script"
echo "=================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}❌ Vercel CLI not found!${NC}"
    echo "Install it with: npm install -g vercel"
    exit 1
fi

echo -e "${BLUE}📋 Pre-deployment checks...${NC}"

# Run pre-deployment validation
echo "▶ Running build validation..."
if ! npm run build > /dev/null 2>&1; then
    echo -e "${RED}❌ Local build failed! Fix issues before deploying.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Local build successful${NC}"

# Verify critical files exist
echo "▶ Verifying critical files..."
node scripts/check-vercel-build.js

echo ""
echo -e "${YELLOW}⚠️  This will deploy directly to Vercel, bypassing GitHub.${NC}"
echo "This creates a deployment that may be out of sync with your git repository."
echo ""

# Ask for confirmation
read -p "Continue with force deployment? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled."
    exit 0
fi

echo ""
echo -e "${BLUE}🔧 Preparing for deployment...${NC}"

# Clean build artifacts
echo "▶ Cleaning build artifacts..."
rm -rf .next
rm -rf .vercel
rm -rf node_modules/.cache

# Force fresh install
echo "▶ Fresh dependency install..."
npm ci

# Build the project
echo "▶ Building project..."
npm run build

echo ""
echo -e "${BLUE}📤 Deploying to Vercel...${NC}"

# Deploy to Vercel with force flag
vercel --prod --force --yes

echo ""
echo -e "${GREEN}✅ Force deployment completed!${NC}"
echo ""
echo -e "${YELLOW}📝 Next steps:${NC}"
echo "1. Test the deployed application"
echo "2. If successful, ensure your git repository is up to date"
echo "3. Consider pushing any local changes to GitHub to stay in sync"
echo ""
echo -e "${BLUE}💡 To return to GitHub-based deployments:${NC}"
echo "   Ensure all changes are committed and pushed to your main branch"
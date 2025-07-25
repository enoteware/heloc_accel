# Build Log

## 2025-07-24 - Augment to Claude Code Migration

### Overview
Successfully migrated Augment configuration and rules to Claude Code, establishing consistent development workflows across both AI assistants.

### Changes Made

#### 1. MCP Server Configuration (`.mcp.json`)
- **Added 5 MCP servers:**
  - `serena`: Code exploration and semantic understanding
  - `context7`: Library and API documentation research
  - `playwright`: UI testing and browser automation
  - `sequential-thinking`: Complex problem solving and planning
  - `supabase`: Supabase API operations
  - `postgres`: Direct PostgreSQL database access (read-only)

#### 2. Claude Code Settings (`.claude/settings.json`)
- **Pre/Post hooks:**
  - Pre-edit: TypeScript linting check
  - Post-edit: TypeScript compilation check
  - Test completion: Coverage threshold reminder (80%)
  - User prompt: Project context reminder
- **Quality gates:** TypeScript strict mode, 80% test coverage, lint/format on save
- **Security patterns:** Password, secret, token, API key detection
- **Workflow preferences:** Default MCP tool selection by task type

#### 3. CLAUDE.md Updates
- Added comprehensive code quality standards section
- Integrated MCP tool workflow documentation
- Added debugging workflow with database state checks
- Enhanced security requirements and financial calculation guidelines

#### 4. Augment Rules Updates (`.augment/rules/`)
- Updated MCP orchestration rules to include PostgreSQL MCP
- Modified debugging workflow to check database state
- Added PostgreSQL as primary tool for database operations

### Technical Notes

#### PostgreSQL MCP
- **Package:** `@modelcontextprotocol/server-postgres@0.6.2`
- **Status:** ⚠️ Deprecated but functional
- **Mode:** Read-only (safe for production)
- **Connection:** Via `DATABASE_URL` environment variable

#### Environment Variables Required
```bash
DATABASE_URL=postgresql://user:pass@host:5432/dbname
SUPABASE_URL=https://project.supabase.co
SUPABASE_KEY=your-anon-key
```

### Next Steps
- Monitor PostgreSQL MCP deprecation status
- Consider alternative PostgreSQL MCP implementations if needed
- Test all MCP integrations with actual connections

### Agent Instructions
When working on this project:
1. Use Sequential Thinking MCP for complex planning
2. Use Serena MCP for code exploration and editing
3. Use PostgreSQL MCP for database queries and schema inspection
4. Use Context7 MCP for library/API documentation
5. Use Playwright MCP for UI testing
6. Follow the workflows defined in CLAUDE.md and .augment/rules/mcp_rules.md

---
*This log is maintained for agent context and project history*

## 2025-07-25 - Production Build & Deployment

### Status: ✅ Success
**Type:** Production standalone build  
**Domain:** https://heloc.noteware.dev/

### Changes Deployed
- Fixed "Get Started" button functionality by removing automatic redirect
- Updated button text to "Get Started - Calculate Your Savings"
- Simplified navigation flow

### Build & Deployment Process
1. **Local Build**: `npm run build` - Successful
2. **Deployment**: Manual via SSH
3. **Server**: VPS with nginx reverse proxy
4. **PM2 Status**: Running successfully

### Issues Resolved
1. **Static Assets 404** 
   - Fixed by configuring nginx to serve `.next/static` directly
   - Added nginx location block for `/_next/static/`
   
2. **Button Not Working**
   - Removed automatic redirect to calculator in demo mode
   - Button now properly navigates to `/calculator`

### Deployment Notes
- Using Next.js 15 standalone mode
- PM2 configured with explicit `NODE_ENV=production`
- Nginx serving static files directly for performance

---

## 2025-07-24 - VPS Auto-Deployment Setup

### Initial Status
⚠️ **Auto-deployment was FAILING** - Missing test dependencies

### Issues & Resolutions

#### 1. CI/CD Pipeline Failure
- **Error**: TypeScript compilation failed in GitHub Actions
- **Cause**: Missing `@testing-library/react` and `@testing-library/user-event`
- **Fix**: Added dependencies to package.json
- **Result**: ✅ CI/CD now passing

#### 2. Server Configuration Issues
- **NODE_ENV**: Was set to development, fixed in ecosystem.config.js
- **Port Mismatch**: Nginx upstream was 3001, app was on 3000
- **Directory Structure**: Fixed nested deployment structure

#### 3. basePath Configuration
- **Issue**: Conflict between subdomain and basePath
- **Fix**: Removed basePath since using subdomain (heloc.noteware.dev)

### Deployment Configuration
- **Trigger**: Pushes to `main` branch automatically trigger deployment
- **Workflow**: `.github/workflows/deploy.yml`
- **Server**: Deploys to VPS at `/opt/heloc-accelerator/`
- **Process Manager**: PM2 with standalone Next.js build

### Common Build Commands
```bash
# Development
npm run dev

# Production build
npm run build
./deploy-standalone.sh

# Tests (run before deployment)
npm test
npm run lint

# Manual deployment
ssh root@server
cd /opt/heloc-accelerator/app/heloc-accelerator
git pull
npm install
npm run build
pm2 restart heloc-accelerator
```

### Pre-deployment Checklist
- [ ] Run `npm run pre-deploy` - all checks pass
- [ ] Check CLEAN_COMMIT.md for validation details
- [ ] Verify environment variables
- [ ] Test "Get Started" button functionality

---

## 2025-07-25 - Pre-Deployment Validation System

### Status: ✅ Implemented
**Type:** Development tooling enhancement

### Overview
Created comprehensive pre-deployment validation system to catch build errors before deployment, with specific support for Vercel deployments.

### New Features

#### 1. Import Validation Script (`scripts/validate-imports.js`)
- Scans all TypeScript/JavaScript files for import statements
- Validates module resolution including:
  - Path alias resolution (@/ mappings)
  - File existence checks
  - Case sensitivity detection
  - Circular dependency warnings
- Provides detailed error reporting with file:line information

#### 2. Pre-Deployment Check Script (`scripts/pre-deploy-check.js`)
- Orchestrates all validation checks:
  - Node.js version compatibility (>= 18)
  - TypeScript compilation (`tsc --noEmit`)
  - ESLint validation
  - Import resolution verification
  - Test suite execution
  - Production build test
  - Vercel deployment checks

#### 3. Vercel-Specific Validation (`scripts/vercel-check.js`)
- Validates Vercel compatibility:
  - Checks for incompatible `output: 'standalone'` mode
  - Validates vercel.json configuration
  - Enforces 50MB file size limit
  - Detects hardcoded localhost URLs
  - Identifies server code in client components
  - Simulates Vercel build environment
  - Lists required environment variables

### NPM Commands Added
```bash
npm run check:imports    # Validate import statements only
npm run check:vercel     # Vercel-specific checks only
npm run pre-deploy       # Full pre-deployment validation
```

### Documentation Created
- **CLEAN_COMMIT.md** - Comprehensive guide for clean commits
  - Pre-commit checklist
  - Error resolution examples
  - Deployment workflows
  - CI/CD integration guide

### Usage
Before any deployment (traditional or Vercel):
```bash
npm run pre-deploy
```

This single command ensures:
- ✅ All imports resolve correctly
- ✅ TypeScript compiles without errors
- ✅ ESLint passes
- ✅ Tests pass (when present)
- ✅ Production build succeeds
- ✅ Vercel compatibility (if deploying to Vercel)

### Impact
- Prevents "Module not found" errors in production
- Catches configuration issues before deployment
- Provides clear guidance for fixing issues
- Supports both VPS and Vercel deployment strategies

---

## 2025-07-25 - Vercel Build Fix

### Status: ✅ Fixed
**Type:** Vercel deployment build failure resolution

### Issue
Vercel build failing with multiple errors:
1. `Cannot find module 'tailwindcss'` - CSS processing dependency missing
2. Module not found errors for existing components and utilities

### Root Cause Analysis
- **tailwindcss, autoprefixer, postcss** were in `devDependencies`
- Vercel production builds need CSS processing dependencies in `dependencies`
- Next.js font loader requires these packages during build process
- All application files were present and tracked in git

### Resolution
**Moved CSS dependencies from devDependencies to dependencies:**
```json
"dependencies": {
  "autoprefixer": "^10.4.21",
  "postcss": "^8",
  "tailwindcss": "^3.4.1"
}
```

### Verification
- ✅ Local build passes: `npm run build`
- ✅ No warnings about missing modules
- ✅ All static pages generated successfully (26/26)
- ✅ Bundle analysis complete
- ✅ Files committed and ready for deployment

### Next Steps
- Push changes to trigger Vercel deployment
- Monitor build success in Vercel dashboard
- Verify deployed application functionality

### Prevention
- Pre-deployment check script already validates builds
- Added note in CLAUDE.md about checking BUILD_LOG.md before builds
- CSS processing dependencies now correctly categorized
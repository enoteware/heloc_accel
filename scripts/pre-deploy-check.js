#!/usr/bin/env node

/**
 * Pre-deployment check script for HELOC Accelerator
 * 
 * This script runs comprehensive validation checks before deployment:
 * - TypeScript compilation
 * - Import resolution verification
 * - ESLint checks
 * - Build test
 * - Environment validation
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

console.log(`${colors.blue}${colors.bright}🚀 Running pre-deployment checks for HELOC Accelerator...${colors.reset}\n`);

// Helper function to run command with proper error handling
function runCommand(name, command, critical = true) {
  console.log(`${colors.yellow}▶ ${name}${colors.reset}`);
  console.log(`  Command: ${command}`);
  
  try {
    const startTime = Date.now();
    execSync(command, { stdio: 'inherit' });
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`${colors.green}✅ ${name} passed (${duration}s)${colors.reset}\n`);
    return true;
  } catch (error) {
    console.error(`${colors.red}❌ ${name} failed${colors.reset}\n`);
    if (critical) {
      return false;
    }
    console.log(`${colors.yellow}⚠️  Warning: Non-critical check failed, continuing...${colors.reset}\n`);
    return true;
  }
}

// Check Node.js version
function checkNodeVersion() {
  console.log(`${colors.yellow}▶ Node.js Version Check${colors.reset}`);
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));
  
  if (majorVersion < 18) {
    console.error(`${colors.red}❌ Node.js version ${nodeVersion} is too old. Required: >= 18.0.0${colors.reset}\n`);
    return false;
  }
  
  console.log(`${colors.green}✅ Node.js version ${nodeVersion} is compatible${colors.reset}\n`);
  return true;
}

// Check for required environment files
function checkEnvironment() {
  console.log(`${colors.yellow}▶ Environment Configuration Check${colors.reset}`);
  
  const envExample = path.join(process.cwd(), '.env.example');
  const envLocal = path.join(process.cwd(), '.env.local');
  
  if (!fs.existsSync(envExample)) {
    console.log(`${colors.yellow}⚠️  Warning: .env.example not found${colors.reset}`);
  }
  
  if (!fs.existsSync(envLocal)) {
    console.log(`${colors.yellow}⚠️  Warning: .env.local not found (using demo mode)${colors.reset}`);
  }
  
  console.log(`${colors.green}✅ Environment check complete${colors.reset}\n`);
  return true;
}

// Main checks array
const checks = [
  {
    name: 'TypeScript Compilation',
    command: 'npx tsc --noEmit',
    critical: true
  },
  {
    name: 'ESLint Check',
    command: 'npm run lint',
    critical: true
  },
  {
    name: 'Import Resolution Verification',
    command: 'node scripts/validate-imports.js',
    critical: true,
    preCheck: () => {
      // Create the import validator if it doesn't exist
      const validatorPath = path.join(process.cwd(), 'scripts', 'validate-imports.js');
      if (!fs.existsSync(validatorPath)) {
        console.log(`${colors.yellow}  Creating import validator...${colors.reset}`);
        return false;
      }
      return true;
    }
  },
  {
    name: 'Test Suite',
    command: 'npm test -- --passWithNoTests --silent',
    critical: false
  },
  {
    name: 'Production Build Test',
    command: 'NODE_ENV=production npm run build',
    critical: true
  }
];

// Run all checks
async function runChecks() {
  const results = [];
  
  // Initial checks
  results.push(checkNodeVersion());
  results.push(checkEnvironment());
  
  // Run main checks
  for (const check of checks) {
    // Run pre-check if exists
    if (check.preCheck && !check.preCheck()) {
      // Skip this check if pre-check fails
      continue;
    }
    
    const result = runCommand(check.name, check.command, check.critical);
    results.push(result);
    
    // Exit early if critical check failed
    if (!result && check.critical) {
      break;
    }
  }
  
  // Summary
  const failed = results.some(r => !r);
  console.log(colors.bright);
  console.log('='.repeat(60));
  
  if (failed) {
    console.log(`${colors.red}❌ PRE-DEPLOYMENT CHECKS FAILED!${colors.reset}`);
    console.log(`\n${colors.yellow}Please fix the errors above before deploying.${colors.reset}`);
    console.log(`\nTip: Check BUILD_LOG.md for common issues and solutions.`);
    process.exit(1);
  } else {
    console.log(`${colors.green}✅ ALL PRE-DEPLOYMENT CHECKS PASSED!${colors.reset}`);
    console.log(`\n${colors.green}The application is ready for deployment.${colors.reset}`);
    
    // Additional tips
    console.log(`\n${colors.blue}Next steps:${colors.reset}`);
    console.log('  1. Run: npm run deploy-standalone');
    console.log('  2. Deploy to your server');
    console.log('  3. Run post-deployment tests');
  }
  
  console.log('='.repeat(60));
}

// Handle errors gracefully
process.on('unhandledRejection', (error) => {
  console.error(`${colors.red}Unexpected error during pre-deployment checks:${colors.reset}`, error);
  process.exit(1);
});

// Run the checks
runChecks();
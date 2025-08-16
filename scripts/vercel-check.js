#!/usr/bin/env node

/**
 * Vercel deployment check script for HELOC Accelerator
 *
 * This script validates that the project is ready for Vercel deployment by:
 * - Checking for Vercel-specific configuration issues
 * - Simulating Vercel build environment
 * - Validating environment variables
 * - Testing production build with Vercel settings
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
};

console.log(
  `${colors.magenta}${colors.bright}▲ Running Vercel deployment checks...${colors.reset}\n`,
);

const errors = [];
const warnings = [];

// Check for Vercel configuration
function checkVercelConfig() {
  console.log(`${colors.blue}▶ Vercel Configuration${colors.reset}`);

  const vercelJsonPath = path.join(process.cwd(), "vercel.json");
  if (!fs.existsSync(vercelJsonPath)) {
    warnings.push("No vercel.json found - using default settings");
    console.log(
      `${colors.yellow}⚠️  No vercel.json found - using default settings${colors.reset}`,
    );
  } else {
    console.log(`${colors.green}✅ vercel.json found${colors.reset}`);

    // Validate vercel.json
    try {
      const config = JSON.parse(fs.readFileSync(vercelJsonPath, "utf8"));

      // Check for common issues
      if (config.functions) {
        console.log(`  ✓ Function configurations found`);
      }

      if (config.buildCommand && config.buildCommand !== "npm run build") {
        warnings.push(`Custom build command: ${config.buildCommand}`);
      }
    } catch (e) {
      errors.push("Invalid vercel.json - " + e.message);
      console.log(`${colors.red}❌ Invalid vercel.json${colors.reset}`);
    }
  }

  console.log("");
}

// Check Next.js configuration for Vercel compatibility
function checkNextConfig() {
  console.log(`${colors.blue}▶ Next.js Configuration${colors.reset}`);

  const nextConfigPath = path.join(process.cwd(), "next.config.js");
  if (fs.existsSync(nextConfigPath)) {
    const content = fs.readFileSync(nextConfigPath, "utf8");

    // Check for incompatible settings
    if (content.includes("output: 'standalone'") && !content.includes("//")) {
      errors.push(
        "next.config.js has 'output: standalone' which is incompatible with Vercel",
      );
      console.log(
        `${colors.red}❌ Standalone output mode is not compatible with Vercel${colors.reset}`,
      );
    } else {
      console.log(
        `${colors.green}✅ No incompatible output mode${colors.reset}`,
      );
    }

    // Check for custom server
    if (
      content.includes("server.js") ||
      fs.existsSync(path.join(process.cwd(), "server.js"))
    ) {
      warnings.push("Custom server detected - not used in Vercel deployment");
      console.log(
        `${colors.yellow}⚠️  Custom server detected - will be ignored by Vercel${colors.reset}`,
      );
    }
  }

  console.log("");
}

// Check environment variables
function checkEnvironmentVariables() {
  console.log(`${colors.blue}▶ Environment Variables${colors.reset}`);

  const requiredEnvVars = ["NEXTAUTH_URL", "NEXTAUTH_SECRET", "DATABASE_URL"];

  const envExamplePath = path.join(process.cwd(), ".env.example");
  if (fs.existsSync(envExamplePath)) {
    console.log(`${colors.green}✅ .env.example found${colors.reset}`);

    // Parse .env.example for required variables
    const envExample = fs.readFileSync(envExamplePath, "utf8");
    const envVars = envExample.match(/^[A-Z_]+=.*/gm) || [];

    console.log(`  Required environment variables:`);
    envVars.forEach((envVar) => {
      const varName = envVar.split("=")[0];
      console.log(`  - ${varName}`);
    });

    console.log(
      `\n${colors.yellow}  ⚠️  Remember to set these in Vercel dashboard${colors.reset}`,
    );
  } else {
    warnings.push(
      "No .env.example found - ensure environment variables are documented",
    );
  }

  console.log("");
}

// Check for large files that might cause issues
function checkFileSizes() {
  console.log(`${colors.blue}▶ File Size Check${colors.reset}`);

  const maxFileSize = 50 * 1024 * 1024; // 50MB limit for Vercel
  let largeFiles = [];

  function checkDirectory(dir) {
    const files = fs.readdirSync(dir);

    files.forEach((file) => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        if (!["node_modules", ".next", ".git", "deployment"].includes(file)) {
          checkDirectory(filePath);
        }
      } else if (stat.size > maxFileSize) {
        largeFiles.push({
          path: path.relative(process.cwd(), filePath),
          size: (stat.size / 1024 / 1024).toFixed(2) + "MB",
        });
      }
    });
  }

  checkDirectory(process.cwd());

  if (largeFiles.length > 0) {
    errors.push(
      `Found ${largeFiles.length} files exceeding Vercel's 50MB limit`,
    );
    console.log(`${colors.red}❌ Large files detected:${colors.reset}`);
    largeFiles.forEach((file) => {
      console.log(`  - ${file.path} (${file.size})`);
    });
  } else {
    console.log(
      `${colors.green}✅ All files within size limits${colors.reset}`,
    );
  }

  console.log("");
}

// Simulate Vercel build
function simulateVercelBuild() {
  console.log(`${colors.blue}▶ Simulating Vercel Build${colors.reset}`);

  // Set Vercel environment variables
  const vercelEnv = {
    ...process.env,
    VERCEL: "1",
    VERCEL_ENV: "production",
    CI: "1",
    NODE_ENV: "production",
  };

  try {
    console.log("  Running production build with Vercel environment...");
    execSync("npm run build", {
      stdio: "inherit",
      env: vercelEnv,
    });
    console.log(`${colors.green}✅ Build successful${colors.reset}`);
  } catch (error) {
    errors.push("Build failed in Vercel environment");
    console.log(`${colors.red}❌ Build failed${colors.reset}`);
  }

  console.log("");
}

// Check for Vercel-specific gotchas
function checkVercelGotchas() {
  console.log(`${colors.blue}▶ Common Vercel Issues${colors.reset}`);

  // Check for hardcoded localhost URLs
  const srcFiles = execSync(
    'find src -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" 2>/dev/null || true',
    { encoding: "utf8" },
  )
    .split("\n")
    .filter(Boolean);

  let localhostCount = 0;
  srcFiles.forEach((file) => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, "utf8");
      if (content.includes("localhost:") || content.includes("127.0.0.1")) {
        localhostCount++;
      }
    }
  });

  if (localhostCount > 0) {
    warnings.push(
      `Found ${localhostCount} files with hardcoded localhost URLs`,
    );
    console.log(
      `${colors.yellow}⚠️  Found hardcoded localhost URLs in ${localhostCount} files${colors.reset}`,
    );
    console.log(`  Use environment variables or relative URLs instead`);
  } else {
    console.log(`${colors.green}✅ No hardcoded localhost URLs${colors.reset}`);
  }

  // Check for server-only code in client components
  const clientComponents = execSync(
    'grep -l "use client" src/**/*.tsx 2>/dev/null || true',
    { encoding: "utf8" },
  )
    .split("\n")
    .filter(Boolean);

  let serverCodeInClient = 0;
  clientComponents.forEach((file) => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, "utf8");
      if (
        content.includes("fs.") ||
        content.includes("require('fs')") ||
        (content.includes("process.env") && !content.includes("NEXT_PUBLIC_"))
      ) {
        serverCodeInClient++;
      }
    }
  });

  if (serverCodeInClient > 0) {
    errors.push(
      `Found ${serverCodeInClient} client components with server-only code`,
    );
    console.log(
      `${colors.red}❌ Server code in client components (${serverCodeInClient} files)${colors.reset}`,
    );
  } else {
    console.log(
      `${colors.green}✅ No server code in client components${colors.reset}`,
    );
  }

  console.log("");
}

// Generate deployment checklist
function generateChecklist() {
  console.log(`${colors.blue}▶ Vercel Deployment Checklist${colors.reset}`);
  console.log(
    "  [ ] Set all required environment variables in Vercel dashboard",
  );
  console.log("  [ ] Configure custom domain (if needed)");
  console.log("  [ ] Review Function configurations in vercel.json");
  console.log("  [ ] Enable Vercel Analytics (optional)");
  console.log("  [ ] Set up preview deployments for branches");
  console.log("  [ ] Configure build & development settings");
  console.log("");
}

// Main execution
function main() {
  checkVercelConfig();
  checkNextConfig();
  checkEnvironmentVariables();
  checkFileSizes();
  checkVercelGotchas();

  // Only simulate build if no critical errors so far
  if (errors.length === 0) {
    simulateVercelBuild();
  }

  generateChecklist();

  // Summary
  console.log(colors.bright);
  console.log("=".repeat(60));

  if (errors.length > 0) {
    console.log(
      `${colors.red}❌ VERCEL DEPLOYMENT CHECK FAILED${colors.reset}`,
    );
    console.log(`\n${colors.red}Errors (${errors.length}):${colors.reset}`);
    errors.forEach((err) => console.log(`  - ${err}`));
  }

  if (warnings.length > 0) {
    console.log(
      `\n${colors.yellow}Warnings (${warnings.length}):${colors.reset}`,
    );
    warnings.forEach((warn) => console.log(`  - ${warn}`));
  }

  if (errors.length === 0) {
    console.log(`${colors.green}✅ READY FOR VERCEL DEPLOYMENT${colors.reset}`);
    console.log(
      `\n${colors.green}The application passed all Vercel compatibility checks!${colors.reset}`,
    );
    console.log(`\nNext steps:`);
    console.log("  1. Commit all changes");
    console.log("  2. Push to GitHub");
    console.log("  3. Import project in Vercel dashboard");
    console.log("  4. Configure environment variables");
    console.log("  5. Deploy!");
  } else {
    console.log(
      `\n${colors.red}Please fix the errors above before deploying to Vercel.${colors.reset}`,
    );
    process.exit(1);
  }

  console.log("=".repeat(60));
}

// Handle errors
process.on("unhandledRejection", (error) => {
  console.error(`${colors.red}Unexpected error:${colors.reset}`, error);
  process.exit(1);
});

// Run checks
main();

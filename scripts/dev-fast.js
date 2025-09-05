#!/usr/bin/env node

/**
 * Fast Development Mode Script
 * Optimizes the development environment for maximum speed
 */

const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("🚀 Starting HELOC Accelerator in Fast Development Mode...\n");

// Set performance environment variables
process.env.NODE_ENV = "development";
process.env.TURBOPACK = "1";
process.env.NEXT_TELEMETRY_DISABLED = "1";
process.env.ENABLE_SOURCE_MAPS = "false";
process.env.FAST_REFRESH = "true";
process.env.NODE_OPTIONS = "--max-old-space-size=4096";

// Clear Next.js cache for fresh start
const nextDir = path.join(process.cwd(), ".next");
if (fs.existsSync(nextDir)) {
  console.log("🧹 Clearing Next.js cache...");
  fs.rmSync(nextDir, { recursive: true, force: true });
}

// Clear Turbo cache if it exists
const turboDir = path.join(process.cwd(), ".turbo");
if (fs.existsSync(turboDir)) {
  console.log("🧹 Clearing Turbo cache...");
  fs.rmSync(turboDir, { recursive: true, force: true });
}

console.log("⚡ Performance optimizations enabled:");
console.log("  • Turbopack bundler");
console.log("  • Source maps disabled");
console.log("  • Telemetry disabled");
console.log("  • Memory optimized (4GB)");
console.log("  • Fast refresh enabled\n");

// Start Next.js with optimizations
const nextProcess = spawn(
  "npx",
  ["next", "dev", "--turbo", "--port", "3001", "--hostname", "0.0.0.0"],
  {
    stdio: "inherit",
    env: process.env,
  },
);

nextProcess.on("close", (code) => {
  console.log(`\n🏁 Development server exited with code ${code}`);
  process.exit(code);
});

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("\n🛑 Shutting down development server...");
  nextProcess.kill("SIGINT");
});

process.on("SIGTERM", () => {
  console.log("\n🛑 Shutting down development server...");
  nextProcess.kill("SIGTERM");
});

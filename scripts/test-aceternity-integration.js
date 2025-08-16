#!/usr/bin/env node

/**
 * Test script to verify Aceternity UI integration
 */

const http = require("http");
const path = require("path");
const fs = require("fs");

console.log("🧪 Testing Aceternity UI Integration...\n");

// Test 1: Check component files exist
const componentPaths = [
  "src/components/design-system/AceternityCard.tsx",
  "src/components/design-system/SimpleAceternityCard.tsx",
  "src/components/design-system/FinancialAceternityCard.tsx",
  "src/app/demo/aceternity/page.tsx",
];

console.log("📁 Checking component files...");
componentPaths.forEach((filePath) => {
  const fullPath = path.join(process.cwd(), filePath);
  if (fs.existsSync(fullPath)) {
    console.log(`✅ ${filePath}`);
  } else {
    console.log(`❌ ${filePath} - Missing!`);
  }
});

// Test 2: Check exports in design system
console.log("\n📦 Checking design system exports...");
try {
  const indexPath = path.join(
    process.cwd(),
    "src/components/design-system/index.ts",
  );
  const indexContent = fs.readFileSync(indexPath, "utf8");

  const expectedExports = [
    "AceternityCard",
    "SimpleAceternityCard",
    "FinancialAceternityCard",
    "HomeAceternityCard",
    "MoneyAceternityCard",
    "SuccessAceternityCard",
  ];

  expectedExports.forEach((exportName) => {
    if (indexContent.includes(exportName)) {
      console.log(`✅ ${exportName} exported`);
    } else {
      console.log(`❌ ${exportName} - Not exported!`);
    }
  });
} catch (error) {
  console.log("❌ Could not read design system index file");
}

// Test 3: Check home page integration
console.log("\n🏠 Checking home page integration...");
try {
  const homePagePath = path.join(
    process.cwd(),
    "src/app/[locale]/HomePageContent.tsx",
  );
  const homeContent = fs.readFileSync(homePagePath, "utf8");

  if (homeContent.includes("MoneyAceternityCard")) {
    console.log("✅ Aceternity cards integrated in home page");
  } else {
    console.log("❌ Aceternity cards not found in home page");
  }
} catch (error) {
  console.log("❌ Could not read home page file");
}

// Test 4: Check server status
console.log("\n🌐 Testing server endpoints...");

function testEndpoint(path, description) {
  return new Promise((resolve) => {
    const options = {
      hostname: "localhost",
      port: 3000,
      path: path,
      method: "GET",
      timeout: 5000,
    };

    const req = http.request(options, (res) => {
      console.log(`✅ ${description} - Status: ${res.statusCode}`);
      resolve(true);
    });

    req.on("error", (err) => {
      console.log(`❌ ${description} - Error: ${err.code}`);
      resolve(false);
    });

    req.on("timeout", () => {
      console.log(`⏱️  ${description} - Timeout`);
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

// Run server tests
async function runServerTests() {
  await testEndpoint("/", "Home page");
  await testEndpoint("/demo/aceternity", "Aceternity demo page");
  await testEndpoint(
    "/api/pexels/search?theme=money&per_page=1",
    "Pexels API endpoint",
  );

  console.log("\n🎉 Integration test completed!");
  console.log("\n📖 Usage:");
  console.log("• Visit http://localhost:3000/ to see enhanced home page");
  console.log("• Visit http://localhost:3000/demo/aceternity for full demo");
  console.log(
    '• Import components: import { MoneyAceternityCard } from "@/components/design-system"',
  );
}

runServerTests().catch(console.error);

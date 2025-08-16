#!/usr/bin/env node

// Vercel build diagnostic script
// Checks for common issues that cause module resolution failures

const fs = require("fs");
const path = require("path");

console.log("🔍 Vercel Build Diagnostic Check\n");

// List of problematic imports from the error
const problematicImports = [
  {
    import: "@/components/DemoAccountsInfo",
    file: "src/components/DemoAccountsInfo.tsx",
  },
  {
    import: "@/components/CalculatorForm",
    file: "src/components/CalculatorForm.tsx",
  },
  { import: "@/lib/demo-storage", file: "src/lib/demo-storage.ts" },
  { import: "@/lib/api-url", file: "src/lib/api-url.ts" },
  { import: "@/components/Logo", file: "src/components/Logo.tsx" },
];

let allGood = true;

problematicImports.forEach(({ import: importPath, file: filePath }) => {
  const fullPath = path.join(process.cwd(), filePath);
  const exists = fs.existsSync(fullPath);

  if (exists) {
    const stats = fs.statSync(fullPath);
    const content = fs.readFileSync(fullPath, "utf8");
    const hasDefaultExport =
      content.includes("export default") || content.includes("module.exports");

    console.log(`✅ ${importPath}`);
    console.log(`   📁 File: ${filePath}`);
    console.log(`   📊 Size: ${stats.size} bytes`);
    console.log(`   📤 Has default export: ${hasDefaultExport}`);
    console.log(
      `   📝 First line: ${content.split("\n")[0].substring(0, 50)}...`,
    );
  } else {
    console.log(`❌ ${importPath}`);
    console.log(`   📁 File: ${filePath} - MISSING!`);
    allGood = false;
  }
  console.log("");
});

// Check tsconfig.json path mapping
const tsconfigPath = path.join(process.cwd(), "tsconfig.json");
if (fs.existsSync(tsconfigPath)) {
  const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, "utf8"));
  console.log("📋 TypeScript path mapping:");
  console.log(`   baseUrl: ${tsconfig.compilerOptions?.baseUrl || "not set"}`);
  console.log(
    `   @/* mapping: ${JSON.stringify(tsconfig.compilerOptions?.paths?.["@/*"] || "not set")}`,
  );
  console.log("");
}

// Check for case sensitivity issues
console.log("🔤 Case sensitivity check:");
const srcComponents = path.join(process.cwd(), "src", "components");
const srcLib = path.join(process.cwd(), "src", "lib");

if (fs.existsSync(srcComponents)) {
  const componentFiles = fs.readdirSync(srcComponents);
  console.log(`   Components directory: ${componentFiles.length} files`);
  componentFiles.slice(0, 5).forEach((file) => console.log(`     - ${file}`));
  if (componentFiles.length > 5)
    console.log(`     ... and ${componentFiles.length - 5} more`);
}

if (fs.existsSync(srcLib)) {
  const libFiles = fs.readdirSync(srcLib);
  console.log(`   Lib directory: ${libFiles.length} files`);
  libFiles.slice(0, 5).forEach((file) => console.log(`     - ${file}`));
  if (libFiles.length > 5)
    console.log(`     ... and ${libFiles.length - 5} more`);
}

console.log(
  "\n" + (allGood ? "✅ All files found locally" : "❌ Some files are missing"),
);
console.log("\n💡 If build fails on Vercel but works locally:");
console.log("   1. Check case sensitivity (Linux vs macOS)");
console.log("   2. Verify all files are committed to git");
console.log("   3. Clear Vercel build cache");
console.log("   4. Check for hidden characters in imports");

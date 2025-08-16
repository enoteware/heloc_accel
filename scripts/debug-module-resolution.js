#!/usr/bin/env node

// Advanced module resolution debugging for Vercel builds
const fs = require("fs");
const path = require("path");

console.log("🔍 Advanced Module Resolution Debug\n");

// List of failing imports from build log
const failingImports = [
  {
    import: "@/components/DemoAccountsInfo",
    expectedFile: "src/components/DemoAccountsInfo.tsx",
  },
  {
    import: "@/components/CalculatorForm",
    expectedFile: "src/components/CalculatorForm.tsx",
  },
  { import: "@/lib/demo-storage", expectedFile: "src/lib/demo-storage.ts" },
  { import: "@/lib/api-url", expectedFile: "src/lib/api-url.ts" },
  { import: "@/components/Logo", expectedFile: "src/components/Logo.tsx" },
];

function checkFile(filePath) {
  const fullPath = path.join(process.cwd(), filePath);

  try {
    const stats = fs.statSync(fullPath);
    const content = fs.readFileSync(fullPath, "utf8");

    return {
      exists: true,
      size: stats.size,
      isDirectory: stats.isDirectory(),
      hasContent: content.length > 0,
      firstLine: content.split("\n")[0],
      lastModified: stats.mtime,
      permissions: stats.mode.toString(8),
    };
  } catch (error) {
    return {
      exists: false,
      error: error.code,
    };
  }
}

function analyzeImportResolution() {
  console.log("📁 File System Analysis:");
  console.log("========================\n");

  failingImports.forEach(({ import: importPath, expectedFile }) => {
    console.log(`🔗 Import: ${importPath}`);
    const fileInfo = checkFile(expectedFile);

    if (fileInfo.exists) {
      console.log(`  ✅ File exists: ${expectedFile}`);
      console.log(`  📊 Size: ${fileInfo.size} bytes`);
      console.log(`  🔐 Permissions: ${fileInfo.permissions}`);
      console.log(`  📅 Modified: ${fileInfo.lastModified.toISOString()}`);
      console.log(`  📝 First line: ${fileInfo.firstLine}`);

      if (!fileInfo.hasContent) {
        console.log(`  ⚠️  WARNING: File is empty!`);
      }
    } else {
      console.log(`  ❌ File missing: ${expectedFile}`);
      console.log(`  🚫 Error: ${fileInfo.error}`);
    }
    console.log("");
  });
}

function checkTsConfig() {
  console.log("⚙️  TypeScript Configuration:");
  console.log("=============================\n");

  const tsconfigPath = path.join(process.cwd(), "tsconfig.json");
  const tsconfigInfo = checkFile("tsconfig.json");

  if (tsconfigInfo.exists) {
    try {
      const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, "utf8"));
      console.log("✅ tsconfig.json found");
      console.log(
        `📂 baseUrl: ${tsconfig.compilerOptions?.baseUrl || "not set"}`,
      );
      console.log(`🔗 Path mappings:`);

      if (tsconfig.compilerOptions?.paths) {
        Object.entries(tsconfig.compilerOptions.paths).forEach(
          ([key, value]) => {
            console.log(`  ${key} -> ${JSON.stringify(value)}`);
          },
        );
      } else {
        console.log("  No path mappings found");
      }

      console.log(
        `🎯 Module resolution: ${tsconfig.compilerOptions?.moduleResolution || "not set"}`,
      );
      console.log(
        `📦 Include patterns: ${JSON.stringify(tsconfig.include || [])}`,
      );
      console.log(
        `🚫 Exclude patterns: ${JSON.stringify(tsconfig.exclude || [])}`,
      );
    } catch (error) {
      console.log("❌ Error parsing tsconfig.json:", error.message);
    }
  } else {
    console.log("❌ tsconfig.json not found");
  }
  console.log("");
}

function checkNextConfig() {
  console.log("⚙️  Next.js Configuration:");
  console.log("==========================\n");

  const nextConfigInfo = checkFile("next.config.js");
  if (nextConfigInfo.exists) {
    console.log("✅ next.config.js found");
    // We can't safely parse JS, but we can show it exists
  } else {
    console.log("❌ next.config.js not found");
  }
  console.log("");
}

function checkPackageJson() {
  console.log("📦 Package Configuration:");
  console.log("=========================\n");

  const packageInfo = checkFile("package.json");
  if (packageInfo.exists) {
    try {
      const pkg = JSON.parse(
        fs.readFileSync(path.join(process.cwd(), "package.json"), "utf8"),
      );
      console.log("✅ package.json found");
      console.log(`📛 Name: ${pkg.name}`);
      console.log(`🔢 Version: ${pkg.version}`);
      console.log(
        `⚡ Next.js version: ${pkg.dependencies?.next || "not found"}`,
      );
      console.log(
        `🔧 TypeScript version: ${pkg.devDependencies?.typescript || "not found"}`,
      );

      // Check if tailwindcss is in dependencies (our earlier fix)
      if (pkg.dependencies?.tailwindcss) {
        console.log("✅ tailwindcss in dependencies (fixed)");
      } else if (pkg.devDependencies?.tailwindcss) {
        console.log("⚠️  tailwindcss in devDependencies (may cause issues)");
      } else {
        console.log("❌ tailwindcss not found");
      }
    } catch (error) {
      console.log("❌ Error parsing package.json:", error.message);
    }
  } else {
    console.log("❌ package.json not found");
  }
  console.log("");
}

function generateRecommendations() {
  console.log("💡 Recommendations:");
  console.log("===================\n");

  const recommendations = [];

  // Check if all files exist
  const missingFiles = failingImports.filter(
    ({ expectedFile }) => !checkFile(expectedFile).exists,
  );
  if (missingFiles.length > 0) {
    recommendations.push(
      "❌ Missing files detected - restore from git or recreate",
    );
  }

  // Check for empty files
  const emptyFiles = failingImports.filter(({ expectedFile }) => {
    const info = checkFile(expectedFile);
    return info.exists && !info.hasContent;
  });
  if (emptyFiles.length > 0) {
    recommendations.push("⚠️  Empty files detected - restore content from git");
  }

  // Check tsconfig
  if (!checkFile("tsconfig.json").exists) {
    recommendations.push("❌ Missing tsconfig.json - create one");
  }

  if (recommendations.length === 0) {
    recommendations.push(
      "✅ All basic checks passed - issue may be Vercel-specific",
    );
    recommendations.push("🔄 Try: Clear Vercel build cache via dashboard");
    recommendations.push("🔄 Try: Different Next.js version");
    recommendations.push(
      "🔄 Try: Remove .next and node_modules, fresh install",
    );
  }

  recommendations.forEach((rec) => console.log(rec));
  console.log("");
}

// Run all checks
analyzeImportResolution();
checkTsConfig();
checkNextConfig();
checkPackageJson();
generateRecommendations();

console.log("🏁 Debug complete. Check output above for issues.");

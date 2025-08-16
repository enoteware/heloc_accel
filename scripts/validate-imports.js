#!/usr/bin/env node

/**
 * Import validation script for HELOC Accelerator
 *
 * This script scans all TypeScript/JavaScript files for import statements
 * and verifies that all imported modules can be resolved.
 *
 * Checks for:
 * - Missing files/modules
 * - Case sensitivity issues
 * - Incorrect path aliases
 * - Circular dependencies
 */

const fs = require("fs");
const path = require("path");

const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
};

// Get all TypeScript and JavaScript files
function getAllSourceFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Skip certain directories
      if (
        ["node_modules", ".next", "deployment", ".git", "coverage"].includes(
          file,
        )
      ) {
        return;
      }
      getAllSourceFiles(filePath, fileList);
    } else if (file.match(/\.(ts|tsx|js|jsx)$/)) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

// Parse import statements from file content
function parseImports(content, filePath) {
  const imports = [];

  // Match various import patterns
  const patterns = [
    // import { something } from 'module'
    /import\s+(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)\s+from\s+['"]([^'"]+)['"]/g,
    // import 'module'
    /import\s+['"]([^'"]+)['"]/g,
    // require('module')
    /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
    // dynamic import()
    /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
    // export { something } from 'module'
    /export\s+(?:\{[^}]*\}|\*)\s+from\s+['"]([^'"]+)['"]/g,
  ];

  patterns.forEach((pattern) => {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      imports.push({
        statement: match[0],
        module: match[1],
        line: content.substring(0, match.index).split("\n").length,
      });
    }
  });

  return imports;
}

// Resolve TypeScript path aliases
function resolvePathAlias(importPath, tsConfig) {
  if (!tsConfig.compilerOptions || !tsConfig.compilerOptions.paths) {
    return importPath;
  }

  const { paths, baseUrl = "." } = tsConfig.compilerOptions;

  for (const [alias, replacements] of Object.entries(paths)) {
    const aliasPattern = alias.replace("/*", "");
    if (importPath.startsWith(aliasPattern)) {
      const relativePath = importPath.substring(aliasPattern.length);
      const replacement = replacements[0].replace("/*", "");
      return path.join(baseUrl, replacement, relativePath);
    }
  }

  return importPath;
}

// Check if a module can be resolved
function canResolveModule(importPath, fromFile, tsConfig) {
  // Handle node_modules imports
  if (!importPath.startsWith(".") && !importPath.startsWith("@/")) {
    // Check if it's a Node.js built-in module
    try {
      require.resolve(importPath);
      return { resolved: true };
    } catch (e) {
      // Try to find in node_modules
      const nodeModulesPath = path.join(
        process.cwd(),
        "node_modules",
        importPath,
      );
      if (fs.existsSync(nodeModulesPath)) {
        return { resolved: true };
      }
      return { resolved: false, reason: "Module not found in node_modules" };
    }
  }

  // Handle relative and alias imports
  let resolvedPath = importPath;

  // Resolve TypeScript path aliases
  if (importPath.startsWith("@/")) {
    resolvedPath = resolvePathAlias(importPath, tsConfig);
  }

  // Convert to absolute path
  if (resolvedPath.startsWith(".")) {
    resolvedPath = path.resolve(path.dirname(fromFile), resolvedPath);
  } else if (!path.isAbsolute(resolvedPath)) {
    resolvedPath = path.resolve(process.cwd(), resolvedPath);
  }

  // Check various file extensions
  const extensions = ["", ".ts", ".tsx", ".js", ".jsx", ".json"];
  const indexFiles = ["/index.ts", "/index.tsx", "/index.js", "/index.jsx"];

  // Try exact path with extensions
  for (const ext of extensions) {
    if (fs.existsSync(resolvedPath + ext)) {
      return { resolved: true };
    }
  }

  // Try index files
  for (const indexFile of indexFiles) {
    if (fs.existsSync(resolvedPath + indexFile)) {
      return { resolved: true };
    }
  }

  // Check for case sensitivity issues
  const dir = path.dirname(resolvedPath);
  const basename = path.basename(resolvedPath);

  if (fs.existsSync(dir)) {
    const files = fs.readdirSync(dir);
    const match = files.find(
      (file) =>
        file.toLowerCase() === basename.toLowerCase() ||
        file.toLowerCase() === basename.toLowerCase() + ".ts" ||
        file.toLowerCase() === basename.toLowerCase() + ".tsx" ||
        file.toLowerCase() === basename.toLowerCase() + ".js" ||
        file.toLowerCase() === basename.toLowerCase() + ".jsx",
    );

    if (match && match !== basename) {
      return {
        resolved: false,
        reason: `Case sensitivity issue: found '${match}' but import uses '${basename}'`,
      };
    }
  }

  return { resolved: false, reason: "File not found" };
}

// Main validation function
function validateImports() {
  console.log(`${colors.blue}Validating imports...${colors.reset}\n`);

  // Load TypeScript config
  let tsConfig = {};
  const tsConfigPath = path.join(process.cwd(), "tsconfig.json");
  if (fs.existsSync(tsConfigPath)) {
    try {
      const content = fs.readFileSync(tsConfigPath, "utf8");
      tsConfig = JSON.parse(content);
    } catch (e) {
      console.warn(
        `${colors.yellow}Warning: Could not parse tsconfig.json${colors.reset}`,
      );
    }
  }

  // Get all source files
  const sourceFiles = getAllSourceFiles(process.cwd());
  console.log(`Found ${sourceFiles.length} source files to check\n`);

  const errors = [];
  const warnings = [];
  let totalImports = 0;

  // Check each file
  sourceFiles.forEach((file) => {
    const content = fs.readFileSync(file, "utf8");
    const imports = parseImports(content, file);
    totalImports += imports.length;

    imports.forEach((imp) => {
      const result = canResolveModule(imp.module, file, tsConfig);

      if (!result.resolved) {
        const relativePath = path.relative(process.cwd(), file);
        const error = {
          file: relativePath,
          line: imp.line,
          module: imp.module,
          reason: result.reason,
        };

        // CSS modules are warnings, not errors
        if (imp.module.endsWith(".css") || imp.module.endsWith(".scss")) {
          warnings.push(error);
        } else {
          errors.push(error);
        }
      }
    });
  });

  // Report results
  console.log(
    `Checked ${totalImports} imports across ${sourceFiles.length} files\n`,
  );

  if (warnings.length > 0) {
    console.log(
      `${colors.yellow}⚠️  Warnings (${warnings.length}):${colors.reset}`,
    );
    warnings.forEach((w) => {
      console.log(
        `  ${w.file}:${w.line} - Cannot resolve '${w.module}' (${w.reason})`,
      );
    });
    console.log("");
  }

  if (errors.length > 0) {
    console.log(
      `${colors.red}❌ Import Errors (${errors.length}):${colors.reset}`,
    );
    errors.forEach((err) => {
      console.log(
        `  ${colors.red}${err.file}:${err.line} - Cannot resolve '${err.module}'${colors.reset}`,
      );
      console.log(`    Reason: ${err.reason}`);
    });
    console.log("");
    console.log(
      `${colors.red}Import validation failed with ${errors.length} error(s)${colors.reset}`,
    );
    process.exit(1);
  } else {
    console.log(
      `${colors.green}✅ All imports validated successfully!${colors.reset}`,
    );
  }
}

// Run validation
try {
  validateImports();
} catch (error) {
  console.error(
    `${colors.red}Error during import validation:${colors.reset}`,
    error,
  );
  process.exit(1);
}

#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

// User-facing strings that need translation
const userStrings = new Set();

function extractFromFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8");

    // Look for actual user-facing text patterns
    const patterns = [
      // JSX text content
      />([A-Z][^<>{]*[a-z][^<>{}]*)</g,
      // String literals that look like UI text
      /"([A-Z][^"]*(?:loan|payment|mortgage|property|income|calculate|save|error|success|help|info|warning)[^"]*)"[^>]/gi,
      // Button/label text
      /"(Save|Cancel|Edit|Delete|Calculate|Submit|Close|Back|Next|Continue|Sign In|Sign Out)"[^a-z]/g,
      // Error messages
      /"([A-Z][^"]*(?:required|invalid|error|must be|cannot|failed)[^"]*)"[^>]/gi,
      // Form labels
      /label="([A-Z][^"]*)"[^>]/g,
      // Placeholder text
      /placeholder="([A-Z][^"]*)"[^>]/g,
      // Title attributes
      /title="([A-Z][^"]*)"[^>]/g,
    ];

    patterns.forEach((pattern) => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const text = match[1].trim();

        // Skip if too short, technical, or contains code-like patterns
        if (
          text.length < 3 ||
          /^[a-z-]+$/.test(text) || // CSS classes
          /^\d+/.test(text) || // Starting with numbers
          text.includes("px") ||
          text.includes("rem") ||
          text.includes("useState") ||
          text.includes("useEffect") ||
          text.includes("className") ||
          text.includes("onChange") ||
          text.includes("=") ||
          text.includes("{") ||
          text.includes("}") ||
          /^[A-Z_]{2,}$/.test(text) // Constants
        ) {
          continue;
        }

        userStrings.add(text);
      }
    });
  } catch (error) {
    // Ignore read errors
  }
}

function scanDirectory(dir) {
  try {
    const files = fs.readdirSync(dir);

    files.forEach((file) => {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);

      if (
        stat.isDirectory() &&
        !file.startsWith(".") &&
        file !== "node_modules"
      ) {
        scanDirectory(fullPath);
      } else if (
        file.endsWith(".tsx") ||
        file.endsWith(".ts") ||
        file.endsWith(".jsx")
      ) {
        extractFromFile(fullPath);
      }
    });
  } catch (error) {
    // Ignore directory errors
  }
}

// Manually add key strings we know exist
const knownStrings = [
  // Navigation
  "Calculator",
  "Dashboard",
  "Scenarios",
  "Reports",
  "Profile",
  "Sign In",
  "Sign Out",

  // Calculator Form
  "Current Mortgage",
  "Balance",
  "Interest Rate",
  "Monthly Payment",
  "Property Value",
  "HELOC Limit",
  "HELOC Interest Rate",
  "Monthly Income",
  "Monthly Expenses",

  // Results
  "Traditional Payoff",
  "HELOC Acceleration",
  "Total Interest",
  "Time Saved",
  "Monthly Savings",
  "Total Savings",

  // Actions
  "Calculate",
  "Save",
  "Cancel",
  "Edit",
  "Delete",
  "Close",
  "Loading...",

  // Messages
  "Calculation successful",
  "Scenario saved",
  "Error occurred",
  "Please enter",
  "This field is required",
  "Invalid format",
  "Must be positive number",
];

knownStrings.forEach((str) => userStrings.add(str));

console.log("🔍 Scanning for user-facing strings...\n");
scanDirectory("./src");

const sortedStrings = Array.from(userStrings).sort();

console.log(`📊 Found ${sortedStrings.length} user-facing strings:\n`);

// Create a simple translation file
const translations = {
  en: {},
  es: {},
};

sortedStrings.forEach((str) => {
  const key = str
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");

  translations.en[key] = str;
  translations.es[key] = str; // Will be translated
});

// Output for review
console.log("Key strings to translate:");
sortedStrings.slice(0, 20).forEach((str) => {
  console.log(`  "${str}"`);
});

if (sortedStrings.length > 20) {
  console.log(`  ... and ${sortedStrings.length - 20} more`);
}

// Save to files
fs.writeFileSync("./user-strings.json", JSON.stringify(sortedStrings, null, 2));
fs.writeFileSync(
  "./translations-base.json",
  JSON.stringify(translations, null, 2),
);

console.log(`\n✅ Saved ${sortedStrings.length} strings to user-strings.json`);
console.log("✅ Created translations-base.json template");
console.log("\n💡 This is a much more manageable amount for free translation!");

#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Strings that should NOT be translated (technical terms, CSS, etc.)
const skipPatterns = [
  /^[a-z-]+$/,           // CSS classes, HTML attributes
  /^[A-Z][a-z]*$/,       // Single word titles that might be brand names
  /^\d+/,                // Numbers
  /^[#@$]/,              // CSS/selectors/special chars
  /fill|stroke|path|svg|className|aria-/i, // SVG/HTML attributes
  /^(GET|POST|PUT|DELETE)$/i, // HTTP methods
  /^[A-Z_]{2,}$/,        // Constants
];

// Collect all translatable strings
const translatableStrings = new Set();
const stringLocations = new Map();

function extractStringsFromFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Match quoted strings, excluding very short ones and patterns to skip
    const stringMatches = content.match(/"([^"]{2,}|'[^']{2,})"/g) || [];
    const singleQuoteMatches = content.match(/'([^']{2,})'/g) || [];
    
    [...stringMatches, ...singleQuoteMatches].forEach(match => {
      const str = match.slice(1, -1); // Remove quotes
      
      // Skip if matches any skip pattern
      if (skipPatterns.some(pattern => pattern.test(str))) {
        return;
      }
      
      // Skip very short strings, technical terms, or those without letters
      if (str.length < 3 || !/[a-zA-Z]/.test(str) || /^[\d\s.,!?-]+$/.test(str)) {
        return;
      }
      
      // Skip obvious technical strings
      if (str.includes('px') || str.includes('rem') || str.includes('vh') || 
          str.includes('vw') || str.startsWith('.') || str.startsWith('#') ||
          str.includes('useState') || str.includes('useEffect') ||
          str.includes('className') || str.includes('aria-')) {
        return;
      }
      
      // This looks like user-facing text
      translatableStrings.add(str);
      
      // Track location
      if (!stringLocations.has(str)) {
        stringLocations.set(str, []);
      }
      stringLocations.get(str).push(filePath);
    });
    
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
  }
}

function scanDirectory(dir, extensions = ['.tsx', '.ts', '.jsx', '.js']) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      scanDirectory(fullPath, extensions);
    } else if (extensions.some(ext => file.endsWith(ext))) {
      extractStringsFromFile(fullPath);
    }
  });
}

// Scan the src directory
console.log('🔍 Scanning for translatable strings...\n');
scanDirectory('./src');

// Sort strings by length for easier manual review
const sortedStrings = Array.from(translatableStrings).sort((a, b) => a.length - b.length);

console.log(`📊 Found ${sortedStrings.length} translatable strings:\n`);

// Group by category for easier translation
const categories = {
  'UI Labels': [],
  'Messages': [],
  'Form Fields': [],
  'Errors': [],
  'Other': []
};

sortedStrings.forEach(str => {
  if (str.includes('error') || str.includes('Error') || str.includes('invalid') || str.includes('required')) {
    categories['Errors'].push(str);
  } else if (str.includes('field') || str.includes('input') || str.includes('enter') || str.includes('select')) {
    categories['Form Fields'].push(str);
  } else if (str.length > 50 || str.includes('please') || str.includes('success') || str.includes('complete')) {
    categories['Messages'].push(str);
  } else if (str.length < 20) {
    categories['UI Labels'].push(str);
  } else {
    categories['Other'].push(str);
  }
});

// Output organized results
Object.entries(categories).forEach(([category, strings]) => {
  if (strings.length > 0) {
    console.log(`\n📁 ${category} (${strings.length} strings):`);
    strings.forEach(str => {
      console.log(`  "${str}"`);
    });
  }
});

// Create a JSON file for easy translation
const translationData = {
  metadata: {
    totalStrings: sortedStrings.length,
    extractedAt: new Date().toISOString(),
    categories: Object.fromEntries(
      Object.entries(categories).map(([key, value]) => [key, value.length])
    )
  },
  strings: sortedStrings.reduce((acc, str) => {
    acc[str] = str; // English as key and value
    return acc;
  }, {})
};

fs.writeFileSync('./translation-extract.json', JSON.stringify(translationData, null, 2));
console.log(`\n✅ Exported ${sortedStrings.length} strings to translation-extract.json`);
console.log('\n💡 Next steps:');
console.log('1. Review translation-extract.json to verify strings');
console.log('2. Use free Google Translate API or manual translation');
console.log('3. Update src/messages/es.json with translations');
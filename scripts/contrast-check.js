#!/usr/bin/env node

/**
 * Contrast Check Script
 * 
 * Scans the entire codebase for potential contrast issues
 * and validates color combinations against WCAG standards.
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Color combination patterns to check
const DANGEROUS_PATTERNS = [
  // Exact dangerous combinations (only report real issues)
  { pattern: /\bbg-white\b.*?\btext-white\b/g, severity: 'error', message: 'White text on white background' },
  { pattern: /\bbg-neutral-50\b.*?\btext-white\b/g, severity: 'error', message: 'White text on light background' },
  { pattern: /\bbg-neutral-100\b.*?\btext-neutral-100\b/g, severity: 'error', message: 'Same light colors' },
  { pattern: /\bbg-neutral-800\b.*?\btext-neutral-800\b/g, severity: 'error', message: 'Same dark colors' },
  { pattern: /\bbg-neutral-900\b.*?\btext-neutral-900\b/g, severity: 'error', message: 'Same dark colors' },
  { pattern: /\bbg-black\b.*?\btext-black\b/g, severity: 'error', message: 'Black text on black background' },
  
  // Potentially problematic combinations
  { pattern: /\bbg-yellow-[12]\d{2}\b.*?\btext-white\b/g, severity: 'warning', message: 'White text on yellow may have poor contrast' },
];

// Safe combinations that should not trigger warnings
const SAFE_WHITE_COMBINATIONS = [
  'bg-primary-500 text-white',
  'bg-primary-600 text-white', 
  'bg-secondary-500 text-white',
  'bg-secondary-600 text-white',
  'bg-red-500 text-white',
  'bg-green-500 text-white',
  'bg-blue-500 text-white',
  'bg-neutral-800 text-white',
  'bg-neutral-900 text-white'
];

class ContrastChecker {
  constructor() {
    this.issues = [];
    this.fileCount = 0;
    this.checkedFiles = [];
  }

  scanFiles() {
    console.log('🔍 Scanning for contrast issues...\n');
    
    // Find all relevant files
    const patterns = [
      'src/**/*.tsx',
      'src/**/*.ts',
      'src/**/*.jsx', 
      'src/**/*.js',
      'src/**/*.css'
    ];
    
    const files = [];
    for (const pattern of patterns) {
      const matched = glob.sync(pattern, { 
        ignore: [
          'node_modules/**', 
          '.next/**', 
          'build/**', 
          'dist/**',
          'src/__tests__/**', // Ignore test files that intentionally have bad combinations
          '**/*.test.*',
          '**/*.spec.*'
        ] 
      });
      files.push(...matched);
    }
    
    // Remove duplicates
    const uniqueFiles = [...new Set(files)];
    
    console.log(`Found ${uniqueFiles.length} files to check`);
    
    for (const file of uniqueFiles) {
      this.checkFile(file);
    }
    
    return this.generateReport();
  }

  checkFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      this.fileCount++;
      this.checkedFiles.push(filePath);
      
      // Skip documentation files that show dangerous examples intentionally
      if (filePath.includes('useContrastValidation.ts') || 
          filePath.includes('contrast-safe.css') ||
          filePath.includes('CONTRAST_SAFETY.md')) {
        return;
      }
      
      // Check for dangerous patterns
      for (const { pattern, severity, message } of DANGEROUS_PATTERNS) {
        let match;
        const regex = new RegExp(pattern.source, 'g');
        
        while ((match = regex.exec(content)) !== null) {
          const lineNumber = this.getLineNumber(content, match.index);
          const contextLine = this.getContextLine(content, match.index);
          
          // Skip if it's a safe combination
          if (this.isSafeCombination(match[0])) {
            continue;
          }
          
          // Skip if it's in a comment showing bad examples
          if (contextLine.includes('// ❌') || contextLine.includes('/* ❌') || 
              contextLine.includes('dangerousCombinations') ||
              contextLine.includes('never match')) {
            continue;
          }
          
          this.issues.push({
            file: filePath,
            line: lineNumber,
            severity,
            message,
            match: match[0],
            context: contextLine.trim()
          });
        }
      }
      
      // Check for className concatenation that might hide issues
      this.checkClassNameConcatenation(filePath, content);
      
    } catch (error) {
      console.error(`Error checking ${filePath}:`, error.message);
    }
  }

  checkClassNameConcatenation(filePath, content) {
    // Look for template literals and string concatenation in className
    const patterns = [
      /className=\{`[^`]*\$\{[^}]*\}[^`]*`\}/g,
      /className=\{[^}]*\+[^}]*\}/g,
      /cn\([^)]*\)/g
    ];
    
    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const lineNumber = this.getLineNumber(content, match.index);
        const contextLine = this.getContextLine(content, match.index);
        
        // Check if the concatenated string might contain dangerous combinations
        if (this.containsPotentialIssue(match[0])) {
          this.issues.push({
            file: filePath,
            line: lineNumber,
            severity: 'info',
            message: 'Dynamic className - manual review needed for contrast safety',
            match: match[0],
            context: contextLine.trim()
          });
        }
      }
    });
  }

  containsPotentialIssue(classNameExpression) {
    // Simple heuristics to detect potential issues in dynamic classNames
    const dangerousKeywords = [
      'bg-white', 'text-white',
      'bg-black', 'text-black', 
      'bg-neutral', 'text-neutral',
      'bg-primary', 'text-primary'
    ];
    
    return dangerousKeywords.some(keyword => 
      classNameExpression.includes(keyword)
    );
  }

  isSafeCombination(combination) {
    // Check against known safe combinations
    return SAFE_WHITE_COMBINATIONS.some(safe => 
      combination.includes(safe.replace(/\s+/g, '.*'))
    );
  }

  getLineNumber(content, index) {
    return content.substring(0, index).split('\n').length;
  }

  getContextLine(content, index) {
    const lines = content.split('\n');
    const lineNum = this.getLineNumber(content, index) - 1;
    return lines[lineNum] || '';
  }

  generateReport() {
    console.log('\n📊 Contrast Check Results');
    console.log('========================\n');
    
    if (this.issues.length === 0) {
      console.log('✅ No contrast issues found!');
      console.log(`Checked ${this.fileCount} files successfully.\n`);
      return { success: true, issues: [] };
    }
    
    // Group issues by severity
    const errors = this.issues.filter(issue => issue.severity === 'error');
    const warnings = this.issues.filter(issue => issue.severity === 'warning');
    const info = this.issues.filter(issue => issue.severity === 'info');
    
    // Report errors
    if (errors.length > 0) {
      console.log(`🚨 ${errors.length} Critical Contrast Errors:`);
      console.log('These MUST be fixed - they result in unreadable text\n');
      
      errors.forEach((issue, i) => {
        console.log(`${i + 1}. ${issue.file}:${issue.line}`);
        console.log(`   Error: ${issue.message}`);
        console.log(`   Found: ${issue.match}`);
        console.log(`   Context: ${issue.context}`);
        console.log('');
      });
    }
    
    // Report warnings
    if (warnings.length > 0) {
      console.log(`⚠️  ${warnings.length} Potential Contrast Warnings:`);
      console.log('These should be reviewed for accessibility\n');
      
      warnings.forEach((issue, i) => {
        console.log(`${i + 1}. ${issue.file}:${issue.line}`);
        console.log(`   Warning: ${issue.message}`);
        console.log(`   Found: ${issue.match}`);
        console.log(`   Context: ${issue.context}`);
        console.log('');
      });
    }
    
    // Report info items
    if (info.length > 0) {
      console.log(`ℹ️  ${info.length} Items for Manual Review:`);
      console.log('Dynamic classNames that need manual verification\n');
      
      info.forEach((issue, i) => {
        console.log(`${i + 1}. ${issue.file}:${issue.line}`);
        console.log(`   Info: ${issue.message}`);
        console.log(`   Found: ${issue.match}`);
        console.log(`   Context: ${issue.context}`);
        console.log('');
      });
    }
    
    // Summary
    console.log('Summary:');
    console.log(`- Files checked: ${this.fileCount}`);
    console.log(`- Critical errors: ${errors.length}`);
    console.log(`- Warnings: ${warnings.length}`);
    console.log(`- Manual review needed: ${info.length}`);
    console.log('');
    
    // Recommendations
    if (errors.length > 0 || warnings.length > 0) {
      console.log('💡 Recommendations:');
      console.log('1. Use safe-* utility classes from contrast-safe.css');
      console.log('2. Test combinations with `npm run test:accessibility`');
      console.log('3. Use the validateTailwindCombination() utility function');
      console.log('4. Consider the useContrastValidation() hook for dynamic colors');
      console.log('');
    }
    
    return {
      success: errors.length === 0,
      issues: this.issues,
      summary: {
        filesChecked: this.fileCount,
        errors: errors.length,
        warnings: warnings.length,
        info: info.length
      }
    };
  }
}

// CLI interface
function main() {
  const checker = new ContrastChecker();
  const result = checker.scanFiles();
  
  // Exit with error code if critical issues found
  process.exit(result.success ? 0 : 1);
}

// Run if called directly
if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error('Contrast check failed:', error);
    process.exit(1);
  }
}

module.exports = { ContrastChecker };
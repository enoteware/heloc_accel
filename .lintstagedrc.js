module.exports = {
  // JavaScript/TypeScript files
  "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"],

  // CSS files
  "*.{css,scss}": ["prettier --write"],

  // Run contrast check on any file that might contain color classes
  "*.{js,jsx,ts,tsx,css}": ["node scripts/contrast-check.js"],

  // Temporarily disable accessibility tests during commit
  // "src/components/**/*.{ts,tsx}": [
  //   "npm run test -- --testPathPattern=accessibility --passWithNoTests",
  // ],
};

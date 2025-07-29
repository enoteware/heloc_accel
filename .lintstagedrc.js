module.exports = {
  // JavaScript/TypeScript files
  '*.{js,jsx,ts,tsx}': [
    'eslint --fix',
    'prettier --write',
  ],
  
  // CSS files
  '*.{css,scss}': [
    'prettier --write',
  ],
  
  // Run contrast check on any file that might contain color classes
  '*.{js,jsx,ts,tsx,css}': [
    'node scripts/contrast-check.js',
  ],
  
  // Run tests for accessibility on component changes
  'src/components/**/*.{ts,tsx}': [
    'npm run test -- --testPathPattern=accessibility --passWithNoTests',
  ],
};
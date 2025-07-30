#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const isI18nEnabled = process.argv[2] === 'enable';

if (isI18nEnabled) {
  console.log('🌍 Enabling internationalization...');
  
  // Move pages to locale structure if not already there
  if (fs.existsSync('./src/app/page.tsx') && !fs.existsSync('./src/app/[locale]/page.tsx')) {
    // Backup original
    if (!fs.existsSync('./src/app/page.tsx.backup')) {
      fs.copyFileSync('./src/app/page.tsx', './src/app/page.tsx.backup');
    }
    if (!fs.existsSync('./src/app/layout.tsx.backup')) {
      fs.copyFileSync('./src/app/layout.tsx', './src/app/layout.tsx.backup');
    }
  }
  
  console.log('✅ I18n enabled - pages now use locale structure');
  console.log('🔗 Access your app at:');
  console.log('   English: http://localhost:3000/en');
  console.log('   Spanish: http://localhost:3000/es');
  
} else {
  console.log('🔧 Disabling internationalization...');
  
  // Restore original pages if backups exist
  if (fs.existsSync('./src/app/page.tsx.backup')) {
    fs.copyFileSync('./src/app/page.tsx.backup', './src/app/page.tsx');
    console.log('✅ Restored original page.tsx');
  }
  
  if (fs.existsSync('./src/app/layout.tsx.backup')) {
    fs.copyFileSync('./src/app/layout.tsx.backup', './src/app/layout.tsx');
    console.log('✅ Restored original layout.tsx');
  }
  
  console.log('✅ I18n disabled - back to original structure');
  console.log('🔗 Access your app at: http://localhost:3000');
}

console.log('\n💡 You can switch anytime with:');
console.log('   node scripts/toggle-i18n.js enable');
console.log('   node scripts/toggle-i18n.js disable');
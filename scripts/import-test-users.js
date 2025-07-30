#!/usr/bin/env node

/**
 * Import Test Users to NEON Database
 * 
 * This script imports the test user accounts from dummy-users.ts into the NEON database
 * with properly hashed passwords for production authentication.
 * 
 * Usage: node scripts/import-test-users.js
 */

const { Client } = require('pg');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Test users to import (from dummy-users.ts)
const TEST_USERS = [
  {
    email: 'demo@example.com',
    password: 'demo123',
    firstName: 'Demo',
    lastName: 'User'
  },
  {
    email: 'john@example.com',
    password: 'password123',
    firstName: 'John',
    lastName: 'Smith'
  },
  {
    email: 'jane@example.com',
    password: 'password123',
    firstName: 'Jane',
    lastName: 'Doe'
  }
];

async function importTestUsers() {
  console.log('🚀 Importing test users into NEON database...\n');

  // Check database connection
  if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('[username]')) {
    console.error('❌ Error: DATABASE_URL not configured properly in .env.local');
    process.exit(1);
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('🔌 Connecting to NEON database...');
    await client.connect();
    console.log('✅ Connected successfully!\n');

    // Check if users already exist
    const existingUsers = await client.query('SELECT email FROM users WHERE email = ANY($1)', 
      [TEST_USERS.map(u => u.email)]);
    
    if (existingUsers.rows.length > 0) {
      console.log('⚠️  Some test users already exist:');
      existingUsers.rows.forEach(row => {
        console.log(`  - ${row.email}`);
      });
      
      const readline = require('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      const answer = await new Promise(resolve => {
        rl.question('\nDo you want to update existing users? (y/N): ', resolve);
      });
      rl.close();
      
      if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
        console.log('❌ Import cancelled by user');
        process.exit(0);
      }
    }

    console.log('🔒 Hashing passwords...');
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    
    // Process each user
    for (const user of TEST_USERS) {
      const hashedPassword = await bcrypt.hash(user.password, saltRounds);
      const userId = uuidv4();
      
      console.log(`📝 Processing ${user.email}...`);
      
      // Check if user exists
      const existingUser = await client.query('SELECT id FROM users WHERE email = $1', [user.email]);
      
      if (existingUser.rows.length > 0) {
        // Update existing user
        await client.query(`
          UPDATE users 
          SET password_hash = $1, first_name = $2, last_name = $3, updated_at = CURRENT_TIMESTAMP
          WHERE email = $4
        `, [hashedPassword, user.firstName, user.lastName, user.email]);
        
        console.log(`  ✅ Updated existing user: ${user.email}`);
      } else {
        // Insert new user
        await client.query(`
          INSERT INTO users (id, email, password_hash, first_name, last_name, is_active, email_verified)
          VALUES ($1, $2, $3, $4, $5, true, true)
        `, [userId, user.email, hashedPassword, user.firstName, user.lastName]);
        
        console.log(`  ✅ Created new user: ${user.email}`);
      }
    }

    // Verify import
    console.log('\n🧪 Verifying imported users...');
    const result = await client.query(`
      SELECT id, email, first_name, last_name, is_active, email_verified, created_at
      FROM users 
      WHERE email = ANY($1)
      ORDER BY email
    `, [TEST_USERS.map(u => u.email)]);

    console.log('\n📊 Imported users:');
    result.rows.forEach(user => {
      console.log(`  ✓ ${user.email} (${user.first_name} ${user.last_name}) - Active: ${user.is_active}, Verified: ${user.email_verified}`);
    });

    console.log(`\n🎉 Successfully imported ${result.rows.length} test users!`);
    console.log('\n📝 Next steps:');
    console.log('1. Update auth.ts to use database authentication');
    console.log('2. Disable demo mode in .env.local');
    console.log('3. Test login with imported users');
    console.log('\n🔑 Test user credentials:');
    TEST_USERS.forEach(user => {
      console.log(`  - ${user.email} / ${user.password}`);
    });

  } catch (error) {
    console.error('❌ Error importing users:', error.message);
    
    if (error.code === '23505') {
      console.log('\n🔧 This error usually means a user already exists.');
      console.log('Run the script again and choose to update existing users.');
    }
    
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Add uuid dependency check
try {
  require('uuid');
} catch (error) {
  console.error('❌ Missing uuid dependency. Installing...');
  const { exec } = require('child_process');
  exec('npm install uuid', (error) => {
    if (error) {
      console.error('Failed to install uuid. Please run: npm install uuid');
      process.exit(1);
    }
    console.log('✅ uuid installed successfully');
    importTestUsers().catch(console.error);
  });
}

// Run the import
if (require.main === module) {
  importTestUsers().catch(console.error);
}

module.exports = { importTestUsers };
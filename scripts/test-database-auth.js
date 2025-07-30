#!/usr/bin/env node

/**
 * Test Database Authentication
 * 
 * This script tests the database authentication by simulating login attempts
 * with the imported test users.
 * 
 * Usage: node scripts/test-database-auth.js
 */

const { Client } = require('pg');
const bcrypt = require('bcryptjs');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Test credentials
const TEST_CREDENTIALS = [
  { email: 'demo@example.com', password: 'demo123' },
  { email: 'john@example.com', password: 'password123' },
  { email: 'jane@example.com', password: 'password123' },
  { email: 'invalid@example.com', password: 'wrongpassword' }, // Should fail
];

async function testAuthentication() {
  console.log('🧪 Testing database authentication...\n');

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
    await client.connect();
    console.log('✅ Connected to NEON database\n');

    // Test each credential
    for (const cred of TEST_CREDENTIALS) {
      console.log(`🔐 Testing: ${cred.email}`);
      
      try {
        // Find user by email
        const result = await client.query(
          'SELECT id, email, password_hash, first_name, last_name, is_active FROM users WHERE email = $1 AND is_active = true',
          [cred.email]
        );
        
        if (result.rows.length === 0) {
          console.log(`  ❌ User not found: ${cred.email}`);
          continue;
        }
        
        const user = result.rows[0];
        
        // Verify password
        const isValidPassword = await bcrypt.compare(cred.password, user.password_hash);
        
        if (isValidPassword) {
          console.log(`  ✅ Authentication successful: ${user.first_name} ${user.last_name}`);
        } else {
          console.log(`  ❌ Invalid password for: ${cred.email}`);
        }
        
      } catch (error) {
        console.log(`  ❌ Error testing ${cred.email}: ${error.message}`);
      }
    }

    // Show user statistics
    console.log('\n📊 Database statistics:');
    const userCount = await client.query('SELECT COUNT(*) FROM users WHERE is_active = true');
    const allUsers = await client.query('SELECT email, first_name, last_name FROM users WHERE is_active = true ORDER BY email');
    
    console.log(`  Total active users: ${userCount.rows[0].count}`);
    console.log('  Users in database:');
    allUsers.rows.forEach(user => {
      console.log(`    - ${user.email} (${user.first_name} ${user.last_name})`);
    });

    console.log('\n🎉 Authentication testing completed!');
    console.log('\n📝 Next steps:');
    console.log('1. Visit http://localhost:3002/login');
    console.log('2. Test login with these credentials:');
    console.log('   - demo@example.com / demo123456');
    console.log('   - john@example.com / password123456');
    console.log('   - jane@example.com / password123456');

  } catch (error) {
    console.error('❌ Error testing authentication:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Run the test
if (require.main === module) {
  testAuthentication().catch(console.error);
}

module.exports = { testAuthentication };
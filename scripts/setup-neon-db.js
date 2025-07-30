#!/usr/bin/env node

/**
 * NEON Database Setup Script
 * 
 * This script helps set up the HELOC Accelerator database schema in NEON.
 * 
 * Prerequisites:
 * 1. Have your NEON connection string ready
 * 2. Update the DATABASE_URL in .env.local with your NEON connection string
 * 
 * Usage:
 * 1. First, update your .env.local file with your NEON connection string:
 *    DATABASE_URL=postgresql://username:password@endpoint/database?sslmode=require
 * 
 * 2. Run this script:
 *    node scripts/setup-neon-db.js
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

async function setupNeonDatabase() {
  console.log('🚀 Setting up NEON PostgreSQL database for HELOC Accelerator...\n');

  // Check if DATABASE_URL is configured
  if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('[username]')) {
    console.error('❌ Error: DATABASE_URL not configured properly in .env.local');
    console.log('\n📝 To fix this:');
    console.log('1. Go to your NEON dashboard');
    console.log('2. Copy your connection string');
    console.log('3. Update DATABASE_URL in .env.local file');
    console.log('4. Format: DATABASE_URL=postgresql://username:password@endpoint/database?sslmode=require\n');
    process.exit(1);
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false // Required for NEON
    }
  });

  try {
    console.log('🔌 Connecting to NEON database...');
    await client.connect();
    console.log('✅ Connected successfully!\n');

    // Read and execute the schema file
    const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
    
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Schema file not found at: ${schemaPath}`);
    }

    console.log('📄 Reading database schema...');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('🔨 Creating database schema in NEON...');
    await client.query(schema);
    
    console.log('✅ Database schema created successfully!\n');

    // Test the setup by querying tables
    console.log('🧪 Testing database setup...');
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('📊 Created tables:');
    result.rows.forEach(row => {
      console.log(`  ✓ ${row.table_name}`);
    });

    // Check if default data was inserted
    const userCount = await client.query('SELECT COUNT(*) FROM users');
    const scenarioCount = await client.query('SELECT COUNT(*) FROM scenarios');
    
    console.log('\n📈 Database statistics:');
    console.log(`  Users: ${userCount.rows[0].count}`);
    console.log(`  Scenarios: ${scenarioCount.rows[0].count}`);

    console.log('\n🎉 NEON database setup completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Test the connection: npm run test');
    console.log('2. Start development: npm run dev');
    console.log('3. Access the app at: http://localhost:3000');

  } catch (error) {
    console.error('❌ Error setting up database:', error.message);
    
    if (error.message.includes('connect ENOTFOUND') || error.message.includes('connection refused')) {
      console.log('\n🔧 Connection troubleshooting:');
      console.log('1. Check your NEON connection string in .env.local');
      console.log('2. Ensure your NEON database is active (not in sleep mode)');
      console.log('3. Verify your internet connection');
    }
    
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Run the setup
if (require.main === module) {
  setupNeonDatabase().catch(console.error);
}

module.exports = { setupNeonDatabase };
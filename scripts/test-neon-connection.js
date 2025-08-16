#!/usr/bin/env node

/**
 * NEON Database Connection Test
 *
 * Quick test to verify your NEON database connection is working.
 *
 * Usage: node scripts/test-neon-connection.js
 */

const { Client } = require("pg");

// Load environment variables
require("dotenv").config({ path: ".env.local" });

async function testConnection() {
  console.log("🔌 Testing NEON PostgreSQL connection...\n");

  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL not found in .env.local");
    process.exit(1);
  }

  if (process.env.DATABASE_URL.includes("[username]")) {
    console.error("❌ DATABASE_URL not configured properly in .env.local");
    console.log(
      "Please replace [username], [password], [endpoint], and [database] with your actual NEON values",
    );
    process.exit(1);
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    await client.connect();
    console.log("✅ Connected to NEON successfully!");

    // Test basic query
    const result = await client.query(
      "SELECT NOW() as current_time, version() as db_version",
    );
    console.log(`📅 Current time: ${result.rows[0].current_time}`);
    console.log(
      `🗄️  Database: ${result.rows[0].db_version.split(" ")[0]} ${result.rows[0].db_version.split(" ")[1]}`,
    );

    // Check if tables exist
    const tables = await client.query(`
      SELECT COUNT(*) as table_count 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);

    console.log(`📊 Tables in database: ${tables.rows[0].table_count}`);

    if (parseInt(tables.rows[0].table_count) === 0) {
      console.log("\n💡 No tables found. Run the setup script:");
      console.log("   node scripts/setup-neon-db.js");
    }

    console.log("\n🎉 Connection test passed!");
  } catch (error) {
    console.error("❌ Connection failed:", error.message);

    if (error.code === "ENOTFOUND") {
      console.log("\n🔧 Possible issues:");
      console.log("• Check your NEON endpoint URL");
      console.log("• Verify internet connection");
      console.log("• Ensure NEON database is not in sleep mode");
    } else if (error.code === "28P01") {
      console.log("\n🔧 Authentication failed:");
      console.log("• Check your username and password");
      console.log("• Verify credentials in NEON dashboard");
    }

    process.exit(1);
  } finally {
    await client.end();
  }
}

testConnection().catch(console.error);

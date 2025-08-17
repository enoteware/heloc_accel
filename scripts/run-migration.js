#!/usr/bin/env node

const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

// Load environment variables
require("dotenv").config({ path: ".env.local" });

async function runMigration(migrationFile) {
  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL not found in environment");
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    const migrationPath = path.join(
      __dirname,
      "../database/migrations",
      migrationFile,
    );

    if (!fs.existsSync(migrationPath)) {
      console.error(`❌ Migration file not found: ${migrationPath}`);
      process.exit(1);
    }

    const migrationSQL = fs.readFileSync(migrationPath, "utf8");

    console.log(`🚀 Running migration: ${migrationFile}`);
    console.log("📄 SQL to execute:");
    console.log(migrationSQL);
    console.log("═".repeat(50));

    const client = await pool.connect();
    try {
      await client.query(migrationSQL);
      console.log("✅ Migration completed successfully!");
    } catch (error) {
      if (error.message.includes("already exists")) {
        console.log("⚠️  Migration already applied (column/index exists)");
      } else {
        throw error;
      }
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Get migration file from command line argument
const migrationFile = process.argv[2];

if (!migrationFile) {
  console.error("Usage: node scripts/run-migration.js <migration-file>");
  console.error(
    "Example: node scripts/run-migration.js 001_add_stack_auth_id.sql",
  );
  process.exit(1);
}

runMigration(migrationFile);

#!/usr/bin/env node

/**
 * Apply Budgeting Tool Migration
 * Applies only the budgeting-specific schema changes to existing database
 */

const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

// Configuration
const config = {
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://heloc_user:heloc_password@localhost:5432/heloc_accelerator",
  ssl: false,
};

// Colors for output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

const log = (message, color = "green") => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const error = (message) => {
  console.error(`${colors.red}[ERROR] ${message}${colors.reset}`);
};

const info = (message) => {
  console.log(`${colors.blue}[INFO] ${message}${colors.reset}`);
};

async function applyBudgetingMigration() {
  const pool = new Pool(config);

  try {
    info("Connecting to database...");

    // Check if budgeting tables already exist
    const checkQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('budget_scenarios', 'income_scenarios', 'expense_scenarios', 'budget_calculation_results');
    `;

    const existingTables = await pool.query(checkQuery);

    if (existingTables.rows.length > 0) {
      log("Budgeting tables already exist:", "yellow");
      existingTables.rows.forEach((row) => {
        log(`  - ${row.table_name}`, "yellow");
      });
      log("Migration already applied or partially applied.", "yellow");
      return;
    }

    info("Reading budgeting migration file...");
    const migrationPath = path.join(
      process.cwd(),
      "database",
      "migrations",
      "001_budgeting_tool_schema.sql",
    );

    if (!fs.existsSync(migrationPath)) {
      throw new Error(`Migration file not found: ${migrationPath}`);
    }

    const migrationSQL = fs.readFileSync(migrationPath, "utf8");

    info("Applying budgeting schema migration...");

    // Execute the migration in a transaction
    await pool.query("BEGIN");

    try {
      await pool.query(migrationSQL);
      await pool.query("COMMIT");

      log("✅ Budgeting schema migration applied successfully!");

      // Verify the tables were created
      const verifyQuery = `
        SELECT table_name, 
               (SELECT count(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
        FROM information_schema.tables t
        WHERE table_schema = 'public' 
        AND table_name IN ('budget_scenarios', 'income_scenarios', 'expense_scenarios', 'budget_calculation_results', 'budget_scenario_templates')
        ORDER BY table_name;
      `;

      const createdTables = await pool.query(verifyQuery);

      log("Created tables:", "cyan");
      createdTables.rows.forEach((row) => {
        log(`  ✓ ${row.table_name} (${row.column_count} columns)`, "green");
      });

      // Check if template data was inserted
      const templateCount = await pool.query(
        "SELECT COUNT(*) FROM budget_scenario_templates",
      );
      log(
        `  ✓ ${templateCount.rows[0].count} scenario templates inserted`,
        "green",
      );
    } catch (err) {
      await pool.query("ROLLBACK");
      throw err;
    }
  } catch (err) {
    error(`Migration failed: ${err.message}`);
    if (err.code) {
      error(`Error code: ${err.code}`);
    }
    if (err.detail) {
      error(`Details: ${err.detail}`);
    }
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the migration
if (require.main === module) {
  applyBudgetingMigration();
}

module.exports = { applyBudgetingMigration };

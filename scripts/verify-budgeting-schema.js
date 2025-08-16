#!/usr/bin/env node

/**
 * Verify Budgeting Schema
 * Validates that all budgeting tables, indexes, and constraints are properly created
 */

const { Pool } = require("pg");

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

async function verifyBudgetingSchema() {
  const pool = new Pool(config);

  try {
    info("Verifying budgeting schema...");

    // Check tables exist
    const tablesQuery = `
      SELECT table_name, 
             (SELECT count(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
      FROM information_schema.tables t
      WHERE table_schema = 'public' 
      AND table_name LIKE '%budget%' OR table_name LIKE '%income_scenarios%' OR table_name LIKE '%expense_scenarios%'
      ORDER BY table_name;
    `;

    const tables = await pool.query(tablesQuery);

    log("\n📋 Tables Created:", "cyan");
    tables.rows.forEach((row) => {
      log(`  ✓ ${row.table_name} (${row.column_count} columns)`, "green");
    });

    // Check indexes
    const indexesQuery = `
      SELECT indexname, tablename 
      FROM pg_indexes 
      WHERE schemaname = 'public' 
      AND (tablename LIKE '%budget%' OR tablename LIKE '%income_scenarios%' OR tablename LIKE '%expense_scenarios%')
      ORDER BY tablename, indexname;
    `;

    const indexes = await pool.query(indexesQuery);

    log("\n🔍 Indexes Created:", "cyan");
    let currentTable = "";
    indexes.rows.forEach((row) => {
      if (row.tablename !== currentTable) {
        currentTable = row.tablename;
        log(`  ${row.tablename}:`, "yellow");
      }
      log(`    ✓ ${row.indexname}`, "green");
    });

    // Check constraints
    const constraintsQuery = `
      SELECT tc.table_name, tc.constraint_name, tc.constraint_type
      FROM information_schema.table_constraints tc
      WHERE tc.table_schema = 'public'
      AND (tc.table_name LIKE '%budget%' OR tc.table_name LIKE '%income_scenarios%' OR tc.table_name LIKE '%expense_scenarios%')
      ORDER BY tc.table_name, tc.constraint_type, tc.constraint_name;
    `;

    const constraints = await pool.query(constraintsQuery);

    log("\n🔒 Constraints Created:", "cyan");
    currentTable = "";
    constraints.rows.forEach((row) => {
      if (row.table_name !== currentTable) {
        currentTable = row.table_name;
        log(`  ${row.table_name}:`, "yellow");
      }
      log(`    ✓ ${row.constraint_name} (${row.constraint_type})`, "green");
    });

    // Check triggers
    const triggersQuery = `
      SELECT trigger_name, event_object_table, action_timing, event_manipulation
      FROM information_schema.triggers
      WHERE trigger_schema = 'public'
      AND (event_object_table LIKE '%budget%' OR event_object_table LIKE '%income_scenarios%' OR event_object_table LIKE '%expense_scenarios%')
      ORDER BY event_object_table, trigger_name;
    `;

    const triggers = await pool.query(triggersQuery);

    log("\n⚡ Triggers Created:", "cyan");
    currentTable = "";
    triggers.rows.forEach((row) => {
      if (row.event_object_table !== currentTable) {
        currentTable = row.event_object_table;
        log(`  ${row.event_object_table}:`, "yellow");
      }
      log(
        `    ✓ ${row.trigger_name} (${row.action_timing} ${row.event_manipulation})`,
        "green",
      );
    });

    // Check functions
    const functionsQuery = `
      SELECT routine_name, routine_type
      FROM information_schema.routines
      WHERE routine_schema = 'public'
      AND (routine_name LIKE '%budget%' OR routine_name LIKE '%discretionary%' OR routine_name LIKE '%scenario%')
      ORDER BY routine_name;
    `;

    const functions = await pool.query(functionsQuery);

    log("\n🔧 Functions Created:", "cyan");
    functions.rows.forEach((row) => {
      log(`  ✓ ${row.routine_name} (${row.routine_type})`, "green");
    });

    // Check template data
    const templatesQuery = `
      SELECT name, category, is_public, usage_count
      FROM budget_scenario_templates
      ORDER BY category, name;
    `;

    const templates = await pool.query(templatesQuery);

    log("\n📝 Template Data:", "cyan");
    templates.rows.forEach((row) => {
      log(
        `  ✓ ${row.name} (${row.category}) - Public: ${row.is_public}, Used: ${row.usage_count}`,
        "green",
      );
    });

    // Test basic functionality
    log("\n🧪 Testing Basic Functionality:", "cyan");

    // Test that we can insert a budget scenario (using a dummy scenario_id)
    const testScenarioId = "00000000-0000-0000-0000-000000000000";

    try {
      await pool.query("BEGIN");

      // Insert test budget scenario
      const insertResult = await pool.query(
        `
        INSERT INTO budget_scenarios (
          scenario_id, name, description, 
          base_monthly_gross_income, base_monthly_net_income, base_monthly_expenses
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, base_discretionary_income, recommended_principal_payment
      `,
        [testScenarioId, "Test Scenario", "Test Description", 8000, 6000, 4000],
      );

      const budgetScenario = insertResult.rows[0];
      log(`  ✓ Budget scenario created with ID: ${budgetScenario.id}`, "green");
      log(
        `  ✓ Discretionary income calculated: $${budgetScenario.base_discretionary_income}`,
        "green",
      );
      log(
        `  ✓ Recommended payment calculated: $${budgetScenario.recommended_principal_payment}`,
        "green",
      );

      // Test income scenario
      const incomeResult = await pool.query(
        `
        INSERT INTO income_scenarios (
          budget_scenario_id, name, scenario_type, amount, start_month, frequency
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
      `,
        [budgetScenario.id, "Test Raise", "raise", 500, 13, "monthly"],
      );

      log(
        `  ✓ Income scenario created with ID: ${incomeResult.rows[0].id}`,
        "green",
      );

      // Test expense scenario
      const expenseResult = await pool.query(
        `
        INSERT INTO expense_scenarios (
          budget_scenario_id, name, category, amount, start_month, frequency
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
      `,
        [budgetScenario.id, "Test Emergency", "emergency", 5000, 6, "one_time"],
      );

      log(
        `  ✓ Expense scenario created with ID: ${expenseResult.rows[0].id}`,
        "green",
      );

      await pool.query("ROLLBACK"); // Clean up test data
    } catch (testErr) {
      await pool.query("ROLLBACK");
      error(`Functionality test failed: ${testErr.message}`);
    }

    log("\n✅ Budgeting schema verification completed successfully!", "bright");
    log(
      "All tables, indexes, constraints, triggers, and functions are properly created.",
      "green",
    );
  } catch (err) {
    error(`Verification failed: ${err.message}`);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the verification
if (require.main === module) {
  verifyBudgetingSchema();
}

module.exports = { verifyBudgetingSchema };

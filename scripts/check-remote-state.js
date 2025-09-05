#!/usr/bin/env node

const { Client } = require("pg");
require("dotenv").config({ path: ".env.local" });

(async () => {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL missing");
    process.exit(1);
  }
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  try {
    await client.connect();
    const users = await client.query(
      "SELECT email, id FROM users WHERE email = ANY($1) ORDER BY email",
      [
        [
          "admin@helocaccel.com",
          "demo@example.com",
          "john@example.com",
          "jane@example.com",
          "enoteware@gmail.com",
        ],
      ],
    );
    const budgetTables = await client.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name IN ('budget_scenarios','income_scenarios','expense_scenarios','budget_calculation_results') ORDER BY table_name",
    );
    const scenariosCount = await client.query(
      "SELECT COUNT(*)::int AS count FROM scenarios",
    );

    console.log("USERS", users.rows);
    console.log(
      "BUDGET_TABLES",
      budgetTables.rows.map((r) => r.table_name),
    );
    console.log("SCENARIOS_COUNT", scenariosCount.rows[0].count);
  } catch (e) {
    console.error("ERROR", e.message);
    process.exit(1);
  } finally {
    await client.end();
  }
})();

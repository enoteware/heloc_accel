#!/usr/bin/env node
const { Client } = require("pg");
require("dotenv").config({ path: ".env.local" });
(async () => {
  const c = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  await c.connect();
  const r = await c.query(`
    SELECT bs.name, bs.base_discretionary_income, bs.recommended_principal_payment
    FROM budget_scenarios bs
    JOIN scenarios s ON bs.scenario_id = s.id
    JOIN users u ON s.user_id = u.id
    WHERE u.email = 'enoteware@gmail.com' AND s.name = 'Baseline 30y @ 6.5%'
    ORDER BY bs.created_at
  `);
  console.log("Budget scenarios for Baseline:", r.rows);
  await c.end();
})().catch((e) => {
  console.error("ERROR", e.message);
  process.exit(1);
});

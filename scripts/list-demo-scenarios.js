#!/usr/bin/env node
const { Client } = require("pg");
require("dotenv").config({ path: ".env.local" });
(async () => {
  const c = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  await c.connect();
  const res = await c.query(`
    SELECT s.name, s.current_mortgage_balance, s.current_interest_rate, s.remaining_term_months
    FROM scenarios s
    JOIN users u ON s.user_id = u.id
    WHERE u.email = 'enoteware@gmail.com'
    ORDER BY s.created_at DESC, s.name
  `);
  console.log("Demo scenarios:", res.rows);
  await c.end();
})().catch((e) => {
  console.error("ERROR", e.message);
  process.exit(1);
});

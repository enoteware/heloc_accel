#!/usr/bin/env node
const { Client } = require("pg");
require("dotenv").config({ path: ".env.local" });
(async () => {
  const c = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  await c.connect();
  const q = await c.query(`
    SELECT a.email AS agent_email
    FROM user_agent_assignments ua
    JOIN users u ON ua.user_id = u.id
    JOIN agents a ON a.id = ua.agent_id
    WHERE u.email = 'enoteware@gmail.com'
  `);
  console.log("Assigned agent(s):", q.rows);
  await c.end();
})().catch((e) => {
  console.error("ERROR", e.message);
  process.exit(1);
});

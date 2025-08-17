import { Pool } from "pg";

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL is not set. Aborting.");
    process.exit(1);
  }

  const pool = new Pool({ connectionString: databaseUrl });
  const client = await pool.connect();

  try {
    console.log("Seeding demo user agent assignments...");

    // Demo users and a default agent mapping (adjust IDs/emails as needed)
    const demoUsers = [
      { email: "enoteware@gmail.com" },
      { email: "demo@example.com" },
      { email: "john@example.com" },
      { email: "jane@example.com" },
    ];

    // Pick the first active agent as default
    const agentRes = await client.query(
      "SELECT id FROM agents WHERE is_active = true ORDER BY id ASC LIMIT 1",
    );

    if (agentRes.rows.length === 0) {
      console.warn("No active agents found. Skipping assignments.");
      return;
    }

    const agentId = agentRes.rows[0].id;

    for (const u of demoUsers) {
      const userRes = await client.query(
        "SELECT id FROM users WHERE email = $1 AND is_active = true LIMIT 1",
        [u.email],
      );

      if (userRes.rows.length === 0) {
        console.warn(`User not found or inactive: ${u.email}`);
        continue;
      }

      const userId = userRes.rows[0].id;

      // Upsert assignment
      await client.query(
        `INSERT INTO user_agent_assignments (user_id, agent_id, assigned_at)
         VALUES ($1, $2, NOW())
         ON CONFLICT (user_id) DO UPDATE SET agent_id = EXCLUDED.agent_id, assigned_at = NOW()`,
        [userId, agentId],
      );

      console.log(`Assigned agent ${agentId} to user ${u.email}`);
    }

    console.log("✅ Demo user agent assignments seeded.");
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

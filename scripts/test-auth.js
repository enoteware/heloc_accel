#!/usr/bin/env node

const bcrypt = require("bcryptjs");
const { Pool } = require("pg");

// Database connection
const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://heloc_user:heloc_password@localhost:5432/heloc_accelerator",
  ssl: false,
});

async function testAuth() {
  const testEmail = process.argv[2] || "test@example.com";
  const testPassword = process.argv[3] || "Test123!";

  console.log(`\nTesting authentication for: ${testEmail}`);
  console.log(`Password: ${testPassword}`);
  console.log("-".repeat(50));

  try {
    // 1. Check database connection
    const healthCheck = await pool.query("SELECT 1 as health_check");
    console.log("✓ Database connection successful");

    // 2. Find user
    const userResult = await pool.query(
      "SELECT * FROM users WHERE email = $1 AND is_active = true",
      [testEmail],
    );

    if (userResult.rows.length === 0) {
      console.log("✗ User not found or inactive");
      return;
    }

    const user = userResult.rows[0];
    console.log("✓ User found:", {
      id: user.id,
      email: user.email,
      name: `${user.first_name} ${user.last_name}`,
      email_verified: user.email_verified,
    });

    // 3. Test password comparison
    console.log("\nTesting password...");
    console.log("Stored hash:", user.password_hash);

    const isValid = await bcrypt.compare(testPassword, user.password_hash);
    console.log("Password valid:", isValid ? "✓ YES" : "✗ NO");

    // 4. Test with wrong password
    const wrongPassword = "WrongPassword123!";
    const isInvalid = await bcrypt.compare(wrongPassword, user.password_hash);
    console.log(
      "Wrong password rejected:",
      isInvalid ? "✗ NO (problem!)" : "✓ YES",
    );

    // 5. Show what a new hash would look like
    const newHash = await bcrypt.hash(testPassword, 12);
    console.log("\nNew hash for same password would be:", newHash);
    console.log("(Hashes are different each time due to salt)");
  } catch (error) {
    console.error("✗ Error:", error.message);
  } finally {
    await pool.end();
  }
}

// Usage
console.log("Usage: node test-auth.js [email] [password]");
console.log("Default: test@example.com / Test123!");

testAuth();

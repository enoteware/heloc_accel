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

async function createTestUser() {
  const email = process.argv[2] || "test@example.com";
  const password = process.argv[3] || "Test123!";
  const firstName = process.argv[4] || "Test";
  const lastName = process.argv[5] || "User";

  try {
    // Check if user exists
    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email],
    );

    if (existingUser.rows.length > 0) {
      console.log(`User ${email} already exists`);
      process.exit(0);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, email_verified, is_active)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email`,
      [email, passwordHash, firstName, lastName, true, true],
    );

    console.log("Test user created successfully:");
    console.log("Email:", result.rows[0].email);
    console.log("Password:", password);
    console.log("ID:", result.rows[0].id);
  } catch (error) {
    console.error("Error creating test user:", error);
  } finally {
    await pool.end();
  }
}

// Usage instructions
if (process.argv.length < 3) {
  console.log(
    "Usage: node create-test-user.js <email> [password] [firstName] [lastName]",
  );
  console.log(
    "Example: node create-test-user.js test@example.com MyPassword123! John Doe",
  );
  console.log("Default: test@example.com / Test123!");
}

createTestUser();

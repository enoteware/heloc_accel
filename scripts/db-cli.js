#!/usr/bin/env node

/**
 * Database CLI Tool for HELOC Accelerator
 * MCP-style command-line interface for database operations
 */

const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

// Configuration
const config = {
  local: {
    connectionString:
      process.env.DATABASE_URL ||
      "postgresql://heloc_user:heloc_password@localhost:5432/heloc_accelerator",
    ssl: false,
  },
  cloud: {
    connectionString: process.env.CLOUD_DB_URL,
    ssl:
      process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false }
        : false,
  },
};

// Colors for output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

// Utility functions
const log = (message, color = "green") => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const error = (message) => {
  console.error(`${colors.red}[ERROR] ${message}${colors.reset}`);
};

const warning = (message) => {
  console.warn(`${colors.yellow}[WARNING] ${message}${colors.reset}`);
};

const info = (message) => {
  console.log(`${colors.blue}[INFO] ${message}${colors.reset}`);
};

// Database connection helper
const getPool = (target = "local") => {
  const conf = config[target];
  if (!conf.connectionString) {
    throw new Error(`${target.toUpperCase()}_DB_URL not configured`);
  }
  return new Pool(conf);
};

// Commands
const commands = {
  async status() {
    info("Checking database status...");

    // Check local database
    try {
      const localPool = getPool("local");
      const result = await localPool.query(
        "SELECT version(), current_database(), current_user",
      );
      const userCount = await localPool.query("SELECT COUNT(*) FROM users");
      const scenarioCount = await localPool.query(
        "SELECT COUNT(*) FROM scenarios",
      );

      log("\n📊 Local Database Status:", "cyan");
      console.log(`  Database: ${result.rows[0].current_database}`);
      console.log(`  User: ${result.rows[0].current_user}`);
      console.log(`  Users: ${userCount.rows[0].count}`);
      console.log(`  Scenarios: ${scenarioCount.rows[0].count}`);
      console.log(
        `  Version: ${result.rows[0].version.split(" ")[0]} ${result.rows[0].version.split(" ")[1]}`,
      );

      await localPool.end();
    } catch (err) {
      error(`Local database: ${err.message}`);
    }

    // Check cloud database
    if (config.cloud.connectionString) {
      try {
        const cloudPool = getPool("cloud");
        const result = await cloudPool.query(
          "SELECT version(), current_database(), current_user",
        );
        const userCount = await cloudPool.query("SELECT COUNT(*) FROM users");
        const scenarioCount = await cloudPool.query(
          "SELECT COUNT(*) FROM scenarios",
        );

        log("\n☁️  Cloud Database Status:", "cyan");
        console.log(`  Database: ${result.rows[0].current_database}`);
        console.log(`  User: ${result.rows[0].current_user}`);
        console.log(`  Users: ${userCount.rows[0].count}`);
        console.log(`  Scenarios: ${scenarioCount.rows[0].count}`);
        console.log(
          `  Version: ${result.rows[0].version.split(" ")[0]} ${result.rows[0].version.split(" ")[1]}`,
        );

        await cloudPool.end();
      } catch (err) {
        error(`Cloud database: ${err.message}`);
      }
    } else {
      warning("Cloud database not configured (set CLOUD_DB_URL)");
    }
  },

  async createUser(
    email,
    password,
    firstName = "Test",
    lastName = "User",
    target = "local",
  ) {
    if (!email || !password) {
      error("Email and password are required");
      process.exit(1);
    }

    try {
      const pool = getPool(target);

      // Check if user exists
      const existing = await pool.query(
        "SELECT id FROM users WHERE email = $1",
        [email],
      );
      if (existing.rows.length > 0) {
        warning(`User ${email} already exists`);
        await pool.end();
        return;
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

      log(`✅ User created successfully in ${target} database:`);
      console.log(`  Email: ${result.rows[0].email}`);
      console.log(`  ID: ${result.rows[0].id}`);
      console.log(`  Password: ${password}`);

      await pool.end();
    } catch (err) {
      error(`Failed to create user: ${err.message}`);
      process.exit(1);
    }
  },

  async listUsers(target = "local") {
    try {
      const pool = getPool(target);
      const result = await pool.query(
        "SELECT id, email, first_name, last_name, created_at, last_login, is_active FROM users ORDER BY created_at DESC",
      );

      log(
        `\n👥 Users in ${target} database (${result.rows.length} total):`,
        "cyan",
      );

      if (result.rows.length === 0) {
        info("No users found");
      } else {
        console.log(
          "\n  ID                                   | Email                    | Name              | Active | Created",
        );
        console.log(
          "  -------------------------------------|--------------------------|-------------------|--------|----------",
        );

        result.rows.forEach((user) => {
          const id = user.id.substring(0, 8) + "...";
          const email = user.email.padEnd(24);
          const name = `${user.first_name} ${user.last_name}`.padEnd(17);
          const active = user.is_active ? "✅" : "❌";
          const created = user.created_at.toISOString().split("T")[0];

          console.log(
            `  ${id.padEnd(36)} | ${email} | ${name} | ${active.padEnd(6)} | ${created}`,
          );
        });
      }

      await pool.end();
    } catch (err) {
      error(`Failed to list users: ${err.message}`);
      process.exit(1);
    }
  },

  async backup(target = "local") {
    const timestamp =
      new Date().toISOString().replace(/[:.]/g, "-").split("T")[0] +
      "_" +
      new Date().toTimeString().split(" ")[0].replace(/:/g, "");
    const backupDir = path.join(process.cwd(), "backups");
    const backupFile = path.join(
      backupDir,
      `${target}_backup_${timestamp}.sql`,
    );

    // Create backup directory
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    try {
      const connectionString = config[target].connectionString;
      if (!connectionString) {
        throw new Error(`${target.toUpperCase()}_DB_URL not configured`);
      }

      info(`Creating ${target} database backup...`);

      const pgDump = spawn("pg_dump", [connectionString], {
        stdio: ["inherit", "pipe", "inherit"],
      });

      const writeStream = fs.createWriteStream(backupFile);
      pgDump.stdout.pipe(writeStream);

      await new Promise((resolve, reject) => {
        pgDump.on("close", (code) => {
          if (code === 0) {
            resolve();
          } else {
            reject(new Error(`pg_dump exited with code ${code}`));
          }
        });
      });

      log(`✅ Backup saved to: ${backupFile}`);

      // Show file size
      const stats = fs.statSync(backupFile);
      const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
      info(`Backup size: ${fileSizeInMB} MB`);
    } catch (err) {
      error(`Backup failed: ${err.message}`);
      process.exit(1);
    }
  },

  async migrate(target = "local") {
    try {
      const pool = getPool(target);
      const schemaPath = path.join(process.cwd(), "database", "schema.sql");

      if (!fs.existsSync(schemaPath)) {
        throw new Error("Schema file not found: database/schema.sql");
      }

      const schema = fs.readFileSync(schemaPath, "utf8");

      info(`Applying schema to ${target} database...`);
      await pool.query(schema);

      log(`✅ Schema applied to ${target} database`);
      await pool.end();
    } catch (err) {
      error(`Migration failed: ${err.message}`);
      process.exit(1);
    }
  },

  help() {
    console.log(`
${colors.cyan}🗄️  HELOC Accelerator Database CLI${colors.reset}

${colors.bright}Usage:${colors.reset}
  node scripts/db-cli.js <command> [options]

${colors.bright}Commands:${colors.reset}
  ${colors.green}status${colors.reset}                     Show database status
  ${colors.green}create-user${colors.reset} <email> <pass>  Create a new user
  ${colors.green}list-users${colors.reset} [target]        List all users
  ${colors.green}backup${colors.reset} [target]            Create database backup
  ${colors.green}migrate${colors.reset} [target]           Apply schema migrations
  ${colors.green}help${colors.reset}                       Show this help

${colors.bright}Options:${colors.reset}
  [target]    Database target: 'local' or 'cloud' (default: local)

${colors.bright}Examples:${colors.reset}
  node scripts/db-cli.js status
  node scripts/db-cli.js create-user test@example.com password123
  node scripts/db-cli.js list-users cloud
  node scripts/db-cli.js backup local
  node scripts/db-cli.js migrate cloud

${colors.bright}Environment Variables:${colors.reset}
  DATABASE_URL     Local PostgreSQL connection string
  CLOUD_DB_URL     Cloud PostgreSQL connection string
`);
  },
};

// Main execution
async function main() {
  const [, , command, ...args] = process.argv;

  if (
    !command ||
    command === "help" ||
    command === "--help" ||
    command === "-h"
  ) {
    commands.help();
    return;
  }

  if (!commands[command.replace("-", "")]) {
    error(`Unknown command: ${command}`);
    commands.help();
    process.exit(1);
  }

  try {
    await commands[command.replace("-", "")](...args);
  } catch (err) {
    error(`Command failed: ${err.message}`);
    process.exit(1);
  }
}

// Handle uncaught errors
process.on("unhandledRejection", (err) => {
  error(`Unhandled rejection: ${err.message}`);
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  error(`Uncaught exception: ${err.message}`);
  process.exit(1);
});

if (require.main === module) {
  main();
}

import pool from "@/lib/db";
import { stackServerApp } from "@/stack";

export interface LocalUser {
  id: string;
  email: string;
  stack_auth_id: string;
  first_name?: string;
  last_name?: string;
  created_at: Date;
  updated_at: Date;
}

/**
 * Get or create a local database user for a Stack Auth user
 * This function ensures every Stack Auth user has a corresponding local database record
 */
export async function getOrCreateLocalUser(
  stackUser: any, // Stack Auth user object
): Promise<LocalUser> {
  if (!stackUser?.id || !stackUser?.primaryEmail) {
    throw new Error("Invalid Stack Auth user: missing id or email");
  }

  const client = await pool.connect();
  try {
    // First, try to find existing user by stack_auth_id
    let result = await client.query(
      "SELECT id, email, stack_auth_id, first_name, last_name, created_at, updated_at FROM users WHERE stack_auth_id = $1",
      [stackUser.id],
    );

    if (result.rows.length > 0) {
      // User exists, return it
      return result.rows[0] as LocalUser;
    }

    // Try to find by email and update with stack_auth_id (for existing users)
    result = await client.query(
      "SELECT id, email, stack_auth_id, first_name, last_name, created_at, updated_at FROM users WHERE email = $1 AND stack_auth_id IS NULL",
      [stackUser.primaryEmail],
    );

    if (result.rows.length > 0) {
      // Update existing user with stack_auth_id
      const updateResult = await client.query(
        `UPDATE users 
         SET stack_auth_id = $1, 
             first_name = COALESCE($2, first_name),
             last_name = COALESCE($3, last_name),
             updated_at = CURRENT_TIMESTAMP 
         WHERE id = $4 
         RETURNING id, email, stack_auth_id, first_name, last_name, created_at, updated_at`,
        [
          stackUser.id,
          stackUser.displayName?.split(" ")[0] || null,
          stackUser.displayName?.split(" ").slice(1).join(" ") || null,
          result.rows[0].id,
        ],
      );

      return updateResult.rows[0] as LocalUser;
    }

    // Create new user
    const insertResult = await client.query(
      `INSERT INTO users (
        email, 
        stack_auth_id, 
        first_name, 
        last_name, 
        is_active, 
        email_verified
      ) VALUES ($1, $2, $3, $4, true, true)
      RETURNING id, email, stack_auth_id, first_name, last_name, created_at, updated_at`,
      [
        stackUser.primaryEmail,
        stackUser.id,
        stackUser.displayName?.split(" ")[0] || null,
        stackUser.displayName?.split(" ").slice(1).join(" ") || null,
      ],
    );

    return insertResult.rows[0] as LocalUser;
  } finally {
    client.release();
  }
}

/**
 * Get local user by Stack Auth ID
 * Returns null if not found
 */
export async function getLocalUserByStackId(
  stackAuthId: string,
): Promise<LocalUser | null> {
  const client = await pool.connect();
  try {
    const result = await client.query(
      "SELECT id, email, stack_auth_id, first_name, last_name, created_at, updated_at FROM users WHERE stack_auth_id = $1",
      [stackAuthId],
    );

    return result.rows.length > 0 ? (result.rows[0] as LocalUser) : null;
  } finally {
    client.release();
  }
}

/**
 * Update user's last login timestamp
 */
export async function updateLastLogin(localUserId: string): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query(
      "UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1",
      [localUserId],
    );
  } finally {
    client.release();
  }
}

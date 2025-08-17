-- Migration: Add Stack Auth ID column to users table
-- This allows mapping between Stack Auth users and local database users

-- Add stack_auth_id column to users table
ALTER TABLE users ADD COLUMN stack_auth_id VARCHAR(255) UNIQUE;

-- Create index for performance
CREATE INDEX idx_users_stack_auth_id ON users(stack_auth_id) WHERE stack_auth_id IS NOT NULL;

-- Make password_hash nullable since Stack Auth handles authentication
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

-- Add comment explaining the column
COMMENT ON COLUMN users.stack_auth_id IS 'External Stack Auth user ID for SSO integration';
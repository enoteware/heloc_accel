# NEON PostgreSQL Setup Guide

This guide will help you set up NEON PostgreSQL for the HELOC Accelerator project.

## Prerequisites

1. **NEON Account**: Create a free account at [neon.tech](https://neon.tech)
2. **NEON Project**: Create a new project in your NEON dashboard
3. **API Key**: You mentioned you have this already ✅

## Step 1: Get Your NEON Connection String

1. Go to your NEON dashboard
2. Select your project
3. Navigate to **Dashboard** > **Connection Details**
4. Copy the connection string, it should look like:
   ```
   postgresql://username:password@ep-example-123456.region.aws.neon.tech/neondb?sslmode=require
   ```

## Step 2: Update Environment Variables

1. Open `.env.local` in your project root
2. Replace the `DATABASE_URL` placeholder with your actual NEON connection string:
   ```bash
   # Replace this line:
   DATABASE_URL=postgresql://[username]:[password]@[endpoint]/[database]?sslmode=require
   
   # With your actual NEON connection string:
   DATABASE_URL=postgresql://your_username:your_password@ep-example-123456.region.aws.neon.tech/neondb?sslmode=require
   ```

## Step 3: Test the Connection

Run the connection test to make sure everything is working:

```bash
npm run db:neon:test
```

You should see:
- ✅ Connected to NEON successfully!
- Current time and database version
- Number of tables (should be 0 initially)

## Step 4: Set Up Database Schema

Create all the necessary tables and initial data:

```bash
npm run db:neon:setup
```

This will:
- Create all tables (users, scenarios, calculation_results, etc.)
- Set up indexes for performance
- Insert sample data for testing
- Show you a summary of what was created

## Step 5: Verify Setup

Test your application:

```bash
npm run dev
```

Then visit `http://localhost:3000` and verify:
- ✅ Application loads without database errors
- ✅ Demo mode works (if enabled)
- ✅ User authentication works
- ✅ Scenarios can be created and saved

## Troubleshooting

### Connection Issues

If you get connection errors:

1. **Check your connection string format**:
   - Must include `?sslmode=require` at the end
   - Username and password must be URL-encoded if they contain special characters

2. **NEON database sleeping**:
   - Free tier databases sleep after inactivity
   - Try making a query in the NEON console to wake it up

3. **Firewall/Network Issues**:
   - NEON uses standard port 5432
   - Ensure your network allows outbound connections

### Authentication Issues

If you get authentication errors:

1. **Double-check credentials**:
   - Copy connection string directly from NEON dashboard
   - Don't manually type username/password

2. **Password special characters**:
   - URL-encode special characters in password
   - Or regenerate password without special characters

### Schema Issues

If schema creation fails:

1. **Check NEON permissions**:
   - Ensure your user has CREATE privileges
   - Default NEON users should have full access

2. **Existing tables**:
   - If tables already exist, you might need to drop them first
   - Or modify the schema.sql file to use `CREATE TABLE IF NOT EXISTS`

## Production Deployment

For production deployment (Vercel, etc.):

1. Add your NEON connection string to your deployment platform's environment variables
2. Update `NEXTAUTH_URL` and `NODE_ENV` appropriately
3. The same NEON database can be used for both development and production

## Database Management

Useful commands:

```bash
# Test connection
npm run db:neon:test

# Set up fresh database
npm run db:neon:setup

# Other database operations (if available)
npm run db:users    # List users
npm run db:cli      # Open database CLI
```

## Security Notes

- ✅ NEON enforces SSL connections automatically
- ✅ Connection strings include authentication
- ❌ Never commit `.env.local` to git
- ✅ Use different databases for development/production if desired

## Support

- NEON Documentation: [neon.tech/docs](https://neon.tech/docs)
- NEON Community: [community.neon.tech](https://community.neon.tech)
- Project Issues: Check `BUILD_LOG.md` for common issues
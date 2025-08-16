# Database Setup Summary

## 🎯 What We've Created

Your HELOC Accelerator now has a comprehensive database setup with multiple options for local development and cloud synchronization.

## 📁 New Files Created

### Docker Configuration

- `docker-compose.yml` - PostgreSQL + pgAdmin setup
- `scripts/init-db.sql` - Docker initialization script

### Setup & Management Scripts

- `scripts/db-setup.sh` - Automated database setup (Docker or native)
- `scripts/db-sync.sh` - Cloud synchronization and backup tools
- `scripts/db-cli.js` - MCP-style CLI for database operations

### Documentation

- `docs/DATABASE_SETUP.md` - Comprehensive setup guide
- Updated `.env.example` with cloud database configuration
- Updated `package.json` with database scripts

## 🚀 Quick Start Commands

### Setup Database

```bash
# Auto-detect and setup (Docker or native PostgreSQL)
npm run db:setup

# Force Docker setup
npm run db:setup:docker

# Force native PostgreSQL setup
npm run db:setup:native
```

### Check Status

```bash
# Check database status
npm run db:status

# Or use the CLI tool
npm run db:cli status
```

### User Management

```bash
# Create test user
npm run db:create-user

# List all users
npm run db:users

# Create custom user
npm run db:cli create-user test@example.com password123
```

### Backups & Sync

```bash
# Backup local database
npm run db:backup

# Sync to cloud (requires CLOUD_DB_URL)
npm run db:sync:to-cloud

# Sync from cloud
npm run db:sync:from-cloud
```

## 🐳 Docker Setup (Recommended)

**Advantages:**

- ✅ Isolated environment
- ✅ Consistent across team members
- ✅ Includes pgAdmin for database management
- ✅ Easy to reset/recreate

**Quick Start:**

```bash
# Start PostgreSQL with Docker
docker-compose up -d postgres

# Check status
npm run db:status

# Access pgAdmin: http://localhost:8080
# Login: admin@helocaccel.com / admin123
```

## 🔧 Native PostgreSQL Setup

**For macOS:**

```bash
brew install postgresql@15
brew services start postgresql@15
npm run db:setup:native
```

**For Ubuntu/Debian:**

```bash
sudo apt install postgresql postgresql-contrib
npm run db:setup:native
```

## ☁️ Cloud Synchronization

### Setup Cloud Connection

```bash
# Set environment variable
export CLOUD_DB_URL="postgresql://username:password@your-vps-ip:5432/heloc_accelerator"

# Or add to .env.local
echo "CLOUD_DB_URL=postgresql://username:password@your-vps-ip:5432/heloc_accelerator" >> .env.local
```

### Sync Operations

```bash
# Push local data to cloud
npm run db:sync:to-cloud

# Pull cloud data to local
npm run db:sync:from-cloud

# Check both databases
npm run db:status
```

## 🛠️ CLI Tools Available

### Database CLI (`npm run db:cli`)

- `status` - Show database status
- `create-user <email> <pass>` - Create new user
- `list-users [target]` - List all users
- `backup [target]` - Create database backup
- `migrate [target]` - Apply schema migrations

### Sync Tools (`./scripts/db-sync.sh`)

- `status` - Show database status
- `backup-local` - Backup local database
- `backup-cloud` - Backup cloud database
- `sync-to-cloud` - Sync local to cloud
- `sync-from-cloud` - Sync cloud to local

## 📊 Database Schema

Your database includes:

- **Users table** - Authentication and user management
- **Scenarios table** - HELOC calculation scenarios
- **Calculation results** - Detailed month-by-month breakdowns
- **User accounts** - Additional user profile data
- **Audit logs** - Activity tracking

## 🔒 Security Features

- Password hashing with bcrypt
- UUID primary keys
- Row-level security ready
- SSL support for production
- Environment-based configuration

## 🎯 Next Steps

1. **Choose your setup method:**

   ```bash
   npm run db:setup  # Auto-detect best option
   ```

2. **Create test users:**

   ```bash
   npm run db:create-user
   ```

3. **Configure cloud sync (optional):**

   ```bash
   export CLOUD_DB_URL="postgresql://user:pass@host:port/db"
   ```

4. **Start developing:**
   ```bash
   npm run dev
   ```

## 🆘 Troubleshooting

### Docker Issues

```bash
# Reset Docker setup
docker-compose down -v
docker-compose up -d postgres
```

### Connection Issues

```bash
# Test local connection
npm run db:cli status

# Test specific connection
psql "postgresql://heloc_user:heloc_password@localhost:5432/heloc_accelerator" -c "SELECT version();"
```

### Permission Issues

```bash
# Fix PostgreSQL permissions
sudo -u postgres psql -c "ALTER USER heloc_user CREATEDB;"
```

## 📚 Documentation

- **Full Setup Guide:** `docs/DATABASE_SETUP.md`
- **Schema Definition:** `database/schema.sql`
- **Environment Config:** `.env.example`

Your database setup is now complete and ready for development! 🎉

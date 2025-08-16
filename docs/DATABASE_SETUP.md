# Database Setup Guide

This guide covers setting up PostgreSQL for local development and syncing with your cloud VPS.

## Quick Start

### Option 1: Automatic Setup (Recommended)

```bash
# Auto-detects Docker or native PostgreSQL
npm run db:setup

# Check status
npm run db:status
```

### Option 2: Docker Setup (Isolated & Consistent)

```bash
# Force Docker setup
npm run db:setup:docker

# Or manually with docker-compose
docker-compose up -d postgres
```

### Option 3: Native PostgreSQL

```bash
# Force native PostgreSQL setup
npm run db:setup:native
```

## Detailed Setup Options

### Docker Setup (Recommended for Development)

**Advantages:**

- ✅ Isolated environment
- ✅ Consistent across team members
- ✅ Easy to reset/recreate
- ✅ Includes pgAdmin for database management
- ✅ No conflicts with system PostgreSQL

**Requirements:**

- Docker & Docker Compose installed

**Setup:**

```bash
# Start PostgreSQL with Docker
docker-compose up -d postgres

# Optional: Start pgAdmin too
docker-compose up -d pgadmin

# Check status
docker-compose ps
```

**Access:**

- **Database:** `postgresql://heloc_user:heloc_password@localhost:5432/heloc_accelerator`
- **pgAdmin:** http://localhost:8080 (admin@helocaccel.com / admin123)

### Native PostgreSQL Setup

**Advantages:**

- ✅ Direct system integration
- ✅ Better performance
- ✅ Familiar if you already use PostgreSQL

**Requirements:**

- PostgreSQL 12+ installed

**macOS Installation:**

```bash
# Install with Homebrew
brew install postgresql@15
brew services start postgresql@15

# Setup database
npm run db:setup:native
```

**Ubuntu/Debian Installation:**

```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Setup database
npm run db:setup:native
```

## Database Management

### Creating Test Users

```bash
# Create default test user
npm run db:create-user

# Create custom user
node scripts/create-test-user.js user@example.com password123 John Doe
```

### Database Status

```bash
# Check local and cloud database status
npm run db:status
```

### Backups

```bash
# Backup local database
npm run db:backup

# Backup cloud database (requires CLOUD_DB_URL)
./scripts/db-sync.sh backup-cloud
```

## Cloud Synchronization

### Setup Cloud Connection

```bash
# Set your cloud database URL
export CLOUD_DB_URL="postgresql://username:password@your-vps-ip:5432/heloc_accelerator"

# Or add to .env.local
echo "CLOUD_DB_URL=postgresql://username:password@your-vps-ip:5432/heloc_accelerator" >> .env.local
```

### Sync Operations

```bash
# Sync local data to cloud (overwrites cloud)
npm run db:sync:to-cloud

# Sync cloud data to local (overwrites local)
npm run db:sync:from-cloud

# Check sync status
npm run db:status
```

## Environment Configuration

### Local Development (.env.local)

```bash
# Copy example environment
cp .env.example .env.local

# Edit with your settings
DATABASE_URL=postgresql://heloc_user:heloc_password@localhost:5432/heloc_accelerator
CLOUD_DB_URL=postgresql://username:password@your-vps-ip:5432/heloc_accelerator
```

### Docker Environment

The Docker setup automatically configures:

- Database: `heloc_accelerator`
- User: `heloc_user`
- Password: `heloc_password`
- Port: `5432`

## Troubleshooting

### Docker Issues

```bash
# Reset Docker setup
docker-compose down -v
docker-compose up -d postgres

# Check logs
docker-compose logs postgres
```

### Connection Issues

```bash
# Test local connection
psql postgresql://heloc_user:heloc_password@localhost:5432/heloc_accelerator -c "SELECT version();"

# Test cloud connection
psql "$CLOUD_DB_URL" -c "SELECT version();"
```

### Permission Issues

```bash
# Fix native PostgreSQL permissions
sudo -u postgres psql -c "ALTER USER heloc_user CREATEDB;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE heloc_accelerator TO heloc_user;"
```

## Advanced Usage

### Manual Schema Updates

```bash
# Apply schema changes
psql "$DATABASE_URL" -f database/schema.sql

# Or with Docker
docker-compose exec postgres psql -U heloc_user -d heloc_accelerator -f /docker-entrypoint-initdb.d/01-schema.sql
```

### Database Migrations

Currently using direct SQL schema. For production, consider:

- [node-pg-migrate](https://github.com/salsita/node-pg-migrate)
- [Knex.js migrations](https://knexjs.org/guide/migrations.html)
- [Prisma](https://www.prisma.io/)

### Performance Monitoring

```bash
# Check database size
psql "$DATABASE_URL" -c "SELECT pg_size_pretty(pg_database_size('heloc_accelerator'));"

# Check table sizes
psql "$DATABASE_URL" -c "SELECT schemaname,tablename,pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size FROM pg_tables WHERE schemaname='public' ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;"
```

## Security Considerations

### Production Setup

- Use strong passwords
- Enable SSL connections
- Restrict network access
- Regular backups
- Monitor access logs

### Development Security

- Never commit real credentials
- Use `.env.local` for sensitive data
- Rotate test passwords regularly

## Next Steps

1. **Choose your setup method** (Docker recommended)
2. **Run the setup script**: `npm run db:setup`
3. **Create test users**: `npm run db:create-user`
4. **Configure cloud sync** (optional): Set `CLOUD_DB_URL`
5. **Start developing**: `npm run dev`

For questions or issues, check the troubleshooting section or create an issue in the repository.

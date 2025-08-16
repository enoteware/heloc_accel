# Database File Locations Guide

## 📍 Your Current Setup: Native PostgreSQL (Homebrew)

### Database Files Location

Your PostgreSQL database files are stored at:

```
/opt/homebrew/var/postgresql@14/
```

### Database Data Directory Structure

```
/opt/homebrew/var/postgresql@14/
├── base/                    # Database files (your actual data is here)
├── global/                  # Cluster-wide tables
├── pg_wal/                  # Write-Ahead Logging files
├── pg_stat/                 # Statistics files
├── postgresql.conf          # Main configuration file
├── pg_hba.conf             # Host-based authentication
└── postmaster.pid          # Process ID file
```

### Your HELOC Database Specifically

- **Database Name:** `heloc_accelerator`
- **Owner:** `elliotnoteware`
- **User Access:** `heloc_user` has full access
- **Physical Location:** Inside `/opt/homebrew/var/postgresql@14/base/[database_oid]/`

## 🔍 Finding Your Specific Database Files

### Get Database OID (Object Identifier)

```bash
psql -d heloc_accelerator -c "SELECT oid, datname FROM pg_database WHERE datname = 'heloc_accelerator';"
```

### View Database Size

```bash
psql -d heloc_accelerator -c "SELECT pg_size_pretty(pg_database_size('heloc_accelerator'));"
```

### List All Tables and Their Sizes

```bash
psql -d heloc_accelerator -c "
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
    pg_total_relation_size(schemaname||'.'||tablename) as size_bytes
FROM pg_tables
WHERE schemaname='public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;"
```

## 📊 Database File Types Explained

### In `/opt/homebrew/var/postgresql@14/base/[database_oid]/`

- **Relation files** - Your actual table data (numbered files like `16384`, `16385`)
- **Index files** - Database indexes for faster queries
- **TOAST files** - Large object storage
- **Visibility map files** - Track which pages have all-visible tuples

### Configuration Files

- **postgresql.conf** - Main PostgreSQL configuration
- **pg_hba.conf** - Authentication rules
- **postgresql.auto.conf** - Auto-generated configuration

### Log Files

- **pg_wal/** - Transaction logs (Write-Ahead Logging)
- **pg_stat/** - Statistics and performance data

## 🛠️ Useful Commands

### Check Database Status

```bash
# Using our CLI tool
npm run db:cli status

# Or directly with psql
psql -d heloc_accelerator -c "SELECT version();"
```

### View Database Information

```bash
# Database size
psql -d heloc_accelerator -c "SELECT pg_size_pretty(pg_database_size(current_database()));"

# Table information
psql -d heloc_accelerator -c "\dt+"

# Connection info
psql -d heloc_accelerator -c "\conninfo"
```

### Backup Your Database

```bash
# Using our backup script
npm run db:backup

# Or manually
pg_dump heloc_accelerator > backup_$(date +%Y%m%d).sql
```

## 🐳 Alternative: Docker Setup

If you want isolated database files, you can switch to Docker:

### Docker Database Location

With Docker, database files would be in:

```
# Docker volume (managed by Docker)
/var/lib/docker/volumes/heloc-accelerator_postgres_data/_data/

# Or if you mount a local directory:
./docker-data/postgres/
```

### Switch to Docker

```bash
# Stop current PostgreSQL
brew services stop postgresql@14

# Start with Docker
npm run db:setup:docker

# Your data will be in Docker volumes
docker volume ls | grep postgres
```

## 📁 Backup Locations

### Our Backup Scripts Store Files In:

```
./backups/
├── local_backup_YYYYMMDD_HHMMSS.sql
├── cloud_backup_YYYYMMDD_HHMMSS.sql
└── ...
```

### Manual Backups

```bash
# Create backup directory
mkdir -p ./backups

# Backup database
pg_dump heloc_accelerator > ./backups/manual_backup_$(date +%Y%m%d_%H%M%S).sql
```

## 🔧 Configuration Files

### PostgreSQL Configuration

```bash
# Main config file
/opt/homebrew/var/postgresql@14/postgresql.conf

# Authentication config
/opt/homebrew/var/postgresql@14/pg_hba.conf

# View current settings
psql -c "SHOW config_file;"
psql -c "SHOW hba_file;"
```

### Application Configuration

```bash
# Your app's database config
.env.local                  # Local environment variables
.env.example               # Template with examples
src/lib/database.ts        # Database connection code
```

## 🚨 Important Notes

### File Permissions

- Database files are owned by your user (`elliotnoteware`)
- Files have restricted permissions (700/600) for security
- Don't manually edit database files - use SQL commands

### Moving/Copying Database

```bash
# Don't copy files directly - use pg_dump/pg_restore
pg_dump heloc_accelerator > backup.sql
createdb new_database
psql new_database < backup.sql
```

### Monitoring Disk Usage

```bash
# Check database directory size
du -sh /opt/homebrew/var/postgresql@14/

# Check specific database size
psql -c "SELECT pg_size_pretty(pg_database_size('heloc_accelerator'));"
```

## 🔄 Quick Reference Commands

```bash
# Database status
npm run db:status

# List databases
psql -l

# Connect to your database
psql heloc_accelerator

# Show data directory
psql -c "SHOW data_directory;"

# Database size
psql -d heloc_accelerator -c "SELECT pg_size_pretty(pg_database_size(current_database()));"

# Backup database
npm run db:backup
```

Your database files are safely stored in PostgreSQL's managed directory structure at `/opt/homebrew/var/postgresql@14/`. Use the provided CLI tools and SQL commands to interact with your data rather than accessing files directly.

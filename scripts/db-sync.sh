#!/bin/bash

# Database Synchronization Script for HELOC Accelerator
# Sync between local and cloud PostgreSQL databases

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
LOCAL_DB_URL="postgresql://heloc_user:heloc_password@localhost:5432/heloc_accelerator"
BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Functions
log() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Backup local database
backup_local() {
    log "Creating local database backup..."
    local backup_file="$BACKUP_DIR/local_backup_$TIMESTAMP.sql"
    
    if command -v docker &> /dev/null && docker ps | grep -q heloc-postgres; then
        # Docker setup
        docker-compose exec -T postgres pg_dump -U heloc_user heloc_accelerator > "$backup_file"
    else
        # Native setup
        pg_dump "$LOCAL_DB_URL" > "$backup_file"
    fi
    
    log "Local backup saved to: $backup_file"
    echo "$backup_file"
}

# Backup cloud database
backup_cloud() {
    if [ -z "$CLOUD_DB_URL" ]; then
        error "CLOUD_DB_URL environment variable not set"
        exit 1
    fi
    
    log "Creating cloud database backup..."
    local backup_file="$BACKUP_DIR/cloud_backup_$TIMESTAMP.sql"
    
    pg_dump "$CLOUD_DB_URL" > "$backup_file"
    log "Cloud backup saved to: $backup_file"
    echo "$backup_file"
}

# Restore from backup
restore_backup() {
    local backup_file="$1"
    local target_db="$2"
    
    if [ ! -f "$backup_file" ]; then
        error "Backup file not found: $backup_file"
        exit 1
    fi
    
    log "Restoring from backup: $backup_file"
    
    if [ "$target_db" = "local" ]; then
        if command -v docker &> /dev/null && docker ps | grep -q heloc-postgres; then
            # Docker setup - need to copy file into container first
            docker cp "$backup_file" heloc-postgres:/tmp/restore.sql
            docker-compose exec -T postgres psql -U heloc_user -d heloc_accelerator -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
            docker-compose exec -T postgres psql -U heloc_user -d heloc_accelerator < /tmp/restore.sql
        else
            # Native setup
            psql "$LOCAL_DB_URL" -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
            psql "$LOCAL_DB_URL" < "$backup_file"
        fi
    elif [ "$target_db" = "cloud" ]; then
        if [ -z "$CLOUD_DB_URL" ]; then
            error "CLOUD_DB_URL environment variable not set"
            exit 1
        fi
        psql "$CLOUD_DB_URL" -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
        psql "$CLOUD_DB_URL" < "$backup_file"
    fi
    
    log "Restore completed"
}

# Sync local to cloud
sync_to_cloud() {
    if [ -z "$CLOUD_DB_URL" ]; then
        error "CLOUD_DB_URL environment variable not set"
        error "Please set it like: export CLOUD_DB_URL='postgresql://user:pass@host:port/db'"
        exit 1
    fi
    
    warning "This will overwrite the cloud database with local data!"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log "Cancelled"
        exit 0
    fi
    
    # Backup cloud first
    cloud_backup=$(backup_cloud)
    
    # Backup local
    local_backup=$(backup_local)
    
    # Restore local backup to cloud
    restore_backup "$local_backup" "cloud"
    
    log "✅ Local database synced to cloud"
    log "Cloud backup saved as: $cloud_backup"
}

# Sync cloud to local
sync_from_cloud() {
    if [ -z "$CLOUD_DB_URL" ]; then
        error "CLOUD_DB_URL environment variable not set"
        error "Please set it like: export CLOUD_DB_URL='postgresql://user:pass@host:port/db'"
        exit 1
    fi
    
    warning "This will overwrite the local database with cloud data!"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log "Cancelled"
        exit 0
    fi
    
    # Backup local first
    local_backup=$(backup_local)
    
    # Backup cloud
    cloud_backup=$(backup_cloud)
    
    # Restore cloud backup to local
    restore_backup "$cloud_backup" "local"
    
    log "✅ Cloud database synced to local"
    log "Local backup saved as: $local_backup"
}

# Show database status
show_status() {
    log "Database Status:"
    echo ""
    
    # Local database
    echo -e "${BLUE}Local Database:${NC}"
    if command -v docker &> /dev/null && docker ps | grep -q heloc-postgres; then
        echo "  Type: Docker"
        echo "  Status: $(docker-compose ps postgres | grep -q Up && echo 'Running' || echo 'Stopped')"
        if docker-compose exec -T postgres pg_isready -U heloc_user -d heloc_accelerator &>/dev/null; then
            local user_count=$(docker-compose exec -T postgres psql -U heloc_user -d heloc_accelerator -t -c "SELECT COUNT(*) FROM users;" | tr -d ' ')
            local scenario_count=$(docker-compose exec -T postgres psql -U heloc_user -d heloc_accelerator -t -c "SELECT COUNT(*) FROM scenarios;" | tr -d ' ')
            echo "  Users: $user_count"
            echo "  Scenarios: $scenario_count"
        else
            echo "  Status: Not accessible"
        fi
    else
        echo "  Type: Native PostgreSQL"
        if psql "$LOCAL_DB_URL" -c "SELECT 1;" &>/dev/null; then
            local user_count=$(psql "$LOCAL_DB_URL" -t -c "SELECT COUNT(*) FROM users;" | tr -d ' ')
            local scenario_count=$(psql "$LOCAL_DB_URL" -t -c "SELECT COUNT(*) FROM scenarios;" | tr -d ' ')
            echo "  Status: Running"
            echo "  Users: $user_count"
            echo "  Scenarios: $scenario_count"
        else
            echo "  Status: Not accessible"
        fi
    fi
    
    echo ""
    
    # Cloud database
    echo -e "${BLUE}Cloud Database:${NC}"
    if [ -n "$CLOUD_DB_URL" ]; then
        if psql "$CLOUD_DB_URL" -c "SELECT 1;" &>/dev/null; then
            local user_count=$(psql "$CLOUD_DB_URL" -t -c "SELECT COUNT(*) FROM users;" | tr -d ' ')
            local scenario_count=$(psql "$CLOUD_DB_URL" -t -c "SELECT COUNT(*) FROM scenarios;" | tr -d ' ')
            echo "  Status: Connected"
            echo "  Users: $user_count"
            echo "  Scenarios: $scenario_count"
        else
            echo "  Status: Not accessible"
        fi
    else
        echo "  Status: Not configured (set CLOUD_DB_URL)"
    fi
    
    echo ""
    
    # Recent backups
    echo -e "${BLUE}Recent Backups:${NC}"
    if [ -d "$BACKUP_DIR" ] && [ "$(ls -A $BACKUP_DIR 2>/dev/null)" ]; then
        ls -lt "$BACKUP_DIR"/*.sql 2>/dev/null | head -5 | while read line; do
            echo "  $line"
        done
    else
        echo "  No backups found"
    fi
}

# Show usage
show_usage() {
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  status              Show database status"
    echo "  backup-local        Backup local database"
    echo "  backup-cloud        Backup cloud database"
    echo "  sync-to-cloud       Sync local database to cloud"
    echo "  sync-from-cloud     Sync cloud database to local"
    echo "  restore-local FILE  Restore local database from backup file"
    echo "  restore-cloud FILE  Restore cloud database from backup file"
    echo ""
    echo "Environment Variables:"
    echo "  CLOUD_DB_URL        Cloud PostgreSQL connection string"
    echo ""
    echo "Examples:"
    echo "  export CLOUD_DB_URL='postgresql://user:pass@host:port/db'"
    echo "  $0 status"
    echo "  $0 sync-to-cloud"
    echo "  $0 backup-local"
}

# Main logic
case "$1" in
    "status")
        show_status
        ;;
    "backup-local")
        backup_local
        ;;
    "backup-cloud")
        backup_cloud
        ;;
    "sync-to-cloud")
        sync_to_cloud
        ;;
    "sync-from-cloud")
        sync_from_cloud
        ;;
    "restore-local")
        if [ -z "$2" ]; then
            error "Please specify backup file"
            exit 1
        fi
        restore_backup "$2" "local"
        ;;
    "restore-cloud")
        if [ -z "$2" ]; then
            error "Please specify backup file"
            exit 1
        fi
        restore_backup "$2" "cloud"
        ;;
    *)
        show_usage
        ;;
esac

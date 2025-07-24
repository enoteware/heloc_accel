#!/bin/bash

# Database Setup Script for HELOC Accelerator
# Supports both Docker and native PostgreSQL setups

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DB_NAME="heloc_accelerator"
DB_USER="heloc_user"
DB_PASSWORD="heloc_password"
DB_HOST="localhost"
DB_PORT="5432"

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

# Check if Docker is available
check_docker() {
    if command -v docker &> /dev/null && command -v docker-compose &> /dev/null; then
        return 0
    else
        return 1
    fi
}

# Check if PostgreSQL is installed natively
check_postgres() {
    if command -v psql &> /dev/null; then
        return 0
    else
        return 1
    fi
}

# Setup with Docker
setup_docker() {
    log "Setting up PostgreSQL with Docker..."
    
    # Stop existing containers
    docker-compose down 2>/dev/null || true
    
    # Start PostgreSQL
    docker-compose up -d postgres
    
    # Wait for PostgreSQL to be ready
    log "Waiting for PostgreSQL to be ready..."
    for i in {1..30}; do
        if docker-compose exec -T postgres pg_isready -U $DB_USER -d $DB_NAME &>/dev/null; then
            log "PostgreSQL is ready!"
            break
        fi
        if [ $i -eq 30 ]; then
            error "PostgreSQL failed to start after 30 seconds"
            exit 1
        fi
        sleep 1
    done
    
    log "Database setup complete with Docker!"
    log "Connection string: postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME"
    log "pgAdmin available at: http://localhost:8080 (admin@helocaccel.com / admin123)"
}

# Setup with native PostgreSQL
setup_native() {
    log "Setting up with native PostgreSQL..."
    
    # Check if database exists
    if psql -lqt | cut -d \| -f 1 | grep -qw $DB_NAME; then
        warning "Database $DB_NAME already exists"
    else
        log "Creating database $DB_NAME..."
        createdb $DB_NAME
    fi
    
    # Check if user exists
    if psql -t -c "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'" | grep -q 1; then
        warning "User $DB_USER already exists"
    else
        log "Creating user $DB_USER..."
        psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';"
        psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
    fi
    
    # Run schema
    log "Setting up database schema..."
    psql -d $DB_NAME -f database/schema.sql
    
    # Grant permissions
    psql -d $DB_NAME -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO $DB_USER;"
    psql -d $DB_NAME -c "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO $DB_USER;"
    
    log "Database setup complete with native PostgreSQL!"
    log "Connection string: postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME"
}

# Main setup logic
main() {
    echo -e "${BLUE}🚀 HELOC Accelerator Database Setup${NC}"
    echo ""
    
    # Check for setup method preference
    if [ "$1" = "docker" ]; then
        if check_docker; then
            setup_docker
        else
            error "Docker not available. Please install Docker and Docker Compose."
            exit 1
        fi
    elif [ "$1" = "native" ]; then
        if check_postgres; then
            setup_native
        else
            error "PostgreSQL not available. Please install PostgreSQL."
            exit 1
        fi
    else
        # Auto-detect best option
        if check_docker; then
            log "Docker detected. Using Docker setup..."
            setup_docker
        elif check_postgres; then
            log "PostgreSQL detected. Using native setup..."
            setup_native
        else
            error "Neither Docker nor PostgreSQL found."
            echo "Please install either:"
            echo "  - Docker & Docker Compose: https://docs.docker.com/get-docker/"
            echo "  - PostgreSQL: https://postgresql.org/download/"
            exit 1
        fi
    fi
    
    echo ""
    log "✅ Setup complete! You can now run:"
    log "   npm run dev"
    echo ""
    log "To create a test user:"
    log "   node scripts/create-test-user.js test@example.com password123"
}

# Show usage if help requested
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    echo "Usage: $0 [docker|native]"
    echo ""
    echo "Options:"
    echo "  docker    Force Docker setup"
    echo "  native    Force native PostgreSQL setup"
    echo "  (none)    Auto-detect best option"
    echo ""
    echo "Examples:"
    echo "  $0              # Auto-detect"
    echo "  $0 docker       # Use Docker"
    echo "  $0 native       # Use native PostgreSQL"
    exit 0
fi

main "$@"

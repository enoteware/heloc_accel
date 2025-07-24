#!/bin/bash

# CI/CD Deployment Script for HELOC Accelerator
# This script is optimized for GitHub Actions deployment

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="heloc-accelerator"
APP_DIR="/opt/${APP_NAME}"
APP_USER="heloc"
DEPLOYMENT_ARCHIVE="/tmp/deployment.tar.gz"

log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1"
}

warning() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1"
}

# Check if running as root
check_root() {
    if [ "$EUID" -ne 0 ]; then
        error "This script must be run as root"
        exit 1
    fi
}

# Create backup of current deployment
create_backup() {
    if [ -d "$APP_DIR/app" ] && [ "$(ls -A $APP_DIR/app)" ]; then
        log "Creating backup of current deployment..."
        BACKUP_NAME="${APP_NAME}-backup-$(date +%Y%m%d-%H%M%S)"
        tar -czf "$APP_DIR/backups/$BACKUP_NAME.tar.gz" \
            --exclude='app/node_modules' \
            --exclude='app/.next' \
            --exclude='app/logs' \
            -C "$APP_DIR" app/ 2>/dev/null || true
        log "Backup created: $BACKUP_NAME.tar.gz"
    else
        log "No existing deployment to backup"
    fi
}

# Stop the application
stop_application() {
    log "Stopping application..."
    su - "$APP_USER" -c "pm2 stop $APP_NAME || true" 2>/dev/null || true
    log "Application stopped"
}

# Deploy new version
deploy_application() {
    log "Deploying new version..."
    
    # Verify deployment archive exists
    if [ ! -f "$DEPLOYMENT_ARCHIVE" ]; then
        error "Deployment archive not found: $DEPLOYMENT_ARCHIVE"
        exit 1
    fi
    
    # Extract deployment
    cd "$APP_DIR/app"
    tar -xzf "$DEPLOYMENT_ARCHIVE"
    
    # Set proper ownership
    chown -R "$APP_USER:$APP_USER" "$APP_DIR/app"
    
    log "New version deployed"
}

# Install dependencies
install_dependencies() {
    log "Installing production dependencies..."
    cd "$APP_DIR/app"
    
    # Install dependencies as app user
    su - "$APP_USER" -c "cd $APP_DIR/app && npm ci --production --silent"
    
    log "Dependencies installed"
}

# Update PM2 configuration
update_pm2_config() {
    log "Updating PM2 configuration..."
    cd "$APP_DIR/app"
    
    # Ensure ecosystem.config.js uses standalone server
    sed -i 's/script: .*/script: "node",/' ecosystem.config.js
    sed -i 's/args: .*/args: ".next\/standalone\/server.js",/' ecosystem.config.js
    
    # Update working directory
    sed -i "s|cwd: .*|cwd: '$APP_DIR/app',|" ecosystem.config.js
    
    log "PM2 configuration updated"
}

# Start the application
start_application() {
    log "Starting application..."
    cd "$APP_DIR/app"
    
    # Start with PM2
    su - "$APP_USER" -c "cd $APP_DIR/app && pm2 start ecosystem.config.js --env production"
    su - "$APP_USER" -c "pm2 save"
    
    log "Application started"
}

# Perform health check
health_check() {
    log "Performing health check..."
    
    # Wait for application to start
    sleep 10
    
    # Check if PM2 process is running
    if ! su - "$APP_USER" -c "pm2 list | grep -q $APP_NAME.*online"; then
        error "PM2 process is not running"
        return 1
    fi
    
    # Check if application is responding
    local max_attempts=5
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f -s http://localhost:3000/heloc/api/health > /dev/null; then
            log "Health check passed!"
            return 0
        fi
        
        warning "Health check attempt $attempt/$max_attempts failed, retrying in 10 seconds..."
        sleep 10
        ((attempt++))
    done
    
    error "Health check failed after $max_attempts attempts"
    return 1
}

# Cleanup deployment files
cleanup() {
    log "Cleaning up deployment files..."
    rm -f "$DEPLOYMENT_ARCHIVE"
    log "Cleanup completed"
}

# Show deployment summary
show_summary() {
    log "Deployment completed successfully!"
    echo ""
    echo -e "${BLUE}📊 Deployment Summary:${NC}"
    echo "• Application: $APP_NAME"
    echo "• Directory: $APP_DIR/app"
    echo "• User: $APP_USER"
    echo "• PM2 Status: $(su - $APP_USER -c "pm2 list | grep $APP_NAME" | awk '{print $10}' || echo 'Unknown')"
    echo ""
    echo -e "${GREEN}🌐 Application URLs:${NC}"
    echo "• Main Site: http://localhost:3000/heloc/"
    echo "• Health Check: http://localhost:3000/heloc/api/health"
    echo ""
    
    # Show deployment info if available
    if [ -f "$APP_DIR/app/DEPLOYMENT_INFO.txt" ]; then
        echo -e "${BLUE}📋 Deployment Info:${NC}"
        cat "$APP_DIR/app/DEPLOYMENT_INFO.txt"
        echo ""
    fi
}

# Main deployment function
main() {
    echo -e "${BLUE}🚀 Starting CI/CD Deployment for $APP_NAME${NC}"
    echo ""
    
    check_root
    create_backup
    stop_application
    deploy_application
    install_dependencies
    update_pm2_config
    start_application
    
    if health_check; then
        cleanup
        show_summary
    else
        error "Deployment failed health check"
        exit 1
    fi
}

# Run main function
main "$@"

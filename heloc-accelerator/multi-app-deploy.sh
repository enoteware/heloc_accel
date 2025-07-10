#!/bin/bash

# Multi-Application Deployment Script for HELOC Accelerator
# This script deploys the HELOC app without interfering with other applications

set -e

# Configuration
APP_NAME="heloc-accelerator"
APP_DIR="/opt/${APP_NAME}"
APP_USER="heloc"
APP_PORT="3000"
REPO_URL="https://github.com/enoteware/heloc_accel.git"
BRANCH="main"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1"
}

warning() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1"
}

header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE} HELOC Accelerator Deployment${NC}"
    echo -e "${BLUE}================================${NC}"
    echo ""
}

# Check if running as root
check_root() {
    if [ "$EUID" -ne 0 ]; then
        error "This script must be run as root"
        exit 1
    fi
}

# Create application user if it doesn't exist
create_app_user() {
    if ! id "$APP_USER" &>/dev/null; then
        log "Creating application user: $APP_USER"
        useradd -r -s /bin/bash -d "$APP_DIR" -m "$APP_USER"
    else
        log "Application user $APP_USER already exists"
    fi
}

# Create application directory structure
create_app_structure() {
    log "Creating application directory structure..."
    
    mkdir -p "$APP_DIR"/{app,logs,backups,uploads,scripts,ssl,config}
    
    # Set ownership
    chown -R "$APP_USER:$APP_USER" "$APP_DIR"
    
    # Set permissions
    chmod 755 "$APP_DIR"
    chmod 755 "$APP_DIR"/{app,scripts,config}
    chmod 750 "$APP_DIR"/{logs,backups,uploads,ssl}
    
    # Create log files
    touch "$APP_DIR"/logs/{app.log,error.log,access.log,deploy.log}
    chown "$APP_USER:$APP_USER" "$APP_DIR"/logs/*.log
    chmod 640 "$APP_DIR"/logs/*.log
    
    # Create environment file
    if [ ! -f "$APP_DIR/config/.env.production" ]; then
        touch "$APP_DIR/config/.env.production"
        chown "$APP_USER:$APP_USER" "$APP_DIR/config/.env.production"
        chmod 600 "$APP_DIR/config/.env.production"
        
        # Add basic environment variables
        cat > "$APP_DIR/config/.env.production" << EOF
NODE_ENV=production
PORT=$APP_PORT
DATABASE_URL=postgresql://heloc:heloc_secure_2025@localhost:5432/heloc_accelerator
NEXTAUTH_URL=https://your-domain.com/heloc
NEXTAUTH_SECRET=change_this_in_production
JWT_SECRET=change_this_in_production
EOF
        log "Created default environment file at $APP_DIR/config/.env.production"
        warning "Please update the environment variables in $APP_DIR/config/.env.production"
    fi
}

# Create backup of current deployment
create_backup() {
    if [ -d "$APP_DIR/app" ] && [ "$(ls -A $APP_DIR/app)" ]; then
        log "Creating backup of current deployment..."
        BACKUP_NAME="${APP_NAME}-backup-$(date +%Y%m%d-%H%M%S)"
        tar -czf "$APP_DIR/backups/$BACKUP_NAME.tar.gz" -C "$APP_DIR/app" . 2>/dev/null || true
        log "Backup created: $BACKUP_NAME.tar.gz"
    fi
}

# Deploy application from Git
deploy_from_git() {
    log "Deploying $APP_NAME from Git repository..."
    log "Repository: $REPO_URL"
    log "Branch: $BRANCH"
    
    # Create backup
    create_backup
    
    # Clone or update repository
    if [ -d "$APP_DIR/app/.git" ]; then
        log "Updating existing repository..."
        cd "$APP_DIR/app"
        sudo -u "$APP_USER" git fetch origin
        sudo -u "$APP_USER" git reset --hard "origin/$BRANCH"
    else
        log "Cloning repository..."
        rm -rf "$APP_DIR/app"
        sudo -u "$APP_USER" git clone "$REPO_URL" "$APP_DIR/app"
        cd "$APP_DIR/app"
        sudo -u "$APP_USER" git checkout "$BRANCH"
    fi
    
    # Set proper ownership
    chown -R "$APP_USER:$APP_USER" "$APP_DIR/app"
    
    # Copy environment file
    if [ -f "$APP_DIR/config/.env.production" ]; then
        cp "$APP_DIR/config/.env.production" "$APP_DIR/app/.env.production"
        chown "$APP_USER:$APP_USER" "$APP_DIR/app/.env.production"
    fi
}

# Install dependencies and build
build_application() {
    log "Installing dependencies and building application..."
    cd "$APP_DIR/app"
    
    # Install dependencies
    sudo -u "$APP_USER" npm ci --production=false
    
    # Build application
    sudo -u "$APP_USER" npm run build
    
    log "Application built successfully"
}

# Manage PM2 process
manage_pm2_process() {
    log "Managing PM2 process..."
    
    # Stop existing process
    sudo -u "$APP_USER" pm2 stop "$APP_NAME" 2>/dev/null || true
    sudo -u "$APP_USER" pm2 delete "$APP_NAME" 2>/dev/null || true
    
    # Start application with PM2
    cd "$APP_DIR/app"
    sudo -u "$APP_USER" pm2 start ecosystem.config.js --env production
    sudo -u "$APP_USER" pm2 save
    
    log "Application started with PM2"
}

# Update Nginx configuration (only if needed)
update_nginx_config() {
    log "Checking Nginx configuration..."
    
    # Check if our multi-app config exists
    if [ ! -f "/etc/nginx/conf.d/multi-app.conf" ]; then
        warning "Multi-app Nginx configuration not found"
        if [ -f "$APP_DIR/app/nginx-multi-app.conf" ]; then
            log "Installing multi-app Nginx configuration..."
            cp "$APP_DIR/app/nginx-multi-app.conf" "/etc/nginx/conf.d/multi-app.conf"
            
            # Remove old single-app config if it exists
            rm -f "/etc/nginx/conf.d/heloc-accelerator.conf"
            
            # Test and reload Nginx
            if nginx -t; then
                systemctl reload nginx
                log "Nginx configuration updated and reloaded"
            else
                error "Nginx configuration test failed"
                return 1
            fi
        fi
    else
        log "Multi-app Nginx configuration already exists"
    fi
}

# Health check
health_check() {
    log "Performing health check..."
    
    # Wait for application to start
    sleep 10
    
    # Check if application is responding
    if curl -f "http://localhost:$APP_PORT/health" 2>/dev/null; then
        log "Health check passed!"
        return 0
    else
        error "Health check failed!"
        return 1
    fi
}

# Show deployment summary
show_summary() {
    echo ""
    log "Deployment completed successfully!"
    echo ""
    echo "Application Details:"
    echo "  Name: $APP_NAME"
    echo "  Directory: $APP_DIR"
    echo "  User: $APP_USER"
    echo "  Port: $APP_PORT"
    echo "  Repository: $REPO_URL"
    echo ""
    echo "Access URLs:"
    echo "  Main: https://your-server-ip/"
    echo "  Alt: https://your-server-ip/heloc/"
    echo "  Health: https://your-server-ip/health"
    echo ""
    echo "Management Commands:"
    echo "  Status: sudo -u $APP_USER pm2 list"
    echo "  Logs: sudo -u $APP_USER pm2 logs $APP_NAME"
    echo "  Restart: sudo -u $APP_USER pm2 restart $APP_NAME"
    echo ""
}

# Main deployment function
main() {
    header
    check_root
    
    log "Starting deployment of $APP_NAME..."
    
    create_app_user
    create_app_structure
    deploy_from_git
    build_application
    manage_pm2_process
    update_nginx_config
    
    if health_check; then
        show_summary
    else
        error "Deployment completed but health check failed"
        exit 1
    fi
}

# Help function
show_help() {
    echo "HELOC Accelerator Multi-App Deployment Script"
    echo ""
    echo "Usage:"
    echo "  $0                    # Full deployment"
    echo "  $0 help              # Show this help"
    echo ""
    echo "This script will:"
    echo "  - Create dedicated app user and directory"
    echo "  - Deploy from Git repository"
    echo "  - Build and start the application"
    echo "  - Configure Nginx for multi-app hosting"
    echo "  - Perform health checks"
    echo ""
    echo "The application will be accessible at:"
    echo "  https://your-server-ip/ (main route)"
    echo "  https://your-server-ip/heloc/ (alternative route)"
    echo ""
}

# Script entry point
case "$1" in
    "help"|"-h"|"--help")
        show_help
        ;;
    *)
        main "$@"
        ;;
esac

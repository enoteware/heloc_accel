#!/bin/bash

# HELOC Accelerator Server Setup Script
# Run this script on the VPS server to set up the environment

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="heloc-accelerator"
APP_DIR="/opt/${APP_NAME}"
APP_USER="heloc"
NODE_VERSION="20"
POSTGRES_VERSION="15"

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE} HELOC Accelerator Server Setup${NC}"
    echo -e "${BLUE}================================${NC}"
    echo ""
}

# Check if running as root
check_root() {
    if [ "$EUID" -ne 0 ]; then
        print_error "This script must be run as root"
        exit 1
    fi
}

# Update system packages
update_system() {
    print_status "Updating system packages..."
    apt update && apt upgrade -y
    apt install -y curl wget git unzip software-properties-common
}

# Install Node.js
install_nodejs() {
    print_status "Installing Node.js ${NODE_VERSION}..."
    
    # Install NodeSource repository
    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
    apt install -y nodejs
    
    # Verify installation
    node_version=$(node --version)
    npm_version=$(npm --version)
    print_status "Node.js installed: ${node_version}"
    print_status "npm installed: ${npm_version}"
}

# Install PostgreSQL
install_postgresql() {
    print_status "Installing PostgreSQL ${POSTGRES_VERSION}..."
    
    apt install -y postgresql postgresql-contrib
    
    # Start and enable PostgreSQL
    systemctl start postgresql
    systemctl enable postgresql
    
    print_status "PostgreSQL installed and started"
}

# Create application user
create_app_user() {
    print_status "Creating application user: ${APP_USER}"
    
    if id "${APP_USER}" &>/dev/null; then
        print_warning "User ${APP_USER} already exists"
    else
        useradd -m -s /bin/bash ${APP_USER}
        print_status "User ${APP_USER} created"
    fi
}

# Create application directory
create_app_directory() {
    print_status "Creating application directory: ${APP_DIR}"
    
    mkdir -p ${APP_DIR}
    chown ${APP_USER}:${APP_USER} ${APP_DIR}
    chmod 755 ${APP_DIR}
    
    print_status "Application directory created"
}

# Set up PostgreSQL database
setup_database() {
    print_status "Setting up PostgreSQL database..."
    
    # Switch to postgres user and create database
    sudo -u postgres psql -c "CREATE DATABASE ${APP_NAME};"
    sudo -u postgres psql -c "CREATE USER ${APP_USER} WITH PASSWORD 'heloc_secure_password_2025';"
    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE ${APP_NAME} TO ${APP_USER};"
    
    print_status "Database ${APP_NAME} created with user ${APP_USER}"
}

# Install PM2 for process management
install_pm2() {
    print_status "Installing PM2 for process management..."
    
    npm install -g pm2
    
    # Set up PM2 to start on boot
    pm2 startup
    
    print_status "PM2 installed"
}

# Configure firewall
configure_firewall() {
    print_status "Configuring firewall..."
    
    # Install ufw if not present
    apt install -y ufw
    
    # Configure basic firewall rules
    ufw default deny incoming
    ufw default allow outgoing
    ufw allow ssh
    ufw allow 80/tcp
    ufw allow 443/tcp
    ufw allow 3000/tcp  # For development
    
    # Enable firewall
    ufw --force enable
    
    print_status "Firewall configured"
}

# Install Nginx
install_nginx() {
    print_status "Installing Nginx..."
    
    apt install -y nginx
    systemctl start nginx
    systemctl enable nginx
    
    print_status "Nginx installed and started"
}

# Create basic Nginx configuration
create_nginx_config() {
    print_status "Creating Nginx configuration..."
    
    cat > /etc/nginx/sites-available/${APP_NAME} << EOF
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

    # Enable the site
    ln -sf /etc/nginx/sites-available/${APP_NAME} /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
    
    # Test and reload Nginx
    nginx -t && systemctl reload nginx
    
    print_status "Nginx configuration created"
}

# Display system information
show_system_info() {
    print_header
    print_status "System Information:"
    echo "OS: $(cat /etc/os-release | grep PRETTY_NAME | cut -d'=' -f2 | tr -d '\"')"
    echo "Node.js: $(node --version 2>/dev/null || echo 'Not installed')"
    echo "npm: $(npm --version 2>/dev/null || echo 'Not installed')"
    echo "PostgreSQL: $(sudo -u postgres psql --version 2>/dev/null || echo 'Not installed')"
    echo "PM2: $(pm2 --version 2>/dev/null || echo 'Not installed')"
    echo "Nginx: $(nginx -v 2>&1 | cut -d' ' -f3 2>/dev/null || echo 'Not installed')"
    echo ""
    echo "Memory: $(free -h | grep Mem | awk '{print $2}')"
    echo "Disk: $(df -h / | tail -1 | awk '{print $2}')"
    echo ""
}

# Main installation function
main() {
    print_header
    check_root
    
    print_status "Starting HELOC Accelerator server setup..."
    
    update_system
    install_nodejs
    install_postgresql
    create_app_user
    create_app_directory
    setup_database
    install_pm2
    configure_firewall
    install_nginx
    create_nginx_config
    
    print_status "Server setup completed!"
    print_status "Application directory: ${APP_DIR}"
    print_status "Database: ${APP_NAME}"
    print_status "User: ${APP_USER}"
    
    show_system_info
}

# Help function
show_help() {
    echo "HELOC Accelerator Server Setup Script"
    echo ""
    echo "Usage:"
    echo "  ./server-setup.sh              # Full setup"
    echo "  ./server-setup.sh info         # Show system info only"
    echo "  ./server-setup.sh help         # Show this help"
    echo ""
    echo "This script will:"
    echo "  - Update system packages"
    echo "  - Install Node.js ${NODE_VERSION}"
    echo "  - Install PostgreSQL ${POSTGRES_VERSION}"
    echo "  - Create application user and directory"
    echo "  - Set up database"
    echo "  - Install PM2 for process management"
    echo "  - Configure firewall"
    echo "  - Install and configure Nginx"
}

# Script entry point
case "$1" in
    "info")
        show_system_info
        ;;
    "help"|"-h"|"--help")
        show_help
        ;;
    *)
        main
        ;;
esac

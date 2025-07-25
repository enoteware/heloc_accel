#!/bin/bash

# HELOC Accelerator Manual Deployment Script
# This script helps deploy the application to your server

set -e

# Configuration
SERVER_USER=${SERVER_USER:-"root"}
SERVER_HOST=${SERVER_HOST:-"your-server.com"}
SERVER_PATH=${SERVER_PATH:-"/opt/heloc-accelerator"}
ARCHIVE_NAME="heloc-accelerator-deployment.tar.gz"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}HELOC Accelerator Deployment Script${NC}"
echo -e "${YELLOW}======================================${NC}"

# Check if archive exists
if [ ! -f "$ARCHIVE_NAME" ]; then
    echo -e "${RED}Error: Deployment archive not found!${NC}"
    echo "Please run ./deploy-standalone.sh first to create the deployment package"
    exit 1
fi

# Get server details if not set
if [ "$SERVER_HOST" == "your-server.com" ]; then
    read -p "Enter server hostname or IP: " SERVER_HOST
fi

read -p "Deploy to $SERVER_USER@$SERVER_HOST? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled"
    exit 1
fi

echo -e "\n${YELLOW}Step 1: Uploading deployment archive...${NC}"
scp "$ARCHIVE_NAME" "$SERVER_USER@$SERVER_HOST:/tmp/"

echo -e "\n${YELLOW}Step 2: Extracting and setting up on server...${NC}"
ssh "$SERVER_USER@$SERVER_HOST" << 'ENDSSH'
set -e

# Create backup if exists
if [ -d "/opt/heloc-accelerator" ]; then
    echo "Creating backup of existing deployment..."
    sudo mv /opt/heloc-accelerator /opt/heloc-accelerator-backup-$(date +%Y%m%d-%H%M%S)
fi

# Extract new deployment
echo "Extracting deployment archive..."
cd /opt
sudo tar -xzf /tmp/heloc-accelerator-deployment.tar.gz
sudo mv deployment heloc-accelerator

# Set permissions
sudo chown -R www-data:www-data /opt/heloc-accelerator
cd /opt/heloc-accelerator

# Copy environment file if exists in backup
if [ -f "/opt/heloc-accelerator-backup-*/env.local" ]; then
    echo "Copying environment configuration from backup..."
    sudo cp /opt/heloc-accelerator-backup-*/.env.local .env.local
else
    echo "No existing .env.local found. Please configure manually."
fi

echo "Deployment extracted successfully!"
ENDSSH

echo -e "\n${YELLOW}Step 3: Starting application...${NC}"
read -p "Start application with PM2? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    ssh "$SERVER_USER@$SERVER_HOST" << 'ENDSSH'
    cd /opt/heloc-accelerator
    
    # Check if PM2 is installed
    if ! command -v pm2 &> /dev/null; then
        echo "PM2 not found. Installing..."
        sudo npm install -g pm2
    fi
    
    # Stop existing if running
    pm2 stop heloc-accelerator 2>/dev/null || true
    pm2 delete heloc-accelerator 2>/dev/null || true
    
    # Start new instance
    sudo -u www-data pm2 start ecosystem.config.js --env production
    sudo -u www-data pm2 save
    
    echo "Application started with PM2!"
    pm2 status
ENDSSH
else
    echo -e "${YELLOW}Manual start required. SSH to server and run:${NC}"
    echo "cd $SERVER_PATH && ./pm2-start.sh"
fi

echo -e "\n${GREEN}Deployment complete!${NC}"
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Configure .env.local if not already done"
echo "2. Set up Nginx reverse proxy if needed"
echo "3. Configure SSL certificate"
echo "4. Test application at http://$SERVER_HOST:3000"

echo -e "\n${YELLOW}To check application status:${NC}"
echo "ssh $SERVER_USER@$SERVER_HOST 'pm2 status'"
echo "ssh $SERVER_USER@$SERVER_HOST 'pm2 logs heloc-accelerator'"
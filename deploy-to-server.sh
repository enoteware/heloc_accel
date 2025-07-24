#!/bin/bash

# HELOC Accelerator Deployment Script to VPS
# This script deploys the updated application to the production server

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Server configuration
SERVER_HOST="50.28.106.254"
SERVER_USER="root"
SERVER_PASS="-OEe2/AS60wK4p"
APP_USER="heloc"
APP_DIR="/opt/heloc-accelerator/app"
BACKUP_DIR="/opt/heloc-accelerator/backups"

echo -e "${GREEN}🚀 Starting HELOC Accelerator deployment to production...${NC}"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: package.json not found. Please run this script from the project root.${NC}"
    exit 1
fi

# Build the application locally
echo -e "${YELLOW}📦 Building the application...${NC}"
npm run build

if [ ! -f ".next/standalone/server.js" ]; then
    echo -e "${RED}Error: Build failed. Standalone server not found.${NC}"
    exit 1
fi

# Prepare deployment package
echo -e "${YELLOW}📋 Preparing deployment files...${NC}"
DEPLOY_DIR="deployment-package"
rm -rf $DEPLOY_DIR
mkdir -p $DEPLOY_DIR

# Copy application files (excluding node_modules and .next)
rsync -av --exclude='node_modules' --exclude='.next' --exclude='deployment-package' --exclude='.git' \
    --exclude='*.log' --exclude='.env.local' --exclude='.env.production' \
    ./ $DEPLOY_DIR/

# Copy the standalone build
cp -r .next/standalone/* $DEPLOY_DIR/
cp -r .next/static $DEPLOY_DIR/.next/
cp -r public $DEPLOY_DIR/

# Create deployment info
echo "Deployment Date: $(date)" > $DEPLOY_DIR/DEPLOYMENT_INFO.txt
echo "Git Commit: $(git rev-parse --short HEAD 2>/dev/null || echo 'N/A')" >> $DEPLOY_DIR/DEPLOYMENT_INFO.txt
echo "Next.js Version: 15.4.3" >> $DEPLOY_DIR/DEPLOYMENT_INFO.txt

# Create tarball
echo -e "${YELLOW}📦 Creating deployment archive...${NC}"
tar -czf deployment.tar.gz -C $DEPLOY_DIR .

# Stop the application on server
echo -e "${YELLOW}🛑 Stopping application on server...${NC}"
sshpass -p "$SERVER_PASS" ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_HOST << 'EOF'
su - heloc -c "pm2 stop heloc-accelerator || true"
EOF

# Create backup on server
echo -e "${YELLOW}💾 Creating backup on server...${NC}"
BACKUP_NAME="backup-$(date +%Y%m%d-%H%M%S).tar.gz"
sshpass -p "$SERVER_PASS" ssh $SERVER_USER@$SERVER_HOST << EOF
cd /opt/heloc-accelerator
tar -czf backups/$BACKUP_NAME \
    --exclude='app/node_modules' \
    --exclude='app/.next' \
    --exclude='app/logs' \
    app/
echo "Backup created: $BACKUP_NAME"
EOF

# Upload deployment package
echo -e "${YELLOW}📤 Uploading deployment package...${NC}"
sshpass -p "$SERVER_PASS" scp deployment.tar.gz $SERVER_USER@$SERVER_HOST:/tmp/

# Extract and deploy on server
echo -e "${YELLOW}🔄 Deploying on server...${NC}"
sshpass -p "$SERVER_PASS" ssh $SERVER_USER@$SERVER_HOST << 'EOF'
# Extract new files
cd /opt/heloc-accelerator/app
tar -xzf /tmp/deployment.tar.gz

# Fix ownership
chown -R heloc:heloc /opt/heloc-accelerator/app

# Remove deployment archive
rm /tmp/deployment.tar.gz

# Install dependencies for standalone
cd /opt/heloc-accelerator/app
su - heloc -c "cd /opt/heloc-accelerator/app && npm ci --production --silent"
EOF

# Update PM2 configuration (already done, but let's ensure it's correct)
echo -e "${YELLOW}⚙️  Verifying PM2 configuration...${NC}"
sshpass -p "$SERVER_PASS" ssh $SERVER_USER@$SERVER_HOST << 'EOF'
cd /opt/heloc-accelerator/app
# Ensure ecosystem.config.js uses standalone server
sed -i 's/script: .*/script: "node",/' ecosystem.config.js
sed -i 's/args: .*/args: ".next\/standalone\/server.js",/' ecosystem.config.js
EOF

# Start the application
echo -e "${YELLOW}🚀 Starting application...${NC}"
sshpass -p "$SERVER_PASS" ssh $SERVER_USER@$SERVER_HOST << 'EOF'
su - heloc -c "cd /opt/heloc-accelerator/app && pm2 start ecosystem.config.js --env production"
su - heloc -c "pm2 save"
EOF

# Verify deployment
echo -e "${YELLOW}✅ Verifying deployment...${NC}"
sleep 5
sshpass -p "$SERVER_PASS" ssh $SERVER_USER@$SERVER_HOST << 'EOF'
# Check PM2 status
echo "PM2 Status:"
su - heloc -c "pm2 status"

# Test local access
echo -e "\nTesting local access:"
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://localhost:3000/heloc/

# Check logs for errors
echo -e "\nRecent logs:"
su - heloc -c "pm2 logs heloc-accelerator --lines 5 --nostream"
EOF

# Clean up local files
echo -e "${YELLOW}🧹 Cleaning up...${NC}"
rm -rf $DEPLOY_DIR deployment.tar.gz

echo -e "${GREEN}✅ Deployment complete!${NC}"
echo -e "${BLUE}🌐 Application should be available at: https://heloc.noteware.dev${NC}"
echo -e "${YELLOW}📊 Monitor logs with: ssh $SERVER_USER@$SERVER_HOST 'su - heloc -c \"pm2 logs heloc-accelerator\"'${NC}"

# Final test from local machine
echo -e "\n${YELLOW}🔍 Testing from local machine...${NC}"
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -L https://heloc.noteware.dev)
if [ "$HTTP_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ Site is accessible and returning HTTP 200!${NC}"
else
    echo -e "${RED}⚠️  Site returned HTTP $HTTP_STATUS - please check the application${NC}"
fi
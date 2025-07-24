#!/bin/bash

# HELOC Accelerator Standalone Deployment Script
# This script prepares the Next.js standalone build for deployment

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting HELOC Accelerator Standalone Deployment...${NC}"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: package.json not found. Please run this script from the project root.${NC}"
    exit 1
fi

# Build the application
echo -e "${YELLOW}Building the application...${NC}"
npm run build

# Check if build was successful
if [ ! -f ".next/standalone/server.js" ]; then
    echo -e "${RED}Error: Standalone build not found. Build may have failed.${NC}"
    exit 1
fi

# Create deployment directory structure
echo -e "${YELLOW}Setting up deployment directory...${NC}"
DEPLOY_DIR="deployment"
rm -rf $DEPLOY_DIR
mkdir -p $DEPLOY_DIR

# Copy standalone server
echo -e "${YELLOW}Copying standalone server...${NC}"
cp -r .next/standalone/* $DEPLOY_DIR/

# Copy static files (required for standalone)
echo -e "${YELLOW}Copying static files...${NC}"
cp -r .next/static $DEPLOY_DIR/.next/

# Copy public directory (required for standalone)
echo -e "${YELLOW}Copying public directory...${NC}"
cp -r public $DEPLOY_DIR/

# Copy ecosystem config
echo -e "${YELLOW}Copying PM2 configuration...${NC}"
cp ecosystem.config.js $DEPLOY_DIR/

# Copy environment example
if [ -f ".env.example" ]; then
    echo -e "${YELLOW}Copying environment example...${NC}"
    cp .env.example $DEPLOY_DIR/
fi

# Create startup script
echo -e "${YELLOW}Creating startup script...${NC}"
cat > $DEPLOY_DIR/start.sh << 'EOF'
#!/bin/bash
# HELOC Accelerator Startup Script

# Check for .env.local
if [ ! -f ".env.local" ]; then
    echo "Warning: .env.local not found. Please configure your environment variables."
    if [ -f ".env.example" ]; then
        echo "You can copy .env.example to .env.local and update the values."
    fi
fi

# Start the server
echo "Starting HELOC Accelerator on port ${PORT:-3000}..."
node server.js
EOF

chmod +x $DEPLOY_DIR/start.sh

# Create PM2 startup script
cat > $DEPLOY_DIR/pm2-start.sh << 'EOF'
#!/bin/bash
# PM2 Startup Script for HELOC Accelerator

# Update the cwd in ecosystem.config.js to current directory
sed -i.bak "s|cwd: '/opt/heloc-accelerator/app'|cwd: '$(pwd)'|g" ecosystem.config.js

# Start with PM2
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

echo "HELOC Accelerator started with PM2"
echo "Use 'pm2 status' to check the application status"
echo "Use 'pm2 logs heloc-accelerator' to view logs"
EOF

chmod +x $DEPLOY_DIR/pm2-start.sh

# Create deployment instructions
cat > $DEPLOY_DIR/README.md << 'EOF'
# HELOC Accelerator Standalone Deployment

This directory contains the standalone Next.js build ready for deployment.

## Quick Start

1. Copy this entire directory to your server
2. Configure environment variables by copying `.env.example` to `.env.local`
3. Install Node.js 18+ if not already installed
4. Run the application:

### Option 1: Direct Node.js
```bash
./start.sh
```

### Option 2: With PM2
```bash
npm install -g pm2  # If not already installed
./pm2-start.sh
```

## Directory Structure

- `server.js` - Main standalone server file
- `.next/` - Built application files
- `public/` - Static assets
- `ecosystem.config.js` - PM2 configuration
- `start.sh` - Simple startup script
- `pm2-start.sh` - PM2 startup script

## Environment Variables

Required environment variables (configure in `.env.local`):
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - NextAuth.js secret
- `NEXTAUTH_URL` - Application URL

## Nginx Configuration

For production deployment behind Nginx, use this configuration:

```nginx
location /heloc/ {
    proxy_pass http://localhost:3000/heloc/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

## Troubleshooting

1. If the app serves empty pages, ensure you're using the standalone server (not `next start`)
2. Check that `.next/static` and `public` directories are present
3. Verify environment variables are loaded correctly
4. Check PM2 logs: `pm2 logs heloc-accelerator`
EOF

echo -e "${GREEN}Deployment package created successfully!${NC}"
echo -e "${GREEN}The deployment files are in the '${DEPLOY_DIR}' directory.${NC}"
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Copy the '${DEPLOY_DIR}' directory to your server"
echo "2. Configure environment variables in .env.local"
echo "3. Run ./start.sh or ./pm2-start.sh to start the application"
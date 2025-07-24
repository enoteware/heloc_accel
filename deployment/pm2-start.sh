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

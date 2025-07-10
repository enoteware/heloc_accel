# 🚀 HELOC Accelerator Deployment Commands

## Step 1: Deploy to GitHub (Run in Terminal)

```bash
# Navigate to project directory
cd heloc-accelerator

# Initialize Git and add files
git init
git add .

# Create initial commit
git commit -m "Multi-app ready HELOC Accelerator

- Next.js 14 with TypeScript and Tailwind CSS
- Multi-application server architecture
- Optimized for hosting multiple apps on single VPS
- Production-ready with PM2 and Nginx configuration
- Health monitoring and automated backups
- Secure user isolation and resource management"

# Add remote and push
git remote add origin https://github.com/enoteware/heloc_accel.git
git branch -M main
git push -u origin main
```

## Step 2: Deploy to VPS Server

### Option A: Automated Deployment (Recommended)

```bash
# Connect to your server
ssh heloc-prod

# Create the multi-app deployment script
cat > /tmp/deploy-heloc.sh << 'EOF'
#!/bin/bash

set -e

# Configuration
APP_NAME="heloc-accelerator"
APP_DIR="/opt/${APP_NAME}"
APP_USER="heloc"
APP_PORT="3000"
REPO_URL="https://github.com/enoteware/heloc_accel.git"

echo "🚀 Deploying HELOC Accelerator..."

# Create application user if needed
if ! id "$APP_USER" &>/dev/null; then
    echo "Creating user: $APP_USER"
    useradd -r -s /bin/bash -d "$APP_DIR" -m "$APP_USER"
fi

# Create directory structure
echo "Creating directory structure..."
mkdir -p "$APP_DIR"/{app,logs,backups,uploads,scripts,ssl,config}
chown -R "$APP_USER:$APP_USER" "$APP_DIR"
chmod 755 "$APP_DIR"
chmod 755 "$APP_DIR"/{app,scripts,config}
chmod 750 "$APP_DIR"/{logs,backups,uploads,ssl}

# Create log files
touch "$APP_DIR"/logs/{app.log,error.log,access.log,deploy.log}
chown "$APP_USER:$APP_USER" "$APP_DIR"/logs/*.log
chmod 640 "$APP_DIR"/logs/*.log

# Create environment file
if [ ! -f "$APP_DIR/config/.env.production" ]; then
    cat > "$APP_DIR/config/.env.production" << 'ENVEOF'
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://heloc:heloc_secure_2025@localhost:5432/heloc_accelerator
NEXTAUTH_URL=https://50.28.106.254
NEXTAUTH_SECRET=heloc_secure_secret_2025_change_in_production
JWT_SECRET=heloc_jwt_secret_2025_change_in_production
ENVEOF
    chown "$APP_USER:$APP_USER" "$APP_DIR/config/.env.production"
    chmod 600 "$APP_DIR/config/.env.production"
    echo "✅ Created environment file"
fi

# Clone or update repository
echo "Deploying from Git..."
if [ -d "$APP_DIR/app/.git" ]; then
    echo "Updating existing repository..."
    cd "$APP_DIR/app"
    sudo -u "$APP_USER" git fetch origin
    sudo -u "$APP_USER" git reset --hard origin/main
else
    echo "Cloning repository..."
    rm -rf "$APP_DIR/app"
    sudo -u "$APP_USER" git clone "$REPO_URL" "$APP_DIR/app"
    cd "$APP_DIR/app"
    sudo -u "$APP_USER" git checkout main
fi

# Set ownership
chown -R "$APP_USER:$APP_USER" "$APP_DIR/app"

# Copy environment file
cp "$APP_DIR/config/.env.production" "$APP_DIR/app/.env.production"
chown "$APP_USER:$APP_USER" "$APP_DIR/app/.env.production"

# Install dependencies and build
echo "Installing dependencies..."
cd "$APP_DIR/app"
sudo -u "$APP_USER" npm ci --production=false

echo "Building application..."
sudo -u "$APP_USER" npm run build

# Stop existing PM2 process
echo "Managing PM2 process..."
sudo -u "$APP_USER" pm2 stop "$APP_NAME" 2>/dev/null || true
sudo -u "$APP_USER" pm2 delete "$APP_NAME" 2>/dev/null || true

# Start with PM2
sudo -u "$APP_USER" pm2 start ecosystem.config.js --env production
sudo -u "$APP_USER" pm2 save

# Update Nginx configuration
echo "Updating Nginx configuration..."
if [ -f "$APP_DIR/app/nginx-multi-app.conf" ]; then
    cp "$APP_DIR/app/nginx-multi-app.conf" "/etc/nginx/conf.d/multi-app.conf"
    
    # Remove old config if exists
    rm -f "/etc/nginx/conf.d/heloc-accelerator.conf"
    
    # Test and reload Nginx
    if nginx -t; then
        systemctl reload nginx
        echo "✅ Nginx configuration updated"
    else
        echo "❌ Nginx configuration test failed"
        exit 1
    fi
fi

# Health check
echo "Performing health check..."
sleep 10
if curl -f "http://localhost:$APP_PORT/health" 2>/dev/null; then
    echo "✅ Health check passed!"
else
    echo "❌ Health check failed!"
    exit 1
fi

echo ""
echo "🎉 HELOC Accelerator deployed successfully!"
echo ""
echo "Access URLs:"
echo "  Main: https://50.28.106.254/"
echo "  Alt:  https://50.28.106.254/heloc/"
echo "  Health: https://50.28.106.254/health"
echo ""
echo "Management:"
echo "  Status: sudo -u $APP_USER pm2 list"
echo "  Logs: sudo -u $APP_USER pm2 logs $APP_NAME"
echo "  Restart: sudo -u $APP_USER pm2 restart $APP_NAME"
echo ""
EOF

# Make executable and run
chmod +x /tmp/deploy-heloc.sh
/tmp/deploy-heloc.sh
```

### Option B: Manual Step-by-Step

```bash
# Connect to server
ssh heloc-prod

# Create user and directories
useradd -r -s /bin/bash -d /opt/heloc-accelerator -m heloc
mkdir -p /opt/heloc-accelerator/{app,logs,backups,uploads,scripts,ssl,config}
chown -R heloc:heloc /opt/heloc-accelerator

# Clone repository
sudo -u heloc git clone https://github.com/enoteware/heloc_accel.git /opt/heloc-accelerator/app

# Create environment file
cat > /opt/heloc-accelerator/config/.env.production << 'EOF'
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://heloc:heloc_secure_2025@localhost:5432/heloc_accelerator
NEXTAUTH_URL=https://50.28.106.254
NEXTAUTH_SECRET=heloc_secure_secret_2025_change_in_production
JWT_SECRET=heloc_jwt_secret_2025_change_in_production
EOF

# Copy environment file to app
cp /opt/heloc-accelerator/config/.env.production /opt/heloc-accelerator/app/.env.production
chown heloc:heloc /opt/heloc-accelerator/app/.env.production

# Install and build
cd /opt/heloc-accelerator/app
sudo -u heloc npm ci
sudo -u heloc npm run build

# Start with PM2
sudo -u heloc pm2 start ecosystem.config.js --env production

# Update Nginx
cp /opt/heloc-accelerator/app/nginx-multi-app.conf /etc/nginx/conf.d/multi-app.conf
nginx -t && systemctl reload nginx

# Test
curl http://localhost:3000/health
```

## Step 3: Verify Deployment

After deployment, test these URLs:

- **Main App**: https://50.28.106.254/
- **Health Check**: https://50.28.106.254/health
- **Server Status**: https://50.28.106.254/server-status

## Step 4: Monitor

```bash
# Check PM2 status
sudo -u heloc pm2 list

# Check logs
sudo -u heloc pm2 logs heloc-accelerator

# Check Nginx
systemctl status nginx
```

## 🎯 Quick Commands Summary

```bash
# Local: Push to GitHub
cd heloc-accelerator && git init && git add . && git commit -m "Initial commit" && git remote add origin https://github.com/enoteware/heloc_accel.git && git push -u origin main

# Server: Deploy application
ssh heloc-prod
curl -s https://raw.githubusercontent.com/enoteware/heloc_accel/main/multi-app-deploy.sh | bash
```

Your HELOC Accelerator will be live at: **https://50.28.106.254/**

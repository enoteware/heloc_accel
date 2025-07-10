# HELOC Accelerator Multi-App Deployment Guide

## 🚀 Step 1: Deploy to GitHub

Run these commands in your terminal:

```bash
# Navigate to the project directory
cd heloc-accelerator

# Initialize Git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: HELOC Accelerator Next.js application"

# Add remote repository
git remote add origin https://github.com/enoteware/heloc_accel.git

# Set main branch and push
git branch -M main
git push -u origin main
```

## 🖥️ Step 2: Deploy to VPS Server (Multi-App Setup)

### Connect to your server

```bash
ssh heloc-prod
```

### Option A: Use the multi-app deployment script (Recommended)

```bash
# Download and run the multi-app deployment script
curl -o /tmp/multi-app-deploy.sh https://raw.githubusercontent.com/enoteware/heloc_accel/main/multi-app-deploy.sh
chmod +x /tmp/multi-app-deploy.sh
/tmp/multi-app-deploy.sh
```

### Option B: Manual deployment

```bash
# Create the application structure
mkdir -p /opt/heloc-accelerator/{app,logs,backups,uploads,scripts,ssl,config}
useradd -r -s /bin/bash -d /opt/heloc-accelerator -m heloc
chown -R heloc:heloc /opt/heloc-accelerator

# Clone the repository
sudo -u heloc git clone https://github.com/enoteware/heloc_accel.git /opt/heloc-accelerator/app

# Install and build
cd /opt/heloc-accelerator/app
sudo -u heloc npm ci
sudo -u heloc npm run build

# Start with PM2
sudo -u heloc pm2 start ecosystem.config.js --env production
```

## 🔧 Step 3: Configure Environment Variables

Edit the production environment file:

```bash
nano /opt/heloc-accelerator/config/.env.production
```

Update these key variables:

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://heloc:heloc_secure_2025@localhost:5432/heloc_accelerator
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your_secure_secret_here
JWT_SECRET=your_jwt_secret_here
```

## 🌐 Step 4: Access Your Application

- **HTTP**: `http://your-server-ip` (redirects to HTTPS)
- **HTTPS**: `https://your-server-ip`
- **Health Check**: `https://your-server-ip/health`

## 📊 Step 5: Monitor Your Application

### Check application status

```bash
/opt/heloc-accelerator/scripts/status.sh
```

### View logs

```bash
tail -f /opt/heloc-accelerator/logs/app.log
```

### Health check

```bash
/opt/heloc-accelerator/scripts/monitor.sh health
```

## 🔄 Step 6: Future Updates

To update your application:

1. **Push changes to GitHub:**

   ```bash
   git add .
   git commit -m "Your update message"
   git push origin main
   ```

2. **Deploy to server:**

   ```bash
   ssh heloc-prod
   /opt/heloc-accelerator/scripts/deploy.sh git https://github.com/enoteware/heloc_accel.git main
   ```

## 🛠️ Troubleshooting

### Application won't start

```bash
# Check PM2 status
sudo -u heloc pm2 list

# Check logs
tail -f /opt/heloc-accelerator/logs/error.log

# Restart application
/opt/heloc-accelerator/scripts/deploy.sh restart
```

### Database connection issues

```bash
# Check PostgreSQL status
systemctl status postgresql

# Test database connection
sudo -u postgres psql heloc_accelerator
```

### SSL certificate issues

```bash
# Check certificate
openssl x509 -text -in /opt/heloc-accelerator/ssl/cert.pem

# Test Nginx config
nginx -t

# Reload Nginx
systemctl reload nginx
```

## 📝 Important Notes

- The application runs on port 3000 internally
- Nginx proxies external traffic (ports 80/443) to the application
- All logs are stored in `/opt/heloc-accelerator/logs/`
- Backups are automated daily at 2 AM
- Health checks run every 5 minutes

## 🎯 Next Steps

1. **Set up a custom domain** and point it to your server IP
2. **Get a real SSL certificate** (Let's Encrypt recommended)
3. **Configure email settings** for user notifications
4. **Set up monitoring alerts** for production use

Your HELOC Accelerator is now ready for production! 🎉

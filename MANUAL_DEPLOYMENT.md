# Manual Deployment Guide for HELOC Accelerator

This guide provides step-by-step instructions for manually deploying the HELOC Accelerator application to your production server.

## Prerequisites

- Node.js 18+ installed on the server
- PM2 (optional, for process management)
- PostgreSQL database (for production mode)
- Nginx or similar reverse proxy (recommended)

## Deployment Files

The `deployment` directory contains everything needed for production:

- `server.js` - Main standalone server
- `.next/` - Compiled application files
- `public/` - Static assets
- `node_modules/` - Dependencies
- `ecosystem.config.js` - PM2 configuration
- `.env.example` - Environment variables template

## Step 1: Create Deployment Archive

```bash
# From the project root
tar -czf heloc-accelerator-deployment.tar.gz deployment/
```

## Step 2: Upload to Server

```bash
# Using SCP
scp heloc-accelerator-deployment.tar.gz user@your-server:/opt/

# Or using rsync
rsync -avz heloc-accelerator-deployment.tar.gz user@your-server:/opt/
```

## Step 3: Extract on Server

```bash
# SSH into your server
ssh user@your-server

# Navigate to deployment directory
cd /opt

# Extract the archive
tar -xzf heloc-accelerator-deployment.tar.gz

# Rename for clarity (optional)
mv deployment heloc-accelerator

# Navigate to app directory
cd heloc-accelerator
```

## Step 4: Configure Environment Variables

```bash
# Copy the example file
cp .env.example .env.local

# Edit with your production values
nano .env.local
```

Required environment variables:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/heloc_db

# NextAuth
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=https://yourdomain.com

# Demo Mode (set to false for production)
NEXT_PUBLIC_DEMO_MODE=false

# Optional: Error tracking, analytics, etc.
```

## Step 5: Set Up Database (if not already done)

```bash
# Create database
createdb heloc_db

# Run schema
psql heloc_db < database/schema.sql
```

## Step 6: Start the Application

### Option A: Using PM2 (Recommended)

```bash
# Install PM2 globally if not already installed
npm install -g pm2

# Start using the provided script
./pm2-start.sh

# Or manually
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Set up PM2 to start on boot
pm2 startup
```

### Option B: Direct Node.js

```bash
# Start using the provided script
./start.sh

# Or manually
NODE_ENV=production PORT=3000 node server.js
```

### Option C: Using systemd

Create `/etc/systemd/system/heloc-accelerator.service`:

```ini
[Unit]
Description=HELOC Accelerator
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/heloc-accelerator
ExecStart=/usr/bin/node server.js
Restart=on-failure
Environment=NODE_ENV=production
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
```

Then:

```bash
systemctl enable heloc-accelerator
systemctl start heloc-accelerator
```

## Step 7: Configure Nginx (Recommended)

Add to your Nginx configuration:

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/key.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Step 8: Verify Deployment

1. Check application status:

   ```bash
   # If using PM2
   pm2 status
   pm2 logs heloc-accelerator

   # If using systemd
   systemctl status heloc-accelerator
   journalctl -u heloc-accelerator -f
   ```

2. Test the application:

   ```bash
   curl http://localhost:3000/health
   ```

3. Access via browser at your configured domain

## Troubleshooting

### Application won't start

- Check logs for errors
- Verify all environment variables are set
- Ensure database connection is working
- Check file permissions

### Blank pages or 404 errors

- Verify `.next/static` directory exists
- Check that `public` directory is present
- Ensure Nginx is properly configured

### Database connection issues

- Verify DATABASE_URL is correct
- Check PostgreSQL is running
- Ensure database user has proper permissions

## Updates

To update the application:

1. Create new deployment package on development machine
2. Upload to server
3. Stop current application
4. Replace files (backup old version first)
5. Start application

```bash
# Example update process
pm2 stop heloc-accelerator
mv /opt/heloc-accelerator /opt/heloc-accelerator-backup
tar -xzf heloc-accelerator-deployment-new.tar.gz
mv deployment /opt/heloc-accelerator
cd /opt/heloc-accelerator
# Copy over your .env.local from backup
cp /opt/heloc-accelerator-backup/.env.local .
pm2 start ecosystem.config.js --env production
```

## Security Checklist

- [ ] SSL certificate configured
- [ ] Environment variables secured (not in version control)
- [ ] Database password is strong
- [ ] NEXTAUTH_SECRET is random and secure
- [ ] File permissions set appropriately
- [ ] Firewall configured (only necessary ports open)
- [ ] Regular backups configured

## Monitoring

Consider setting up:

- PM2 monitoring dashboard
- Application logs aggregation
- Uptime monitoring
- Database backup automation

## Support

If you encounter issues:

1. Check application logs
2. Verify all prerequisites are met
3. Ensure environment variables are correct
4. Check database connectivity

The application includes navigation bar and dashboard components on all pages.

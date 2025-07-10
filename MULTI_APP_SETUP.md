# Multi-Application Server Setup

## 🏗️ Architecture Overview

This setup is designed to host multiple Node.js applications on a single VPS server efficiently and securely.

## 📁 Directory Structure

```bash
/opt/
├── heloc-accelerator/          # HELOC Accelerator (port 3000)
│   ├── app/                    # Application code
│   ├── logs/                   # Application logs
│   ├── backups/                # Automated backups
│   ├── config/                 # Environment configuration
│   ├── ssl/                    # SSL certificates (shared)
│   └── scripts/                # Management scripts
├── future-app-1/               # Future application (port 3001)
└── future-app-2/               # Future application (port 3002)
```

## 🔧 Key Components

### 1. Application Isolation
- **Separate users**: Each app runs under its own system user
- **Separate directories**: Each app has its own `/opt/app-name/` directory
- **Separate logs**: Each app maintains its own log files
- **Separate PM2 processes**: Each app runs independently

### 2. Nginx Reverse Proxy
- **Single entry point**: All traffic goes through Nginx on ports 80/443
- **Path-based routing**: Different apps accessible via different paths
- **SSL termination**: Single SSL certificate for all apps
- **Load balancing**: Can distribute traffic if needed

### 3. Resource Management
- **Memory limits**: Each app limited to 512MB (configurable)
- **Process limits**: Single PM2 instance per app (not cluster)
- **CPU sharing**: Fair scheduling across all applications
- **Disk quotas**: Can be implemented per application

## 🌐 Routing Strategy

### Current Setup (HELOC Accelerator)
- `https://your-server.com/` → HELOC Accelerator (main route)
- `https://your-server.com/heloc/` → HELOC Accelerator (alternative)
- `https://your-server.com/health` → HELOC health check
- `https://your-server.com/api/` → HELOC API endpoints

### Future Applications
- `https://your-server.com/app2/` → Second application
- `https://your-server.com/app3/` → Third application
- `https://your-server.com/admin/` → Admin dashboard

### Alternative: Subdomain Routing
- `heloc.your-domain.com` → HELOC Accelerator
- `app2.your-domain.com` → Second application
- `admin.your-domain.com` → Admin dashboard

## 🔒 Security Features

### Application Level
- **User isolation**: Each app runs as different system user
- **File permissions**: Strict file access controls
- **Environment isolation**: Separate environment variables
- **Process isolation**: Independent PM2 processes

### Network Level
- **Firewall**: Only necessary ports open (80, 443, 22)
- **Rate limiting**: API and authentication endpoints protected
- **SSL/TLS**: All traffic encrypted
- **Security headers**: HSTS, CSP, XSS protection

## 📊 Monitoring & Logging

### Per-Application Monitoring
```bash
# Check specific app status
sudo -u heloc pm2 list
sudo -u heloc pm2 logs heloc-accelerator

# Check app-specific logs
tail -f /opt/heloc-accelerator/logs/app.log
tail -f /opt/heloc-accelerator/logs/error.log
```

### System-Wide Monitoring
```bash
# Check all PM2 processes
pm2 list

# Check Nginx status
systemctl status nginx

# Check system resources
htop
df -h
```

## 🚀 Deployment Workflow

### For HELOC Accelerator
1. Push code to GitHub
2. SSH to server: `ssh heloc-prod`
3. Run deployment: `/tmp/multi-app-deploy.sh`

### For Future Applications
1. Create app structure: `mkdir -p /opt/new-app/{app,logs,config}`
2. Create app user: `useradd -r -s /bin/bash -d /opt/new-app -m newapp`
3. Deploy code to `/opt/new-app/app/`
4. Update Nginx config with new upstream and location
5. Start with PM2: `sudo -u newapp pm2 start ecosystem.config.js`
6. Reload Nginx: `systemctl reload nginx`

## 🔄 Backup Strategy

### Automated Backups
- **Daily backups**: Each app backed up separately
- **Database backups**: PostgreSQL dumps for each app's database
- **File backups**: Application code and uploads
- **Configuration backups**: Environment files and configs

### Backup Locations
```bash
/opt/heloc-accelerator/backups/    # HELOC app backups
/opt/app2/backups/                 # App2 backups
/opt/shared/backups/               # System-wide backups
```

## 📈 Scaling Considerations

### Vertical Scaling (Current Server)
- **Memory**: Upgrade server RAM for more applications
- **CPU**: Upgrade CPU cores for better performance
- **Storage**: Add more disk space for applications and backups

### Horizontal Scaling (Multiple Servers)
- **Load balancer**: Distribute traffic across multiple servers
- **Database clustering**: Separate database servers
- **CDN**: Static asset delivery
- **Container orchestration**: Docker + Kubernetes

## 🛠️ Maintenance Tasks

### Regular Maintenance
- **Update system packages**: `dnf update -y`
- **Update Node.js applications**: Redeploy from Git
- **Rotate logs**: Automated log rotation
- **Monitor disk space**: Clean old backups and logs
- **SSL certificate renewal**: Update certificates before expiry

### Performance Optimization
- **Database optimization**: Regular VACUUM and ANALYZE
- **Nginx tuning**: Optimize worker processes and connections
- **PM2 optimization**: Adjust memory limits and restart policies
- **Caching**: Implement Redis for session and data caching

## 🎯 Best Practices

### Development
- **Environment parity**: Keep dev/staging/prod environments similar
- **Configuration management**: Use environment variables
- **Version control**: Tag releases and maintain changelog
- **Testing**: Automated tests before deployment

### Operations
- **Monitoring**: Set up alerts for downtime and errors
- **Documentation**: Keep deployment and configuration docs updated
- **Backup testing**: Regularly test backup restoration
- **Security updates**: Keep all components updated

### Resource Management
- **Memory monitoring**: Watch for memory leaks
- **CPU monitoring**: Identify performance bottlenecks
- **Disk monitoring**: Prevent disk space issues
- **Network monitoring**: Track bandwidth usage

This multi-app setup provides a solid foundation for hosting multiple applications while maintaining security, performance, and maintainability.

# GitHub Actions CI/CD Setup for HELOC Accelerator

This guide will help you set up automated deployments using GitHub Actions.

## 🚀 Quick Setup

### 1. Run the SSH Setup Script

```bash
./setup-github-actions-ssh.sh
```

This script will:
- Generate SSH keys for GitHub Actions
- Install the public key on your server
- Test the SSH connection
- Display the secrets you need to add to GitHub

### 2. Add GitHub Repository Secrets

Go to your repository settings: `https://github.com/enoteware/heloc_accel/settings/secrets/actions`

Add these secrets:

| Secret Name | Description | Example Value |
|-------------|-------------|---------------|
| `SSH_PRIVATE_KEY` | Private SSH key for server access | `-----BEGIN OPENSSH PRIVATE KEY-----...` |
| `SSH_USER` | SSH username for server | `root` |
| `SERVER_HOST` | Server IP address | `50.28.106.254` |

### 3. Set Up Server Environment (if not done already)

The SSH setup script handles this, but manually you can:

```bash
# On your server
sudo mkdir -p /opt/heloc-accelerator/{app,backups,logs}
sudo useradd -m -s /bin/bash heloc
sudo chown -R heloc:heloc /opt/heloc-accelerator
sudo npm install -g pm2
```

### 4. Configure Production Environment

Copy the environment template to your server:

```bash
# On your server
cp .env.production.example /opt/heloc-accelerator/config/.env.production
# Edit the values as needed
nano /opt/heloc-accelerator/config/.env.production
```

## 🔄 How It Works

### Workflow Triggers

The deployment runs automatically when:
- You push to the `main` branch
- You manually trigger it from GitHub Actions tab

### Deployment Process

1. **Test & Build** (runs on GitHub's servers):
   - Install dependencies
   - Run linting and type checking
   - Run tests
   - Build the Next.js application
   - Create deployment package

2. **Deploy** (runs on your server):
   - Download the built package
   - Create backup of current version
   - Stop the application
   - Deploy new version
   - Install dependencies
   - Start the application
   - Run health checks

### Security Features

- SSH key-based authentication (no passwords)
- Secrets stored securely in GitHub
- Automatic backups before deployment
- Health checks after deployment
- Rollback capability if deployment fails

## 📊 Monitoring Deployments

### GitHub Actions Dashboard

View deployment status at:
`https://github.com/enoteware/heloc_accel/actions`

### Server Monitoring

```bash
# Check PM2 status
pm2 status

# View application logs
pm2 logs heloc-accelerator

# Check health endpoint
curl http://localhost:3000/heloc/api/health
```

### Deployment Logs

Each deployment creates:
- Backup in `/opt/heloc-accelerator/backups/`
- Deployment info in `/opt/heloc-accelerator/app/DEPLOYMENT_INFO.txt`
- PM2 logs in `/opt/heloc-accelerator/logs/`

## 🛠 Troubleshooting

### Common Issues

**SSH Connection Failed:**
```bash
# Test SSH connection manually
ssh -i ~/.ssh/github-actions-heloc root@50.28.106.254
```

**Deployment Failed:**
```bash
# Check PM2 status
pm2 status
pm2 logs heloc-accelerator

# Check server logs
tail -f /opt/heloc-accelerator/logs/error.log
```

**Health Check Failed:**
```bash
# Test health endpoint
curl -v http://localhost:3000/heloc/api/health

# Check if port is listening
netstat -tlnp | grep :3000
```

### Manual Deployment

If you need to deploy manually:

```bash
# On your local machine
npm run build
tar -czf deployment.tar.gz -C .next/standalone .

# Copy to server
scp deployment.tar.gz root@50.28.106.254:/tmp/

# On server
cd /opt/heloc-accelerator/app
sudo ./scripts/ci-deploy.sh
```

## 🔧 Customization

### Modify Deployment Process

Edit `.github/workflows/deploy.yml` to:
- Add more test steps
- Change deployment conditions
- Add notifications (Slack, email, etc.)
- Add staging environment

### Environment-Specific Deployments

Create additional workflow files for different environments:
- `.github/workflows/deploy-staging.yml`
- `.github/workflows/deploy-production.yml`

### Advanced Features

- **Blue-Green Deployments**: Run two versions and switch traffic
- **Canary Deployments**: Gradually roll out to users
- **Database Migrations**: Run migrations before deployment
- **CDN Cache Invalidation**: Clear CDN cache after deployment

## 📈 Best Practices

1. **Always test locally** before pushing to main
2. **Use feature branches** for development
3. **Monitor deployments** in GitHub Actions
4. **Keep backups** of working versions
5. **Test health endpoints** after deployment
6. **Use semantic versioning** for releases

## 🎉 You're All Set!

Once configured, your deployment workflow is:

1. **Develop** → Make changes locally
2. **Test** → `npm run dev` and test thoroughly
3. **Commit** → `git add . && git commit -m "Your changes"`
4. **Push** → `git push origin main`
5. **Deploy** → GitHub Actions automatically deploys! 🚀

Check the Actions tab to watch your deployment in real-time!

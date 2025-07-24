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

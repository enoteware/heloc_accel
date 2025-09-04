# HELOC Accelerator Docker Quick Reference

## 🚀 Quick Start

```bash
# One-command setup
./docker-setup.sh setup

# Test everything is working
./test-docker-setup.sh
```

## 📋 Essential Commands

### Setup & Management
```bash
./docker-setup.sh setup          # Start development environment
./docker-setup.sh setup-prod     # Start production-like environment
./docker-setup.sh stop           # Stop all services
./docker-setup.sh status         # Check service status
./docker-setup.sh cleanup        # Clean up everything
```

### Logs & Debugging
```bash
./docker-setup.sh logs           # All service logs
./docker-setup.sh logs app       # Application logs only
./docker-setup.sh logs postgres  # Database logs only
```

### NPM Shortcuts
```bash
npm run docker:setup             # Same as ./docker-setup.sh setup
npm run docker:logs:app          # Application logs
npm run docker:stop              # Stop services
```

## 🌐 Service URLs

| Service | URL | Credentials |
|---------|-----|-------------|
| **Application** | http://localhost:3001 | - |
| **pgAdmin** | http://localhost:8080 | admin@helocaccel.com / admin123 |
| **Database** | localhost:5432 | heloc_user / heloc_password |

## 🔧 Development Workflow

### 1. Start Development
```bash
./docker-setup.sh setup
```

### 2. Make Code Changes
- Edit files normally
- Changes auto-reload in development mode
- Check logs: `./docker-setup.sh logs app`

### 3. Database Operations
```bash
# Access database directly
docker-compose exec postgres psql -U heloc_user -d heloc_accelerator

# Or use pgAdmin at http://localhost:8080
```

### 4. Testing
```bash
# Test the setup
./test-docker-setup.sh

# Run application tests
docker-compose exec app npm test
```

## 🐛 Troubleshooting

### Service Won't Start
```bash
./docker-setup.sh logs app       # Check application logs
./docker-setup.sh status         # Check service status
```

### Port Conflicts
```bash
lsof -i :3001                    # Check what's using port 3001
./docker-setup.sh stop           # Stop Docker services
```

### Database Issues
```bash
./docker-setup.sh logs postgres  # Check database logs
docker-compose exec postgres pg_isready -U heloc_user
```

### Clean Restart
```bash
./docker-setup.sh cleanup        # Clean everything
./docker-setup.sh setup          # Fresh start
```

## 📁 File Structure

```
├── Dockerfile                   # Production build
├── Dockerfile.dev              # Development build  
├── docker-compose.yml          # Production services
├── docker-compose.dev.yml      # Development services
├── docker-setup.sh             # Setup script
├── test-docker-setup.sh        # Test script
└── .env.local                  # Environment config
```

## ⚡ Pro Tips

- Use **development mode** for coding: `./docker-setup.sh setup`
- Use **production mode** for testing builds: `./docker-setup.sh setup-prod`
- Check health: http://localhost:3001/health
- Monitor resources: `docker stats`
- Clean up regularly: `./docker-setup.sh cleanup`

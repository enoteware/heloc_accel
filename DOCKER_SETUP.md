# HELOC Accelerator Docker Setup

This guide explains how to set up and run the HELOC Accelerator application using Docker for local development.

## Prerequisites

1. **Docker Desktop**: Install from [docker.com](https://www.docker.com/products/docker-desktop)
2. **Git**: For cloning the repository
3. **Terminal/Command Line**: Basic familiarity recommended

## Quick Start

### 1. Automated Setup (Recommended)

Run the setup script to automatically configure everything:

```bash
./docker-setup.sh setup
```

This will:
- Check Docker installation
- Create environment configuration
- Build and start all services
- Set up the database with initial schema

### 2. Manual Setup

If you prefer manual control:

```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local with your settings (see Configuration section)

# Start development environment
docker-compose -f docker-compose.dev.yml up --build -d

# Or start production-like environment
DOCKER_BUILD=true docker-compose up --build -d
```

## Available Services

After setup, the following services will be available:

| Service | URL | Description |
|---------|-----|-------------|
| **HELOC App** | http://heloc.localhost:3000 | Main application (via Docker port mapping)
| **PostgreSQL** | localhost:5432 | Database server |
| **pgAdmin** | http://localhost:8080 | Database management UI |

### Default Credentials

**pgAdmin:**
- Email: `admin@helocaccel.com`
- Password: `admin123`

**PostgreSQL:**
- Host: `localhost` (or `postgres` from within Docker)
- Port: `5432`
- Database: `heloc_accelerator`
- Username: `heloc_user`
- Password: `heloc_password`

## Docker Configurations

### Development Mode (`docker-compose.dev.yml`)

- **Hot Reload**: Code changes automatically refresh the app
- **Volume Mounting**: Source code is mounted for live editing
- **Debug Mode**: Full logging and development tools enabled
- **Fast Startup**: Optimized for quick iteration

### Production Mode (`docker-compose.yml`)

- **Optimized Build**: Multi-stage build for smaller images
- **Standalone Output**: Self-contained application bundle
- **Health Checks**: Automatic service monitoring
- **Production Settings**: Optimized for performance

## Common Commands

### Using the Setup Script

```bash
# Start development environment
./docker-setup.sh setup

# Start production-like environment
./docker-setup.sh setup-prod

# Check service status
./docker-setup.sh status

# View all logs
./docker-setup.sh logs

# View specific service logs
./docker-setup.sh logs app
./docker-setup.sh logs postgres

# Stop all services
./docker-setup.sh stop

# Clean up everything
./docker-setup.sh cleanup
```

### Using Docker Compose Directly

```bash
# Development environment
docker-compose -f docker-compose.dev.yml up -d
docker-compose -f docker-compose.dev.yml down

# Production environment
DOCKER_BUILD=true docker-compose up -d
docker-compose down

# View logs
docker-compose logs -f app
docker-compose logs -f postgres

# Rebuild services
docker-compose up --build -d
```

## Configuration

### Environment Variables

Key variables in `.env.local`:

```env
# Application
NODE_ENV=development
PORT=3001
# Domain used for app URL and CORS. Defaults to heloc.localhost:3000 (no hosts file needed)
DOMAIN=heloc.localhost:3000
NEXTAUTH_URL=http://${DOMAIN}
NEXTAUTH_SECRET=your-generated-secret
JWT_SECRET=your-generated-jwt-secret

# Database
DATABASE_URL=postgresql://heloc_user:heloc_password@localhost:5432/heloc_accelerator

# Security
CORS_ORIGIN=http://${DOMAIN}

### Local Domain (.localhost)

- The Docker setup maps the application to heloc.localhost:3000 by default.
- The .localhost TLD is reserved and automatically resolves to 127.0.0.1; no /etc/hosts changes are required.
- You can customize the domain/port by setting DOMAIN in your .env.local or shell environment before starting Docker:

```bash
# Example: use a different subdomain or port
export DOMAIN=myapp.localhost:4000
# Start dev env
docker-compose -f docker-compose.dev.yml up -d
```
```

### Generating Secrets

```bash
# Generate secure secrets
openssl rand -base64 32
```

## Troubleshooting

### Common Issues

**1. Port Already in Use**
```bash
# Check what's using the port
lsof -i :3001
lsof -i :5432

# Stop conflicting services
./docker-setup.sh stop
```

**2. Database Connection Issues**
```bash
# Check database health
docker-compose exec postgres pg_isready -U heloc_user

# View database logs
./docker-setup.sh logs postgres
```

**3. Application Won't Start**
```bash
# Check application logs
./docker-setup.sh logs app

# Rebuild from scratch
docker-compose down --volumes
./docker-setup.sh cleanup
./docker-setup.sh setup
```

**4. Hot Reload Not Working (Development)**
```bash
# Ensure you're using the dev configuration
docker-compose -f docker-compose.dev.yml up -d

# Check volume mounts
docker-compose -f docker-compose.dev.yml exec app ls -la /app
```

### Health Checks

The application includes health checks accessible at:
- **Application Health**: http://localhost:3001/health
- **Database Health**: Automatic via Docker health checks

### Performance Tips

**Development:**
- Use `docker-compose.dev.yml` for faster iteration
- Keep only necessary services running
- Use `docker system prune` regularly to clean up

**Production:**
- Use the main `docker-compose.yml` for testing production builds
- Monitor resource usage with `docker stats`
- Use health checks to ensure service reliability

## File Structure

```
├── Dockerfile              # Production build
├── Dockerfile.dev          # Development build
├── docker-compose.yml      # Production services
├── docker-compose.dev.yml  # Development services
├── docker-setup.sh         # Setup automation script
├── .dockerignore           # Docker build exclusions
└── .env.local              # Local environment config
```

## Next Steps

1. **Access the Application**: Visit http://heloc.localhost:3000 (no hosts file changes needed)
2. **Database Management**: Use pgAdmin at http://localhost:8080
3. **Development**: Edit code and see changes automatically reload
4. **Testing**: Run tests with `npm test` inside the container

For more advanced configuration and deployment options, see the main project documentation.

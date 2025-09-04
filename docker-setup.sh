#!/bin/bash

# HELOC Accelerator Docker Setup Script
# This script sets up the local development environment using Docker

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Docker is installed and running
check_docker() {
    print_status "Checking Docker installation..."
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker Desktop first."
        echo "Visit: https://www.docker.com/products/docker-desktop"
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        print_error "Docker is not running. Please start Docker Desktop."
        exit 1
    fi
    
    print_success "Docker is installed and running"
}

# Function to check if docker-compose is available
check_docker_compose() {
    print_status "Checking Docker Compose..."
    
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        print_error "Docker Compose is not available."
        exit 1
    fi
    
    print_success "Docker Compose is available"
}

# Function to create environment file
create_env_file() {
    print_status "Setting up environment file..."
    
    if [ ! -f .env.local ]; then
        print_status "Creating .env.local from .env.example..."
        cp .env.example .env.local
        
        # Update database URL for Docker
        sed -i.bak 's|DATABASE_URL=postgresql://heloc_user:your_password@localhost:5432/heloc_accelerator|DATABASE_URL=postgresql://heloc_user:heloc_password@localhost:5432/heloc_accelerator|g' .env.local
        
        # Update port to 3001
        sed -i.bak 's|PORT=3000|PORT=3001|g' .env.local
        sed -i.bak 's|NEXTAUTH_URL=http://localhost:3000/heloc|NEXTAUTH_URL=http://localhost:3001|g' .env.local
        sed -i.bak 's|CORS_ORIGIN=http://localhost:3000|CORS_ORIGIN=http://localhost:3001|g' .env.local
        
        # Generate secrets
        NEXTAUTH_SECRET=$(openssl rand -base64 32)
        JWT_SECRET=$(openssl rand -base64 32)
        
        sed -i.bak "s|NEXTAUTH_SECRET=your-super-secure-nextauth-secret-key-here|NEXTAUTH_SECRET=$NEXTAUTH_SECRET|g" .env.local
        sed -i.bak "s|JWT_SECRET=your-jwt-secret-key-here|JWT_SECRET=$JWT_SECRET|g" .env.local
        
        # Clean up backup file
        rm -f .env.local.bak
        
        print_success "Created .env.local with Docker-compatible settings"
    else
        print_warning ".env.local already exists. Skipping creation."
    fi
}

# Function to build and start services
start_services() {
    local mode=$1
    
    if [ "$mode" = "dev" ]; then
        print_status "Starting development environment..."
        docker-compose -f docker-compose.dev.yml down --remove-orphans
        docker-compose -f docker-compose.dev.yml up --build -d
    else
        print_status "Starting production-like environment..."
        docker-compose down --remove-orphans
        DOCKER_BUILD=true docker-compose up --build -d
    fi
}

# Function to show service status
show_status() {
    print_status "Checking service status..."
    
    if command -v docker-compose &> /dev/null; then
        docker-compose ps
    else
        docker compose ps
    fi
}

# Function to show logs
show_logs() {
    local service=$1
    
    if [ -z "$service" ]; then
        print_status "Showing all service logs..."
        if command -v docker-compose &> /dev/null; then
            docker-compose logs -f
        else
            docker compose logs -f
        fi
    else
        print_status "Showing logs for $service..."
        if command -v docker-compose &> /dev/null; then
            docker-compose logs -f "$service"
        else
            docker compose logs -f "$service"
        fi
    fi
}

# Function to stop services
stop_services() {
    print_status "Stopping all services..."
    
    if command -v docker-compose &> /dev/null; then
        docker-compose -f docker-compose.dev.yml down
        docker-compose down
    else
        docker compose -f docker-compose.dev.yml down
        docker compose down
    fi
    
    print_success "All services stopped"
}

# Function to clean up
cleanup() {
    print_status "Cleaning up Docker resources..."
    
    # Stop and remove containers
    stop_services
    
    # Remove unused images and volumes
    docker system prune -f
    
    print_success "Cleanup completed"
}

# Function to show help
show_help() {
    echo "HELOC Accelerator Docker Setup"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  setup       Set up and start development environment"
    echo "  setup-prod  Set up and start production-like environment"
    echo "  start       Start existing services"
    echo "  start-dev   Start development services"
    echo "  stop        Stop all services"
    echo "  status      Show service status"
    echo "  logs        Show all service logs"
    echo "  logs <svc>  Show logs for specific service (app, postgres, pgadmin)"
    echo "  cleanup     Stop services and clean up Docker resources"
    echo "  help        Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 setup           # Set up development environment"
    echo "  $0 logs app        # Show application logs"
    echo "  $0 status          # Check service status"
}

# Main script logic
case "${1:-setup}" in
    "setup")
        check_docker
        check_docker_compose
        create_env_file
        start_services "dev"
        print_success "Development environment is ready!"
        print_status "Application: http://localhost:3001"
        print_status "Database: localhost:5432"
        print_status "pgAdmin: http://localhost:8080"
        ;;
    "setup-prod")
        check_docker
        check_docker_compose
        create_env_file
        start_services "prod"
        print_success "Production-like environment is ready!"
        print_status "Application: http://localhost:3001"
        ;;
    "start")
        start_services "dev"
        ;;
    "start-dev")
        start_services "dev"
        ;;
    "stop")
        stop_services
        ;;
    "status")
        show_status
        ;;
    "logs")
        show_logs "$2"
        ;;
    "cleanup")
        cleanup
        ;;
    "help"|"-h"|"--help")
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac

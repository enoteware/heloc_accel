#!/bin/bash

# Test script to verify Docker setup is working correctly

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[TEST]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[PASS]${NC} $1"
}

print_error() {
    echo -e "${RED}[FAIL]${NC} $1"
}

# Test if Docker is running
test_docker() {
    print_status "Testing Docker availability..."
    if docker info &> /dev/null; then
        print_success "Docker is running"
        return 0
    else
        print_error "Docker is not running"
        return 1
    fi
}

# Test if services are running
test_services() {
    print_status "Testing if services are running..."
    
    # Check if containers are running
    if docker-compose ps | grep -q "Up"; then
        print_success "Docker services are running"
    else
        print_error "Docker services are not running"
        return 1
    fi
}

# Test database connectivity
test_database() {
    print_status "Testing database connectivity..."
    
    # Wait a moment for database to be ready
    sleep 5
    
    if docker-compose exec -T postgres pg_isready -U heloc_user -d heloc_accelerator &> /dev/null; then
        print_success "Database is accessible"
    else
        print_error "Database is not accessible"
        return 1
    fi
}

# Test application health
test_application() {
    print_status "Testing application health..."
    
    # Wait for application to start
    sleep 10
    
    # Test health endpoint
    if curl -f http://localhost:3001/health &> /dev/null; then
        print_success "Application health endpoint is responding"
    else
        print_error "Application health endpoint is not responding"
        return 1
    fi
}

# Test application homepage
test_homepage() {
    print_status "Testing application homepage..."
    
    if curl -f http://localhost:3001 &> /dev/null; then
        print_success "Application homepage is accessible"
    else
        print_error "Application homepage is not accessible"
        return 1
    fi
}

# Main test execution
main() {
    echo "HELOC Accelerator Docker Setup Test"
    echo "=================================="
    echo ""
    
    local failed=0
    
    # Run tests
    test_docker || failed=$((failed + 1))
    test_services || failed=$((failed + 1))
    test_database || failed=$((failed + 1))
    test_application || failed=$((failed + 1))
    test_homepage || failed=$((failed + 1))
    
    echo ""
    echo "=================================="
    
    if [ $failed -eq 0 ]; then
        print_success "All tests passed! Docker setup is working correctly."
        echo ""
        echo "You can now access:"
        echo "  - Application: http://localhost:3001"
        echo "  - pgAdmin: http://localhost:8080"
        echo "  - Database: localhost:5432"
        return 0
    else
        print_error "$failed test(s) failed. Please check the setup."
        echo ""
        echo "Try running:"
        echo "  ./docker-setup.sh logs"
        echo "  ./docker-setup.sh status"
        return 1
    fi
}

# Run main function
main "$@"

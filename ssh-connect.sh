#!/bin/bash

# HELOC Accelerator VPS SSH Connection Script
# Usage: ./ssh-connect.sh [command]
# If no command is provided, opens an interactive SSH session

SERVER_HOST="50.28.106.254"
SERVER_PORT="22"
SERVER_USER="root"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE} HELOC Accelerator VPS Connection${NC}"
    echo -e "${BLUE}================================${NC}"
    echo -e "Server: ${GREEN}${SERVER_USER}@${SERVER_HOST}:${SERVER_PORT}${NC}"
    echo ""
}

# Check if SSH is available
check_ssh() {
    if ! command -v ssh &> /dev/null; then
        print_error "SSH client not found. Please install OpenSSH client."
        exit 1
    fi
}

# Test connection
test_connection() {
    print_status "Testing connection to server..."
    if ssh -o ConnectTimeout=10 -o BatchMode=yes -p ${SERVER_PORT} ${SERVER_USER}@${SERVER_HOST} exit 2>/dev/null; then
        print_status "Connection test successful!"
        return 0
    else
        print_warning "Connection test failed. You may need to enter password or check server status."
        return 1
    fi
}

# Main connection function
connect_ssh() {
    local command="$1"
    
    print_header
    check_ssh
    
    if [ -n "$command" ]; then
        print_status "Executing command: $command"
        ssh -p ${SERVER_PORT} ${SERVER_USER}@${SERVER_HOST} "$command"
    else
        print_status "Opening interactive SSH session..."
        print_warning "Type 'exit' to close the connection"
        echo ""
        ssh -p ${SERVER_PORT} ${SERVER_USER}@${SERVER_HOST}
    fi
}

# Help function
show_help() {
    echo "HELOC Accelerator VPS SSH Connection Script"
    echo ""
    echo "Usage:"
    echo "  ./ssh-connect.sh                    # Interactive SSH session"
    echo "  ./ssh-connect.sh 'command'          # Execute single command"
    echo "  ./ssh-connect.sh test               # Test connection"
    echo "  ./ssh-connect.sh help               # Show this help"
    echo ""
    echo "Examples:"
    echo "  ./ssh-connect.sh                    # Connect interactively"
    echo "  ./ssh-connect.sh 'ls -la'           # List files"
    echo "  ./ssh-connect.sh 'systemctl status nginx'  # Check nginx status"
    echo "  ./ssh-connect.sh 'df -h'            # Check disk usage"
    echo ""
    echo "Server Details:"
    echo "  Host: ${SERVER_HOST}"
    echo "  Port: ${SERVER_PORT}"
    echo "  User: ${SERVER_USER}"
}

# Main script logic
case "$1" in
    "help"|"-h"|"--help")
        show_help
        ;;
    "test")
        print_header
        check_ssh
        test_connection
        ;;
    *)
        connect_ssh "$1"
        ;;
esac

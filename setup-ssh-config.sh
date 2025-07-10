#!/bin/bash

# HELOC Accelerator SSH Configuration Setup Script
# This script sets up SSH configuration for VS Code Remote-SSH extension

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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
    echo -e "${BLUE} HELOC SSH Configuration Setup${NC}"
    echo -e "${BLUE}================================${NC}"
    echo ""
}

# Check if SSH directory exists
setup_ssh_directory() {
    print_status "Setting up SSH directory..."
    
    if [ ! -d ~/.ssh ]; then
        mkdir -p ~/.ssh
        chmod 700 ~/.ssh
        print_status "Created ~/.ssh directory"
    else
        print_status "SSH directory already exists"
    fi
}

# Backup existing config
backup_existing_config() {
    if [ -f ~/.ssh/config ]; then
        print_warning "Existing SSH config found. Creating backup..."
        cp ~/.ssh/config ~/.ssh/config.backup.$(date +%Y%m%d_%H%M%S)
        print_status "Backup created: ~/.ssh/config.backup.$(date +%Y%m%d_%H%M%S)"
        return 0
    else
        print_status "No existing SSH config found"
        return 1
    fi
}

# Install SSH config
install_ssh_config() {
    print_status "Installing SSH configuration..."
    
    if [ ! -f "ssh_config_heloc" ]; then
        print_error "ssh_config_heloc file not found in current directory"
        exit 1
    fi
    
    # Check if we should append or create new
    if [ -f ~/.ssh/config ]; then
        print_status "Appending HELOC configuration to existing SSH config..."
        echo "" >> ~/.ssh/config
        echo "# HELOC Accelerator Configuration - Added $(date)" >> ~/.ssh/config
        grep -v "^#.*INSTALLATION INSTRUCTIONS" ssh_config_heloc | grep -v "^#.*USAGE WITH VS CODE" >> ~/.ssh/config
    else
        print_status "Creating new SSH config file..."
        cp ssh_config_heloc ~/.ssh/config
    fi
    
    chmod 600 ~/.ssh/config
    print_status "SSH config installed and permissions set"
}

# Check for SSH key
check_ssh_key() {
    print_status "Checking for SSH key..."
    
    if [ -f ~/.ssh/id_rsa ]; then
        print_status "SSH private key found: ~/.ssh/id_rsa"
    elif [ -f ~/.ssh/id_ed25519 ]; then
        print_status "SSH private key found: ~/.ssh/id_ed25519"
        print_warning "You may need to update IdentityFile in SSH config to use id_ed25519"
    else
        print_warning "No SSH private key found"
        echo ""
        echo "To generate an SSH key, run:"
        echo "  ssh-keygen -t rsa -b 4096 -C \"your_email@example.com\""
        echo ""
        echo "Then copy the public key to the server:"
        echo "  ssh-copy-id root@50.28.106.254"
        echo ""
    fi
}

# Test connection
test_connection() {
    print_status "Testing SSH connection..."
    
    echo ""
    echo "You can now test the connection with:"
    echo "  ssh heloc-accelerator"
    echo "  ssh heloc-app"
    echo "  ssh heloc-tunnel"
    echo ""
    
    read -p "Would you like to test the connection now? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Testing connection to heloc-accelerator..."
        ssh -o ConnectTimeout=10 heloc-accelerator "echo 'Connection successful!'"
    fi
}

# Show VS Code instructions
show_vscode_instructions() {
    echo ""
    echo -e "${BLUE}VS Code Remote-SSH Setup Instructions:${NC}"
    echo "======================================"
    echo ""
    echo "1. Install the 'Remote - SSH' extension in VS Code"
    echo "2. Press Cmd+Shift+P (or Ctrl+Shift+P on Windows/Linux)"
    echo "3. Type 'Remote-SSH: Connect to Host'"
    echo "4. Select one of these hosts:"
    echo "   • heloc-accelerator (root access for system admin)"
    echo "   • heloc-app (application user for development)"
    echo "   • heloc-tunnel (with port forwarding for local access)"
    echo ""
    echo "5. VS Code will open a new window connected to the server"
    echo "6. You can then open the folder: /opt/heloc-accelerator/app"
    echo ""
    echo -e "${YELLOW}Note:${NC} If using password authentication, VS Code will prompt for password"
    echo ""
}

# Main function
main() {
    print_header
    
    setup_ssh_directory
    backup_existing_config
    install_ssh_config
    check_ssh_key
    
    print_status "SSH configuration setup complete!"
    
    show_vscode_instructions
    
    echo ""
    print_status "Setup completed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Test SSH connection: ssh heloc-accelerator"
    echo "2. Set up SSH key authentication (if not already done)"
    echo "3. Connect with VS Code Remote-SSH extension"
    echo ""
}

# Run main function
main "$@"

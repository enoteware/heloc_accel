#!/bin/bash

# GitHub Actions SSH Setup Script for HELOC Accelerator
# This script sets up SSH access for GitHub Actions to deploy to your server

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔐 GitHub Actions SSH Setup for HELOC Accelerator${NC}"
echo ""

# Configuration
SERVER_HOST="50.28.106.254"
SERVER_USER="root"
APP_USER="heloc"
KEY_NAME="github-actions-heloc"

echo -e "${YELLOW}📋 Configuration:${NC}"
echo "Server: $SERVER_USER@$SERVER_HOST"
echo "App User: $APP_USER"
echo "Key Name: $KEY_NAME"
echo ""

# Step 1: Generate SSH key pair
echo -e "${YELLOW}🔑 Step 1: Generating SSH key pair...${NC}"
if [ -f "$HOME/.ssh/$KEY_NAME" ]; then
    echo "SSH key already exists at $HOME/.ssh/$KEY_NAME"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Using existing key..."
    else
        rm -f "$HOME/.ssh/$KEY_NAME" "$HOME/.ssh/$KEY_NAME.pub"
        ssh-keygen -t ed25519 -f "$HOME/.ssh/$KEY_NAME" -N "" -C "github-actions-heloc-accelerator"
        echo "✅ New SSH key generated"
    fi
else
    ssh-keygen -t ed25519 -f "$HOME/.ssh/$KEY_NAME" -N "" -C "github-actions-heloc-accelerator"
    echo "✅ SSH key generated"
fi

# Step 2: Copy public key to server
echo -e "${YELLOW}🚀 Step 2: Installing public key on server...${NC}"
echo "You'll need to enter the server password to install the SSH key."

# Create the command to add the key
PUBLIC_KEY=$(cat "$HOME/.ssh/$KEY_NAME.pub")
ssh-copy-id -i "$HOME/.ssh/$KEY_NAME.pub" "$SERVER_USER@$SERVER_HOST" || {
    echo -e "${RED}❌ Failed to copy SSH key automatically${NC}"
    echo -e "${YELLOW}Manual setup required:${NC}"
    echo "1. Copy this public key:"
    echo ""
    echo "$PUBLIC_KEY"
    echo ""
    echo "2. SSH to your server and add it to ~/.ssh/authorized_keys"
    echo "3. Run: ssh $SERVER_USER@$SERVER_HOST 'mkdir -p ~/.ssh && echo \"$PUBLIC_KEY\" >> ~/.ssh/authorized_keys'"
    exit 1
}

# Step 3: Test SSH connection
echo -e "${YELLOW}🧪 Step 3: Testing SSH connection...${NC}"
if ssh -i "$HOME/.ssh/$KEY_NAME" -o ConnectTimeout=10 "$SERVER_USER@$SERVER_HOST" "echo 'SSH connection successful'"; then
    echo "✅ SSH connection test passed"
else
    echo -e "${RED}❌ SSH connection test failed${NC}"
    exit 1
fi

# Step 4: Set up server environment
echo -e "${YELLOW}⚙️ Step 4: Setting up server environment...${NC}"
ssh -i "$HOME/.ssh/$KEY_NAME" "$SERVER_USER@$SERVER_HOST" << 'EOF'
# Ensure app user exists
if ! id "heloc" &>/dev/null; then
    useradd -m -s /bin/bash heloc
    echo "Created user: heloc"
fi

# Ensure directory structure exists
mkdir -p /opt/heloc-accelerator/{app,backups,logs}
chown -R heloc:heloc /opt/heloc-accelerator

# Ensure PM2 is installed globally
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
    echo "Installed PM2 globally"
fi

# Set up PM2 for heloc user
su - heloc -c "pm2 startup" || true

echo "✅ Server environment ready"
EOF

# Step 5: Display GitHub secrets
echo ""
echo -e "${GREEN}🎉 SSH setup completed successfully!${NC}"
echo ""
echo -e "${YELLOW}📝 Next steps - Add these secrets to your GitHub repository:${NC}"
echo ""
echo "1. Go to: https://github.com/enoteware/heloc_accel/settings/secrets/actions"
echo "2. Add these repository secrets:"
echo ""
echo -e "${BLUE}SSH_PRIVATE_KEY:${NC}"
echo "---"
cat "$HOME/.ssh/$KEY_NAME"
echo "---"
echo ""
echo -e "${BLUE}SSH_USER:${NC} $SERVER_USER"
echo -e "${BLUE}SERVER_HOST:${NC} $SERVER_HOST"
echo ""
echo -e "${YELLOW}🔒 Security Notes:${NC}"
echo "• The private key above should ONLY be added to GitHub Secrets"
echo "• Never commit the private key to your repository"
echo "• The key is stored locally at: $HOME/.ssh/$KEY_NAME"
echo ""
echo -e "${GREEN}✅ Once you add the secrets, GitHub Actions will automatically deploy on push to main!${NC}"

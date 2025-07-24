#!/bin/bash

# HELOC Accelerator Git Deployment Script
# This script initializes git and pushes to a remote repository

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
    echo -e "${BLUE} HELOC Accelerator Git Setup${NC}"
    echo -e "${BLUE}================================${NC}"
    echo ""
}

# Check if git is installed
check_git() {
    if ! command -v git &> /dev/null; then
        print_error "Git is not installed. Please install Git first."
        exit 1
    fi
}

# Initialize git repository
init_git() {
    print_status "Initializing Git repository..."
    
    if [ ! -d ".git" ]; then
        git init
        print_status "Git repository initialized"
    else
        print_status "Git repository already exists"
    fi
}

# Add files to git
add_files() {
    print_status "Adding files to Git..."
    git add .
    print_status "Files added to staging area"
}

# Create initial commit
create_commit() {
    print_status "Creating initial commit..."
    
    # Check if there are any commits
    if git rev-parse --verify HEAD >/dev/null 2>&1; then
        print_status "Repository already has commits"
        git commit -m "Update HELOC Accelerator application" || print_warning "No changes to commit"
    else
        git commit -m "Initial commit: HELOC Accelerator Next.js application

- Next.js 14 with TypeScript
- Tailwind CSS for styling
- Basic landing page
- Health check endpoint
- Production-ready configuration
- VPS deployment ready"
        print_status "Initial commit created"
    fi
}

# Add remote repository
add_remote() {
    local repo_url="$1"
    
    if [ -z "$repo_url" ]; then
        print_warning "No repository URL provided"
        echo ""
        echo "To add a remote repository later, run:"
        echo "  git remote add origin <repository-url>"
        echo "  git push -u origin main"
        return
    fi
    
    print_status "Adding remote repository: $repo_url"
    
    # Remove existing origin if it exists
    git remote remove origin 2>/dev/null || true
    
    git remote add origin "$repo_url"
    print_status "Remote repository added"
}

# Push to remote
push_to_remote() {
    local repo_url="$1"
    
    if [ -z "$repo_url" ]; then
        print_warning "Skipping push - no repository URL provided"
        return
    fi
    
    print_status "Pushing to remote repository..."
    
    # Set upstream and push
    git branch -M main
    git push -u origin main
    
    print_status "Code pushed to remote repository!"
}

# Show next steps
show_next_steps() {
    local repo_url="$1"
    
    echo ""
    print_status "Git setup completed!"
    echo ""
    
    if [ -n "$repo_url" ]; then
        echo "Repository URL: $repo_url"
        echo ""
        echo "Next steps:"
        echo "1. Your code is now on GitHub/GitLab"
        echo "2. Deploy to your VPS server:"
        echo "   ssh heloc-prod"
        echo "   /opt/heloc-accelerator/scripts/deploy.sh git $repo_url main"
        echo ""
    else
        echo "Next steps:"
        echo "1. Create a repository on GitHub/GitLab"
        echo "2. Add the remote:"
        echo "   git remote add origin <repository-url>"
        echo "   git push -u origin main"
        echo "3. Deploy to your VPS server:"
        echo "   ssh heloc-prod"
        echo "   /opt/heloc-accelerator/scripts/deploy.sh git <repository-url> main"
        echo ""
    fi
    
    echo "Local development:"
    echo "  npm install    # Install dependencies"
    echo "  npm run dev    # Start development server"
    echo ""
}

# Main function
main() {
    local repo_url="$1"
    
    print_header
    
    check_git
    init_git
    add_files
    create_commit
    add_remote "$repo_url"
    push_to_remote "$repo_url"
    show_next_steps "$repo_url"
}

# Help function
show_help() {
    echo "HELOC Accelerator Git Deployment Script"
    echo ""
    echo "Usage:"
    echo "  ./deploy-to-git.sh                           # Initialize git only"
    echo "  ./deploy-to-git.sh <repository-url>          # Initialize and push to remote"
    echo "  ./deploy-to-git.sh help                      # Show this help"
    echo ""
    echo "Examples:"
    echo "  ./deploy-to-git.sh https://github.com/username/heloc-accelerator.git"
    echo "  ./deploy-to-git.sh git@github.com:username/heloc-accelerator.git"
    echo ""
}

# Script entry point
case "$1" in
    "help"|"-h"|"--help")
        show_help
        ;;
    *)
        main "$1"
        ;;
esac

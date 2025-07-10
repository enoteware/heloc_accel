#!/bin/bash

# Quick HELOC Accelerator Directory Setup
# Copy and paste this entire script into your SSH session

echo "🚀 Setting up HELOC Accelerator directory structure..."

# 1. Create the dedicated system user
echo "📁 Creating heloc user..."
useradd -r -s /bin/bash -d /opt/heloc-accelerator -m heloc

# 2. Create the main directory structure
echo "📁 Creating directory structure..."
mkdir -p /opt/heloc-accelerator/{app,logs,backups,uploads,scripts,ssl,config}

# 3. Set proper ownership
echo "🔐 Setting ownership..."
chown -R heloc:heloc /opt/heloc-accelerator

# 4. Set appropriate permissions
echo "🔐 Setting permissions..."
chmod 755 /opt/heloc-accelerator
chmod 755 /opt/heloc-accelerator/{app,scripts,config}
chmod 750 /opt/heloc-accelerator/{logs,backups,uploads,ssl}

# 5. Create log files with proper permissions
echo "📝 Creating log files..."
touch /opt/heloc-accelerator/logs/{app.log,error.log,access.log}
chown heloc:heloc /opt/heloc-accelerator/logs/*.log
chmod 640 /opt/heloc-accelerator/logs/*.log

# 6. Create a systemd service directory for the heloc user
echo "⚙️ Setting up systemd directories..."
mkdir -p /home/heloc/.config/systemd/user
chown -R heloc:heloc /home/heloc/.config

# 7. Create environment file
echo "🔧 Creating environment file..."
touch /opt/heloc-accelerator/config/.env.production
chown heloc:heloc /opt/heloc-accelerator/config/.env.production
chmod 600 /opt/heloc-accelerator/config/.env.production

# 8. Verify the structure
echo "✅ Verifying setup..."
echo "User created:"
id heloc

echo -e "\nDirectory structure:"
ls -la /opt/heloc-accelerator/

echo -e "\nSubdirectories:"
for dir in /opt/heloc-accelerator/*/; do
    echo "$(basename "$dir"): $(ls -ld "$dir" | awk '{print $1, $3, $4}')"
done

echo -e "\n🎉 Directory setup complete!"
echo "Main directory: /opt/heloc-accelerator"
echo "Application user: heloc"
echo "Next steps: Install Node.js, PostgreSQL, and deploy the application"

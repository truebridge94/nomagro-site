#!/bin/bash

# Quick VPS setup script for complete beginners
# Run this as root user on a fresh Ubuntu server

echo "🔧 Setting up your VPS for Nomagro Backend..."

# Update system
echo "📦 Updating system packages..."
apt update && apt upgrade -y

# Install Node.js 18.x
echo "📦 Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Install PM2
echo "📦 Installing PM2..."
npm install -g pm2

# Install Nginx
echo "📦 Installing Nginx..."
apt install nginx -y

# Install Git
echo "📦 Installing Git..."
apt install git -y

# Create application user
echo "👤 Creating application user..."
if ! id "nomagro" &>/dev/null; then
    adduser --disabled-password --gecos "" nomagro
    usermod -aG sudo nomagro
fi

# Create web directory
echo "📁 Creating web directory..."
mkdir -p /var/www
chown nomagro:nomagro /var/www

# Configure firewall
echo "🛡️ Configuring firewall..."
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 'Nginx Full'
ufw --force enable

# Start and enable services
echo "🚀 Starting services..."
systemctl start nginx
systemctl enable nginx

# Display versions
echo ""
echo "✅ Installation complete!"
echo ""
echo "📋 Installed versions:"
echo "   Node.js: $(node --version)"
echo "   NPM: $(npm --version)"
echo "   PM2: $(pm2 --version)"
echo "   Nginx: $(nginx -v 2>&1)"
echo ""
echo "👤 Application user created: nomagro"
echo "📁 Web directory: /var/www"
echo ""
echo "🔄 Next steps:"
echo "1. Switch to nomagro user: su - nomagro"
echo "2. Clone your repository to /var/www/"
echo "3. Run the deployment script"
echo ""
echo "💡 Your server IP: $(curl -s ifconfig.me)"